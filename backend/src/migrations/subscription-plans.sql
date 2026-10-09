-- ============================================================
-- Migración: Sistema de Comercialización (Subscription Plans)
-- Base de datos: MySQL 8.0, InnoDB, utf8mb4
-- Fecha: 2025
-- Requisitos: 2.1, 2.2, 2.4, 4.5, 5.9
-- ============================================================

-- ============================================================
-- 1. ALTER TABLE users: agregar columnas nuevas
-- ============================================================

ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_status ENUM('none','pending','verified') DEFAULT 'none';
ALTER TABLE users ADD COLUMN self_registered TINYINT(1) DEFAULT 0;
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN trial_used TINYINT(1) DEFAULT 0;

-- Índice para búsquedas por email
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. CREATE TABLE plans
-- ============================================================

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  features JSON,
  max_guests INT DEFAULT NULL,
  is_trial TINYINT(1) DEFAULT 0,
  trial_days INT DEFAULT NULL,
  volume_discount JSON,
  status ENUM('active','inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plans_status (status),
  INDEX idx_plans_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. CREATE TABLE purchases
-- ============================================================

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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
  INDEX idx_purchases_user_id (user_id),
  INDEX idx_purchases_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. CREATE TABLE transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT NULL,
  user_id INT NOT NULL,
  gateway ENUM('stripe','mercadopago') NOT NULL,
  gateway_session_id VARCHAR(500),
  gateway_payment_id VARCHAR(500),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  type ENUM('purchase','postponement') DEFAULT 'purchase',
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_transactions_user_id (user_id),
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_gateway_session (gateway_session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. CREATE TABLE email_verifications
-- ============================================================

CREATE TABLE IF NOT EXISTS email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('registration','email_change') NOT NULL DEFAULT 'registration',
  new_email VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_email_verifications_token (token),
  INDEX idx_email_verifications_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. ALTER TABLE events: agregar columnas nuevas
-- ============================================================

ALTER TABLE events ADD COLUMN lifecycle_status ENUM('available','active','completed') DEFAULT 'available';
ALTER TABLE events ADD COLUMN deactivation_date DATETIME NULL;
ALTER TABLE events ADD COLUMN purchase_id INT NULL;
ALTER TABLE events ADD COLUMN postponed TINYINT(1) DEFAULT 0;
ALTER TABLE events ADD COLUMN plan_type VARCHAR(100) NULL;

-- FK de purchase_id a purchases
ALTER TABLE events ADD CONSTRAINT fk_events_purchase_id FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL;

-- Índice para búsquedas por lifecycle_status
CREATE INDEX idx_events_lifecycle_status ON events(lifecycle_status);
CREATE INDEX idx_events_deactivation_date ON events(deactivation_date);

-- ============================================================
-- 7. CREATE TABLE postponements
-- ============================================================

CREATE TABLE IF NOT EXISTS postponements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  original_date DATETIME NOT NULL,
  new_date DATETIME NOT NULL,
  transaction_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE RESTRICT,
  INDEX idx_postponements_event_id (event_id),
  INDEX idx_postponements_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
