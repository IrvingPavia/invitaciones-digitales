const express = require('express');
const XLSX = require('xlsx');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { logAudit } = require('../utils/audit');
const { deactivateExpiredEvents } = require('../services/lifecycle.service');

const router = express.Router();

// All routes require auth + root/admin role
router.use(auth, requireRole('root', 'admin'));

// GET /api/admin/purchases — listado con filtros y paginación
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { status, plan_id, from_date, to_date, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    let where = '1=1';
    const params = [];

    if (status) {
      where += ' AND p.status = ?';
      params.push(status);
    }
    if (plan_id) {
      where += ' AND p.plan_id = ?';
      params.push(parseInt(plan_id));
    }
    if (from_date) {
      where += ' AND p.created_at >= ?';
      params.push(from_date);
    }
    if (to_date) {
      where += ' AND p.created_at <= ?';
      params.push(to_date);
    }

    // Count total
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM purchases p WHERE ${where}`,
      params
    );
    const total = countRows[0].total;

    // Fetch with joins
    const [purchases] = await db.query(
      `SELECT p.*, u.username, u.full_name as user_name, u.email as user_email, pl.name as plan_name
       FROM purchases p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN plans pl ON p.plan_id = pl.id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      purchases,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/metrics — dashboard métricas
router.get('/metrics', async (req, res) => {
  try {
    const db = getDB();

    // Revenue this month
    const [revenueRows] = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue_month
      FROM purchases
      WHERE status = 'completed'
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    // Sales by plan
    const [salesByPlan] = await db.query(`
      SELECT pl.name as plan_name, COUNT(p.id) as count, COALESCE(SUM(p.total_amount), 0) as total
      FROM purchases p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.status = 'completed'
      GROUP BY p.plan_id, pl.name
    `);

    // Trial conversion: ratio of users who used trial and then purchased
    const [trialUsers] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as total_trial_users
      FROM purchases p
      JOIN plans pl ON p.plan_id = pl.id
      WHERE pl.is_trial = 1 AND p.status = 'completed'
    `);

    const [convertedUsers] = await db.query(`
      SELECT COUNT(DISTINCT p2.user_id) as converted_users
      FROM purchases p2
      JOIN plans pl2 ON p2.plan_id = pl2.id
      WHERE pl2.is_trial = 0
        AND p2.status = 'completed'
        AND p2.user_id IN (
          SELECT DISTINCT p.user_id
          FROM purchases p
          JOIN plans pl ON p.plan_id = pl.id
          WHERE pl.is_trial = 1 AND p.status = 'completed'
        )
    `);

    const totalTrialUsers = trialUsers[0].total_trial_users;
    const convertedCount = convertedUsers[0].converted_users;
    const trialConversion = totalTrialUsers > 0
      ? Math.round((convertedCount / totalTrialUsers) * 100) / 100
      : 0;

    // Active events
    const [activeEvents] = await db.query(`
      SELECT COUNT(*) as active_events
      FROM events
      WHERE lifecycle_status = 'active'
    `);

    res.json({
      revenue_month: revenueRows[0].revenue_month,
      sales_by_plan: salesByPlan,
      trial_conversion: {
        trial_users: totalTrialUsers,
        converted: convertedCount,
        ratio: trialConversion
      },
      active_events: activeEvents[0].active_events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/purchases/export — export purchases as Excel
router.get('/export', async (req, res) => {
  try {
    const db = getDB();
    const { status, plan_id, from_date, to_date } = req.query;

    let where = '1=1';
    const params = [];

    if (status) {
      where += ' AND p.status = ?';
      params.push(status);
    }
    if (plan_id) {
      where += ' AND p.plan_id = ?';
      params.push(parseInt(plan_id));
    }
    if (from_date) {
      where += ' AND p.created_at >= ?';
      params.push(from_date);
    }
    if (to_date) {
      where += ' AND p.created_at <= ?';
      params.push(to_date);
    }

    const [purchases] = await db.query(
      `SELECT p.id, u.username, u.full_name as user_name, u.email as user_email,
              pl.name as plan_name, p.quantity, p.unit_price, p.discount_pct,
              p.total_amount, p.status, p.events_assigned, p.created_at
       FROM purchases p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN plans pl ON p.plan_id = pl.id
       WHERE ${where}
       ORDER BY p.created_at DESC`,
      params
    );

    // Build workbook
    const wsData = [
      ['ID', 'Usuario', 'Nombre', 'Email', 'Plan', 'Cantidad', 'Precio Unitario', 'Descuento %', 'Total', 'Estado', 'Eventos Asignados', 'Fecha'],
      ...purchases.map(p => [
        p.id, p.username, p.user_name, p.user_email, p.plan_name,
        p.quantity, p.unit_price, p.discount_pct, p.total_amount,
        p.status, p.events_assigned, p.created_at
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Compras');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=compras.xlsx');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/purchases/:id — detalle de una compra con eventos y transacciones
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const purchaseId = parseInt(req.params.id);
    if (isNaN(purchaseId)) return res.status(400).json({ error: 'ID inválido' });

    const [purchases] = await db.query(
      `SELECT p.*, u.username, u.full_name as user_name, u.email as user_email, pl.name as plan_name
       FROM purchases p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN plans pl ON p.plan_id = pl.id
       WHERE p.id = ?`,
      [purchaseId]
    );

    if (purchases.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });

    // Get events associated with this purchase
    const [events] = await db.query(
      `SELECT id, name, slug, event_type, event_date, lifecycle_status, deactivation_date, active, created_at
       FROM events WHERE purchase_id = ?`,
      [purchaseId]
    );

    // Get transactions for this purchase
    const [transactions] = await db.query(
      `SELECT id, gateway, gateway_session_id, gateway_payment_id, amount, currency, status, type, metadata, created_at, updated_at
       FROM transactions WHERE purchase_id = ?`,
      [purchaseId]
    );

    res.json({
      ...purchases[0],
      events,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== EVENTS ADMIN ROUTES ===================

const eventsAdminRouter = express.Router();
eventsAdminRouter.use(auth, requireRole('root', 'admin'));

// PUT /api/admin/events/:id/extend — extend deactivation_date
eventsAdminRouter.put('/:id/extend', async (req, res) => {
  try {
    const db = getDB();
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: 'ID inválido' });

    const { new_deactivation_date, reason } = req.body;
    if (!new_deactivation_date) {
      return res.status(400).json({ error: 'new_deactivation_date es requerido' });
    }

    const parsedDate = new Date(new_deactivation_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'new_deactivation_date no es una fecha válida' });
    }

    // Get current event
    const [events] = await db.query(
      'SELECT id, deactivation_date FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

    const previousDate = events[0].deactivation_date;

    await db.query(
      'UPDATE events SET deactivation_date = ?, lifecycle_status = \'active\', active = 1 WHERE id = ?',
      [parsedDate, eventId]
    );

    // Record in audit_log
    await logAudit(
      req.user.id,
      req.user.username,
      'extend_deactivation',
      'event',
      eventId,
      { previous_date: previousDate, new_date: parsedDate, reason: reason || null }
    );

    res.json({
      message: 'Fecha de desactivación actualizada',
      previous_date: previousDate,
      new_date: parsedDate,
      reason: reason || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/events/expired — list expired active events
eventsAdminRouter.get('/expired', async (req, res) => {
  try {
    const db = getDB();

    const [expiredEvents] = await db.query(`
      SELECT e.id, e.name, e.event_date, e.deactivation_date,
             u.email as user_email, u.username,
             DATEDIFF(NOW(), e.deactivation_date) as days_overdue
      FROM events e
      LEFT JOIN user_events ue ON e.id = ue.event_id
      LEFT JOIN users u ON ue.user_id = u.id
      WHERE e.lifecycle_status = 'active'
        AND e.deactivation_date < NOW()
      ORDER BY e.deactivation_date ASC
    `);

    res.json({
      expired_events: expiredEvents,
      total: expiredEvents.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/events/deactivate-expired — deactivate all expired events
eventsAdminRouter.post('/deactivate-expired', async (req, res) => {
  try {
    const result = await deactivateExpiredEvents();

    // Record in audit_log
    await logAudit(
      req.user.id,
      req.user.username,
      'deactivate_expired_batch',
      'event',
      null,
      { deactivated_count: result.deactivatedCount }
    );

    res.json({
      deactivated_count: result.deactivatedCount,
      message: `${result.deactivatedCount} eventos marcados como completados`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/events/:id/complete — mark individual event as completed
eventsAdminRouter.patch('/:id/complete', async (req, res) => {
  try {
    const db = getDB();
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) return res.status(400).json({ error: 'ID inválido' });

    // Check event exists
    const [events] = await db.query(
      'SELECT id, name, lifecycle_status FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });

    if (events[0].lifecycle_status === 'completed') {
      return res.status(400).json({ error: 'El evento ya está completado' });
    }

    await db.query(
      "UPDATE events SET lifecycle_status = 'completed', active = 0 WHERE id = ?",
      [eventId]
    );

    // Record in audit_log
    await logAudit(
      req.user.id,
      req.user.username,
      'complete_event',
      'event',
      eventId,
      { previous_status: events[0].lifecycle_status, event_name: events[0].name }
    );

    res.json({ message: `Evento "${events[0].name}" marcado como completado` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== ADMIN GENERAL ROUTES (mounted at /api/admin) ===================

const adminGeneralRouter = express.Router();
adminGeneralRouter.use(auth, requireRole('root', 'admin'));

// GET /api/admin/metrics — dashboard métricas (also accessible via /api/admin/purchases/metrics)
adminGeneralRouter.get('/metrics', async (req, res) => {
  try {
    const db = getDB();

    // Revenue this month
    const [revenueRows] = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue_month
      FROM purchases
      WHERE status = 'completed'
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    // Sales by plan
    const [salesByPlan] = await db.query(`
      SELECT pl.name as plan_name, COUNT(p.id) as count, COALESCE(SUM(p.total_amount), 0) as total
      FROM purchases p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.status = 'completed'
      GROUP BY p.plan_id, pl.name
    `);

    // Trial conversion
    const [trialUsers] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as total_trial_users
      FROM purchases p
      JOIN plans pl ON p.plan_id = pl.id
      WHERE pl.is_trial = 1 AND p.status = 'completed'
    `);

    const [convertedUsers] = await db.query(`
      SELECT COUNT(DISTINCT p2.user_id) as converted_users
      FROM purchases p2
      JOIN plans pl2 ON p2.plan_id = pl2.id
      WHERE pl2.is_trial = 0
        AND p2.status = 'completed'
        AND p2.user_id IN (
          SELECT DISTINCT p.user_id
          FROM purchases p
          JOIN plans pl ON p.plan_id = pl.id
          WHERE pl.is_trial = 1 AND p.status = 'completed'
        )
    `);

    const totalTrialUsers = trialUsers[0].total_trial_users;
    const convertedCount = convertedUsers[0].converted_users;
    const trialConversion = totalTrialUsers > 0
      ? Math.round((convertedCount / totalTrialUsers) * 100) / 100
      : 0;

    // Active events
    const [activeEvents] = await db.query(`
      SELECT COUNT(*) as active_events
      FROM events
      WHERE lifecycle_status = 'active'
    `);

    res.json({
      revenue_month: revenueRows[0].revenue_month,
      sales_by_plan: salesByPlan,
      trial_conversion: {
        trial_users: totalTrialUsers,
        converted: convertedCount,
        ratio: trialConversion
      },
      active_events: activeEvents[0].active_events
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { purchasesRouter: router, eventsAdminRouter, adminGeneralRouter };
