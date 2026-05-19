const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

router.get('/:eventId', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    if (!rows[0]) return res.json({ front_config: {}, back_config: {} });
    res.json({
      ...rows[0],
      front_config: JSON.parse(rows[0].front_config || '{}'),
      back_config: JSON.parse(rows[0].back_config || '{}')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:eventId', auth, async (req, res) => {
  try {
    const { front_config, back_config } = req.body;
    const [existing] = await getDB().query('SELECT id FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    if (existing.length) {
      await getDB().query(
        'UPDATE card_templates SET front_config=?, back_config=? WHERE event_id=?',
        [JSON.stringify(front_config), JSON.stringify(back_config), req.params.eventId]
      );
    } else {
      await getDB().query(
        'INSERT INTO card_templates (event_id, front_config, back_config) VALUES (?, ?, ?)',
        [req.params.eventId, JSON.stringify(front_config), JSON.stringify(back_config)]
      );
    }
    res.json({ message: 'Plantilla guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:eventId/pdf', auth, async (req, res) => {
  try {
    const [events] = await getDB().query('SELECT * FROM events WHERE id = ?', [req.params.eventId]);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    const event = events[0];

    const [guests] = await getDB().query('SELECT * FROM guests WHERE event_id = ?', [req.params.eventId]);
    const [templates] = await getDB().query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    const frontConfig = templates[0] ? JSON.parse(templates[0].front_config || '{}') : {};

    const doc = new PDFDocument({ size: 'LETTER', margin: 20 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invitaciones_${event.name}.pdf"`);
    doc.pipe(res);

    const cardW = 240, cardH = 140, colGap = 20, rowGap = 15;
    const startX = 20, startY = 40, perPage = 5;

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const posInPage = i % perPage;
      if (i > 0 && posInPage === 0) doc.addPage();
      const y = startY + posInPage * (cardH + rowGap);

      doc.rect(startX, y, cardW, cardH).fillAndStroke(frontConfig.bgColor || '#fff8f0', '#d4a017');
      doc.fillColor('#333').fontSize(10).font('Helvetica-Bold')
        .text(event.name, startX + 10, y + 10, { width: cardW - 20, align: 'center' });
      doc.fontSize(8).font('Helvetica')
        .text(`Tipo: ${event.event_type}`, startX + 10, y + 28)
        .text(`Fecha: ${new Date(event.event_date).toLocaleDateString('es-MX')}`, startX + 10, y + 42)
        .text(`Invitado: ${guest.family_name || guest.guest_names}`, startX + 10, y + 56)
        .text(`Asistentes: ${guest.guest_type === 'family' ? guest.guest_names.split(',').length : guest.max_companions + 1}`, startX + 10, y + 70);

      const backX = startX + cardW + colGap;
      doc.rect(backX, y, cardW, cardH).fillAndStroke('#ffffff', '#d4a017');
      const url = `${process.env.BASE_URL}/invitacion/${event.slug}?t=${guest.unique_code}`;
      const qrBuffer = await QRCode.toBuffer(url, { width: 100, margin: 1 });
      doc.image(qrBuffer, backX + (cardW - 100) / 2, y + 10, { width: 100, height: 100 });
      doc.fillColor('#666').fontSize(7).text(guest.unique_code, backX, y + 115, { width: cardW, align: 'center' });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
