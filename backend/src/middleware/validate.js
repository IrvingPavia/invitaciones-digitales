const Joi = require('joi');

/**
 * Express middleware factory for Joi validation.
 * Usage: router.post('/path', validate(schema), handler)
 * Validates req.body against the schema. Returns 400 on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });
    if (error) {
      const details = error.details.map(d => d.message).join('; ');
      return res.status(400).json({ error: details });
    }
    req.body = value; // Use sanitized values
    next();
  };
}

/**
 * Same as validate but for req.params
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map(d => d.message).join('; ');
      return res.status(400).json({ error: details });
    }
    req.params = value;
    next();
  };
}

// =================== SCHEMAS ===================

// --- Auth ---
const loginSchema = Joi.object({
  username: Joi.string().trim().min(1).max(50).required()
    .messages({ 'string.empty': 'Username es requerido', 'string.max': 'Username muy largo' }),
  password: Joi.string().min(1).max(128).required()
    .messages({ 'string.empty': 'Password es requerido' }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required()
    .messages({ 'string.empty': 'Contraseña actual es requerida' }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'La nueva contraseña debe tener al menos 6 caracteres' }),
});

// --- Events ---
const createEventSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required()
    .messages({ 'string.empty': 'Nombre del evento es requerido' }),
  event_type: Joi.string().trim().min(1).max(50).required()
    .messages({ 'string.empty': 'Tipo de evento es requerido' }),
  event_date: Joi.string().trim().required()
    .messages({ 'string.empty': 'Fecha del evento es requerida' }),
  slug: Joi.string().trim().min(1).max(200).pattern(/^[a-z0-9-]+$/).required()
    .messages({ 'string.pattern.base': 'Slug solo puede contener letras minúsculas, números y guiones' }),
  event_mode: Joi.string().valid('private', 'open').default('private'),
  max_capacity: Joi.number().integer().min(1).max(100000).allow(null).default(null),
  landing_template: Joi.string().trim().max(50).allow('', null),
});

const updateEventSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  event_type: Joi.string().trim().min(1).max(50).required(),
  event_date: Joi.string().trim().required(),
  active: Joi.number().integer().valid(0, 1).default(1),
  event_mode: Joi.string().valid('private', 'open').default('private'),
  max_capacity: Joi.number().integer().min(1).max(100000).allow(null).default(null),
});

// --- Users ---
const createUserSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required()
    .messages({ 'string.min': 'Username debe tener al menos 2 caracteres' }),
  password: Joi.string().min(6).max(128).allow('', null),
  role: Joi.string().valid('root', 'admin', 'client').default('admin'),
  can_manage_users: Joi.boolean().default(false),
  event_ids: Joi.array().items(Joi.number().integer().positive()).default([]),
});

const updateUserSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required(),
  password: Joi.string().min(6).max(128).allow('', null),
  role: Joi.string().valid('root', 'admin', 'client').required(),
  can_manage_users: Joi.boolean().default(false),
  event_ids: Joi.array().items(Joi.number().integer().positive()),
});

// --- Guests ---
const createGuestSchema = Joi.object({
  event_id: Joi.number().integer().positive().required()
    .messages({ 'number.base': 'event_id es requerido' }),
  guest_type: Joi.string().valid('individual', 'family', 'couple').default('individual'),
  family_name: Joi.string().trim().max(200).allow('').default(''),
  guest_names: Joi.string().trim().min(1).max(500).required()
    .messages({ 'string.empty': 'Nombres del invitado es requerido' }),
  max_companions: Joi.number().integer().min(0).max(50).default(0),
  phone: Joi.string().trim().max(30).allow('', null).default(null),
  notes: Joi.string().trim().max(500).allow('').default(''),
});

const updateGuestSchema = Joi.object({
  guest_type: Joi.string().valid('individual', 'family', 'couple').required(),
  family_name: Joi.string().trim().max(200).allow('').default(''),
  guest_names: Joi.string().trim().min(1).max(500).required(),
  max_companions: Joi.number().integer().min(0).max(50).default(0),
  phone: Joi.string().trim().max(30).allow('', null).default(null),
  notes: Joi.string().trim().max(500).allow('').default(''),
});

// --- RSVP ---
const confirmRsvpSchema = Joi.object({
  confirmed_names: Joi.string().trim().max(1000).allow('', null),
  confirmed_count: Joi.number().integer().min(1).max(100).allow(null),
});

// --- Public Registration ---
const publicRegisterSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required()
    .messages({ 'string.empty': 'El nombre es requerido' }),
  email: Joi.string().trim().email().max(200).allow('', null),
  phone: Joi.string().trim().max(30).allow('', null),
  company: Joi.string().trim().max(200).allow('', null),
  position: Joi.string().trim().max(200).allow('', null),
});

// --- Suggestions ---
const createSuggestionSchema = Joi.object({
  text: Joi.string().trim().min(1).max(2000).required()
    .messages({ 'string.empty': 'El texto es requerido' }),
  category: Joi.string().valid('landing', 'tarjetas', 'invitados', 'general').default('general'),
  event_id: Joi.number().integer().positive().allow(null).default(null),
});

const updateSuggestionSchema = Joi.object({
  status: Joi.string().valid('nueva', 'leida', 'implementada', 'descartada'),
  admin_note: Joi.string().trim().max(2000).allow('', null),
}).min(1).messages({ 'object.min': 'Nada que actualizar' });

// --- Params ---
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const eventIdParamSchema = Joi.object({
  eventId: Joi.number().integer().positive().required(),
});

module.exports = {
  validate,
  validateParams,
  // Auth
  loginSchema,
  changePasswordSchema,
  // Events
  createEventSchema,
  updateEventSchema,
  // Users
  createUserSchema,
  updateUserSchema,
  // Guests
  createGuestSchema,
  updateGuestSchema,
  // RSVP
  confirmRsvpSchema,
  // Public
  publicRegisterSchema,
  // Suggestions
  createSuggestionSchema,
  updateSuggestionSchema,
  // Params
  idParamSchema,
  eventIdParamSchema,
};
