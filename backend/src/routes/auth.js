const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { validate, loginSchema, changePasswordSchema } = require('../middleware/validate');

// Rate limit: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await getDB().query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, can_manage_users: user.can_manage_users },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, can_manage_users: user.can_manage_users, must_change_password: !!user.must_change_password } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT id, username, role, can_manage_users, created_at FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Get assigned events for client users
    if (user.role === 'client') {
      const [events] = await getDB().query(
        'SELECT e.id, e.name, e.slug FROM user_events ue JOIN events e ON ue.event_id = e.id WHERE ue.user_id = ?',
        [user.id]
      );
      user.events = events;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', auth, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await getDB().query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!bcrypt.compareSync(currentPassword, user.password))
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    const hash = bcrypt.hashSync(newPassword, 10);
    await getDB().query('UPDATE users SET password = ?, plain_password = ?, must_change_password = 0 WHERE id = ?', [hash, newPassword, req.user.id]);
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
