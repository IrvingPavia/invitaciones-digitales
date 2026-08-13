/**
 * Migration: Generate gallery_url variants for existing photos
 * 
 * This generates a 600px JPEG 75% variant for each photo that doesn't have one yet.
 * Reduces GPU memory from ~295MB to ~28MB for 20 photos on mobile.
 * 
 * Run: docker exec -it invitaciones-backend node src/migrations/generate-gallery-variants.js
 * Or locally: node src/migrations/generate-gallery-variants.js
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../uploads/images');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'invitaciones'
  });

  try {
    // Ensure gallery_url column exists
    try {
      await conn.query('ALTER TABLE photos ADD COLUMN gallery_url VARCHAR(500) AFTER thumb_url');
      console.log('Column gallery_url added.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column gallery_url already exists.');
      } else {
        throw e;
      }
    }

    // Get all photos without gallery_url
    const [photos] = await conn.query('SELECT id, url, filename FROM photos WHERE gallery_url IS NULL OR gallery_url = ""');
    console.log(`Found ${photos.length} photos to process.`);

    let success = 0;
    let failed = 0;

    for (const photo of photos) {
      try {
        // Determine source file path
        const originalFilename = path.basename(photo.url);
        const sourcePath = path.join(UPLOADS_DIR, originalFilename);

        if (!fs.existsSync(sourcePath)) {
          console.warn(`  SKIP: ${originalFilename} - file not found`);
          failed++;
          continue;
        }

        // Generate gallery variant
        const baseName = originalFilename.replace(path.extname(originalFilename), '.jpg');
        const galleryFilename = 'gallery_' + baseName;
        const galleryPath = path.join(UPLOADS_DIR, galleryFilename);
        const galleryUrl = `/uploads/images/${galleryFilename}`;

        await sharp(sourcePath)
          .rotate()
          .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 75 })
          .toFile(galleryPath);

        // Update DB
        await conn.query('UPDATE photos SET gallery_url = ? WHERE id = ?', [galleryUrl, photo.id]);
        success++;
        console.log(`  OK: ${galleryFilename}`);
      } catch (err) {
        console.error(`  ERROR: photo id=${photo.id} - ${err.message}`);
        failed++;
      }
    }

    console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
