const express = require('express');
const Joi = require('joi');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

// =================== Joi Schemas ===================

const createPlanSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required()
    .messages({ 'string.empty': 'El nombre del plan es requerido' }),
  slug: Joi.string().trim().min(1).max(100).pattern(/^[a-z0-9-]+$/).required()
    .messages({
      'string.empty': 'El slug es requerido',
      'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones'
    }),
  description: Joi.string().trim().max(2000).allow('', null).default(null),
  price: Joi.number().precision(2).min(0).required()
    .messages({ 'number.base': 'El precio es requerido' }),
  features: Joi.array().items(Joi.string().trim()).default([]),
  max_guests: Joi.number().integer().min(1).allow(null).default(null),
  is_trial: Joi.boolean().default(false),
  trial_days: Joi.number().integer().min(1).allow(null).default(null),
  volume_discount: Joi.array().items(
    Joi.object({
      min_qty: Joi.number().integer().min(1).required(),
      discount_pct: Joi.number().min(0).max(100).required()
    })
  ).allow(null).default(null),
  status: Joi.string().valid('active', 'inactive').default('active'),
  sort_order: Joi.number().integer().min(0).default(0),
});

const updatePlanSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required()
    .messages({ 'string.empty': 'El nombre del plan es requerido' }),
  slug: Joi.string().trim().min(1).max(100).pattern(/^[a-z0-9-]+$/).required()
    .messages({
      'string.empty': 'El slug es requerido',
      'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones'
    }),
  description: Joi.string().trim().max(2000).allow('', null).default(null),
  price: Joi.number().precision(2).min(0).required()
    .messages({ 'number.base': 'El precio es requerido' }),
  features: Joi.array().items(Joi.string().trim()).default([]),
  max_guests: Joi.number().integer().min(1).allow(null).default(null),
  is_trial: Joi.boolean().default(false),
  trial_days: Joi.number().integer().min(1).allow(null).default(null),
  volume_discount: Joi.array().items(
    Joi.object({
      min_qty: Joi.number().integer().min(1).required(),
      discount_pct: Joi.number().min(0).max(100).required()
    })
  ).allow(null).default(null),
  status: Joi.string().valid('active', 'inactive').default('active'),
  sort_order: Joi.number().integer().min(0).default(0),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required()
    .messages({ 'any.only': 'El status debe ser active o inactive' }),
});

// =================== PUBLIC ROUTER ===================

const publicRouter = express.Router();

// GET /api/plans — list active plans (no auth)
publicRouter.get('/', async (req, res) => {
  try {
    const db = getDB();
    const [plans] = await db.query(
      `SELECT id, name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, sort_order
       FROM plans
       WHERE status = 'active'
       ORDER BY sort_order ASC`
    );

    // Parse JSON fields
    const parsed = plans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []),
      volume_discount: typeof plan.volume_discount === 'string' ? JSON.parse(plan.volume_discount) : (plan.volume_discount || null),
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/plans/:id — single plan detail (no auth)
publicRouter.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ error: 'ID inválido' });

    const [rows] = await db.query(
      `SELECT id, name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order, created_at, updated_at
       FROM plans
       WHERE id = ?`,
      [planId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });

    const plan = rows[0];
    plan.features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []);
    plan.volume_discount = typeof plan.volume_discount === 'string' ? JSON.parse(plan.volume_discount) : (plan.volume_discount || null);

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== ADMIN ROUTER ===================

const adminRouter = express.Router();

// All admin routes require auth + root/admin role
adminRouter.use(auth, requireRole('root', 'admin'));

// POST /api/admin/plans — create plan
adminRouter.post('/', validate(createPlanSchema), async (req, res) => {
  try {
    const db = getDB();
    const { name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order } = req.body;

    // Check slug uniqueness
    const [existing] = await db.query('SELECT id FROM plans WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El slug ya está en uso' });
    }

    const [result] = await db.query(
      `INSERT INTO plans (name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description,
        price,
        JSON.stringify(features),
        max_guests,
        is_trial ? 1 : 0,
        trial_days,
        volume_discount ? JSON.stringify(volume_discount) : null,
        status,
        sort_order
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Plan creado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/plans/:id — update plan
adminRouter.put('/:id', validate(updatePlanSchema), async (req, res) => {
  try {
    const db = getDB();
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ error: 'ID inválido' });

    // Check plan exists
    const [existing] = await db.query('SELECT id FROM plans WHERE id = ?', [planId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });

    const { name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order } = req.body;

    // Check slug uniqueness (exclude current plan)
    const [slugConflict] = await db.query('SELECT id FROM plans WHERE slug = ? AND id != ?', [slug, planId]);
    if (slugConflict.length > 0) {
      return res.status(400).json({ error: 'El slug ya está en uso por otro plan' });
    }

    await db.query(
      `UPDATE plans SET name=?, slug=?, description=?, price=?, features=?, max_guests=?, is_trial=?, trial_days=?, volume_discount=?, status=?, sort_order=?
       WHERE id=?`,
      [
        name,
        slug,
        description,
        price,
        JSON.stringify(features),
        max_guests,
        is_trial ? 1 : 0,
        trial_days,
        volume_discount ? JSON.stringify(volume_discount) : null,
        status,
        sort_order,
        planId
      ]
    );

    res.json({ message: 'Plan actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/plans/:id/status — activate/deactivate plan
adminRouter.patch('/:id/status', validate(statusSchema), async (req, res) => {
  try {
    const db = getDB();
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) return res.status(400).json({ error: 'ID inválido' });

    // Check plan exists
    const [existing] = await db.query('SELECT id, name FROM plans WHERE id = ?', [planId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });

    const { status } = req.body;

    await db.query('UPDATE plans SET status = ? WHERE id = ?', [status, planId]);

    res.json({ message: `Plan "${existing[0].name}" ${status === 'active' ? 'activado' : 'desactivado'} exitosamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { publicRouter, adminRouter };
