const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'images';
    const dir = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = {
    images: /jpeg|jpg|png|gif|webp/,
    audio: /mp3|wav|ogg|m4a/,
    gifs: /gif|webp|mp4|webm|ogg|jpg|jpeg|png/
  };
  const type = req.params.type || 'images';
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const regex = allowed[type] || allowed.images;
  cb(null, regex.test(ext));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/:type', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido o no proporcionado' });

  // Compress images (not gifs, audio, or video)
  const type = req.params.type;
  const ext = path.extname(req.file.filename).toLowerCase();
  if (type === 'images' && /\.(jpg|jpeg|png|webp)$/.test(ext)) {
    try {
      const filePath = req.file.path;
      const buffer = await sharp(filePath)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      await fs.promises.writeFile(filePath, buffer);
    } catch (e) { /* If compression fails, keep original */ }
  }

  const url = `/uploads/${type}/${req.file.filename}`;
  res.json({ url, filename: `${type}/${req.file.filename}` });
});

router.post('/photos/:eventId', auth, upload.array('files', 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Archivos requeridos' });
  const conn = await getDB().getConnection();
  try {
    await conn.beginTransaction();
    const photos = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const baseName = file.filename.replace(path.extname(file.filename), '.jpg');
      const thumbFilename = 'thumb_' + baseName;
      const galleryFilename = 'gallery_' + baseName;
      const url = `/uploads/images/${file.filename}`;
      const thumbUrl = `/uploads/images/${thumbFilename}`;
      const galleryUrl = `/uploads/images/${galleryFilename}`;
      const [r] = await conn.query(
        'INSERT INTO photos (event_id, filename, url, thumb_url, gallery_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.eventId, `images/${file.filename}`, url, thumbUrl, galleryUrl, i]
      );
      photos.push({ id: r.insertId, url, thumb_url: thumbUrl, gallery_url: galleryUrl });

      // Generate thumbnail (100x100) — for props panel grid
      const thumbPath = path.join(file.destination, thumbFilename);
      await sharp(file.path)
        .rotate()
        .resize(100, 100, { fit: 'cover' })
        .jpeg({ quality: 60 })
        .toFile(thumbPath)
        .catch(() => {});

      // Generate gallery variant (600px) — for gallery cards on mobile
      const galleryPath = path.join(file.destination, galleryFilename);
      await sharp(file.path)
        .rotate()
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toFile(galleryPath)
        .catch(() => {});
    }
    await conn.commit();
    res.json({ uploaded: photos.length, photos });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
