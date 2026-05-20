# 📋 DEVELOPMENT LOG - Gestor de Invitaciones Digitales

> Última actualización: 2026-05-20
> Este archivo sirve como contexto para retomar el desarrollo. Compártelo con `@DEVELOPMENT_LOG.md` al iniciar una nueva sesión.

---

## 🏗️ Stack Real

| Componente | Tecnología |
|---|---|
| Frontend | Angular 18 (Standalone Components, Signals) |
| Backend | Node.js + Express |
| Base de Datos | MySQL 8.0 (mysql2/promise) |
| Contenedores | Docker + Docker Compose |
| Servidor web | Nginx (frontend en producción) |

---

## 📁 Estructura Actual

```
Portafolio/                         ← Workspace
└── invitaciones-digitales/         ← Proyecto (repo git)
    ├── backend/
    │   ├── src/
    │   │   ├── index.js
    │   │   ├── middleware/auth.js
    │   │   ├── models/database.js
    │   │   └── routes/ (auth, events, guests, config, uploads, rsvp, cards, public)
    │   ├── .env
    │   └── Dockerfile
    ├── frontend/
    │   ├── src/
    │   │   ├── index.html              # Google Fonts expandidas + Material Icons
    │   │   ├── main.ts
    │   │   ├── styles.scss             # Estilos globales + @font-face Spumoni
    │   │   ├── assets/fonts/           # SpumoniLPStd.woff2, .woff, .ttf, .eot
    │   │   └── app/
    │   │       ├── app.config.ts
    │   │       ├── app.routes.ts
    │   │       ├── auth/login.component.ts
    │   │       ├── core/
    │   │       │   ├── guards/auth.guard.ts
    │   │       │   ├── interceptors/auth.interceptor.ts
    │   │       │   ├── components/color-picker.component.ts  # Reutilizable
    │   │       │   ├── models/models.ts
    │   │       │   └── services/ (api.service.ts, auth.service.ts)
    │   │       ├── dashboard/
    │   │       │   ├── dashboard.component.ts
    │   │       │   └── pages/
    │   │       │       ├── home/home.component.ts
    │   │       │       ├── events/events.component.ts
    │   │       │       ├── guests/guests.component.ts
    │   │       │       ├── config/config.component.ts + config.component.html
    │   │       │       └── cards/cards.component.ts
    │   │       └── landing/
    │   │           ├── landing.component.ts
    │   │           └── sections/ (intro, hero, invitation, details, venues, itinerary, gallery, dresscode, gifts, rsvp)
    │   ├── angular.json
    │   ├── nginx.conf
    │   └── Dockerfile
    ├── docker-compose.yml          # Volúmenes con nombre fijo
    ├── .gitignore
    ├── .env.example
    ├── README.md
    ├── DEVELOPMENT_LOG.md
    └── invitaciones-api.postman_collection.json
```

---

## 🔧 Cambios Realizados en Esta Sesión (2026-05-20)

### Lightbox Gallery — Tema

37. **Gallery lightbox**: aplicado `--theme-card-bg`, `--theme-card-border`, `--theme-text-primary`, `--theme-text-secondary` al lightbox (imagen borde, botón cerrar fondo/borde/texto/hover)

### BaseUrl — URLs dinámicas en dashboard

38. **`environment.production.ts`**: `baseUrl: '/invitaciones'` para deploy en servidor con subpath (vacío en local)
39. **`events.component.ts`**: URLs de landing usan `environment.baseUrl + '/invitacion/' + slug` en href y textos informativos
40. **`home.component.ts`**: botón "Ver Landing" usa `[href]` con `environment.baseUrl`
41. **`guests.component.ts`**: `landingUrl()` concatena `origin + baseUrl + '/invitacion/...'`
42. **Eliminado `routerLink`** con `target="_blank"` para links de landing → reemplazado por `[href]` con URL completa

---

## 🔧 Cambios Realizados en Sesión (2026-05-19)

### Infraestructura

1. **Proyecto movido** de `c:\Portafolio\` a `c:\Portafolio\invitaciones-digitales\` (workspace multi-proyecto)
2. **Git inicializado** + push a https://github.com/IrvingPavia/invitaciones-digitales
3. **Docker volumes con nombre fijo** (`invitaciones_mysql_data`, `invitaciones_backend_uploads`) para evitar pérdida de datos al mover carpetas
4. **Eliminado `version: '3.9'`** del docker-compose (obsoleto)
5. **Datos migrados** de volúmenes `portafolio_*` a `invitaciones_*`
6. **Rama `int-001`** creada como punto de restauración estable
7. **Budget CSS** aumentado a `maximumWarning: 6kb`, `maximumError: 10kb` en angular.json

### Dashboard - Config Component (UI/UX PRO refactor)

8. **Template separado** `config.component.html` con `templateUrl`
9. **Section cards** — cada sección envuelta en `.section-card` con header dorado y body organizado
10. **Toggle pills** (ON/OFF) elegantes reemplazando checkboxes para habilitar/deshabilitar secciones
11. **Field rows** con grid layout: `.field`, `.field-sm`, `.field-xs`, `.field-row`
12. **Preview unificado** de estilos globales en un solo bloque (encabezado + separador + título degradado + subtítulo + contenido)
13. **Photo grid** con delete button on hover (`.photo-item`, `.photo-delete`)
14. **File inputs estilizados** — borde dashed dorado, botón "Seleccionar archivo" con gradiente
15. **Regalos** separado en 2 section-cards: Mesa de Regalos + Transferencia Bancaria
16. **Slider de intensidad del degradado** (`gradientIntensity: 0-100`) — controla punto medio del gradiente
17. **Slider de grosor** (`fontWeight: 100-900`) — para títulos y nombres de celebrantes
18. **Sliders compactos** con clase `.slider-field` (max-width: 200px) y labels con valores numéricos
19. **Preview de nombres de celebrantes** en la sección Carátula con degradado en vivo

### Sesión 2 — Prioridades 2, 3 y 4

20. **Prioridad 2**: `eventDescriptionStyle` convertido de `HeroTextStyle` a `HeroGradientStyle` (color1, color2, gradientAngle, gradientIntensity, fontWeight)
21. **Prioridad 2**: Controles completos en dashboard + preview en vivo para descripción del evento
22. **Prioridad 2**: Hero landing aplica degradado con `background-clip: text` + fontWeight
23. **Prioridad 3**: `ThemeConfig` con 7 campos (cardBg, cardBorder, textPrimary, textSecondary, navFooterText, buttonBg, buttonText)
24. **Prioridad 3**: Tab "Tema" en dashboard con `ColorPickerComponent` + preview
25. **Prioridad 3**: CSS variables inyectadas en landing-wrapper: `--theme-card-bg`, `--theme-card-border`, `--theme-text-primary`, `--theme-text-secondary`, `--theme-nav-text`, `--theme-btn-bg`, `--theme-btn-text`
26. **Prioridad 3**: Todos los componentes del landing usan variables de tema para cards
27. **Prioridad 3**: Navbar, footer y botón "Volver" usan `--theme-nav-text`
28. **Prioridad 3**: Botones (gifts, venues, rsvp) usan `--theme-btn-bg` / `--theme-btn-text`
29. **Prioridad 4**: `IntroConfig.phraseStyle` agregado (fontFamily, fontSize, color, fontWeight)
30. **Prioridad 4**: Controles en dashboard + aplicación dinámica en intro.component.ts
31. **Tipos ampliados**: `HeroTextStyle.fontFamily` y `HeroGradientStyle.fontFamily` ahora son `string` (no literal union)
32. **ColorPickerComponent**: swatch visual + input hex + slider opacidad + botón copiar
33. **Fix blur**: eliminado `backdrop-filter: blur` del overlay global y countdown items
34. **Fix scrollbar**: color dinámico via `<style>` inyectado al `<head>` con el color del tema
35. **Fix invitation card**: usa `--theme-card-bg/border` + texto usa `--theme-text-secondary/primary`
36. **Fix countdown**: usa `--theme-card-bg/border` + color de valores usa `--theme-nav-text`

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
  globalStyles: GlobalTextStyles;
  theme: ThemeConfig;
}

interface ThemeConfig {
  cardBg: string;          // fondo de cards, ej: 'rgba(255,255,255,0.05)'
  cardBorder: string;      // borde de cards, ej: 'rgba(212,160,23,0.3)'
  textPrimary: string;     // texto principal
  textSecondary: string;   // texto secundario
  navFooterText: string;   // texto de navbar, footer y botón volver
  buttonBg: string;        // fondo de botones (gifts, venues, rsvp)
  buttonText: string;      // texto de botones
}

interface GlobalTextStyles {
  sectionHeadingStyle: DetailTextStyle;
  titleStyle: DetailTextStyle;           // con color2 + gradientAngle para degradado
  subtitleStyle: DetailTextStyle;
  contentStyle: DetailTextStyle;
  separatorStyle: SeparatorStyle;
}

interface SeparatorStyle {
  type: 'elegant' | 'formal' | 'executive' | 'festive' | 'animated' | 'minimal' | 'ornamental';
  color: string;
}

interface DetailTextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  color2?: string;
  gradientAngle?: number;
  gradientIntensity?: number;
  fontWeight?: number;  // 100-900
}

interface IntroConfig {
  enabled: boolean;
  background: string;
  phrase: string;
  duration: number;
  phraseStyle?: { fontFamily: string; fontSize: number; color: string; fontWeight?: number; };
}

interface HeroGradientStyle {
  fontFamily: string;
  fontSize: number;
  color1: string;
  color2: string;
  gradientAngle: number;
  gradientIntensity?: number;
  fontWeight?: number;
}

interface HeroConfig {
  backgroundGif: string;
  audioUrl: string;
  eventDescription: string;
  eventDescriptionStyle: HeroGradientStyle;  // ← ahora soporta degradado
  celebrantNames: string;
  celebrantNamesStyle: HeroGradientStyle;
  heroPhrase: string;
  heroPhraseStyle: HeroTextStyle;
  countdownDate: string;
}

interface TransferConfig {
  enabled: boolean;
  title: string;
  description: string;
  accountName: string;
  bank: string;
  accountType: 'tarjeta' | 'cuenta' | 'clabe';
  accountNumber: string;
  animation: 'coins' | 'bills' | 'none';
}

interface ItineraryItem {
  id?: number;
  icon: string;
  iconType: 'emoji' | 'custom';
  iconUrl?: string;
  time: string;           // formato "HH:mm" 24h
  title: string;
  description: string;
  sort_order: number;
}
```

---

## ⚠️ TAREAS PENDIENTES (en orden de prioridad)

### Prioridad 1 — Estilos globales en TODOS los componentes del landing ✅
- [x] Aplicar `getTitleGradient()` + `fontWeight` en: venues, itinerary, gallery, dresscode, gifts, rsvp
- [x] Separadores ya estaban en TODOS los encabezados de sección
- [x] `sectionHeadingStyle` ya se aplicaba en todos los componentes
- [x] `contentStyle` aplicado a: details, venues, itinerary, dresscode, gifts
- [x] `subtitleStyle` aplicado a: invitation, gallery
- [x] `titleStyle` con degradado aplicado a: invitation, details, venues

### Prioridad 2 — Carátula: degradado en "Descripción del evento" ✅
- [x] Cambiar `eventDescriptionStyle` de `HeroTextStyle` a `HeroGradientStyle` (color1, color2, gradientAngle, gradientIntensity, fontWeight)
- [x] Agregar controles en el dashboard (colores, ángulo, intensidad, grosor) + preview en vivo
- [x] Aplicar degradado con `background-clip: text` en hero.component.ts del landing
- [x] Aplicar `fontWeight` a celebrantNames en el landing

### Prioridad 3 — Nuevo tab "Tema" (colores globales de la landing) ✅
- [x] Modelo: `ThemeConfig` agregado a `EventConfig` (cardBg, cardBorder, textPrimary, textSecondary)
- [x] Tab "Tema" en dashboard con inputs de color/texto + preview en vivo
- [x] CSS variables `--theme-card-bg`, `--theme-card-border`, `--theme-text-primary`, `--theme-text-secondary` inyectadas en landing-wrapper
- [x] Cards de TODOS los componentes usan `var(--theme-card-bg)` y `var(--theme-card-border)`: details, venues, itinerary, gallery, dresscode, gifts, rsvp
- [x] Navbar (scrolled): hereda fondo y borde del tema
- [x] Footer: texto hereda color de bordes
- [x] Botón "Volver arriba": hereda colores del tema

### Prioridad 4 — Configuración de texto del Intro ✅
- [x] `IntroConfig.phraseStyle` agregado (fontFamily, fontSize, color, fontWeight)
- [x] Controles en dashboard: fuente, tamaño, color, grosor
- [x] Aplicado en intro.component.ts con bindings dinámicos

### Prioridad 5 — Otros pendientes
- [x] Selectores de color: `ColorPickerComponent` con hex input + copiar (implementado)
- [x] Scrollbar: color dinámico via style injection en landing (implementado)
- [x] Gallery component: aplicar `--theme-card-bg/border` a lightbox
- [ ] Warnings de `?.` innecesarios en templates (no afectan funcionalidad)
- [ ] CSS budget warnings en componentes (warning, no error)
- [ ] Sliders compactos: verificar que `.slider-field` se aplica correctamente

### Prioridad 6 — BaseUrl para deploy en servidor ✅
- [x] `environment.production.ts` con `baseUrl: '/invitaciones'`
- [x] `events.component.ts` usa `environment.baseUrl` en URLs de landing
- [x] `home.component.ts` usa `environment.baseUrl` en botón Ver Landing
- [x] `guests.component.ts` usa `environment.baseUrl` en `landingUrl()`

---

## 🐳 Comandos Útiles

```bash
# Levantar todo
cd c:\Portafolio\invitaciones-digitales
docker-compose up -d --build

# Solo frontend
docker-compose up -d --build frontend

# Ver logs
docker-compose logs -f

# Acceso
# Frontend: http://localhost
# Login: admin / admin123
# Landing ejemplo: http://localhost/invitacion/{slug}?t={codigo}

# BD
# Host: localhost:3306
# DB: invitaciones
# User: invitaciones_user / invitaciones_pass
# Root: root / rootpassword
```

---

## 🎨 Decisiones de Diseño

- **Landing mobile-first**: wrapper de 520px max-width, background full viewport con cover
- **Dark theme**: fondo #0d1117, acentos dorados (#d4a017), glassmorphism en cards
- **Secciones opcionales**: todas tienen toggle `enabled` excepto hero e invitation
- **Estilos globales**: una sola pestaña controla fuentes/colores de toda la landing (excepto hero)
- **Títulos con degradado**: background-clip text, 2 colores + ángulo configurable con range slider
- **Separadores configurables**: 7 estilos (elegant, formal, executive, festive, animated, minimal, ornamental) + color
- **15 fuentes**: sans (4) + serif (4) + script (7), todas con latin-ext para español
- **Spumoni**: fuente custom cargada como @font-face local
- **Transferencia bancaria**: sección independiente con animación de partículas y copy-to-clipboard
- **Itinerario**: emojis como iconos + opción custom, time spinner visual, feedback al guardar
- **Dashboard sidebar**: fixed en desktop, overlay en mobile, arrow toggle en borde
- **Volúmenes Docker**: nombres fijos para evitar pérdida de datos al mover proyecto

---

## 📦 GitHub

- Repo: https://github.com/IrvingPavia/invitaciones-digitales
- Branch: main (producción), int-001 (desarrollo activo)
- Cuenta: IrvingPavia (Irving.pavia.sosa@hotmail.com)
