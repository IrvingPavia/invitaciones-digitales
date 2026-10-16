-- =============================================================================
-- 001 - Homologacion de esquema dev <-> prod
-- =============================================================================
-- Trae a prod todo lo que dev ya tiene y initDB() NO crea: 5 tablas (plans, purchases,
-- transactions, postponements, email_verifications) y columnas nuevas en users/events/photos.
--
-- 100% IDEMPOTENTE y SIN perdida de datos:
--  - Tablas: CREATE TABLE IF NOT EXISTS.
--  - Columnas/FKs/indices: patron PREPARE/EXECUTE condicionado a INFORMATION_SCHEMA, asi que si el
--    objeto ya existe (dev, o prod ya homologado) la sentencia no hace nada.
-- Orden de tablas: las referenciadas por FK van primero (plans -> purchases -> transactions ->
-- postponements; events.purchase_id depende de purchases).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) TABLAS NUEVAS (en orden de dependencias de FK)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  features JSON DEFAULT NULL,
  max_guests INT DEFAULT NULL,
  is_trial TINYINT(1) DEFAULT 0,
  trial_days INT DEFAULT NULL,
  volume_discount JSON DEFAULT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY slug (slug),
  KEY idx_plans_status (status),
  KEY idx_plans_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_pct DECIMAL(5,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  events_assigned INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY plan_id (plan_id),
  KEY idx_purchases_user_id (user_id),
  KEY idx_purchases_status (status),
  CONSTRAINT purchases_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT purchases_ibfk_2 FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  gateway ENUM('stripe','mercadopago') NOT NULL,
  gateway_session_id VARCHAR(500) DEFAULT NULL,
  gateway_payment_id VARCHAR(500) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  type ENUM('purchase','postponement') DEFAULT 'purchase',
  metadata JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY purchase_id (purchase_id),
  KEY idx_transactions_user_id (user_id),
  KEY idx_transactions_status (status),
  KEY idx_transactions_gateway_session (gateway_session_id),
  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE SET NULL,
  CONSTRAINT transactions_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS postponements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  original_date DATETIME NOT NULL,
  new_date DATETIME NOT NULL,
  transaction_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY transaction_id (transaction_id),
  KEY idx_postponements_event_id (event_id),
  KEY idx_postponements_user_id (user_id),
  CONSTRAINT postponements_ibfk_1 FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT postponements_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT postponements_ibfk_3 FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  type ENUM('registration','email_change') NOT NULL DEFAULT 'registration',
  new_email VARCHAR(255) DEFAULT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY token (token),
  KEY idx_email_verifications_token (token),
  KEY idx_email_verifications_user_id (user_id),
  CONSTRAINT email_verifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- 2) COLUMNAS NUEVAS en tablas existentes (idempotentes via INFORMATION_SCHEMA)
-- -----------------------------------------------------------------------------

-- users
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='email'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='email_verified'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, "ALTER TABLE users ADD COLUMN verification_status ENUM('none','pending','verified') DEFAULT 'none'", 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='verification_status'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN self_registered TINYINT(1) DEFAULT 0', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='self_registered'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='full_name'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD COLUMN trial_used TINYINT(1) DEFAULT 0', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name='trial_used'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- indice email de users
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE users ADD INDEX idx_users_email (email)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='users' AND index_name='idx_users_email'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- events
SET @ddl := (SELECT IF(COUNT(*)=0, "ALTER TABLE events ADD COLUMN lifecycle_status ENUM('available','active','completed') DEFAULT 'available'", 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='events' AND column_name='lifecycle_status'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD COLUMN deactivation_date DATETIME DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='events' AND column_name='deactivation_date'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD COLUMN purchase_id INT DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='events' AND column_name='purchase_id'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD COLUMN postponed TINYINT(1) DEFAULT 0', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='events' AND column_name='postponed'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD COLUMN plan_type VARCHAR(100) DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='events' AND column_name='plan_type'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- indices de events
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD INDEX idx_events_lifecycle_status (lifecycle_status)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='events' AND index_name='idx_events_lifecycle_status'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD INDEX idx_events_deactivation_date (deactivation_date)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='events' AND index_name='idx_events_deactivation_date'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- FK events.purchase_id -> purchases(id). Se añade solo si existe la tabla purchases y la FK no existe.
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE events ADD CONSTRAINT fk_events_purchase_id FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE SET NULL', 'SELECT 1') FROM information_schema.table_constraints WHERE table_schema=DATABASE() AND table_name='events' AND constraint_name='fk_events_purchase_id'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- photos
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE photos ADD COLUMN thumb_url VARCHAR(500) DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='photos' AND column_name='thumb_url'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @ddl := (SELECT IF(COUNT(*)=0, 'ALTER TABLE photos ADD COLUMN gallery_url VARCHAR(500) DEFAULT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='photos' AND column_name='gallery_url'); PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
