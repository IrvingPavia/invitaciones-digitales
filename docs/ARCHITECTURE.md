# 🏗️ Arquitectura — Vitely

## Stack

| Componente | Tecnología |
|---|---|
| Frontend | Angular 18 (Standalone Components, Signals) |
| Backend | Node.js + Express |
| Base de Datos | MySQL 8.0 (mysql2/promise) |
| PDF | Puppeteer + Chromium (HTML → PDF) |
| Contenedores | Docker + Docker Compose |
| Servidor web | Nginx (frontend en producción) |
| Server | Contabo VPS (Ubuntu), IP: 109.199.111.200 |
| Dominio | invitaciones.jbdev.pro (SSL Let's Encrypt) |

## Estructura del proyecto

```
invitaciones-digitales/
├── backend/
│   ├── src/
│   │   ├── index.js              # Entry point, Express app
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   └── roles.js          # Role-based access (root/admin/client)
│   │   ├── models/database.js    # MySQL pool + schema init + migrations
│   │   ├── migrations/fix-urls.js
│   │   └── routes/
│   │       ├── auth.js           # Login, /me, change-password
│   │       ├── events.js         # CRUD eventos (role-filtered)
│   │       ├── guests.js         # CRUD invitados, import/export Excel, QR
│   │       ├── config.js         # Event config JSON, itinerary, photos
│   │       ├── uploads.js        # File uploads (images, audio, gifs)
│   │       ├── cards.js          # Card templates + PDF generation (Puppeteer)
│   │       ├── rsvp.js           # Public RSVP confirmation
│   │       ├── users.js          # User management (CRUD, reset password)
│   │       └── public.js         # Public landing data, KPIs
│   ├── uploads/                  # Persistent volume for uploaded files
│   ├── Dockerfile                # Alpine + Chromium + Node
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/             # Login component
│   │   │   ├── core/             # Guards, interceptors, services, models
│   │   │   ├── dashboard/        # Dashboard layout + pages (home, events, guests, config, cards, users)
│   │   │   └── landing/          # Public landing + sections (envelope, intro, hero, invitation, details, venues, itinerary, gallery, dresscode, gifts, rsvp)
│   │   ├── assets/icons/         # Vitely logo + favicon
│   │   ├── environments/         # Dev/prod config
│   │   └── styles.scss           # Global styles (Vitely purple theme)
│   ├── Dockerfile                # Multi-stage: build Angular + serve with Nginx
│   └── nginx.conf                # Proxy /api/ and /uploads/ to backend
├── docs/                         # Documentation (this folder)
├── docker-compose.yml            # Local dev (MySQL + backend + frontend)
└── DEVELOPMENT_LOG.md            # Session log (legacy, see docs/)
```

## Base de datos (7 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Autenticación con roles (root/admin/client) |
| `user_events` | Relación muchos-a-muchos usuario↔evento |
| `events` | Eventos con slug, tipo, fecha |
| `event_config` | JSON blob con toda la configuración visual |
| `guests` | Invitados con código único, tipo, confirmación |
| `itinerary` | Items del itinerario (normalizado) |
| `photos` | Galería de fotos por evento |
| `card_templates` | Plantillas de tarjetas (front/back JSON) |

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| `root` | Todo + gestionar usuarios + no eliminable |
| `admin` | Todos los eventos + puede gestionar usuarios si tiene permiso |
| `client` | Solo sus eventos asignados + config + invitados |

## Flujo de datos

```
Invitado escanea QR → Landing (/invitacion/:slug?t=code)
  → GET /api/public/invitation/:slug (evento + config + itinerary + photos)
  → GET /api/public/invitation/:slug/guest/:code (datos del invitado)
  → POST /api/rsvp/:code/confirm (confirmación)
```

## Branding

- **Nombre**: Vitely
- **Logo**: `frontend/src/assets/icons/vitely-logo.png`
- **Favicon**: `frontend/src/assets/icons/vitely-favicon.ico`
- **Paleta dashboard**: Púrpura (#7c5cbf / #9d6ee7) sobre dark (#1a1a2a)
- **Paleta landing**: Configurable por evento (tema)
