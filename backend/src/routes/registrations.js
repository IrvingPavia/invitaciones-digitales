const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');

// Get registrations for an event
router.get('/:eventId', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query(
      'SELECT * FROM registrations WHERE event_id = ? ORDER BY created_at DESC',
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a registration
router.delete('/:eventId/:id', auth, async (req, res) => {
  try {
    await getDB().query('DELETE FROM registrations WHERE id = ? AND event_id = ?', [req.params.id, req.params.eventId]);
    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get count/stats
router.get('/:eventId/stats', auth, async (req, res) => {
  try {
    const [[{ count }]] = await getDB().query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [req.params.eventId]);
    const [event] = await getDB().query('SELECT max_capacity FROM events WHERE id = ?', [req.params.eventId]);
    res.json({ registered: count, capacity: event[0]?.max_capacity || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
