const { getDB } = require('../models/database');

/**
 * Lifecycle Service
 * Manages the lifecycle of purchased events: activation, deactivation, and status queries.
 */

/**
 * Calculates the deactivation date for an event.
 * The deactivation date is always event_date + 3 calendar days.
 *
 * @param {Date|string} eventDate - The event date
 * @returns {Date} The deactivation date (eventDate + 3 days)
 */
function calculateDeactivationDate(eventDate) {
  const date = new Date(eventDate);
  date.setDate(date.getDate() + 3);
  return date;
}

/**
 * Queries the current lifecycle_status of an event from the database.
 *
 * @param {number} eventId - The event ID
 * @returns {Promise<string|null>} The lifecycle_status ('available'|'active'|'completed') or null if not found
 */
async function getEventLifecycleStatus(eventId) {
  const db = getDB();
  const [rows] = await db.query(
    'SELECT lifecycle_status FROM events WHERE id = ?',
    [eventId]
  );
  if (rows.length === 0) {
    return null;
  }
  return rows[0].lifecycle_status;
}

/**
 * Deactivates all expired events for manual use by admin.
 * Updates events where lifecycle_status='active' AND deactivation_date < NOW()
 * to lifecycle_status='completed' and active=0.
 *
 * @returns {Promise<{deactivatedCount: number}>} The number of events deactivated
 */
async function deactivateExpiredEvents() {
  const db = getDB();
  const [result] = await db.query(`
    UPDATE events
    SET lifecycle_status = 'completed', active = 0
    WHERE lifecycle_status = 'active'
      AND deactivation_date IS NOT NULL
      AND deactivation_date < NOW()
  `);
  return { deactivatedCount: result.affectedRows };
}

module.exports = {
  calculateDeactivationDate,
  getEventLifecycleStatus,
  deactivateExpiredEvents
};
