/**
 * Migración: Sistema de Comercialización (Subscription Plans)
 * Lee y ejecuta subscription-plans.sql contra la base de datos.
 * Maneja errores gracefully: columnas/índices que ya existen no detienen la ejecución.
 * 
 * Uso: npm run migrate:plans
 * Requisitos: 2.1
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getDB } = require('../models/database');

async function runMigration() {
  const sqlPath = path.join(__dirname, 'subscription-plans.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('[Migration] ERROR: subscription-plans.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolons, filtering out empty statements and comments-only blocks
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      // Remove lines that are only comments or whitespace
      const withoutComments = s.replace(/--.*$/gm, '').trim();
      return withoutComments.length > 0;
    });

  const db = getDB();
  console.log(`[Migration] Running subscription-plans migration (${statements.length} statements)...`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await db.query(stmt);
      success++;
      console.log(`  [${i + 1}/${statements.length}] OK`);
    } catch (err) {
      // Known safe errors for idempotent migrations:
      // ER_DUP_FIELDNAME (1060) - column already exists
      // ER_DUP_KEYNAME (1061) - key/index already exists
      // ER_FK_DUP_NAME (1826) - foreign key constraint already exists
      // ER_CANT_DROP_FIELD_OR_KEY (1091) - can't drop key that doesn't exist
      const safeErrors = [1060, 1061, 1826, 1091];
      if (safeErrors.includes(err.errno)) {
        skipped++;
        console.log(`  [${i + 1}/${statements.length}] SKIPPED (already applied): ${err.message}`);
      } else {
        errors++;
        console.error(`  [${i + 1}/${statements.length}] ERROR: ${err.message}`);
        console.error(`    Statement: ${stmt.substring(0, 100)}...`);
      }
    }
  }

  console.log(`[Migration] Complete: ${success} applied, ${skipped} skipped, ${errors} errors.`);

  await db.end();

  if (errors > 0) {
    process.exit(1);
  }
}

runMigration().catch(err => {
  console.error('[Migration] Fatal error:', err.message);
  process.exit(1);
});
