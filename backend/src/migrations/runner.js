/**
 * Migration runner (hibrido).
 *
 * Objetivo: homologar el esquema de la BD en CADA despliegue, de forma automatica, idempotente y
 * SIN tocar los datos existentes. Resuelve la deuda tecnica de desincronizacion dev <-> prod.
 *
 * Como funciona:
 * 1. initDB() (database.js) crea el esquema BASE en una BD vacia (bootstrap).
 * 2. ESTE runner corre despues: lee los archivos .sql de ./sql ordenados por nombre, y ejecuta
 *    SOLO los que todavia no estan registrados en la tabla `schema_migrations`. Cada migracion que
 *    se aplica con exito queda registrada para no volver a ejecutarse.
 *
 * Reglas para escribir migraciones (archivos en ./sql):
 * - Nombre: `NNN_descripcion.sql` (p. ej. `001_homologacion_esquema_prod.sql`). El prefijo numerico
 *   define el ORDEN de ejecucion; usar ceros a la izquierda (001, 002, ...).
 * - Deben ser IDEMPOTENTES por si corren sobre una BD que ya tiene el cambio: usar
 *   `CREATE TABLE IF NOT EXISTS`, y para columnas/indices/FKs el patron de "añadir si no existe"
 *   via INFORMATION_SCHEMA + sentencia dinamica (ver 001 como ejemplo), o `ADD COLUMN IF NOT EXISTS`
 *   si la version de MySQL lo soporta. NO usar DROP de datos.
 * - Separar sentencias con `;`. Se permite el delimitador por defecto; para bloques con PREPARE/
 *   EXECUTE se ejecuta cada sentencia por separado (ver splitSqlStatements).
 *
 * Seguridad: el runner NUNCA borra datos. Si una migracion falla, se detiene (no registra esa
 * migracion) para que el error sea visible y no se "salte" un cambio a medias.
 */
const fs = require('fs');
const path = require('path');
const { getDB } = require('../models/database');

const SQL_DIR = path.join(__dirname, 'sql');

/** Crea la tabla de control de migraciones si no existe. */
async function ensureMigrationsTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/** Devuelve el set de migraciones ya aplicadas (por nombre de archivo). */
async function getApplied(db) {
  const [rows] = await db.query('SELECT name FROM schema_migrations');
  return new Set(rows.map(r => r.name));
}

/** Lista los archivos .sql de ./sql ordenados por nombre (NNN_...). */
function listMigrationFiles() {
  if (!fs.existsSync(SQL_DIR)) return [];
  return fs.readdirSync(SQL_DIR)
    .filter(f => f.toLowerCase().endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/**
 * Parte un script SQL en sentencias individuales respetando:
 * - comentarios de linea (-- ...) y de bloque (slash-star ... star-slash)
 * - literales entre comillas simples/dobles y backticks
 * - el ; como separador de sentencias
 * No soporta DELIMITER custom (no se usa en estas migraciones).
 */
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false, inDouble = false, inBacktick = false;
  let inLineComment = false, inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const next = sql[i + 1];

    if (inLineComment) { if (c === '\n') { inLineComment = false; current += c; } continue; }
    if (inBlockComment) { if (c === '*' && next === '/') { inBlockComment = false; i++; } continue; }

    if (!inSingle && !inDouble && !inBacktick) {
      if (c === '-' && next === '-') { inLineComment = true; i++; continue; }
      if (c === '#') { inLineComment = true; continue; }
      if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    }

    if (!inDouble && !inBacktick && c === "'" && !inSingle) { inSingle = true; }
    else if (inSingle && c === "'") { inSingle = false; }
    else if (!inSingle && !inBacktick && c === '"' && !inDouble) { inDouble = true; }
    else if (inDouble && c === '"') { inDouble = false; }
    else if (!inSingle && !inDouble && c === '`' && !inBacktick) { inBacktick = true; }
    else if (inBacktick && c === '`') { inBacktick = false; }

    if (c === ';' && !inSingle && !inDouble && !inBacktick) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }
    current += c;
  }
  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

/** Ejecuta las migraciones pendientes en orden. */
async function runMigrations() {
  const db = getDB();
  await ensureMigrationsTable(db);
  const applied = await getApplied(db);
  const files = listMigrationFiles();

  const pending = files.filter(f => !applied.has(f));
  if (pending.length === 0) {
    console.log('[migrations] BD al dia, nada que aplicar.');
    return;
  }

  console.log(`[migrations] pendientes: ${pending.join(', ')}`);
  for (const file of pending) {
    const fullPath = path.join(SQL_DIR, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    const statements = splitSqlStatements(sql);
    console.log(`[migrations] aplicando ${file} (${statements.length} sentencias)...`);
    try {
      for (const stmt of statements) {
        await db.query(stmt);
      }
      await db.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      console.log(`[migrations] OK ${file}`);
    } catch (err) {
      console.error(`[migrations] FALLO en ${file}: ${err.message}`);
      // Se detiene para no saltarse un cambio a medias ni marcar como aplicado algo que fallo.
      throw new Error(`Migracion fallida: ${file} -> ${err.message}`);
    }
  }
  console.log('[migrations] completadas.');
}

module.exports = { runMigrations };
