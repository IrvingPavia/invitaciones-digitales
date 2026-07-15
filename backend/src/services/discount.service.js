const { getDB } = require('../models/database');

/**
 * Discount Service
 * Handles volume discount calculations for plan purchases.
 */

/**
 * Calculates the volume discount and total amount for a plan purchase.
 *
 * Reads the `volume_discount` JSON rules from the plan record in the database.
 * The JSON format is: [{min_qty: number, discount_pct: number}]
 *
 * Applies the greatest `discount_pct` whose `min_qty` does not exceed the given quantity.
 * Calculates total as: price × quantity × (1 - discount/100)
 *
 * @param {number} planId - The plan ID to look up
 * @param {number} quantity - The number of events being purchased
 * @returns {Promise<{unitPrice: number, quantity: number, discountPct: number, totalAmount: number}>}
 * @throws {Error} If plan is not found
 */
async function calculateVolumeDiscount(planId, quantity) {
  const db = getDB();
  const [rows] = await db.query(
    'SELECT price, volume_discount FROM plans WHERE id = ?',
    [planId]
  );

  if (rows.length === 0) {
    throw new Error('Plan not found');
  }

  const plan = rows[0];
  const unitPrice = parseFloat(plan.price);
  let discountPct = 0;

  // Parse volume_discount rules from JSON
  let rules = plan.volume_discount;
  if (typeof rules === 'string') {
    try {
      rules = JSON.parse(rules);
    } catch (e) {
      rules = null;
    }
  }

  // Find the applicable discount: greatest discount_pct whose min_qty <= quantity
  if (Array.isArray(rules) && rules.length > 0) {
    for (const rule of rules) {
      if (rule.min_qty <= quantity && rule.discount_pct > discountPct) {
        discountPct = rule.discount_pct;
      }
    }
  }

  const totalAmount = parseFloat((unitPrice * quantity * (1 - discountPct / 100)).toFixed(2));

  return {
    unitPrice,
    quantity,
    discountPct,
    totalAmount
  };
}

module.exports = {
  calculateVolumeDiscount
};
