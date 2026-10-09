/**
 * Permission middleware for package-based feature access control.
 * Validates that the user's event plan includes the requested feature.
 */

const { getDB } = require('../models/database');

/**
 * Feature mapping by package name (plan_type).
 * Each package grants access to specific features.
 */
const PLAN_FEATURES = {
  'Invitación Digital': ['landing_builder', 'guest_management', 'qr_codes'],
  'Tarjeta Física': ['card_editor', 'pdf_export'],
  'Completo': ['all'],
  'Trial': ['all']
};

/**
 * Get the list of features included in a given plan type.
 * @param {string} planType - The plan_type value from the events table
 * @returns {string[]} Array of feature strings included in the plan
 */
function getPlanFeatures(planType) {
  if (!planType) return [];
  return PLAN_FEATURES[planType] || [];
}

/**
 * Middleware factory that validates access to a specific feature
 * based on the event's plan_type.
 *
 * @param {string} feature - One of: 'landing_builder', 'card_editor', 'pdf_export',
 *   'qr_codes', 'guest_management', 'all'
 * @returns {Function} Express middleware
 */
function requirePackageFeature(feature) {
  return async (req, res, next) => {
    try {
      // Admin/root bypass: non-self-registered admins skip all checks
      if (['root', 'admin'].includes(req.user.role) && !req.user.self_registered) {
        return next();
      }

      const eventId = req.params.eventId || req.params.id;
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID requerido' });
      }

      const db = getDB();

      // Look up the event's plan_type and lifecycle_status
      const [events] = await db.query(
        'SELECT lifecycle_status, plan_type FROM events WHERE id = ?',
        [eventId]
      );

      if (!events[0]) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const event = events[0];

      // Check if event is completed (read-only)
      if (event.lifecycle_status === 'completed') {
        return res.status(403).json({
          error: 'Este evento está completado. Solo acceso de lectura disponible.',
          code: 'EVENT_COMPLETED'
        });
      }

      // Verify feature is included in the event's plan
      const planFeatures = getPlanFeatures(event.plan_type);

      if (!planFeatures.includes('all') && !planFeatures.includes(feature)) {
        return res.status(403).json({
          error: 'Tu paquete no incluye esta funcionalidad.',
          code: 'FEATURE_NOT_INCLUDED',
          required_feature: feature
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: 'Error al verificar permisos: ' + err.message });
    }
  };
}

/**
 * Middleware that verifies the event is not completed (lifecycle_status !== 'completed').
 * Use this when you only need to block writes on completed events without
 * checking specific feature access.
 */
async function requireActiveEvent(req, res, next) {
  try {
    // Admin/root bypass: non-self-registered admins skip all checks
    if (['root', 'admin'].includes(req.user.role) && !req.user.self_registered) {
      return next();
    }

    const eventId = req.params.eventId || req.params.id;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID requerido' });
    }

    const db = getDB();

    const [events] = await db.query(
      'SELECT lifecycle_status FROM events WHERE id = ?',
      [eventId]
    );

    if (!events[0]) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    if (events[0].lifecycle_status === 'completed') {
      return res.status(403).json({
        error: 'Este evento está completado. Solo acceso de lectura disponible.',
        code: 'EVENT_COMPLETED'
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error al verificar estado del evento: ' + err.message });
  }
}

module.exports = {
  requirePackageFeature,
  requireActiveEvent,
  getPlanFeatures,
  PLAN_FEATURES
};
