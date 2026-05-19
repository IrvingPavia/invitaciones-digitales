const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');

router.get('/:eventId', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM event_config WHERE event_id = ?', [req.params.eventId]);
    if (!rows[0]) return res.status(404).json({ error: 'Configuración no encontrada' });
    res.json({ ...rows[0], config_json: JSON.parse(rows[0].config_json) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:eventId', auth, async (req, res) => {
  try {
    const { config_json } = req.body;
    const [existing] = await getDB().query('SELECT id FROM event_config WHERE event_id = ?', [req.params.eventId]);
    if (existing.length) {
      await getDB().query('UPDATE event_config SET config_json=? WHERE event_id=?',
        [JSON.stringify(config_json), req.params.eventId]);
    } else {
      await getDB().query('INSERT INTO event_config (event_id, config_json) VALUES (?, ?)',
        [req.params.eventId, JSON.stringify(config_json)]);
    }
    res.json({ message: 'Configuración guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Itinerary
router.get('/:eventId/itinerary', auth, async (req, res) => {
  try {
    const [items] = await getDB().query('SELECT * FROM itinerary WHERE event_id = ? ORDER BY sort_order', [req.params.eventId]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:eventId/itinerary', auth, async (req, res) => {
  try {
    const { icon, time, title, description, sort_order } = req.body;
    const [result] = await getDB().query(
      'INSERT INTO itinerary (event_id, icon, time, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.eventId, icon || 'event', time, title, description || '', sort_order || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:eventId/itinerary/:id', auth, async (req, res) => {
  try {
    const { icon, time, title, description, sort_order } = req.body;
    await getDB().query(
      'UPDATE itinerary SET icon=?, time=?, title=?, description=?, sort_order=? WHERE id=? AND event_id=?',
      [icon, time, title, description, sort_order, req.params.id, req.params.eventId]
    );
    res.json({ message: 'Actividad actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:eventId/itinerary/:id', auth, async (req, res) => {
  try {
    await getDB().query('DELETE FROM itinerary WHERE id=? AND event_id=?', [req.params.id, req.params.eventId]);
    res.json({ message: 'Actividad eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Photos
router.get('/:eventId/photos', auth, async (req, res) => {
  try {
    const [photos] = await getDB().query('SELECT * FROM photos WHERE event_id = ? ORDER BY sort_order', [req.params.eventId]);
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:eventId/photos/:id', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM photos WHERE id=? AND event_id=?', [req.params.id, req.params.eventId]);
    if (rows[0]) {
      const fs = require('fs');
      const filePath = require('path').join(__dirname, '../../uploads', rows[0].filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await getDB().query('DELETE FROM photos WHERE id=?', [req.params.id]);
    }
    res.json({ message: 'Foto eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
