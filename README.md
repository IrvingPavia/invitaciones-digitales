# 🎉 Gestor de Invitaciones Digitales

Sistema completo para crear y gestionar invitaciones digitales con landing pages animadas y dashboard administrativo.

## Stack Tecnológico

- **Frontend**: Angular 18 (Standalone Components)
- **Backend**: Node.js + Express
- **Base de Datos**: MySQL 8.0 (mysql2/promise)
- **Contenedores**: Docker + Docker Compose

---

## 🚀 Inicio Rápido

### Desarrollo Local

**Backend:**
```bash
cd backend
npm install
npm run dev
# Servidor en http://localhost:3000
# Usuario: admin / Contraseña: admin123
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# App en http://localhost:4200
```

### Con Docker (Producción)

```bash
# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Construir y levantar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

La app estará disponible en `http://localhost`

---

## 📁 Estructura del Proyecto

```
Portafolio/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/auth.js
│   │   ├── models/database.js      # MySQL pool + schema + seed
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── events.js
│   │   │   ├── guests.js
│   │   │   ├── config.js
│   │   │   ├── uploads.js
│   │   │   ├── rsvp.js
│   │   │   ├── cards.js
│   │   │   └── public.js
│   │   └── index.js
│   ├── data/                       # Datos persistentes
│   ├── uploads/                    # Archivos subidos
│   ├── .env
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── auth/login.component.ts
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/models.ts
│   │   │   └── services/
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   ├── home/           # KPIs + selector evento
│   │   │   │   ├── events/         # CRUD eventos
│   │   │   │   ├── guests/         # CRUD + import/export Excel
│   │   │   │   ├── config/         # Configuración landing
│   │   │   │   └── cards/          # Editor tarjetas + PDF
│   │   │   └── dashboard.component.ts
│   │   └── landing/
│   │       ├── landing.component.ts
│   │       └── sections/
│   │           ├── intro/          # Animación de entrada
│   │           ├── hero/           # Countdown + audio + nav
│   │           ├── invitation/     # Nombre invitado
│   │           ├── details/        # Padres, padrinos, lugares
│   │           ├── itinerary/      # Timeline cronológico
│   │           ├── gallery/        # Fotos + lightbox
│   │           ├── dresscode/      # Código de vestimenta
│   │           ├── gifts/          # Mesa de regalos
│   │           └── rsvp/           # Confirmación asistencia
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── invitaciones-api.postman_collection.json
```

---

## 🔗 URLs

| Ruta | Descripción |
|------|-------------|
| `/login` | Panel administrativo - Login |
| `/dashboard` | Dashboard principal con KPIs |
| `/dashboard/events` | Gestión de eventos |
| `/dashboard/guests/:eventId` | Gestión de invitados |
| `/dashboard/config/:eventId` | Configuración de landing |
| `/dashboard/cards/:eventId` | Editor de tarjetas |
| `/invitacion/:slug` | Landing page pública |
| `/invitacion/:slug?t=CODIGO` | Landing con invitado específico |

---

## 📊 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuario actual |
| PUT | `/api/auth/change-password` | Cambiar contraseña |

### Events
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/events` | Listar eventos |
| POST | `/api/events` | Crear evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |

### Guests
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/guests/event/:eventId` | Invitados del evento |
| POST | `/api/guests` | Crear invitado |
| PUT | `/api/guests/:id` | Actualizar invitado |
| DELETE | `/api/guests/:id` | Eliminar invitado |
| GET | `/api/guests/:id/qr` | Generar QR |
| POST | `/api/guests/import/:eventId` | Importar Excel |
| GET | `/api/guests/export/:eventId` | Exportar Excel |
| GET | `/api/guests/template/download` | Plantilla Excel |

### Config
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/config/:eventId` | Obtener configuración |
| PUT | `/api/config/:eventId` | Guardar configuración |
| GET/POST/PUT/DELETE | `/api/config/:eventId/itinerary` | CRUD itinerario |
| GET/DELETE | `/api/config/:eventId/photos` | Gestión fotos |

### Cards
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cards/:eventId` | Obtener plantilla |
| PUT | `/api/cards/:eventId` | Guardar plantilla |
| GET | `/api/cards/:eventId/pdf` | Exportar PDF |

### Public (sin auth)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/invitation/:slug` | Datos de landing |
| GET | `/api/public/invitation/:slug/guest/:code` | Datos del invitado |
| GET | `/api/public/kpis/:eventId` | KPIs del evento |
| GET | `/api/rsvp/:code` | Info invitado por código |
| POST | `/api/rsvp/:code/confirm` | Confirmar asistencia |

---

## 📋 Importación de Invitados (Excel)

El archivo Excel debe tener las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `guest_type` | `family` o `individual` | `family` |
| `family_name` | Nombre de familia (si aplica) | `Familia García` |
| `guest_names` | Nombres separados por coma | `Juan García, María García` |
| `max_companions` | Acompañantes permitidos (solo individual) | `2` |
| `notes` | Notas adicionales | `Mesa VIP` |

Descarga la plantilla desde el dashboard: **Invitados → Plantilla**

---

## 🎨 Configuración de la Landing

Desde **Dashboard → Configurar** puedes personalizar:

- **Intro**: Frase de bienvenida, imagen/gif de fondo, duración (máx 5s)
- **Hero**: GIF de fondo fijo, audio MP3, nombres, cuenta regresiva
- **Invitación**: Título y subtítulo de la sección
- **Detalles**: Padres, padrinos, ceremonia religiosa, lugar de fiesta
- **Itinerario**: Actividades cronológicas con iconos Material
- **Galería**: Álbum de fotos con lightbox
- **Vestimenta**: Código de vestimenta (opcional)
- **Regalos**: Mesa de regalos con link externo (opcional)
- **RSVP**: Confirmación de asistencia (opcional)

---

## 🖨️ Tarjetas para Impresión

El PDF generado contiene **5 invitaciones por página** en 2 columnas:
- **Columna izquierda**: Frente con datos del evento e invitado
- **Columna derecha**: Reverso con código QR único

---

## 🔒 Seguridad

- JWT con expiración de 24h
- Rate limiting: 500 req/15min
- Helmet.js para headers de seguridad
- Validación de tipos de archivo en uploads
- Límite de 50MB por archivo

---

## 🐳 Variables de Entorno

```env
JWT_SECRET=clave_secreta_muy_segura
BASE_URL=https://tudominio.com
FRONTEND_URL=https://tudominio.com
```

---

## 📱 Compatibilidad

- ✅ Mobile (iOS Safari, Android Chrome) — optimizado para escaneo QR
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Responsive design con breakpoints móvil
