const router = require('express').Router();
const { getDB } = require('../models/database');

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
      config: configs[0] ? JSON.parse(configs[0].config_json) : {},
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
