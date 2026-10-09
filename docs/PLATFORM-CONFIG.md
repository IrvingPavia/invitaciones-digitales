# 🔧 Configuración de Plataforma y Reglas de Negocio

> Documento de especificación para el sistema de configuraciones globales de la plataforma,
> restricciones por evento, y panel de administración de reglas de negocio.

---

## 1. Concepto General

La plataforma necesita un sistema de configuración a dos niveles:

1. **Configuración Global (Plataforma)** — Valores por defecto que aplican a todos los eventos nuevos. Solo editable por `root` y `admin`.
2. **Configuración por Evento (Override)** — Valores específicos que el admin puede ajustar para un evento individual, sobreescribiendo los defaults globales.

---

## 2. Panel de Administración de Plataforma (Solo root/admin)

### 2.1 Acceso

- Nuevo módulo en el sidebar: "⚙ Plataforma" (visible solo para rol `root` y `admin`)
- Contiene sub-secciones: Reglas de Negocio, Paquetes/Planes, Auditoría, Configuración General

### 2.2 Secciones del Panel

#### Reglas de Negocio (defaults globales)

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `max_date_changes` | Número máximo de cambios de fecha permitidos por evento | 1 |
| `grace_days_before_event` | Días mínimos antes del evento para permitir cambio de fecha | 7 |
| `event_expiry_days_after` | Días después del evento en que el evento se marca como expirado | 30 |
| `max_guests_per_event` | Máximo de invitados por evento (según plan) | 500 |
| `max_photos_per_event` | Máximo de fotos en galería | 20 |
| `max_file_size_mb` | Tamaño máximo de archivos subidos (MB) | 15 |
| `allow_event_duplication` | Permitir que clientes dupliquen eventos | true |
| `allow_slug_change` | Permitir cambio de slug después de creación | false |

#### Paquetes / Planes de Cobro

| Campo | Descripción |
|-------|-------------|
| `plan_name` | Nombre del plan (Básico, Premium, Enterprise) |
| `max_events` | Número máximo de eventos simultáneos |
| `max_guests` | Invitados por evento |
| `max_photos` | Fotos en galería |
| `features_included` | Lista de features habilitados (galería, dresscode, itinerario, etc.) |
| `price` | Precio del plan |
| `duration_months` | Duración del plan en meses |

#### Auditoría

- Log de acciones sensibles: cambios de fecha, eliminación de eventos, cambios de plan
- Filtrable por evento, usuario, fecha
- Exportable

---

## 3. Restricciones por Evento

### 3.1 Tabla `event_restrictions` (nueva)

```sql
CREATE TABLE event_restrictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  max_date_changes INT DEFAULT NULL,      -- NULL = usa default global
  grace_days INT DEFAULT NULL,            -- NULL = usa default global
  date_changes_used INT DEFAULT 0,        -- Contador de cambios realizados
  last_date_change DATETIME DEFAULT NULL, -- Última vez que se cambió la fecha
  notes TEXT DEFAULT NULL,                -- Notas del admin sobre el override
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

### 3.2 Lógica de Validación (Backend)

```javascript
// Al intentar cambiar la fecha del evento:
async function canChangeEventDate(eventId) {
  const restrictions = await getEventRestrictions(eventId);
  const globalConfig = await getPlatformConfig();
  
  const maxChanges = restrictions.max_date_changes ?? globalConfig.max_date_changes;
  const graceDays = restrictions.grace_days ?? globalConfig.grace_days_before_event;
  
  // 1. Verificar límite de cambios
  if (restrictions.date_changes_used >= maxChanges) {
    return { allowed: false, reason: 'Límite de cambios alcanzado', maxChanges };
  }
  
  // 2. Verificar días de gracia
  const event = await getEvent(eventId);
  const daysUntilEvent = daysBetween(new Date(), new Date(event.event_date));
  if (daysUntilEvent < graceDays && daysUntilEvent > 0) {
    return { allowed: false, reason: `No se puede cambiar con menos de ${graceDays} días de anticipación` };
  }
  
  return { allowed: true, remainingChanges: maxChanges - restrictions.date_changes_used };
}
```

### 3.3 Flujo de Cambio de Fecha

1. Cliente intenta cambiar fecha en Builder/Config
2. Frontend hace `GET /api/events/:id/can-change-date`
3. Si `allowed: false` → muestra mensaje con la razón + opción "Contactar admin"
4. Si `allowed: true` → permite el cambio, muestra "Te quedan N cambios"
5. Al confirmar cambio → `PUT /api/events/:id/date` incrementa `date_changes_used`, registra en audit

### 3.4 Panel de Restricciones por Evento (Admin)

En la vista de detalle de evento (accesible solo por admin/root), agregar una sección "Restricciones":

```
┌─── Restricciones del Evento ──────────────────┐
│                                                 │
│  Cambios de fecha:  [1] / [1] máx   [+1]      │
│  Días de gracia:    [7]  (global: 7)           │
│  Último cambio:     15/Jul/2026                 │
│                                                 │
│  Notas del admin:                               │
│  [___________________________________]          │
│                                                 │
│  [Guardar restricciones]                        │
└─────────────────────────────────────────────────┘
```

- El botón `[+1]` incrementa el máximo permitido en 1 (para cuando el cliente contacta al admin)
- Los campos vacíos/null heredan del valor global

---

## 4. Tabla `platform_config` (nueva)

```sql
CREATE TABLE platform_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed inicial
INSERT INTO platform_config (config_key, config_value, description) VALUES
('max_date_changes', '1', 'Cambios de fecha permitidos por evento'),
('grace_days_before_event', '7', 'Días antes del evento en que se bloquea el cambio'),
('event_expiry_days_after', '30', 'Días después del evento para marcarlo expirado'),
('max_guests_per_event', '500', 'Máximo invitados por evento (default)'),
('max_photos_per_event', '20', 'Máximo fotos en galería'),
('max_file_size_mb', '15', 'Tamaño máximo de archivo en MB'),
('allow_event_duplication', 'true', 'Clientes pueden duplicar eventos'),
('allow_slug_change', 'false', 'Permitir cambio de slug post-creación');
```

---

## 5. Endpoints API

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/platform/config` | admin, root | Obtener toda la config global |
| PUT | `/api/platform/config/:key` | admin, root | Actualizar un valor global |
| GET | `/api/events/:id/restrictions` | admin, root | Restricciones del evento |
| PUT | `/api/events/:id/restrictions` | admin, root | Actualizar restricciones del evento |
| GET | `/api/events/:id/can-change-date` | client, admin | Verificar si puede cambiar fecha |
| PUT | `/api/events/:id/date` | client, admin | Cambiar fecha (con validación) |

---

## 6. Frontend — Comportamiento del Date Picker

### Para el cliente (rol `client`):
- Al abrir el builder/config y estar en el countdown, el date picker muestra la fecha actual
- Si el cliente intenta mover la fecha, se valida contra el backend
- Si no tiene cambios disponibles: el control se muestra **deshabilitado** con tooltip "Sin cambios disponibles. Contacta al administrador."
- Si tiene cambios: se muestra un badge "1 cambio disponible" y al confirmar se consume

### Para admin/root:
- Siempre puede cambiar la fecha sin restricción
- Puede ver/editar las restricciones del evento

---

## 7. Prioridad de Implementación

### Fase 1 (MVP — rápido)
- [ ] Tabla `event_restrictions` + seed
- [ ] Endpoint `can-change-date` con validación básica (solo contador)
- [ ] Frontend: deshabilitar date picker para cliente si no tiene cambios
- [ ] Admin: botón "+1 cambio" en detalle de evento

### Fase 2 (Completa)
- [ ] Tabla `platform_config` + panel de configuración global
- [ ] Días de gracia
- [ ] Auditoría de cambios de fecha
- [ ] Panel completo "Plataforma" en sidebar

### Fase 3 (Planes de cobro)
- [ ] Modelo de planes/paquetes
- [ ] Restricciones por plan (max_guests, max_photos, features)
- [ ] Facturación / expiración

---

*Última actualización: Agosto 2026*
