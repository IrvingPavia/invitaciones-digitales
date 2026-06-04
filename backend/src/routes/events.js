const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { requireRole, requireEventAccess } = require('../middleware/roles');

router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT e.*,
        (SELECT COUNT(*) FROM guests WHERE event_id = e.id) as total_guests,
        (SELECT COUNT(*) FROM guests WHERE event_id = e.id AND confirmed = 1) as confirmed_guests
      FROM events e
    `;
    let params = [];

    // Client users only see their assigned events
    if (req.user.role === 'client') {
      query += ' JOIN user_events ue ON ue.event_id = e.id WHERE ue.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY e.created_at DESC';
    const [events] = await getDB().query(query, params);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get themes for all accessible events (for dashboard carousel)
router.get('/themes', auth, async (req, res) => {
  try {
    let query = `
      SELECT e.id as event_id, ec.config_json
      FROM events e
      LEFT JOIN event_config ec ON ec.event_id = e.id
    `;
    let params = [];

    if (req.user.role === 'client') {
      query += ' JOIN user_events ue ON ue.event_id = e.id WHERE ue.user_id = ?';
      params.push(req.user.id);
    }

    const [rows] = await getDB().query(query, params);
    const themes = {};
    for (const row of rows) {
      if (row.config_json) {
        try {
          const config = JSON.parse(row.config_json);
          themes[row.event_id] = {
            theme: config.theme || null,
            heroBackground: config.hero?.backgroundGif || null,
            globalStyles: config.globalStyles || null
          };
        } catch (e) {
          themes[row.event_id] = { theme: null, heroBackground: null, globalStyles: null };
        }
      } else {
        themes[row.event_id] = { theme: null, heroBackground: null, globalStyles: null };
      }
    }
    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, requireEventAccess, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('root', 'admin'), async (req, res) => {
  try {
    const { name, event_type, event_date, slug } = req.body;
    if (!name || !event_type || !event_date || !slug)
      return res.status(400).json({ error: 'Campos requeridos: name, event_type, event_date, slug' });

    const [existing] = await getDB().query('SELECT id FROM events WHERE slug = ?', [slug]);
    if (existing.length) return res.status(400).json({ error: 'El slug ya existe' });

    const [result] = await getDB().query(
      'INSERT INTO events (name, event_type, event_date, slug, event_mode, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, event_type, event_date, slug, req.body.event_mode || 'private', req.body.max_capacity || null]
    );

    const defaultConfig = getDefaultConfig(name, event_type, event_date, req.body.landing_template);
    await getDB().query('INSERT INTO event_config (event_id, config_json) VALUES (?, ?)',
      [result.insertId, JSON.stringify(defaultConfig)]
    );

    res.status(201).json({ id: result.insertId, slug, name, event_type, event_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireEventAccess, async (req, res) => {
  try {
    const { name, event_type, event_date, active, event_mode, max_capacity } = req.body;
    await getDB().query(
      'UPDATE events SET name=?, event_type=?, event_date=?, active=?, event_mode=?, max_capacity=? WHERE id=?',
      [name, event_type, event_date, active ?? 1, event_mode || 'private', max_capacity || null, req.params.id]
    );
    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('root', 'admin'), async (req, res) => {
  try {
    await getDB().query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate an event (config + card templates + itinerary + photos)
router.post('/:id/duplicate', auth, requireRole('root', 'admin'), async (req, res) => {
  try {
    const db = getDB();
    // Get original event
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    const orig = events[0];

    // Generate unique slug with sequential numbering
    const baseSlug = orig.slug.replace(/-copia-\d+$/, ''); // strip existing "-copia-XX" suffix
    let newSlug = baseSlug + '-copia-01';
    let counter = 1;
    while (true) {
      const [existing] = await db.query('SELECT id FROM events WHERE slug = ?', [newSlug]);
      if (!existing.length) break;
      counter++;
      newSlug = baseSlug + '-copia-' + String(counter).padStart(2, '0');
    }
    const newName = orig.name.replace(/ \(copia\)$/, '') + ' (copia)';

    // Create new event
    const [result] = await db.query(
      'INSERT INTO events (name, event_type, event_date, slug, event_mode, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [newName, orig.event_type, orig.event_date, newSlug, orig.event_mode, orig.max_capacity]
    );
    const newId = result.insertId;

    // Copy event_config
    const [configs] = await db.query('SELECT config_json FROM event_config WHERE event_id = ?', [req.params.id]);
    if (configs[0]) {
      await db.query('INSERT INTO event_config (event_id, config_json) VALUES (?, ?)', [newId, configs[0].config_json]);
    }

    // Copy card_templates
    const [cards] = await db.query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.id]);
    if (cards[0]) {
      await db.query(
        'INSERT INTO card_templates (event_id, front_config, back_config) VALUES (?, ?, ?)',
        [newId, cards[0].front_config, cards[0].back_config]
      );
    }

    // Copy itinerary
    const [itinerary] = await db.query('SELECT * FROM itinerary WHERE event_id = ?', [req.params.id]);
    for (const item of itinerary) {
      await db.query(
        'INSERT INTO itinerary (event_id, icon, icon_type, icon_url, time, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newId, item.icon, item.icon_type, item.icon_url, item.time, item.title, item.description, item.sort_order]
      );
    }

    // Copy photos
    const [photos] = await db.query('SELECT * FROM photos WHERE event_id = ?', [req.params.id]);
    for (const photo of photos) {
      await db.query(
        'INSERT INTO photos (event_id, filename, url, sort_order) VALUES (?, ?, ?, ?)',
        [newId, photo.filename, photo.url, photo.sort_order]
      );
    }

    res.status(201).json({ id: newId, slug: newSlug, name: newName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const LANDING_TEMPLATES = {
  elegante: {
    theme: {
      cardBg: 'rgba(0,0,0,0.5)',
      cardBorder: 'rgba(212,160,23,0.3)',
      textPrimary: '#ffffff',
      textPrimaryFont: 'serif',
      textSecondary: 'rgba(255,255,255,0.7)',
      textSecondaryFont: 'sans',
      navFooterText: '#d4a017',
      navFooterFont: 'script',
      buttonBg: '#d4a017',
      buttonText: '#1a1a2e',
      buttonFont: 'sans'
    },
    globalStyles: {
      sectionHeadingStyle: { fontFamily: 'script', fontSize: 36, color: '#d4a017' },
      titleStyle: { fontFamily: 'serif', fontSize: 20, color: '#ffffff' },
      subtitleStyle: { fontFamily: 'sans', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
      contentStyle: { fontFamily: 'sans', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
      separatorStyle: { type: 'elegant', color: '#d4a017' }
    },
    heroStyles: {
      eventDescriptionStyle: { fontFamily: 'sans', fontSize: 22, color1: '#ffffff', color2: '#d4a017', gradientAngle: 135, gradientIntensity: 50, fontWeight: 400 },
      celebrantNamesStyle: { fontFamily: 'script', fontSize: 80, color1: '#d4a017', color2: '#b8860b', gradientAngle: 135, gradientIntensity: 50, fontWeight: 400 },
      heroPhraseStyle: { fontFamily: 'serif', fontSize: 16, color: '#ffffff' }
    }
  },
  moderno: {
    theme: {
      cardBg: 'rgba(255,255,255,0.03)',
      cardBorder: 'rgba(255,255,255,0.12)',
      textPrimary: '#ffffff',
      textPrimaryFont: 'montserrat',
      textSecondary: 'rgba(255,255,255,0.6)',
      textSecondaryFont: 'montserrat',
      navFooterText: '#a78bfa',
      navFooterFont: 'montserrat',
      buttonBg: '#a78bfa',
      buttonText: '#1a1a2e',
      buttonFont: 'montserrat'
    },
    globalStyles: {
      sectionHeadingStyle: { fontFamily: 'montserrat', fontSize: 32, color: '#a78bfa' },
      titleStyle: { fontFamily: 'montserrat', fontSize: 18, color: '#ffffff' },
      subtitleStyle: { fontFamily: 'montserrat', fontSize: 14, color: 'rgba(255,255,255,0.6)' },
      contentStyle: { fontFamily: 'montserrat', fontSize: 15, color: 'rgba(255,255,255,0.7)' },
      separatorStyle: { type: 'minimal', color: '#a78bfa' }
    },
    heroStyles: {
      eventDescriptionStyle: { fontFamily: 'montserrat', fontSize: 20, color1: '#a78bfa', color2: '#c4b5fd', gradientAngle: 90, gradientIntensity: 60, fontWeight: 300 },
      celebrantNamesStyle: { fontFamily: 'montserrat', fontSize: 56, color1: '#ffffff', color2: '#a78bfa', gradientAngle: 135, gradientIntensity: 40, fontWeight: 700 },
      heroPhraseStyle: { fontFamily: 'montserrat', fontSize: 14, color: 'rgba(255,255,255,0.6)' }
    }
  },
  romantico: {
    theme: {
      cardBg: 'rgba(30,10,20,0.6)',
      cardBorder: 'rgba(219,112,147,0.3)',
      textPrimary: '#fff0f5',
      textPrimaryFont: 'cormorant',
      textSecondary: 'rgba(255,240,245,0.7)',
      textSecondaryFont: 'sans',
      navFooterText: '#f4a7c1',
      navFooterFont: 'dancing',
      buttonBg: '#db7093',
      buttonText: '#ffffff',
      buttonFont: 'sans'
    },
    globalStyles: {
      sectionHeadingStyle: { fontFamily: 'dancing', fontSize: 38, color: '#f4a7c1' },
      titleStyle: { fontFamily: 'cormorant', fontSize: 20, color: '#fff0f5' },
      subtitleStyle: { fontFamily: 'sans', fontSize: 14, color: 'rgba(255,240,245,0.7)' },
      contentStyle: { fontFamily: 'sans', fontSize: 15, color: 'rgba(255,240,245,0.8)' },
      separatorStyle: { type: 'ornamental', color: '#f4a7c1' }
    },
    heroStyles: {
      eventDescriptionStyle: { fontFamily: 'cormorant', fontSize: 22, color1: '#f4a7c1', color2: '#db7093', gradientAngle: 135, gradientIntensity: 50, fontWeight: 400 },
      celebrantNamesStyle: { fontFamily: 'dancing', fontSize: 72, color1: '#f4a7c1', color2: '#ff69b4', gradientAngle: 135, gradientIntensity: 50, fontWeight: 400 },
      heroPhraseStyle: { fontFamily: 'cormorant', fontSize: 16, color: 'rgba(255,240,245,0.8)' }
    }
  },
  festivo: {
    theme: {
      cardBg: 'rgba(0,0,0,0.4)',
      cardBorder: 'rgba(255,200,50,0.3)',
      textPrimary: '#ffffff',
      textPrimaryFont: 'raleway',
      textSecondary: 'rgba(255,255,255,0.7)',
      textSecondaryFont: 'raleway',
      navFooterText: '#fbbf24',
      navFooterFont: 'raleway',
      buttonBg: '#f59e0b',
      buttonText: '#1a1a2e',
      buttonFont: 'raleway'
    },
    globalStyles: {
      sectionHeadingStyle: { fontFamily: 'raleway', fontSize: 34, color: '#fbbf24' },
      titleStyle: { fontFamily: 'raleway', fontSize: 18, color: '#ffffff' },
      subtitleStyle: { fontFamily: 'raleway', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
      contentStyle: { fontFamily: 'raleway', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
      separatorStyle: { type: 'festive', color: '#fbbf24' }
    },
    heroStyles: {
      eventDescriptionStyle: { fontFamily: 'raleway', fontSize: 22, color1: '#fbbf24', color2: '#f59e0b', gradientAngle: 90, gradientIntensity: 60, fontWeight: 600 },
      celebrantNamesStyle: { fontFamily: 'raleway', fontSize: 60, color1: '#ffffff', color2: '#fbbf24', gradientAngle: 135, gradientIntensity: 50, fontWeight: 800 },
      heroPhraseStyle: { fontFamily: 'raleway', fontSize: 15, color: '#fbbf24' }
    }
  },
  corporativo: {
    theme: {
      cardBg: 'rgba(15,23,42,0.7)',
      cardBorder: 'rgba(59,130,246,0.25)',
      textPrimary: '#f1f5f9',
      textPrimaryFont: 'josefin',
      textSecondary: 'rgba(241,245,249,0.6)',
      textSecondaryFont: 'josefin',
      navFooterText: '#60a5fa',
      navFooterFont: 'josefin',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      buttonFont: 'josefin'
    },
    globalStyles: {
      sectionHeadingStyle: { fontFamily: 'josefin', fontSize: 30, color: '#60a5fa' },
      titleStyle: { fontFamily: 'josefin', fontSize: 18, color: '#f1f5f9' },
      subtitleStyle: { fontFamily: 'josefin', fontSize: 14, color: 'rgba(241,245,249,0.6)' },
      contentStyle: { fontFamily: 'josefin', fontSize: 15, color: 'rgba(241,245,249,0.7)' },
      separatorStyle: { type: 'formal', color: '#60a5fa' }
    },
    heroStyles: {
      eventDescriptionStyle: { fontFamily: 'josefin', fontSize: 20, color1: '#60a5fa', color2: '#93c5fd', gradientAngle: 90, gradientIntensity: 50, fontWeight: 300 },
      celebrantNamesStyle: { fontFamily: 'josefin', fontSize: 52, color1: '#f1f5f9', color2: '#60a5fa', gradientAngle: 135, gradientIntensity: 40, fontWeight: 600 },
      heroPhraseStyle: { fontFamily: 'josefin', fontSize: 14, color: 'rgba(241,245,249,0.6)' }
    }
  }
};

function getDefaultConfig(name, event_type, event_date, templateKey) {
  const tpl = LANDING_TEMPLATES[templateKey] || LANDING_TEMPLATES.elegante;

  return {
    envelope: { enabled: false },
    intro: { enabled: false, background: '', phrase: `Bienvenido a ${name}`, duration: 4 },
    hero: {
      backgroundGif: '', audioUrl: '',
      eventDescription: event_type,
      celebrantNames: name,
      heroPhrase: '',
      countdownDate: event_date,
      eventDescriptionStyle: tpl.heroStyles.eventDescriptionStyle,
      celebrantNamesStyle: tpl.heroStyles.celebrantNamesStyle,
      heroPhraseStyle: tpl.heroStyles.heroPhraseStyle
    },
    invitation: { title: 'Están cordialmente invitados', subtitle: '' },
    details: { enabled: false, cards: [] },
    venues: { enabled: false, items: [] },
    itinerary: { enabled: false, title: 'Itinerario', items: [] },
    gallery: { enabled: false, title: 'Galería', description: '' },
    dresscode: { enabled: false, title: 'Código de Vestimenta', description: '' },
    gifts: { enabled: false, title: 'Mesa de Regalos', description: '', link: '', buttonText: 'Ver Lista' },
    rsvp: { enabled: false, title: 'Confirmar Asistencia' },
    globalStyles: tpl.globalStyles,
    theme: tpl.theme
  };
}

module.exports = router;
