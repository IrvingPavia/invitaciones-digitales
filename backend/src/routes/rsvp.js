const router = require('express').Router();
const { getDB } = require('../models/database');
const { validate, confirmRsvpSchema } = require('../middleware/validate');

router.get('/:code', async (req, res) => {
  try {
    const [rows] = await getDB().query(`
      SELECT g.*, e.name as event_name, e.event_type, e.event_date, e.slug
      FROM guests g JOIN events e ON g.event_id = e.id
      WHERE g.unique_code = ? AND e.active = 1
    `, [req.params.code]);
    if (!rows[0]) return res.status(404).json({ error: 'Invitación no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:code/confirm', validate(confirmRsvpSchema), async (req, res) => {
  try {
    const { confirmed_names, confirmed_count } = req.body;
    const [rows] = await getDB().query('SELECT * FROM guests WHERE unique_code = ?', [req.params.code]);
    const guest = rows[0];
    if (!guest) return res.status(404).json({ error: 'Invitación no encontrada' });
    if (guest.confirmed) return res.status(400).json({ error: 'Ya confirmaste tu asistencia' });

    const totalCount = guest.guest_type === 'family'
      ? guest.guest_names.split(',').length
      : Math.min(confirmed_count || 1, guest.max_companions + 1);

    await getDB().query(
      'UPDATE guests SET confirmed=1, confirmed_names=?, confirmed_count=?, confirmed_at=NOW() WHERE unique_code=?',
      [confirmed_names || guest.guest_names, totalCount, req.params.code]
    );
    res.json({ message: '¡Asistencia confirmada! Te esperamos.', confirmed_count: totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
