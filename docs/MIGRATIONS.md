# 🗄️ Migraciones de Base de Datos

## Sesión 2025-06-15 — Seguridad: Forzar cambio de contraseña + Audit Log + Compartir

**Se ejecutan automáticamente** al iniciar el backend (migrations en `database.js`). Si necesitas aplicarlas manualmente:

```sql
-- Agregar columna must_change_password (forzar cambio en primer login para clients)
ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) DEFAULT 0;

-- Tabla audit_log (historial de cambios)
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

-- Columnas para compartir invitaciones por WhatsApp
ALTER TABLE guests ADD COLUMN phone VARCHAR(30) DEFAULT NULL;
ALTER TABLE guests ADD COLUMN invitation_sent TINYINT(1) DEFAULT 0;
ALTER TABLE guests ADD COLUMN sent_at DATETIME DEFAULT NULL;
```

> **Nota**: Los usuarios client existentes no se ven afectados (must_change_password = 0). Solo aplica a clients nuevos.

---

## Sesión 2025-05-29 — Eventos Abiertos v1/v2 + Campos dinámicos

**Ejecutar en DBeaver antes del deploy de `int-004`:**

```sql
-- Agregar columnas company y position a registrations (campos dinámicos de registro)
ALTER TABLE registrations ADD COLUMN company VARCHAR(255) DEFAULT NULL;
ALTER TABLE registrations ADD COLUMN position VARCHAR(255) DEFAULT NULL;
```

> **Nota**: Las columnas `event_mode` y `max_capacity` en `events`, y la tabla `registrations` ya fueron creadas en sesiones anteriores. Si es una BD nueva, el backend las crea automáticamente al iniciar.

---

## Sesión 2025-05-27 — Vista Client + Módulo Sugerencias

**Ejecutar en DBeaver antes del deploy de `int-003`:**

```sql
-- Tabla de sugerencias (módulo de retroalimentación de clientes)
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
```

---

## Sesión 2025-05-27 — Módulo de Tarjetas con Puppeteer

**No requiere cambios en BD.** Las tarjetas usan la tabla `card_templates` existente con JSON (front_config, back_config). El nuevo modelo de elementos se guarda en el mismo JSON.

El backend ahora requiere Puppeteer/Chromium para generar PDFs. Esto se maneja en el Dockerfile del backend (Alpine + Chromium).

---

## Sesión 2025-05-26 — Sistema de Usuarios y Roles

**Ejecutar en DBeaver uno por uno:**

```sql
-- 1. Modificar columna role
ALTER TABLE users MODIFY COLUMN role ENUM('root','admin','client') DEFAULT 'admin';

-- 2. Agregar columna can_manage_users
ALTER TABLE users ADD COLUMN can_manage_users TINYINT(1) DEFAULT 0;

-- 3. Agregar columna plain_password
ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) DEFAULT NULL;

-- 4. Dar permisos al admin existente
UPDATE users SET can_manage_users = 1 WHERE username = 'admin';
UPDATE users SET plain_password = 'admin123' WHERE username = 'admin';

-- 5. Crear tabla relación usuario-eventos
CREATE TABLE IF NOT EXISTS user_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  UNIQUE KEY unique_user_event (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Crear usuario root (password: root123)
-- Hash generado con bcrypt para 'root123':
INSERT INTO users (username, password, role, can_manage_users, plain_password) 
VALUES ('root', '$2a$10$Y8eDz.ISf8IRsGFDgHPLXOhC.hpzSd8cwsGbErRXETqxi1X0B7UrW', 'root', 1, 'root123');

-- 7. (Opcional) Crear usuario cliente de ejemplo
-- INSERT INTO users (username, password, role, can_manage_users, plain_password) 
-- VALUES ('NombreCliente', '$HASH', 'client', 0, 'password_generado');

-- 8. (Opcional) Asignar evento a cliente
-- INSERT INTO user_events (user_id, event_id) 
-- VALUES ((SELECT id FROM users WHERE username = 'NombreCliente'), EVENT_ID);
```

**Verificar event_id:** `SELECT id, name FROM events;`
