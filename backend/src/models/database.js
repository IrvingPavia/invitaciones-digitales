const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'invitaciones',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    });
  }
  return pool;
}

async function initDB() {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const db = getDB();
      await db.query('SELECT 1');
      console.log('MySQL connected');
      break;
    } catch (err) {
      console.log(`MySQL not ready, attempt ${attempt}/${MAX_RETRIES}. Retrying in ${RETRY_DELAY / 1000}s...`);
      if (attempt === MAX_RETRIES) throw new Error('Could not connect to MySQL: ' + err.message);
      await new Promise(r => setTimeout(r, RETRY_DELAY));
    }
  }

  const db = getDB();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('root','admin','client') DEFAULT 'admin',
      can_manage_users TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      event_id INT NOT NULL,
      UNIQUE KEY unique_user_event (user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(200) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      event_date DATETIME NOT NULL,
      active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS event_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL UNIQUE,
      config_json LONGTEXT NOT NULL DEFAULT ('{}'),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      unique_code VARCHAR(50) UNIQUE NOT NULL,
      guest_type ENUM('individual','family') NOT NULL DEFAULT 'individual',
      family_name VARCHAR(255),
      guest_names TEXT NOT NULL,
      max_companions INT DEFAULT 0,
      confirmed TINYINT(1) DEFAULT 0,
      confirmed_names TEXT,
      confirmed_count INT DEFAULT 0,
      confirmed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS itinerary (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      icon VARCHAR(100) DEFAULT 'event',
      icon_type VARCHAR(20) DEFAULT 'emoji',
      icon_url VARCHAR(1000),
      time VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      sort_order INT DEFAULT 0,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      filename VARCHAR(500) NOT NULL,
      url VARCHAR(1000) NOT NULL,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS card_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL UNIQUE,
      front_config LONGTEXT DEFAULT ('{}'),
      back_config LONGTEXT DEFAULT ('{}'),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      event_id INT DEFAULT NULL,
      category ENUM('landing','tarjetas','invitados','general') DEFAULT 'general',
      text TEXT NOT NULL,
      status ENUM('nueva','leida','implementada','descartada') DEFAULT 'nueva',
      admin_note TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure users table has new columns (migration for existing DBs)
  try {
    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('root','admin','client') DEFAULT 'admin'");
  } catch(e) { /* column already correct */ }
  try {
    await db.query("ALTER TABLE users ADD COLUMN can_manage_users TINYINT(1) DEFAULT 0");
  } catch(e) { /* column already exists */ }
  try {
    await db.query("ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) DEFAULT NULL");
  } catch(e) { /* column already exists */ }

  // Migration: events open mode
  try {
    await db.query("ALTER TABLE events ADD COLUMN event_mode ENUM('private','open') DEFAULT 'private'");
  } catch(e) { /* column already exists */ }
  try {
    await db.query("ALTER TABLE events ADD COLUMN max_capacity INT DEFAULT NULL");
  } catch(e) { /* column already exists */ }

  // Table: registrations (for open events)
  await db.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(255),
      position VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Add company/position columns if they don't exist (migration for existing DBs)
  try { await db.query('ALTER TABLE registrations ADD COLUMN company VARCHAR(255) DEFAULT NULL'); } catch(e) {}
  try { await db.query('ALTER TABLE registrations ADD COLUMN position VARCHAR(255) DEFAULT NULL'); } catch(e) {}

  // Migration: must_change_password for forced password change on first login
  try { await db.query('ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0'); } catch(e) {}

  // Migration: phone column for WhatsApp sharing
  try { await db.query('ALTER TABLE guests ADD COLUMN phone VARCHAR(30) DEFAULT NULL'); } catch(e) {}
  try { await db.query('ALTER TABLE guests ADD COLUMN invitation_sent TINYINT(1) DEFAULT 0'); } catch(e) {}
  try { await db.query('ALTER TABLE guests ADD COLUMN sent_at DATETIME DEFAULT NULL'); } catch(e) {}

  // Table: audit_log (historial de cambios)
  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      username VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entity (entity_type, entity_id),
      INDEX idx_user (user_id),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  // Seed root user
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', ['root']);
  if (rows.length === 0) {
    const plainPwd = 'admin123';
    const hash = bcrypt.hashSync(plainPwd, 10);
    await db.query('INSERT INTO users (username, password, role, can_manage_users, plain_password) VALUES (?, ?, ?, ?, ?)', ['root', hash, 'root', 1, plainPwd]);
    console.log('Root user created: root / admin123');
  }

  // Migrate existing admin user to have proper role and permissions
  await db.query("UPDATE users SET can_manage_users = 1 WHERE username = 'admin'");

  console.log('Database initialized');
}

module.exports = { getDB, initDB };
