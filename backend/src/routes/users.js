const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireUserManagement } = require('../middleware/roles');
const { validate, createUserSchema, updateUserSchema } = require('../middleware/validate');

// Get all users (requires user management permission)
router.get('/', auth, requireUserManagement, async (req, res) => {
  try {
    const [users] = await getDB().query(
      'SELECT id, username, role, can_manage_users, plain_password, created_at FROM users ORDER BY created_at DESC'
    );
    // Filter plain_password visibility based on requester role
    for (const user of users) {
      const [events] = await getDB().query(
        'SELECT e.id, e.name, e.slug FROM user_events ue JOIN events e ON ue.event_id = e.id WHERE ue.user_id = ?',
        [user.id]
      );
      user.events = events;

      // Password visibility rules
      if (req.user.role === 'root') {
        // Root sees all passwords
      } else if (req.user.role === 'admin') {
        // Admin sees own + client passwords only
        if (user.id === req.user.id || user.role === 'client') {
          // keep plain_password
        } else {
          user.plain_password = null;
        }
      } else {
        user.plain_password = null;
      }
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
router.post('/', auth, requireUserManagement, validate(createUserSchema), async (req, res) => {
  try {
    let { username, password, role, can_manage_users, event_ids } = req.body;
    // Generate random password for clients if not provided
    if (!password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      password = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    // Only root can create other roots
    if (role === 'root' && req.user.role !== 'root') {
      return res.status(403).json({ error: 'Solo root puede crear usuarios root' });
    }

    const validRoles = ['admin', 'client'];
    if (req.user.role === 'root') validRoles.push('root');
    if (!validRoles.includes(role || 'admin')) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const [existing] = await getDB().query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(400).json({ error: 'El usuario ya existe' });

    const hash = bcrypt.hashSync(password, 10);
    const mustChangePassword = (role || 'admin') === 'client' ? 1 : 0;
    const [result] = await getDB().query(
      'INSERT INTO users (username, password, role, can_manage_users, plain_password, must_change_password) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hash, role || 'admin', can_manage_users ? 1 : 0, password, mustChangePassword]
    );

    // Assign events if provided (for clients)
    if (event_ids && event_ids.length > 0) {
      for (const eventId of event_ids) {
        await getDB().query('INSERT IGNORE INTO user_events (user_id, event_id) VALUES (?, ?)', [result.insertId, eventId]);
      }
    }

    res.status(201).json({ id: result.insertId, username, role: role || 'admin', generatedPassword: password });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', auth, requireUserManagement, validate(updateUserSchema), async (req, res) => {
  try {
    const { username, password, role, can_manage_users, event_ids } = req.body;
    const userId = parseInt(req.params.id);

    // Cannot edit root user unless you are root
    const [target] = await getDB().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (!target[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (target[0].role === 'root' && req.user.role !== 'root') {
      return res.status(403).json({ error: 'No puedes editar al usuario root' });
    }

    // Cannot change role to root unless you are root
    if (role === 'root' && req.user.role !== 'root') {
      return res.status(403).json({ error: 'Solo root puede asignar rol root' });
    }

    let query = 'UPDATE users SET username=?, role=?, can_manage_users=?';
    let params = [username, role, can_manage_users ? 1 : 0];

    if (password) {
      query += ', password=?, plain_password=?';
      params.push(bcrypt.hashSync(password, 10));
      params.push(password);
    }

    query += ' WHERE id=?';
    params.push(userId);
    await getDB().query(query, params);

    // Update event assignments
    if (event_ids !== undefined) {
      await getDB().query('DELETE FROM user_events WHERE user_id = ?', [userId]);
      for (const eventId of (event_ids || [])) {
        await getDB().query('INSERT IGNORE INTO user_events (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
      }
    }

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', auth, requireUserManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Cannot delete root
    const [target] = await getDB().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (!target[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (target[0].role === 'root') {
      return res.status(403).json({ error: 'No se puede eliminar al usuario root' });
    }

    // Cannot delete yourself
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    await getDB().query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password (generates random password and returns it)
router.post('/:id/reset-password', auth, requireUserManagement, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const [target] = await getDB().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (!target[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (target[0].role === 'root' && req.user.role !== 'root') {
      return res.status(403).json({ error: 'No puedes resetear la contraseña del root' });
    }

    // Generate random password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const newPassword = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const hash = bcrypt.hashSync(newPassword, 10);
    await getDB().query('UPDATE users SET password = ?, plain_password = ? WHERE id = ?', [hash, newPassword, userId]);

    res.json({ password: newPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
