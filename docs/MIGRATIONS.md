# 🗄️ Migraciones de Base de Datos

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
