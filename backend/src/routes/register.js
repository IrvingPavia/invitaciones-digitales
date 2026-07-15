const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { getDB } = require('../models/database');
const { validate } = require('../middleware/validate');
const { sendVerificationEmail, resendVerification } = require('../services/email.service');

// === Schemas ===

const registerSchema = Joi.object({
  full_name: Joi.string().trim().min(1).max(255).required()
    .messages({ 'string.empty': 'El nombre completo es requerido', 'any.required': 'El nombre completo es requerido' }),
  email: Joi.string().trim().email().max(255).required()
    .messages({ 'string.email': 'El correo electrónico no es válido', 'any.required': 'El correo electrónico es requerido' }),
  password: Joi.string().min(8).max(128).required()
    .messages({ 'string.min': 'La contraseña debe tener al menos 8 caracteres', 'any.required': 'La contraseña es requerida' }),
});

const resendSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required()
    .messages({ 'string.email': 'El correo electrónico no es válido', 'any.required': 'El correo electrónico es requerido' }),
});

// Rate limit: max 5 register attempts per 15 minutes per IP
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de registro. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// === POST /api/register ===
router.post('/', registerLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const db = getDB();

    // Check if email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Hash password
    const hash = bcrypt.hashSync(password, 10);

    // Create user with defaults: role=client, self_registered=1, verification_status=pending
    const username = email; // Use email as username for self-registered users
    const [result] = await db.query(
      `INSERT INTO users (username, password, role, self_registered, email, email_verified, verification_status, full_name)
       VALUES (?, ?, 'client', 1, ?, 0, 'pending', ?)`,
      [username, hash, email, full_name]
    );

    const userId = result.insertId;

    // Generate verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      `INSERT INTO email_verifications (user_id, token, type, expires_at) VALUES (?, ?, 'registration', ?)`,
      [userId, token, expiresAt]
    );

    // Send verification email (non-blocking error handling)
    try {
      await sendVerificationEmail(email, token, full_name);
    } catch (emailErr) {
      console.error('Error sending verification email:', emailErr.message);
    }

    res.status(201).json({
      message: 'Cuenta creada. Revisa tu correo para verificar.',
      user_id: userId,
    });
  } catch (err) {
    // Handle duplicate username (edge case if email used as username conflicts)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === POST /api/register/verify/:token ===
router.post('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const db = getDB();

    // Find valid token (not expired, not used)
    const [verifications] = await db.query(
      `SELECT ev.id, ev.user_id, ev.expires_at, ev.used_at, u.verification_status, u.email, u.full_name, u.username
       FROM email_verifications ev
       JOIN users u ON ev.user_id = u.id
       WHERE ev.token = ? AND ev.type = 'registration'`,
      [token]
    );

    if (verifications.length === 0) {
      return res.status(400).json({ error: 'Token de verificación inválido' });
    }

    const verification = verifications[0];

    // Check if already used
    if (verification.used_at) {
      return res.status(400).json({ error: 'La cuenta ya fue verificada' });
    }

    // Check if already verified (account state)
    if (verification.verification_status === 'verified') {
      return res.status(400).json({ error: 'La cuenta ya está verificada' });
    }

    // Check if token is expired
    if (new Date() > new Date(verification.expires_at)) {
      return res.status(400).json({ error: 'El enlace de verificación ha expirado. Solicita uno nuevo.' });
    }

    // Activate account
    await db.query(
      `UPDATE users SET verification_status = 'verified', email_verified = 1 WHERE id = ?`,
      [verification.user_id]
    );

    // Mark token as used
    await db.query(
      `UPDATE email_verifications SET used_at = NOW() WHERE id = ?`,
      [verification.id]
    );

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: verification.user_id,
        username: verification.username,
        role: 'client',
        email: verification.email,
        self_registered: 1,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Cuenta verificada exitosamente',
      token: jwtToken,
      user: {
        id: verification.user_id,
        email: verification.email,
        full_name: verification.full_name,
        role: 'client',
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === POST /api/register/resend ===
router.post('/resend', validate(resendSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    // Find user by email
    const [users] = await db.query(
      'SELECT id, verification_status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'Si el correo está registrado, recibirás un enlace de verificación.' });
    }

    const user = users[0];

    // Check if already verified
    if (user.verification_status === 'verified') {
      return res.status(400).json({ error: 'La cuenta ya está verificada' });
    }

    // Use resendVerification from email service (handles rate limiting)
    const result = await resendVerification(user.id);

    if (!result.success) {
      return res.status(429).json({ error: result.message });
    }

    res.json({ message: 'Correo de verificación reenviado.' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
