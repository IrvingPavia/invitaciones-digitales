const { getDB } = require('../models/database');

/**
 * Log an action to the audit trail.
 * Non-blocking — errors are caught and logged, never thrown.
 */
async function logAudit(userId, username, action, entityType, entityId, details = null) {
  try {
    await getDB().query(
      'INSERT INTO audit_log (user_id, username, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('[Audit] Failed to log:', err.message);
  }
}

module.exports = { logAudit };
