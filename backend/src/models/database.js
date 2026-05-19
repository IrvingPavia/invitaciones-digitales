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
      role VARCHAR(50) DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Seed admin user
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', ['admin']);
  if (rows.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
    console.log('Admin user created: admin / admin123');
  }

  console.log('Database initialized');
}

module.exports = { getDB, initDB };
