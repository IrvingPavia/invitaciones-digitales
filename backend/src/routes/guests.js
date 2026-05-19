const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/template/download', auth, (req, res) => {
  const template = [
    { guest_type: 'family', family_name: 'Familia García', guest_names: 'Juan García, María García', max_companions: 0, notes: '' },
    { guest_type: 'individual', family_name: '', guest_names: 'Pedro López', max_companions: 2, notes: 'Mesa VIP' }
  ];
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="plantilla_invitados.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const [guests] = await getDB().query(
      'SELECT * FROM guests WHERE event_id = ? ORDER BY created_at DESC',
      [req.params.eventId]
    );
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/:eventId', auth, async (req, res) => {
  try {
    const [guests] = await getDB().query('SELECT * FROM guests WHERE event_id = ?', [req.params.eventId]);
    const [events] = await getDB().query('SELECT name FROM events WHERE id = ?', [req.params.eventId]);

    const data = guests.map(g => ({
      Codigo: g.unique_code, Tipo: g.guest_type, Familia: g.family_name,
      Nombres: g.guest_names, Acompanantes: g.max_companions,
      Confirmado: g.confirmed ? 'Sí' : 'No',
      'Nombres Confirmados': g.confirmed_names || '',
      'Total Confirmados': g.confirmed_count || 0,
      'Fecha Confirmacion': g.confirmed_at || '', Notas: g.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename="invitados_${events[0]?.name || 'evento'}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/qr', auth, async (req, res) => {
  try {
    const [guests] = await getDB().query('SELECT * FROM guests WHERE id = ?', [req.params.id]);
    if (!guests[0]) return res.status(404).json({ error: 'Invitado no encontrado' });

    const [events] = await getDB().query('SELECT slug FROM events WHERE id = ?', [guests[0].event_id]);
    const QRCode = require('qrcode');
    const url = `${process.env.BASE_URL}/invitacion/${events[0].slug}?t=${guests[0].unique_code}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    res.json({ qr: qrDataUrl, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM guests WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Invitado no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { event_id, guest_type, family_name, guest_names, max_companions, notes } = req.body;
    const unique_code = uuidv4().split('-')[0].toUpperCase();
    const [result] = await getDB().query(
      'INSERT INTO guests (event_id, unique_code, guest_type, family_name, guest_names, max_companions, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event_id, unique_code, guest_type || 'individual', family_name || '', guest_names, max_companions || 0, notes || '']
    );
    res.status(201).json({ id: result.insertId, unique_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { guest_type, family_name, guest_names, max_companions, notes } = req.body;
    await getDB().query(
      'UPDATE guests SET guest_type=?, family_name=?, guest_names=?, max_companions=?, notes=? WHERE id=?',
      [guest_type, family_name || '', guest_names, max_companions || 0, notes || '', req.params.id]
    );
    res.json({ message: 'Invitado actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await getDB().query('DELETE FROM guests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invitado eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import/:eventId', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
  const conn = await getDB().getConnection();
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    await conn.beginTransaction();
    const results = [];
    for (const row of rows) {
      const code = uuidv4().split('-')[0].toUpperCase();
      const [r] = await conn.query(
        'INSERT INTO guests (event_id, unique_code, guest_type, family_name, guest_names, max_companions, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.params.eventId, code, row.guest_type || 'individual', row.family_name || '',
          row.guest_names || row.nombre || '', parseInt(row.max_companions || row.acompanantes || 0),
          row.notes || row.notas || '']
      );
      results.push({ id: r.insertId, code });
    }
    await conn.commit();
    res.json({ imported: results.length, guests: results });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
