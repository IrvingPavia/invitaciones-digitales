# 📋 DEVELOPMENT LOG - Gestor de Invitaciones Digitales

> Última actualización: 2026-05-21
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

## 🔧 Cambios Realizados en Esta Sesión (2026-05-21)

### Detalles — Selector de Icono (Emoji/Imagen)

59. **Modelo `DetailCard`**: agregados campos `iconType: 'emoji' | 'image'` e `icon: string` para persistir selección
60. **Dashboard config (details tab)**: toggle buttons Emoji/Imagen + emoji picker dropdown (mismo patrón que itinerario)
61. **`ensureDefaults`**: migración retrocompatible — cards existentes reciben `iconType` e `icon` al cargar
62. **Landing `details.component.ts`**: renderiza emoji (`.emoji-icon` con fondo tema) o imagen según `iconType`
63. **Fix carga de contenido**: `ensureHtmlContent()` convierte texto plano con `\n` a `<p>` HTML para Quill

### Editor Quill — Color Picker Integrado

64. **Paleta de colores**: 22 colores predefinidos útiles (blancos, grises, dorados, colores vivos) en dropdown estilizado
65. **Color personalizado**: `<input type="color">` inyectado al final de cada paleta via `ngAfterViewChecked`
66. **Estilos Quill mejorados**: dropdown con fondo `#1a1a2e`, bordes dorados, items con hover animado, border-radius
67. **`onEditorCreated`**: captura instancias de Quill para aplicar color custom al texto seleccionado

---

### Lightbox Gallery — Tema

37. **Gallery lightbox**: aplicado `--theme-card-bg`, `--theme-card-border`, `--theme-text-primary`, `--theme-text-secondary` al lightbox (imagen borde, botón cerrar fondo/borde/texto/hover)

### BaseUrl — URLs dinámicas en dashboard

38. **`environment.production.ts`**: `baseUrl: '/invitaciones'` para deploy en servidor con subpath (vacío en local)
39. **`events.component.ts`**: URLs de landing usan `environment.baseUrl + '/invitacion/' + slug` en href y textos informativos
40. **`home.component.ts`**: botón "Ver Landing" usa `[href]` con `environment.baseUrl`
41. **`guests.component.ts`**: `landingUrl()` concatena `origin + baseUrl + '/invitacion/...'`
42. **Eliminado `routerLink`** con `target="_blank"` para links de landing → reemplazado por `[href]` con URL completa

### Prioridad 7 — Consistencia de Tema en toda la Landing

43. **P7.1 Intro**: barra de loading usa `themeColor` pasado como `@Input` (color de `navFooterText`)
44. **P7.2/3/4 Hero**: botones nav `color: --theme-text-primary`, menú navegación `--theme-text-primary`, scroll arrows `--theme-text-primary`, focus/active usa `--theme-btn-bg` en vez de blur dorado
45. **P7.5 Tema opacidad**: `[showOpacity]="true"` en TODOS los color pickers del tab Tema
46. **P7.6 Tema fuentes**: campos `textPrimaryFont`, `textSecondaryFont`, `navFooterFont`, `buttonFont` en `ThemeConfig` + selectores en dashboard + variables CSS `--theme-text-primary-font`, `--theme-text-secondary-font`, `--theme-nav-font`, `--theme-btn-font` inyectadas en landing-wrapper
47. **P7.7 Invitation**: ornamentos ✦ usan `--theme-text-primary`, chips de nombres usan `--theme-card-bg/border/text-primary`, contador asistentes usa `--theme-nav-text`
48. **P7.8 Venues**: icono schedule usa `--theme-text-primary`
49. **P7.9 Itinerario**: línea vertical `--theme-card-border`, dots `--theme-text-primary`, fondo iconos `--theme-card-bg/border`, horarios `--theme-text-primary`
50. **P7.10 Gallery**: flechas carrusel `--theme-card-bg/border/text-primary`, dots activos `--theme-text-primary`
51. **P7.11 Dresscode**: icono usa `--theme-text-primary`
52. **P7.12 Gifts**: icono mesa regalos `--theme-text-primary`, transferencia: icono/título/desc/labels/values/botones copiado todos con variables de tema
53. **RSVP**: textos, badges, chips nombres, botones selección acompañantes, inputs y labels respetan tema + placeholders heredan `--theme-text-primary` con opacity 0.4
54. **Countdown**: aumentado padding (`14px 12px`), `min-width: 60px`, gap `8px` para evitar cuadros estrechos
55. **Transferencia**: número de cuenta/tarjeta unificado con mismo estilo que titular (`--theme-text-primary`)
56. **Dashboard Tema UI**: quitados "Texto ejemplo" inline, fuentes se previsualizan en la Vista Previa existente con `fontFamily` dinámico
57. **Footer/Back-to-top**: usan `--theme-nav-font` para fuente dinámica
58. **Nav menu items**: usan `--theme-text-primary-font`

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

interface DetailCard {
  id: string;
  iconType: 'emoji' | 'image';
  icon: string;
  iconUrl: string;
  title: string;
  content: string;          // HTML (Quill editor)
  textAlign: 'left' | 'center' | 'right';
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

### Prioridad 7 — Consistencia de Tema en toda la Landing

#### P7.1 — Intro: barra de loading respete color del tema
- [x] La barra de progreso del intro usa `themeColor` Input (navFooterText)

#### P7.2 — Botones hero/nav: iconos y textos no respetan tema
- [x] Botones audio/nav: `color: --theme-text-primary`
- [x] Scroll arrows: `--theme-text-primary`
- [x] Textos menú navegación: `--theme-text-primary` + `--theme-text-primary-font`

#### P7.3 — Color texto primario sin efecto real
- [x] `--theme-text-primary` aplicado a todos los controles del P7.2

#### P7.4 — Blur dorado en botones audio/nav al hacer click
- [x] Focus/active usa `--theme-btn-bg` en vez de blur dorado hardcodeado

#### P7.5 — Agregar intensidad (opacidad) a TODAS las configuraciones de colores del tema
- [x] `[showOpacity]="true"` en todos los color pickers del tab Tema

#### P7.6 — Agregar estilo de fuente a TODAS las opciones de texto en configuración de Tema
- [x] Campos `textPrimaryFont`, `textSecondaryFont`, `navFooterFont`, `buttonFont` en ThemeConfig
- [x] Selectores compactos en dashboard + Vista Previa con fuentes aplicadas
- [x] Variables CSS inyectadas en landing-wrapper y usadas en nav, footer, back-to-top

#### P7.7 — Card Invitación: detalles de tema
- [x] Ornamentos ✦: `--theme-text-primary`
- [x] Chips nombres: `--theme-card-bg/border/text-primary`
- [x] Contador asistentes: `--theme-nav-text`

#### P7.8 — Cards Lugares: icono de horarios
- [x] Icono schedule: `--theme-text-primary`

#### P7.9 — Itinerario: colores de tema
- [x] Línea vertical, dots, fondo iconos, horarios: todos con variables de tema

#### P7.10 — Galería: controles de navegación
- [x] Flechas y dots del carrusel: `--theme-card-bg/border/text-primary`

#### P7.11 — Card Código de Vestimenta
- [x] Icono default: `--theme-text-primary`
- [ ] Agregar en configuración: opción de seleccionar icono personalizado
- [ ] Agregar mini cards con ejemplos de imágenes de vestimenta (pendiente: esperar imágenes de referencia)

#### P7.12 — Card Regalos
- [x] Mesa de Regalos: icono respeta tema
- [x] Transferencia Bancaria: icono, título, desc, labels, values, botones copiado respetan tema
- [x] Número cuenta/tarjeta unificado con mismo estilo que titular
- [ ] Agregar config para seleccionar/subir icono personalizado en Mesa de Regalos y Transferencia

#### Ajustes adicionales
- [x] RSVP card: textos, badges, chips, botones selección, inputs, placeholders respetan tema
- [x] RSVP inputs: placeholder usa `--theme-text-secondary`, focus usa `--theme-text-primary` con glow sutil
- [x] Countdown: padding y min-width aumentados para evitar cuadros estrechos
- [x] Dashboard Tema: Vista Previa muestra fuentes dinámicas, eliminados "Texto ejemplo" inline
- [x] Transferencia: número cuenta/tarjeta unificado con `--theme-text-primary` (mismo estilo que titular)
- [x] Itinerario BD: columnas `icon_type` e `icon_url` agregadas a tabla + backend guarda/lee correctamente
- [x] Itinerario UI: radio buttons reemplazados por botones toggle estilizados (Emoji/Imagen) + dropdown de emojis con trigger
- [x] Itinerario imagen: recomendación "PNG o SVG, 128x128px" al seleccionar tipo imagen
- [x] Tabs arrows: `user-select: none` para evitar selección de texto al hacer click

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
