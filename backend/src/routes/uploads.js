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

// Límites de tamaño por TIPO de archivo (MB). El tope de multer es el mayor (video 25MB);
// luego se valida el límite específico por extensión en el handler.
const SIZE_LIMITS_MB = { image: 10, gif: 15, video: 25, audio: 15 };
const MAX_UPLOAD_MB = Math.max(...Object.values(SIZE_LIMITS_MB));

/** Clasifica un archivo (por extensión) para elegir su límite de tamaño. */
function classifyUpload(filename) {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  if (['mp4', 'webm', 'ogg'].includes(ext)) return { kind: 'video', limitMb: SIZE_LIMITS_MB.video };
  if (ext === 'gif') return { kind: 'gif', limitMb: SIZE_LIMITS_MB.gif };
  if (['mp3', 'wav', 'm4a'].includes(ext)) return { kind: 'audio', limitMb: SIZE_LIMITS_MB.audio };
  return { kind: 'image', limitMb: SIZE_LIMITS_MB.image };
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } });

router.post('/:type', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido o no proporcionado' });

  // Validar el límite de tamaño ESPECÍFICO por tipo de archivo. Si excede, borrar y rechazar.
  const { kind, limitMb } = classifyUpload(req.file.filename);
  if (req.file.size > limitMb * 1024 * 1024) {
    fs.promises.unlink(req.file.path).catch(() => {});
    const label = kind === 'video' ? 'video' : kind === 'gif' ? 'GIF' : kind === 'audio' ? 'audio' : 'imagen';
    return res.status(413).json({
      error: `El ${label} pesa ${(req.file.size / 1024 / 1024).toFixed(1)}MB y supera el límite de ${limitMb}MB.`,
    });
  }

  // Compress images (not gifs, audio, or video)
  const type = req.params.type;
  const ext = path.extname(req.file.filename).toLowerCase();
  if (type === 'images' && /\.(jpg|jpeg|png|webp)$/.test(ext)) {
    try {
      const filePath = req.file.path;
      // Redimensiona respetando el formato original para PRESERVAR TRANSPARENCIA.
      // JPEG no soporta canal alfa: forzar JPEG rellenaba de negro los PNG/WebP
      // transparentes (típico en iconos). Por eso solo re-encodeamos a JPEG los
      // formatos opacos (jpg/jpeg) y mantenemos PNG/WebP en su formato con alfa.
      const pipeline = sharp(filePath)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });

      if (/\.png$/.test(ext)) {
        pipeline.png({ compressionLevel: 9, palette: true });
      } else if (/\.webp$/.test(ext)) {
        pipeline.webp({ quality: 80 });
      } else {
        pipeline.jpeg({ quality: 80 });
      }

      const buffer = await pipeline.toBuffer();
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
