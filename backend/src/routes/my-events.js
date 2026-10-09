const router = require('express').Router();
const Joi = require('joi');
const { getDB } = require('../models/database');
const authMiddleware = require('../middleware/auth');
const { calculateDeactivationDate } = require('../services/lifecycle.service');
const { processPostponementPayment } = require('../services/payment.service');

// Joi schema for the activate endpoint
const activateSchema = Joi.object({
  event_date: Joi.date().iso().required().messages({
    'date.base': 'event_date debe ser una fecha válida',
    'any.required': 'event_date es requerido'
  }),
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'name es requerido',
    'any.required': 'name es requerido'
  }),
  event_type: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'event_type es requerido',
    'any.required': 'event_type es requerido'
  }),
  slug: Joi.string().trim().min(1).max(200).pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required().messages({
    'string.empty': 'slug es requerido',
    'string.pattern.base': 'slug debe contener solo letras minúsculas, números y guiones',
    'any.required': 'slug es requerido'
  })
});

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/my-events
 * List events owned by the authenticated user with lifecycle info.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();

    const [events] = await db.query(
      `SELECT
        e.id,
        e.name,
        e.slug,
        e.event_type,
        e.event_date,
        e.lifecycle_status,
        e.deactivation_date,
        e.plan_type,
        e.postponed,
        e.active,
        CASE
          WHEN e.deactivation_date IS NOT NULL AND e.lifecycle_status = 'active'
            THEN DATEDIFF(e.deactivation_date, NOW())
          ELSE NULL
        END AS days_remaining,
        p.id AS purchase_id,
        p.quantity AS purchase_quantity,
        p.total_amount AS purchase_total,
        p.status AS purchase_status,
        p.created_at AS purchase_date,
        pl.name AS plan_name
      FROM events e
      INNER JOIN user_events ue ON ue.event_id = e.id
      LEFT JOIN purchases p ON p.id = e.purchase_id
      LEFT JOIN plans pl ON pl.id = p.plan_id
      WHERE ue.user_id = ?
      ORDER BY
        FIELD(e.lifecycle_status, 'available', 'active', 'completed'),
        e.event_date ASC`,
      [userId]
    );

    res.json({ events });
  } catch (err) {
    console.error('GET /api/my-events error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/my-events/:id/activate
 * Activate an available event by assigning a date, name, type, and slug.
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const db = getDB();

    // Validate body with Joi
    const { error, value } = activateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Datos de activación inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { event_date, name, event_type, slug } = value;

    // Validate event belongs to user
    const [userEvents] = await db.query(
      'SELECT ue.id FROM user_events ue WHERE ue.event_id = ? AND ue.user_id = ?',
      [eventId, userId]
    );

    if (userEvents.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Validate lifecycle_status is 'available'
    const [events] = await db.query(
      'SELECT id, lifecycle_status FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    if (events[0].lifecycle_status !== 'available') {
      return res.status(400).json({
        error: 'Solo se pueden activar eventos con estado "disponible"',
        code: 'EVENT_NOT_AVAILABLE'
      });
    }

    // Check slug uniqueness
    const [existingSlugs] = await db.query(
      'SELECT id FROM events WHERE slug = ? AND id != ?',
      [slug, eventId]
    );

    if (existingSlugs.length > 0) {
      return res.status(409).json({ error: 'El slug ya está en uso' });
    }

    // Calculate deactivation date
    const deactivationDate = calculateDeactivationDate(event_date);

    // Update event
    await db.query(
      `UPDATE events
       SET event_date = ?,
           deactivation_date = ?,
           lifecycle_status = 'active',
           active = 1,
           name = ?,
           event_type = ?,
           slug = ?
       WHERE id = ?`,
      [event_date, deactivationDate, name, event_type, slug, eventId]
    );

    // Create event_config entry for the newly activated event
    await db.query(
      `INSERT INTO event_config (event_id, config_json) VALUES (?, '{}')
       ON DUPLICATE KEY UPDATE event_id = event_id`,
      [eventId]
    );

    res.json({
      message: 'Evento activado exitosamente',
      event: {
        id: parseInt(eventId),
        name,
        slug,
        event_type,
        event_date,
        deactivation_date: deactivationDate,
        lifecycle_status: 'active'
      }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El slug ya está en uso' });
    }
    console.error('POST /api/my-events/:id/activate error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/my-events/:id/postpone
 * Validate postponement eligibility and return the fee amount.
 */
router.post('/:id/postpone', async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const db = getDB();

    // Validate event belongs to user
    const [userEvents] = await db.query(
      'SELECT ue.id FROM user_events ue WHERE ue.event_id = ? AND ue.user_id = ?',
      [eventId, userId]
    );

    if (userEvents.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Get event details
    const [events] = await db.query(
      'SELECT id, event_date, postponed, lifecycle_status FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const event = events[0];

    // Rule 3: lifecycle_status must be 'active'
    if (event.lifecycle_status !== 'active') {
      return res.status(400).json({
        error: 'Solo se pueden postergar eventos activos',
        code: 'EVENT_NOT_ACTIVE'
      });
    }

    // Rule 2: event.postponed must be false (0)
    if (event.postponed) {
      return res.status(400).json({
        error: 'Este evento ya fue postergado una vez. Cada evento solo puede postergarse una vez.',
        code: 'POSTPONEMENT_LIMIT_REACHED'
      });
    }

    // Rule 1: event_date - NOW() > 7 days
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent <= 7) {
      return res.status(400).json({
        error: 'No se puede postergar dentro de los 7 días previos al evento',
        code: 'POSTPONEMENT_TOO_CLOSE'
      });
    }

    // All rules pass - return fee
    const fee = parseFloat(process.env.POSTPONEMENT_FEE || '250.00');

    res.json({
      eligible: true,
      fee,
      currency: 'MXN',
      event_date: event.event_date,
      days_remaining: daysUntilEvent,
      message: `La tarifa de postergación es de $${fee} MXN`
    });
  } catch (err) {
    console.error('POST /api/my-events/:id/postpone error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/my-events/:id/postpone/pay
 * Process postponement payment after validation.
 * Body: { gateway, new_date }
 */
router.post('/:id/postpone/pay', async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { gateway, new_date } = req.body;
    const db = getDB();

    // Validate required fields
    if (!gateway || !new_date) {
      return res.status(400).json({
        error: 'Campos requeridos: gateway, new_date'
      });
    }

    if (!['stripe', 'mercadopago'].includes(gateway)) {
      return res.status(400).json({ error: 'Gateway inválido. Usa "stripe" o "mercadopago".' });
    }

    // Validate event belongs to user
    const [userEvents] = await db.query(
      'SELECT ue.id FROM user_events ue WHERE ue.event_id = ? AND ue.user_id = ?',
      [eventId, userId]
    );

    if (userEvents.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Get event details for validation
    const [events] = await db.query(
      'SELECT id, event_date, postponed, lifecycle_status FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const event = events[0];

    // Re-validate 3 rules before processing payment
    if (event.lifecycle_status !== 'active') {
      return res.status(400).json({
        error: 'Solo se pueden postergar eventos activos',
        code: 'EVENT_NOT_ACTIVE'
      });
    }

    if (event.postponed) {
      return res.status(400).json({
        error: 'Este evento ya fue postergado una vez. Cada evento solo puede postergarse una vez.',
        code: 'POSTPONEMENT_LIMIT_REACHED'
      });
    }

    const now = new Date();
    const eventDate = new Date(event.event_date);
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent <= 7) {
      return res.status(400).json({
        error: 'No se puede postergar dentro de los 7 días previos al evento',
        code: 'POSTPONEMENT_TOO_CLOSE'
      });
    }

    // Process postponement payment
    const result = await processPostponementPayment(userId, parseInt(eventId), gateway);

    // Store new_date in the transaction metadata so the webhook can apply it
    const db2 = getDB();
    await db2.query(
      `UPDATE transactions SET metadata = JSON_SET(COALESCE(metadata, '{}'), '$.new_date', ?)
       WHERE gateway_session_id = ? AND type = 'postponement' AND status = 'pending'`,
      [new_date, result.sessionId]
    );

    res.json({
      message: 'Sesión de pago creada para postergación',
      session_url: result.url,
      session_id: result.sessionId
    });
  } catch (err) {
    console.error('POST /api/my-events/:id/postpone/pay error:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
});

module.exports = router;
