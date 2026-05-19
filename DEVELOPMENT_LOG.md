# 📋 DEVELOPMENT LOG - Gestor de Invitaciones Digitales

> Última actualización: 2026-05-18
> Este archivo sirve como contexto para retomar el desarrollo. Compártelo con `@DEVELOPMENT_LOG.md` al iniciar una nueva sesión.

---

## 🏗️ Stack Real (difiere del README original)

| Componente | Tecnología |
|---|---|
| Frontend | Angular 18 (Standalone Components, Signals) |
| Backend | Node.js + Express |
| Base de Datos | **MySQL 8.0** (mysql2/promise) — NO SQLite |
| Contenedores | Docker + Docker Compose |
| Servidor web | Nginx (frontend en producción) |

---

## 📁 Estructura Actual

```
Portafolio/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app, rutas, middleware
│   │   ├── middleware/auth.js    # JWT verification
│   │   ├── models/database.js    # MySQL pool + schema + seed
│   │   └── routes/
│   │       ├── auth.js           # Login, me, change-password
│   │       ├── events.js         # CRUD eventos + getDefaultConfig
│   │       ├── guests.js         # CRUD + import/export Excel + QR
│   │       ├── config.js         # Config JSON + itinerary + photos
│   │       ├── uploads.js        # Multer: images, audio, gifs, photos
│   │       ├── rsvp.js           # Confirmación pública
│   │       ├── cards.js          # Template + PDF generation
│   │       └── public.js         # Landing data + KPIs (sin auth)
│   ├── .env                      # DB_HOST, JWT_SECRET, BASE_URL, etc.
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── app.config.ts         # provideRouter, provideHttpClient, provideAnimations
│   │   ├── app.routes.ts         # Lazy loading routes
│   │   ├── auth/login.component.ts
│   │   ├── core/
│   │   │   ├── guards/auth.guard.ts
│   │   │   ├── interceptors/auth.interceptor.ts
│   │   │   ├── models/models.ts          # ⚠️ Interfaces actualizadas (ver abajo)
│   │   │   └── services/
│   │   │       ├── api.service.ts
│   │   │       └── auth.service.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts    # Sidebar con overlay mobile, arrow toggle
│   │   │   └── pages/
│   │   │       ├── home/home.component.ts
│   │   │       ├── events/events.component.ts
│   │   │       ├── guests/guests.component.ts
│   │   │       ├── config/config.component.ts  # ⚠️ Componente más grande
│   │   │       └── cards/cards.component.ts
│   │   └── landing/
│   │       ├── landing.component.ts      # ScrollRevealDirective + wrapper
│   │       └── sections/
│   │           ├── intro/intro.component.ts
│   │           ├── hero/hero.component.ts       # Countdown, gradient names, phrase
│   │           ├── invitation/invitation.component.ts
│   │           ├── details/details.component.ts # N cards dinámicas con estilos globales
│   │           ├── venues/venues.component.ts   # N lugares con maps
│   │           ├── itinerary/itinerary.component.ts
│   │           ├── gallery/gallery.component.ts # Carrusel + lightbox sin fondo
│   │           ├── dresscode/dresscode.component.ts
│   │           ├── gifts/gifts.component.ts
│   │           └── rsvp/rsvp.component.ts
│   ├── src/styles.scss           # Estilos globales + responsive
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── DEVELOPMENT_LOG.md            # Este archivo
```

---

## 🔧 Cambios Realizados en Esta Sesión

### Landing - Secciones

1. **Venues (NUEVO)** — Componente que renderiza N lugares del evento con icono, nombre, dirección, horario (AM/PM) y botón "Cómo llegar" (Google Maps). Botón alineado debajo del horario.

2. **Details (REESCRITO)** — Ya no usa padres/padrinos fijos. Ahora es un array de `DetailCard[]` con:
   - `iconUrl` (imagen subida, opcional — si no hay, no se muestra nada)
   - `title` (opcional)
   - `content` (texto libre con saltos de línea)
   - `textAlign` (left/center/right por card)
   - Estilos globales: `titleStyle` y `contentStyle` (fontFamily, fontSize, color)
   - Título de sección configurable

3. **Gallery (REESCRITO)** — Carrusel tipo álbum:
   - Deslizamiento derecha→izquierda con transición suave
   - Auto-play cada 4s
   - Swipe táctil en mobile
   - Flechas + dots + contador
   - Lightbox sin fondo negro, botón "Cerrar" abajo
   - Se cierra al scroll o click fuera

4. **Hero (MODIFICADO)**:
   - Nuevo campo `heroPhrase` entre nombres y countdown
   - Estilos individuales para cada texto (fontFamily, fontSize, color)
   - Nombres con degradado 2 colores + ángulo configurable
   - Countdown responsivo: `flex-wrap: nowrap`, items con `flex:1`, `overflow:hidden`
   - Navbar muestra "Descripción + Nombres" (ej: "XV Años Valeria"), full width

5. **Scroll Reveal** — Directiva `ScrollRevealDirective` con IntersectionObserver, fade-in + translateY al entrar al viewport.

### Dashboard

6. **Responsive completo**:
   - Sidebar como overlay en mobile con botón flecha sutil en el borde izquierdo
   - Botón de colapsar/expandir como pestaña-flecha en el borde derecho del sidebar (desktop)
   - Eliminado el topbar — usuario y logout están en el sidebar footer
   - Tabs con scroll horizontal + flechas de navegación
   - Grids responsivos (1 col mobile, 2 col tablet, 4 col desktop)
   - `overflow-x: hidden` en todos los contenedores
   - Tablas con scroll interno

7. **Navegación**:
   - Botón "Volver a Eventos" (`.back-link`) alineado a la derecha en config, guests y cards
   - Eliminado `withViewTransitions()` que causaba error `InvalidStateError`

8. **Config Component**:
   - Tabs con wrapper + flechas para scroll
   - Toggle "Visible" en itinerario y galería
   - Sección Venues con N lugares configurables
   - Sección Detalles con N cards + estilos globales
   - Hero con controles de color (picker + hex input)
   - `ensureDefaults()` que migra configs viejas al formato nuevo
   - `migrateDetails()` convierte formato padres/padrinos → cards

9. **Estilos globales**:
   - `input[type="color"]` con tamaño 48x40px visible
   - `.back-link` con borde dorado, float right
   - Mobile: cards con `overflow-x: hidden`, `word-break: break-word`

### Backend

10. **events.js** — `getDefaultConfig()` actualizado con formato nuevo de details (`{ enabled, title, cards: [] }`)

---

## 📐 Modelos Actuales (models.ts)

```typescript
interface EventConfig {
  intro: IntroConfig;
  hero: HeroConfig;
  invitation: InvitationConfig;
  details: DetailsConfig;
  venues: VenuesConfig;
  itinerary: ItineraryConfig;
  gallery: GalleryConfig;
  dresscode: DresscodeConfig;
  gifts: GiftsConfig;
  rsvp: RsvpConfig;
}

interface HeroConfig {
  backgroundGif, audioUrl, eventDescription, celebrantNames, heroPhrase, countdownDate
  eventDescriptionStyle: HeroTextStyle    // { fontFamily, fontSize, color }
  celebrantNamesStyle: HeroGradientStyle  // { fontFamily, fontSize, color1, color2, gradientAngle }
  heroPhraseStyle: HeroTextStyle          // { fontFamily, fontSize, color }
}

interface DetailsConfig {
  enabled: boolean;
  title: string;
  titleStyle: DetailTextStyle;    // { fontFamily, fontSize, color }
  contentStyle: DetailTextStyle;
  cards: DetailCard[];            // { id, iconUrl, title, content, textAlign }
}

interface VenuesConfig {
  enabled: boolean;
  items: VenueItem[];  // { id, title, icon, name, address, time, mapsUrl }
}
```

---

## ⚠️ Bugs/Pendientes Conocidos

- [x] CSS warning en config.component.ts línea 27 (`.countdown-picker` tenía CSS suelto sin selector) — **CORREGIDO**
- [ ] Warnings de `?.` innecesarios en templates (no afectan funcionalidad)
- [ ] CSS budget warnings en hero, gallery, rsvp (componentes exceden 2KB de CSS inline — es un warning de Angular, no un bug)
- [ ] No hay git inicializado en el proyecto
- [x] README.md sigue diciendo SQLite (debería decir MySQL) — **CORREGIDO**
- [ ] La carpeta `frontend/src/app/landing/sections/venues/` ya tiene componente funcional
- [x] El `flex: wrap` en `.flex` global puede afectar layouts que no lo esperan — **CORREGIDO**

---

## 🐳 Comandos Útiles

```bash
# Levantar todo
docker-compose up -d --build

# Solo frontend
docker-compose up -d --build frontend

# Ver logs
docker-compose logs -f

# Acceso
# Frontend: http://localhost
# Login: admin / admin123
# Landing ejemplo: http://localhost/invitacion/{slug}?t={codigo}
```

---

## 🎨 Decisiones de Diseño

- **Landing mobile-first**: wrapper de 520px max-width, background full viewport con cover
- **Dark theme**: fondo #0d1117, acentos dorados (#d4a017), glassmorphism en cards
- **Secciones opcionales**: todas tienen toggle `enabled` excepto hero e invitation
- **Estilos de texto configurables**: fontFamily (sans/serif/script), fontSize (px), color (hex)
- **Nombres con degradado**: background-clip text, 2 colores + ángulo
- **Gallery**: carrusel single-image, aspect-ratio 3:4, auto-play 4s
- **Dashboard sidebar**: fixed en desktop, overlay en mobile, arrow toggle en borde
