const { getDB } = require('../models/database');
const Stripe = require('stripe');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

/**
 * Payment Service
 * Handles payment sessions, webhooks, and postponement payments
 * for Stripe and MercadoPago gateways.
 */

// Initialize Stripe client (lazy)
let stripeClient = null;
function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Initialize MercadoPago client (lazy)
let mpClient = null;
function getMercadoPagoClient() {
  if (!mpClient) {
    mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
  }
  return mpClient;
}

/**
 * Creates a Stripe Checkout session for a plan purchase.
 *
 * @param {number} userId - The user ID
 * @param {number} planId - The plan ID
 * @param {number} quantity - Number of events to purchase
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 * @returns {Promise<{sessionId: string, url: string}>}
 */
async function createStripeSession(userId, planId, quantity, successUrl, cancelUrl) {
  const db = getDB();
  const stripe = getStripe();

  // Fetch plan details
  const [plans] = await db.query('SELECT * FROM plans WHERE id = ? AND status = ?', [planId, 'active']);
  if (plans.length === 0) {
    throw new Error('Plan not found or inactive');
  }
  const plan = plans[0];

  // Calculate discount
  const { discountPct, totalAmount } = calculateTotal(plan.price, quantity, plan.volume_discount);

  // Create purchase record
  const [purchaseResult] = await db.query(
    `INSERT INTO purchases (user_id, plan_id, quantity, unit_price, discount_pct, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [userId, planId, quantity, plan.price, discountPct, totalAmount]
  );
  const purchaseId = purchaseResult.insertId;

  // Create transaction record
  const [txResult] = await db.query(
    `INSERT INTO transactions (purchase_id, user_id, gateway, amount, currency, status, type)
     VALUES (?, ?, 'stripe', ?, 'MXN', 'pending', 'purchase')`,
    [purchaseId, userId, totalAmount]
  );
  const transactionId = txResult.insertId;

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `${plan.name} × ${quantity} evento${quantity > 1 ? 's' : ''}`,
            description: plan.description || undefined
          },
          unit_amount: Math.round(plan.price * (1 - discountPct / 100) * 100) // cents
        },
        quantity: quantity
      }
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: String(userId),
      plan_id: String(planId),
      purchase_id: String(purchaseId),
      quantity: String(quantity)
    }
  });

  // Update transaction with gateway session ID
  await db.query(
    'UPDATE transactions SET gateway_session_id = ? WHERE id = ?',
    [session.id, transactionId]
  );

  return { sessionId: session.id, url: session.url };
}

/**
 * Creates a MercadoPago payment preference for a plan purchase.
 *
 * @param {number} userId - The user ID
 * @param {number} planId - The plan ID
 * @param {number} quantity - Number of events to purchase
 * @param {string} successUrl - URL to redirect on success
 * @param {string} cancelUrl - URL to redirect on cancel
 * @returns {Promise<{preferenceId: string, initPoint: string}>}
 */
async function createMercadoPagoPreference(userId, planId, quantity, successUrl, cancelUrl) {
  const db = getDB();
  const client = getMercadoPagoClient();

  // Fetch plan details
  const [plans] = await db.query('SELECT * FROM plans WHERE id = ? AND status = ?', [planId, 'active']);
  if (plans.length === 0) {
    throw new Error('Plan not found or inactive');
  }
  const plan = plans[0];

  // Calculate discount
  const { discountPct, totalAmount } = calculateTotal(plan.price, quantity, plan.volume_discount);

  // Create purchase record
  const [purchaseResult] = await db.query(
    `INSERT INTO purchases (user_id, plan_id, quantity, unit_price, discount_pct, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [userId, planId, quantity, plan.price, discountPct, totalAmount]
  );
  const purchaseId = purchaseResult.insertId;

  // Create transaction record
  const [txResult] = await db.query(
    `INSERT INTO transactions (purchase_id, user_id, gateway, amount, currency, status, type)
     VALUES (?, ?, 'mercadopago', ?, 'MXN', 'pending', 'purchase')`,
    [purchaseId, userId, totalAmount]
  );
  const transactionId = txResult.insertId;

  // Create MercadoPago preference
  const preference = new Preference(client);
  const unitPrice = Number((plan.price * (1 - discountPct / 100)).toFixed(2));

  const result = await preference.create({
    body: {
      items: [
        {
          title: `${plan.name} × ${quantity} evento${quantity > 1 ? 's' : ''}`,
          quantity: quantity,
          unit_price: unitPrice,
          currency_id: 'MXN'
        }
      ],
      back_urls: {
        success: successUrl,
        failure: cancelUrl,
        pending: successUrl
      },
      auto_return: 'approved',
      external_reference: `purchase_${purchaseId}`
    }
  });

  // Update transaction with gateway session ID
  await db.query(
    'UPDATE transactions SET gateway_session_id = ? WHERE id = ?',
    [result.id, transactionId]
  );

  return { preferenceId: result.id, initPoint: result.init_point };
}

/**
 * Handles a Stripe webhook event.
 * Verifies the HMAC signature using STRIPE_WEBHOOK_SECRET.
 *
 * @param {Buffer} rawBody - The raw request body
 * @param {string} signature - The Stripe-Signature header value
 * @returns {{eventType: string, data: object}}
 */
function handleStripeWebhook(rawBody, signature) {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);

  return {
    eventType: event.type,
    data: event.data.object
  };
}

/**
 * Handles a MercadoPago webhook notification.
 * Verifies the payment by querying the MercadoPago API.
 *
 * @param {object} body - The webhook request body
 * @returns {Promise<{eventType: string, data: object}>}
 */
async function handleMPWebhook(body) {
  const client = getMercadoPagoClient();

  // MercadoPago sends topic + id in different formats
  const paymentId = body.data && body.data.id ? body.data.id : body.id;
  const topic = body.type || body.topic;

  if (!paymentId || topic !== 'payment') {
    return { eventType: 'unknown', data: body };
  }

  // Verify payment by querying MercadoPago API
  const payment = new Payment(client);
  const paymentInfo = await payment.get({ id: paymentId });

  return {
    eventType: `payment.${paymentInfo.status}`,
    data: {
      id: paymentInfo.id,
      status: paymentInfo.status,
      external_reference: paymentInfo.external_reference,
      transaction_amount: paymentInfo.transaction_amount,
      currency_id: paymentInfo.currency_id,
      payer: paymentInfo.payer,
      metadata: paymentInfo.metadata
    }
  };
}

/**
 * Creates a payment session for a postponement fee.
 *
 * @param {number} userId - The user ID
 * @param {number} eventId - The event ID to postpone
 * @param {string} gateway - Payment gateway ('stripe' or 'mercadopago')
 * @returns {Promise<{sessionId: string, url: string}>}
 */
async function processPostponementPayment(userId, eventId, gateway) {
  const db = getDB();
  const fee = parseFloat(process.env.POSTPONEMENT_FEE || '250.00');
  const successUrl = process.env.PAYMENT_SUCCESS_URL || 'http://localhost:4200/dashboard/mis-eventos?payment=success';
  const cancelUrl = process.env.PAYMENT_CANCEL_URL || 'http://localhost:4200/dashboard/mis-eventos?payment=cancelled';

  // Verify event belongs to user and is eligible for postponement
  const [events] = await db.query(
    `SELECT e.id, e.event_date, e.postponed, e.lifecycle_status
     FROM events e
     INNER JOIN user_events ue ON ue.event_id = e.id
     WHERE e.id = ? AND ue.user_id = ?`,
    [eventId, userId]
  );

  if (events.length === 0) {
    throw new Error('Event not found or not owned by user');
  }

  const event = events[0];

  if (event.lifecycle_status !== 'active') {
    throw new Error('Only active events can be postponed');
  }

  if (event.postponed) {
    throw new Error('Event has already been postponed once');
  }

  const daysUntilEvent = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilEvent <= 7) {
    throw new Error('Cannot postpone within 7 days of event date');
  }

  // Create transaction for postponement
  const [txResult] = await db.query(
    `INSERT INTO transactions (purchase_id, user_id, gateway, amount, currency, status, type, metadata)
     VALUES (NULL, ?, ?, ?, 'MXN', 'pending', 'postponement', ?)`,
    [userId, gateway, fee, JSON.stringify({ event_id: eventId })]
  );
  const transactionId = txResult.insertId;

  if (gateway === 'stripe') {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Tarifa de postergación de evento'
            },
            unit_amount: Math.round(fee * 100) // cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: String(userId),
        event_id: String(eventId),
        transaction_id: String(transactionId),
        type: 'postponement'
      }
    });

    await db.query(
      'UPDATE transactions SET gateway_session_id = ? WHERE id = ?',
      [session.id, transactionId]
    );

    return { sessionId: session.id, url: session.url };
  } else if (gateway === 'mercadopago') {
    const client = getMercadoPagoClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Tarifa de postergación de evento',
            quantity: 1,
            unit_price: fee,
            currency_id: 'MXN'
          }
        ],
        back_urls: {
          success: successUrl,
          failure: cancelUrl,
          pending: successUrl
        },
        auto_return: 'approved',
        external_reference: `postponement_${transactionId}_event_${eventId}`
      }
    });

    await db.query(
      'UPDATE transactions SET gateway_session_id = ? WHERE id = ?',
      [result.id, transactionId]
    );

    return { sessionId: result.id, url: result.init_point };
  } else {
    throw new Error(`Unsupported gateway: ${gateway}`);
  }
}

/**
 * Checks if a transaction has already been processed (idempotency).
 * Prevents duplicate processing of webhook events.
 *
 * @param {string} gatewayPaymentId - The payment ID from the gateway
 * @param {string} gateway - The gateway name ('stripe' or 'mercadopago')
 * @returns {Promise<boolean>} True if already processed, false otherwise
 */
async function isTransactionAlreadyProcessed(gatewayPaymentId, gateway) {
  const db = getDB();
  const [rows] = await db.query(
    `SELECT id FROM transactions
     WHERE gateway_payment_id = ? AND gateway = ? AND status = 'completed'`,
    [gatewayPaymentId, gateway]
  );
  return rows.length > 0;
}

/**
 * Marks a transaction as completed and updates related records.
 * Used after webhook verification confirms successful payment.
 *
 * @param {string} gatewaySessionId - The session ID from the gateway
 * @param {string} gatewayPaymentId - The payment ID from the gateway
 * @param {string} gateway - The gateway name
 * @returns {Promise<{transaction: object, purchase: object|null}>}
 */
async function completeTransaction(gatewaySessionId, gatewayPaymentId, gateway) {
  const db = getDB();

  // Find the pending transaction
  const [transactions] = await db.query(
    `SELECT * FROM transactions
     WHERE gateway_session_id = ? AND gateway = ? AND status = 'pending'`,
    [gatewaySessionId, gateway]
  );

  if (transactions.length === 0) {
    throw new Error('No pending transaction found for this session');
  }

  const transaction = transactions[0];

  // Update transaction to completed
  await db.query(
    `UPDATE transactions SET status = 'completed', gateway_payment_id = ?, updated_at = NOW() WHERE id = ?`,
    [gatewayPaymentId, transaction.id]
  );

  // If it's a purchase transaction, update the purchase
  let purchase = null;
  if (transaction.purchase_id) {
    await db.query(
      `UPDATE purchases SET status = 'completed' WHERE id = ?`,
      [transaction.purchase_id]
    );

    const [purchases] = await db.query('SELECT * FROM purchases WHERE id = ?', [transaction.purchase_id]);
    purchase = purchases[0] || null;
  }

  return { transaction, purchase };
}

/**
 * Calculates the total amount applying volume discount.
 *
 * @param {number} unitPrice - The unit price per event
 * @param {number} quantity - Number of events
 * @param {string|object|null} volumeDiscount - Volume discount rules JSON or parsed object
 * @returns {{discountPct: number, totalAmount: number}}
 */
function calculateTotal(unitPrice, quantity, volumeDiscount) {
  let discountPct = 0;

  if (volumeDiscount) {
    const rules = typeof volumeDiscount === 'string' ? JSON.parse(volumeDiscount) : volumeDiscount;

    if (Array.isArray(rules)) {
      // Find the highest applicable discount
      for (const rule of rules) {
        if (quantity >= rule.min_qty && rule.discount_pct > discountPct) {
          discountPct = rule.discount_pct;
        }
      }
    }
  }

  const totalAmount = Number((unitPrice * quantity * (1 - discountPct / 100)).toFixed(2));

  return { discountPct, totalAmount };
}

module.exports = {
  createStripeSession,
  createMercadoPagoPreference,
  handleStripeWebhook,
  handleMPWebhook,
  processPostponementPayment,
  isTransactionAlreadyProcessed,
  completeTransaction,
  calculateTotal
};
