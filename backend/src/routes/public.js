const router = require('express').Router();
const { getDB } = require('../models/database');
const { ensureConfigDefaults } = require('../utils/ensureConfigDefaults');

router.get('/invitation/:slug', async (req, res) => {
  try {
    const [events] = await getDB().query('SELECT * FROM events WHERE slug = ? AND active = 1', [req.params.slug]);
    if (!events[0]) return res.status(404).json({ error: 'Invitación no encontrada' });
    const event = events[0];

    const [configs] = await getDB().query('SELECT config_json FROM event_config WHERE event_id = ?', [event.id]);
    const [itinerary] = await getDB().query('SELECT * FROM itinerary WHERE event_id = ? ORDER BY sort_order', [event.id]);
    const [photos] = await getDB().query('SELECT * FROM photos WHERE event_id = ? ORDER BY sort_order', [event.id]);

    res.json({
      event,
      config: ensureConfigDefaults(configs[0] ? JSON.parse(configs[0].config_json) : {}),
      itinerary: itinerary.map(i => ({ ...i, iconType: i.icon_type || 'emoji', iconUrl: i.icon_url || '' })),
      photos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/invitation/:slug/guest/:code', async (req, res) => {
  try {
    const [rows] = await getDB().query(`
      SELECT g.* FROM guests g
      JOIN events e ON g.event_id = e.id
      WHERE e.slug = ? AND g.unique_code = ? AND e.active = 1
    `, [req.params.slug, req.params.code]);
    if (!rows[0]) return res.status(404).json({ error: 'Invitado no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public registration for open events
router.post('/register/:slug', async (req, res) => {
  try {
    const { name, email, phone, company, position } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'El nombre es requerido' });

    const [events] = await getDB().query('SELECT * FROM events WHERE slug = ? AND active = 1 AND event_mode = ?', [req.params.slug, 'open']);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado o no acepta registros' });
    const event = events[0];

    // Check capacity
    const [[{ count }]] = await getDB().query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [event.id]);
    if (event.max_capacity && count >= event.max_capacity) {
      return res.status(409).json({ error: 'Cupo lleno', full: true });
    }

    // Check duplicate email if provided
    if (email && email.trim()) {
      const [existing] = await getDB().query('SELECT id FROM registrations WHERE event_id = ? AND email = ?', [event.id, email.trim()]);
      if (existing.length) return res.status(409).json({ error: 'Este email ya está registrado' });
    }

    await getDB().query(
      'INSERT INTO registrations (event_id, name, email, phone, company, position) VALUES (?, ?, ?, ?, ?, ?)',
      [event.id, name.trim(), email?.trim() || null, phone?.trim() || null, company?.trim() || null, position?.trim() || null]
    );

    const [[{ count: newCount }]] = await getDB().query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [event.id]);
    res.json({ message: 'Registro exitoso', registered: newCount, capacity: event.max_capacity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get registration status for open events (public)
router.get('/register/:slug/status', async (req, res) => {
  try {
    const [events] = await getDB().query('SELECT id, event_mode, max_capacity FROM events WHERE slug = ? AND active = 1', [req.params.slug]);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    const event = events[0];

    if (event.event_mode !== 'open') return res.json({ mode: 'private' });

    const [[{ count }]] = await getDB().query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [event.id]);
    res.json({ mode: 'open', registered: count, capacity: event.max_capacity, full: event.max_capacity ? count >= event.max_capacity : false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/kpis/:eventId', async (req, res) => {
  try {
    const db = getDB();
    const [[total]] = await db.query('SELECT COUNT(*) as count FROM guests WHERE event_id = ?', [req.params.eventId]);
    const [[confirmed]] = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(confirmed_count), 0) as total_confirmed FROM guests WHERE event_id = ? AND confirmed = 1',
      [req.params.eventId]
    );
    const [[pending]] = await db.query('SELECT COUNT(*) as count FROM guests WHERE event_id = ? AND confirmed = 0', [req.params.eventId]);
    const [[seats]] = await db.query(`
      SELECT COALESCE(SUM(
        CASE WHEN guest_type='family'
          THEN (LENGTH(guest_names) - LENGTH(REPLACE(guest_names, ',', '')) + 1)
          ELSE max_companions + 1
        END
      ), 0) as seats
      FROM guests WHERE event_id = ?
    `, [req.params.eventId]);

    res.json({
      total_invitations: total.count,
      confirmed_invitations: confirmed.count,
      pending_invitations: pending.count,
      total_confirmed_guests: confirmed.total_confirmed,
      total_seats: seats.seats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
