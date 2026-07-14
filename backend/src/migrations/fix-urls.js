/**
 * Migración: Convierte URLs absolutas de uploads a rutas relativas
 * Afecta: tabla photos (columna url) y event_config (config_json)
 */
const { getDB } = require('../models/database');

async function fixUrls() {
  const db = getDB();
  console.log('[Migration] Fixing absolute URLs to relative paths...');

  // 1. Fix tabla photos
  await db.query(`
    UPDATE photos 
    SET url = CONCAT('/uploads/', filename) 
    WHERE url LIKE 'http%'
  `);

  // 2. Fix config_json en event_config (URLs de imágenes dentro del JSON)
  const [configs] = await db.query('SELECT id, config_json FROM event_config');
  let fixed = 0;

  for (const row of configs) {
    let json = row.config_json;
    if (!json) continue;

    const original = json;
    // Reemplazar cualquier URL absoluta que apunte a /uploads/
    // Patrones: http://localhost/uploads/, http://localhost:3000/uploads/, https://IP/uploads/, https://dominio/uploads/
    json = json.replace(/https?:\/\/[^/]+\/uploads\//g, '/uploads/');

    if (json !== original) {
      await db.query('UPDATE event_config SET config_json = ? WHERE id = ?', [json, row.id]);
      fixed++;
    }
  }

  // 3. Fix icon_url en itinerary
  await db.query(`
    UPDATE itinerary 
    SET icon_url = REPLACE(icon_url, SUBSTRING_INDEX(icon_url, '/uploads/', 1), '')
    WHERE icon_url LIKE 'http%/uploads/%'
  `);

  console.log(`[Migration] Done. Fixed ${fixed} config(s), photos and itinerary updated.`);
}

module.exports = { fixUrls };
