const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [events] = await getDB().query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM guests WHERE event_id = e.id) as total_guests,
        (SELECT COUNT(*) FROM guests WHERE event_id = e.id AND confirmed = 1) as confirmed_guests
      FROM events e ORDER BY e.created_at DESC
    `);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, event_type, event_date, slug } = req.body;
    if (!name || !event_type || !event_date || !slug)
      return res.status(400).json({ error: 'Campos requeridos: name, event_type, event_date, slug' });

    const [existing] = await getDB().query('SELECT id FROM events WHERE slug = ?', [slug]);
    if (existing.length) return res.status(400).json({ error: 'El slug ya existe' });

    const [result] = await getDB().query(
      'INSERT INTO events (name, event_type, event_date, slug) VALUES (?, ?, ?, ?)',
      [name, event_type, event_date, slug]
    );

    const defaultConfig = getDefaultConfig(name, event_type, event_date);
    await getDB().query('INSERT INTO event_config (event_id, config_json) VALUES (?, ?)',
      [result.insertId, JSON.stringify(defaultConfig)]
    );

    res.status(201).json({ id: result.insertId, slug, name, event_type, event_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, event_type, event_date, active } = req.body;
    await getDB().query(
      'UPDATE events SET name=?, event_type=?, event_date=?, active=? WHERE id=?',
      [name, event_type, event_date, active ?? 1, req.params.id]
    );
    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await getDB().query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getDefaultConfig(name, event_type, event_date) {
  return {
    intro: { enabled: true, background: '', phrase: `Bienvenido a ${name}`, duration: 4 },
    hero: { backgroundGif: '', audioUrl: '', eventDescription: event_type, celebrantNames: name, countdownDate: event_date },
    invitation: { title: 'Están cordialmente invitados', subtitle: '' },
    details: {
      enabled: true,
      cards: []
    },
    venues: {
      enabled: true,
      items: [
        { id: '1', title: 'Ceremonia', icon: '', name: '', address: '', time: '', mapsUrl: '' },
        { id: '2', title: 'Recepción', icon: '', name: '', address: '', time: '', mapsUrl: '' }
      ]
    },
    itinerary: { enabled: true, title: 'Itinerario', items: [] },
    gallery: { enabled: true, title: 'Galería', description: '' },
    dresscode: { enabled: true, title: 'Código de Vestimenta', description: '' },
    gifts: { enabled: true, title: 'Mesa de Regalos', description: '', link: '', buttonText: 'Ver Lista' },
    rsvp: { enabled: true, title: 'Confirmar Asistencia' }
  };
}

module.exports = router;
