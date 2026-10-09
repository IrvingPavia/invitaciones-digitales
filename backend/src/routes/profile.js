const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sendVerificationEmail } = require('../services/email.service');

// =================== Joi Schemas ===================

const updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().min(1).max(255).optional()
    .messages({ 'string.empty': 'El nombre completo no puede estar vacío' }),
  email: Joi.string().trim().email().max(255).optional()
    .messages({ 'string.email': 'El correo electrónico no es válido' }),
}).min(1).messages({ 'object.min': 'Debes enviar al menos un campo para actualizar' });

const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(1).max(128).required()
    .messages({ 'string.empty': 'La contraseña actual es requerida', 'any.required': 'La contraseña actual es requerida' }),
  new_password: Joi.string().min(8).max(128).required()
    .messages({ 'string.min': 'La nueva contraseña debe tener al menos 8 caracteres', 'any.required': 'La nueva contraseña es requerida' }),
});

// All profile routes require auth
router.use(auth);

// =================== GET /api/profile ===================
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const [users] = await db.query(
      `SELECT id, username, email, full_name, role, email_verified, verification_status, self_registered, trial_used, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Profile GET error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =================== PUT /api/profile ===================
router.put('/', validate(updateProfileSchema), async (req, res) => {
  try {
    const db = getDB();
    const { full_name, email } = req.body;
    const userId = req.user.id;

    // Get current user data
    const [users] = await db.query(
      'SELECT id, email, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const currentUser = users[0];
    const updates = [];
    const values = [];

    // Update full_name if provided
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }

    // Handle email change: requires re-verification
    if (email !== undefined && email !== currentUser.email) {
      // Check if new email is already in use
      const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'El correo electrónico ya está en uso por otra cuenta' });
      }

      // Set email_verified=0 and verification_status='pending' until new email is confirmed
      updates.push('email_verified = ?', 'verification_status = ?');
      values.push(0, 'pending');

      // Create email_change verification token
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.query(
        `INSERT INTO email_verifications (user_id, token, type, new_email, expires_at)
         VALUES (?, ?, 'email_change', ?, ?)`,
        [userId, token, email, expiresAt]
      );

      // Send verification email to the new address
      try {
        await sendVerificationEmail(email, token, currentUser.full_name || 'Usuario');
      } catch (emailErr) {
        console.error('Error sending email change verification:', emailErr.message);
      }
    }

    // Apply direct updates (full_name only; email is not changed until verified)
    if (updates.length > 0) {
      values.push(userId);
      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const message = (email !== undefined && email !== currentUser.email)
      ? 'Perfil actualizado. Se envió un enlace de verificación al nuevo correo.'
      : 'Perfil actualizado exitosamente.';

    res.json({ message });
  } catch (err) {
    console.error('Profile PUT error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =================== PUT /api/profile/password ===================
router.put('/password', validate(changePasswordSchema), async (req, res) => {
  try {
    const db = getDB();
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const [users] = await db.query(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify current password
    const valid = bcrypt.compareSync(current_password, users[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hash new password and update
    const hash = bcrypt.hashSync(new_password, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hash, userId]
    );

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    console.error('Profile password error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =================== GET /api/profile/purchases ===================
router.get('/purchases', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const [purchases] = await db.query(
      `SELECT p.id, p.created_at, pl.name AS plan_name, p.quantity, p.unit_price, p.discount_pct, p.total_amount, p.status
       FROM purchases p
       JOIN plans pl ON p.plan_id = pl.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(purchases);
  } catch (err) {
    console.error('Profile purchases error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
