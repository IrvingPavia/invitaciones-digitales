const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate, createSuggestionSchema, updateSuggestionSchema } = require('../middleware/validate');

// GET /api/suggestions — list suggestions
// Clients see only their own; admin/root see all
router.get('/', auth, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'client') {
      query = `
        SELECT s.*, u.username, e.name as event_name
        FROM suggestions s
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN events e ON e.id = s.event_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT s.*, u.username, e.name as event_name
        FROM suggestions s
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN events e ON e.id = s.event_id
        ORDER BY s.created_at DESC
      `;
      params = [];
    }
    const [rows] = await getDB().query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suggestions — create suggestion (any authenticated user)
router.post('/', auth, validate(createSuggestionSchema), async (req, res) => {
  try {
    const { text, category, event_id } = req.body;

    const [result] = await getDB().query(
      'INSERT INTO suggestions (user_id, event_id, category, text) VALUES (?, ?, ?, ?)',
      [req.user.id, event_id || null, category || 'general', text]
    );
    res.status(201).json({ id: result.insertId, message: 'Sugerencia enviada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/suggestions/:id — update status/note (admin/root only)
router.put('/:id', auth, requireRole('root', 'admin'), validate(updateSuggestionSchema), async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const fields = [];
    const params = [];

    if (status) { fields.push('status = ?'); params.push(status); }
    if (admin_note !== undefined) { fields.push('admin_note = ?'); params.push(admin_note); }

    params.push(req.params.id);
    await getDB().query(`UPDATE suggestions SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Sugerencia actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/suggestions/:id — delete (admin/root only)
router.delete('/:id', auth, requireRole('root', 'admin'), async (req, res) => {
  try {
    await getDB().query('DELETE FROM suggestions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sugerencia eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
