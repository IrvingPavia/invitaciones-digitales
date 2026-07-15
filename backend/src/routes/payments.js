const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');
const {
  createStripeSession,
  createMercadoPagoPreference,
  handleStripeWebhook,
  handleMPWebhook,
  isTransactionAlreadyProcessed,
  completeTransaction,
} = require('../services/payment.service');
const { sendPaymentConfirmation, sendPostponementConfirmation } = require('../services/email.service');
const { calculateDeactivationDate } = require('../services/lifecycle.service');

const router = express.Router();

// =================== Joi Schemas ===================

const createSessionSchema = Joi.object({
  plan_id: Joi.number().integer().min(1).required()
    .messages({ 'number.base': 'El plan_id es requerido', 'any.required': 'El plan_id es requerido' }),
  quantity: Joi.number().integer().min(1).max(100).required()
    .messages({ 'number.base': 'La cantidad es requerida', 'number.min': 'La cantidad mínima es 1' }),
  gateway: Joi.string().valid('stripe', 'mercadopago').required()
    .messages({ 'any.only': 'El gateway debe ser stripe o mercadopago', 'any.required': 'El gateway es requerido' }),
});

// =================== POST /api/payments/create-session ===================
// Requires auth (client role)

router.post('/create-session', auth, requireRole('client'), validate(createSessionSchema), async (req, res) => {
  try {
    const { plan_id, quantity, gateway } = req.body;
    const userId = req.user.id;

    const successUrl = process.env.PAYMENT_SUCCESS_URL || 'http://localhost:4200/dashboard/mis-eventos?payment=success';
    const cancelUrl = process.env.PAYMENT_CANCEL_URL || 'http://localhost:4200/dashboard/paquetes?payment=cancelled';

    let result;

    if (gateway === 'stripe') {
      const { sessionId, url } = await createStripeSession(userId, plan_id, quantity, successUrl, cancelUrl);
      // Get the transaction ID
      const db = getDB();
      const [txRows] = await db.query(
        `SELECT id FROM transactions WHERE gateway_session_id = ? AND gateway = 'stripe' ORDER BY id DESC LIMIT 1`,
        [sessionId]
      );
      result = {
        session_url: url,
        transaction_id: txRows.length > 0 ? txRows[0].id : null,
      };
    } else {
      // mercadopago
      const { preferenceId, initPoint } = await createMercadoPagoPreference(userId, plan_id, quantity, successUrl, cancelUrl);
      // Get the transaction ID
      const db = getDB();
      const [txRows] = await db.query(
        `SELECT id FROM transactions WHERE gateway_session_id = ? AND gateway = 'mercadopago' ORDER BY id DESC LIMIT 1`,
        [preferenceId]
      );
      result = {
        session_url: initPoint,
        transaction_id: txRows.length > 0 ? txRows[0].id : null,
      };
    }

    res.json(result);
  } catch (err) {
    console.error('Create payment session error:', err);
    if (err.message === 'Plan not found or inactive') {
      return res.status(400).json({ error: 'Plan no encontrado o inactivo' });
    }
    res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
  }
});

// =================== POST /api/payments/webhook/stripe ===================
// NO auth — uses HMAC signature verification
// Body must be raw buffer (configured in index.js)

router.post('/webhook/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe-Signature header' });
    }

    // req.body should be a raw Buffer (express.raw middleware applied in index.js)
    const rawBody = req.body;

    // Verify webhook signature and parse event
    const { eventType, data } = handleStripeWebhook(rawBody, signature);

    // Only process checkout.session.completed events
    if (eventType === 'checkout.session.completed') {
      const sessionId = data.id;
      const paymentIntentId = data.payment_intent;

      // Idempotency check
      const alreadyProcessed = await isTransactionAlreadyProcessed(paymentIntentId, 'stripe');
      if (alreadyProcessed) {
        return res.json({ received: true, message: 'Already processed' });
      }

      // Complete the transaction
      const { transaction, purchase } = await completeTransaction(sessionId, paymentIntentId, 'stripe');

      // If it's a purchase transaction, create events and send email
      if (purchase) {
        await createEventsForPurchase(purchase, transaction.user_id);
        await sendConfirmationEmail(purchase, transaction);
      } else if (transaction.type === 'postponement') {
        // Handle postponement confirmation
        await applyPostponement(transaction);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    if (err.type === 'StripeSignatureVerificationError') {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// =================== POST /api/payments/webhook/mercadopago ===================
// NO auth — verifies payment via MercadoPago API query

router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const body = req.body;

    // Parse and verify webhook
    const { eventType, data } = await handleMPWebhook(body);

    // Only process approved payments
    if (eventType === 'payment.approved') {
      const externalReference = data.external_reference;
      const paymentId = String(data.id);

      if (!externalReference) {
        return res.json({ received: true, message: 'No external_reference' });
      }

      // Idempotency check
      const alreadyProcessed = await isTransactionAlreadyProcessed(paymentId, 'mercadopago');
      if (alreadyProcessed) {
        return res.json({ received: true, message: 'Already processed' });
      }

      // Find the transaction by external_reference
      // external_reference format: purchase_{purchaseId} or postponement_{transactionId}_event_{eventId}
      const db = getDB();

      if (externalReference.startsWith('purchase_')) {
        const purchaseId = parseInt(externalReference.replace('purchase_', ''));

        // Find the pending transaction for this purchase
        const [txRows] = await db.query(
          `SELECT gateway_session_id FROM transactions WHERE purchase_id = ? AND gateway = 'mercadopago' AND status = 'pending' LIMIT 1`,
          [purchaseId]
        );

        if (txRows.length === 0) {
          return res.json({ received: true, message: 'No pending transaction found' });
        }

        const { transaction, purchase } = await completeTransaction(txRows[0].gateway_session_id, paymentId, 'mercadopago');

        // Create events and send email
        if (purchase) {
          await createEventsForPurchase(purchase, transaction.user_id);
          await sendConfirmationEmail(purchase, transaction);
        }
      } else if (externalReference.startsWith('postponement_')) {
        // Handle postponement payment confirmation
        const parts = externalReference.split('_');
        // Format: postponement_{transactionId}_event_{eventId}
        const transactionId = parseInt(parts[1]);
        const eventId = parseInt(parts[3]);

        const [txRows] = await db.query(
          `SELECT gateway_session_id FROM transactions WHERE id = ? AND gateway = 'mercadopago' AND status = 'pending' LIMIT 1`,
          [transactionId]
        );

        if (txRows.length > 0) {
          const { transaction } = await completeTransaction(txRows[0].gateway_session_id, paymentId, 'mercadopago');
          await applyPostponement(transaction);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('MercadoPago webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// =================== GET /api/payments/status/:transactionId ===================
// Requires auth (client role)

router.get('/status/:transactionId', auth, requireRole('client'), async (req, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    if (isNaN(transactionId)) {
      return res.status(400).json({ error: 'ID de transacción inválido' });
    }

    const db = getDB();
    const userId = req.user.id;

    // Get transaction belonging to the authenticated user
    const [rows] = await db.query(
      `SELECT t.id, t.purchase_id, t.gateway, t.amount, t.currency, t.status, t.type, t.created_at, t.updated_at
       FROM transactions t
       WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get transaction status error:', err);
    res.status(500).json({ error: 'Error al consultar el estado de la transacción' });
  }
});

// =================== Helper Functions ===================

/**
 * Creates N events with lifecycle_status='available' for a completed purchase
 * and assigns them to the user via user_events.
 */
async function createEventsForPurchase(purchase, userId) {
  const db = getDB();

  // Get plan info for the event
  const [plans] = await db.query('SELECT name, slug, features FROM plans WHERE id = ?', [purchase.plan_id]);
  const plan = plans[0];
  const planType = plan ? plan.name : null;

  for (let i = 0; i < purchase.quantity; i++) {
    const eventSlug = uuidv4();
    const eventName = 'Evento disponible';
    const eventType = plan ? plan.name : 'Por definir';

    // Create event with lifecycle_status = 'available'
    const [eventResult] = await db.query(
      `INSERT INTO events (slug, name, event_type, event_date, active, lifecycle_status, purchase_id, plan_type)
       VALUES (?, ?, ?, NOW(), 0, 'available', ?, ?)`,
      [eventSlug, eventName, eventType, purchase.id, planType]
    );

    const eventId = eventResult.insertId;

    // Assign event to user via user_events
    await db.query(
      `INSERT INTO user_events (user_id, event_id) VALUES (?, ?)`,
      [userId, eventId]
    );
  }

  // Update purchase events_assigned count
  await db.query(
    `UPDATE purchases SET events_assigned = ? WHERE id = ?`,
    [purchase.quantity, purchase.id]
  );
}

/**
 * Sends payment confirmation email to the user.
 */
async function sendConfirmationEmail(purchase, transaction) {
  try {
    const db = getDB();

    // Get user info
    const [users] = await db.query(
      'SELECT email, full_name FROM users WHERE id = ?',
      [transaction.user_id]
    );

    if (users.length === 0 || !users[0].email) return;

    // Get plan info
    const [plans] = await db.query('SELECT name FROM plans WHERE id = ?', [purchase.plan_id]);
    const planName = plans.length > 0 ? plans[0].name : 'Paquete';

    await sendPaymentConfirmation(users[0].email, {
      name: users[0].full_name || 'Usuario',
      planName,
      quantity: purchase.quantity,
      unitPrice: parseFloat(purchase.unit_price),
      discountPct: parseFloat(purchase.discount_pct),
      totalAmount: parseFloat(purchase.total_amount),
      transactionId: String(transaction.id),
    });
  } catch (emailErr) {
    // Non-blocking: log error but don't fail the webhook
    console.error('Error sending payment confirmation email:', emailErr.message);
  }
}

/**
 * Applies a postponement to an event after payment is confirmed.
 * Updates event_date, recalculates deactivation_date, sets postponed=1,
 * and inserts a record into the postponements table.
 */
async function applyPostponement(transaction) {
  const db = getDB();

  // Get event_id from transaction metadata
  const metadata = typeof transaction.metadata === 'string'
    ? JSON.parse(transaction.metadata)
    : transaction.metadata;

  const eventId = metadata && metadata.event_id;
  if (!eventId) {
    console.error('applyPostponement: No event_id in transaction metadata', transaction.id);
    return;
  }

  // Get current event info
  const [events] = await db.query(
    'SELECT id, event_date FROM events WHERE id = ?',
    [eventId]
  );

  if (events.length === 0) {
    console.error('applyPostponement: Event not found', eventId);
    return;
  }

  const event = events[0];
  const originalDate = event.event_date;

  // Get the new_date from transaction metadata (stored when payment was initiated)
  // If new_date is not in metadata, use the original date (fallback)
  const newDate = metadata.new_date || originalDate;
  const newDeactivationDate = calculateDeactivationDate(newDate);

  // Update event: new date, recalculate deactivation, mark postponed
  await db.query(
    `UPDATE events
     SET event_date = ?,
         deactivation_date = ?,
         postponed = 1
     WHERE id = ?`,
    [newDate, newDeactivationDate, eventId]
  );

  // Insert into postponements table
  await db.query(
    `INSERT INTO postponements (event_id, user_id, original_date, new_date, transaction_id)
     VALUES (?, ?, ?, ?, ?)`,
    [eventId, transaction.user_id, originalDate, newDate, transaction.id]
  );

  // Send postponement confirmation email
  try {
    const [users] = await db.query(
      'SELECT email, full_name FROM users WHERE id = ?',
      [transaction.user_id]
    );
    if (users.length > 0 && users[0].email) {
      const [eventInfo] = await db.query('SELECT name FROM events WHERE id = ?', [eventId]);
      await sendPostponementConfirmation(users[0].email, {
        name: users[0].full_name || users[0].email,
        eventName: eventInfo.length > 0 ? eventInfo[0].name : 'Evento',
        originalDate: originalDate,
        newDate: newDate,
        deactivationDate: newDeactivationDate
      });
    }
  } catch (emailErr) {
    console.error('Failed to send postponement confirmation email:', emailErr);
  }
}

module.exports = router;
