# DEVELOPMENT LOG — Vitely

> **Documentacion distribuida en `docs/`**
> - `docs/CONTEXT.md` — Contexto general del proyecto
> - `docs/ARCHITECTURE.md` — Stack, estructura, BD, roles
> - `docs/DEPLOY.md` — Instrucciones de despliegue
> - `docs/MIGRATIONS.md` — Scripts SQL para produccion
> - `docs/PENDING.md` — Pendientes y mejoras
> - `docs/BUILDER-FREE-ELEMENTS.md` — Plan de elementos libres (futuro)
> - `docs/BUILDER-PROPS-REDESIGN.md` — Diseno del panel de propiedades

---

## Estado actual del proyecto: 2026-10-17

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: ajustes finales del props-panel de Detalles mini-secciones (validado)

Pulido de la UX y fixes de render de la sección Detalles (mini-secciones por card). Validado por el
usuario. Detalle completo en `docs/TAREA-DETALLES-MINISECCIONES.md`.

- **Controles de texto junto a su campo:** estilo del Encabezado en el acordeón "Encabezado de la
  sección" (UNIFICADO para todas las cards: 1ª edita `details.title`, las demás `card.heading` opcional);
  estilo del Título junto al campo título.
- **Contenido solo por el editor enriquecido:** se quitaron los controles de texto y el de alineación
  duplicados del panel (ya están en la barra del editor).
- **FIX gradiente bicolor del título:** `useTitleGradient(card)`/`getTitleGradient(card)` resuelven el
  degradado desde `card.sectionStyle` con fallback al tema global (antes se desactivaba al tener color
  propio y leía solo el global).
- **FIX canvas no reflejaba el editor:** `[innerHTML]` crudo → Angular borraba los `style` inline del
  editor. Ahora `safeContent()` con `bypassSecurityTrustHtml` (patrón hero/envelope); el tema global
  queda como base heredable vía variables `--dc-*`.

FEATURE DETALLES MINI-SECCIONES COMPLETO y validado. Falta: GUARDAR en el builder para persistir la
migración Opción 2 de las cards de Valeria. Build OK, frontend reconstruido.

---

## Estado actual del proyecto: 2026-10-16 (d)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: Detalles como MINI-SECCIONES por card (Entregas A y B; falta el drag = Entrega C)

Rediseño de la sección Detalles: de 1 sección con N cards apiladas → N mini-secciones (una por card),
cada una con lienzo/estilo propio y gestionables desde el menú de secciones. OPCIÓN A: se mantiene
`config.details.cards[]` como almacén (retrocompatible). Documentación completa + plan por fases en
`docs/TAREA-DETALLES-MINISECCIONES.md`. SIN commit (pendiente de validación del usuario).

- **Modelo (models.ts):** `CardStyle` nueva + `DetailCard` con `label/heading/sectionStyle/cardStyle/
  positions` (opcionales).
- **Entrega A (landing, hecha):** `details.component.ts` reescrito; cada card = `<section .details-mini>`
  con alto flexible, encabezado por card, estilos resueltos por card (fallback a sección/global), fondo
  propio por card (`auto 100%`). `@Input() onlyIndex` para el canvas.
- **Entrega B (builder, hecha):** menú con "Detalles" agrupador + sub-entradas "Detalle N" (renombrables,
  reordenables dentro del grupo, con "+ Agregar Detalle" y eliminar con confirmación). Canvas pinta cada
  card como bloque seleccionable (`onlyIndex`). Props-panel edita la card activa: contenido + Apariencia
  de Card PROPIA + Estilo de Sección PROPIO (helpers redirigidos vía `styleHolder`). Signal
  `selectedDetailIndex` en canvasState. Add/remove viejo eliminado del acordeón.
- **Backend:** sin cambios (ensureConfigDefaults ya pasa `cards` completo).
- **Fix post-B:** quitado el fallback de estilos a nivel sección en `details.component` (causaba que el
  fondo apareciera en todas las cards con el toggle apagado). Migración Opción 2 en `migration.service`
  (`migrateDetailsToMiniSections`, idempotente): copia una vez el estilo de sección + card globales a
  cada card para no perder lo de Valeria. Botón eliminar del menú más visible. El usuario debe GUARDAR
  para persistir la migración.
- **Fix 2:** título con recuadro de color (gradiente aplicado sin la clase que lo recorta al texto) →
  gateado por `useTitleGradient`. Fondo pequeño/cortado → `miniBg` usa `resolveMedia` (cover/banner/
  overlay/override desktop) y `.details-mini.has-image-bg` toma alto de pantalla.
- **Fix 3:** alto de mini-sección = pantalla para TODAS (`min-height: var(--canvas-vh,100svh)`, crece
  con el contenido); quitado el slider de opacidad duplicado (el color-picker ya trae alfa).
- **Entrega C (drag):** encabezado y card arrastrables/redimensionables como objetos únicos por card
  (`card.positions`), lienzo acotado a 600/360 por dispositivo. Canvas pasa editable + persiste con
  `onDetailPositionsChange`.
- **Mejora props-panel:** controles de texto (Encabezado/Título/Contenido) movidos al acordeón
  "Contenido" de cada Detalle; "Texto de Sección" oculto en Detalles. Heredan del Tema Global.

FEATURE DETALLES MINI-SECCIONES COMPLETO (1-7 + fixes + mejora). Falta validación del usuario +
Guardar para persistir la migración. Build OK, frontend reconstruido.

---

## Estado actual del proyecto: 2026-10-16 (c)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: indicador de scroll configurable (carátula) + fix tamaño de canvas al primer render

- **Indicador de scroll (flechas de la carátula) configurable:** nuevo `HeroConfig.scrollIndicator`
  (show/type/color/size/animation) + acordeón "Indicador de scroll" en Carátula. Fix de centrado
  (`left:0;right:0`+flex en vez de left:50%+translateX) y de color (ahora configurable, antes se perdía
  en fondos claros). 6 tipos de icono, 5 animaciones. Retrocompatible.
- **Fix canvas no tomaba el dispositivo al 1er render:** `activeDevice` pasó a `computed` signal y se
  reafirma el dispositivo + re-mide alto en rAF tras cargar la config. Antes el marco solo tomaba el
  tamaño al cambiar de dispositivo manualmente.

Build OK, frontend reconstruido. Pendiente: publicar a prod (push a deploy_prod) cuando se valide.

---

## Estado actual del proyecto: 2026-10-16

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: sistema de migraciones AUTOMÁTICAS (homologación BD en cada deploy)

Implementado el mecanismo híbrido para homologar la BD automáticamente en cada arranque del backend,
idempotente y sin tocar datos. Resuelve la deuda técnica dev↔prod.

- **`backend/src/migrations/runner.js`** (nuevo): tabla `schema_migrations` + ejecuta los `.sql` de
  `migrations/sql/` pendientes (orden por nombre), los registra, se detiene si falla.
- **`backend/src/index.js`**: `initDB()` → `runMigrations()` → `fixUrls()`.
- **`migrations/sql/001_homologacion_esquema_prod.sql`**: crea 5 tablas que faltaban en `initDB()`
  (`plans`, `purchases`, `transactions`, `postponements`, `email_verifications`) + columnas de
  `users`/`events`/`photos`. Idempotente (CREATE IF NOT EXISTS + PREPARE/EXECUTE condicionado a
  information_schema).
- Verificado: aplicó las 73 sentencias sobre dev sin error, registró 001, al reiniciar no reejecuta.
- `docs/MIGRATIONS.md` actualizado con la guía del nuevo sistema.
- Pendiente aparte: migrar DATOS de Valeria (evento 17 + config + imágenes) al server.

---

## Estado actual del proyecto: 2026-10-15 (d)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: integrados los cambios de despliegue de `deploy_prod` (fast-forward)

Se mezcló `origin/deploy_prod` en la rama feature (fast-forward limpio) para no planchar la config
de deploy del server al subir el feature. `deploy_prod` partía de mi commit `4300902` + 3 commits
solo de infra. Traídos:
- `56b7537` orden FK en `database.js` (crea `events` antes de `user_events`).
- `94dc0bc` `docker-compose.yml` frontend `8080:80` (evita choque con nginx del host).
- `11245e7` nuevo `.github/workflows/deploy.yml` (auto-deploy por SSH, dispara solo en push a
  `deploy_prod`).

HEAD local = `11245e7`. La rama feature local va 1 commit por delante de su remoto hasta pushear.
`origin/deploy_prod` tuvo force-push reciente (de ahí los commits "reponer tras force-push").

---

## Estado actual del proyecto: 2026-10-15 (c)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: revertir navbar + fondo de sección a `auto 100%` + REGLAS DE DISEÑO PERMANENTES en steering

- **Navbar REVERTIDO:** se quitó el acotamiento del `.nav-inner` a la columna del lienzo (fue un
  error de la tanda anterior). Vuelve a ocupar el ancho de la ventana.
- **Fondo de SECCIÓN (imagen) unificado a `auto 100%` centrado en los 4 contextos** (canvas
  mobile/desktop + landing mobile/desktop): alto = ventana, ancho proporcional, sin deformar.
  Antes landing/canvas mobile usaban `cover` (deformaba). `builder.component.ts getSectionBgStyle`
  (rama banner mobile) y `landing.component.ts .section-block[style*="--sec-bg-image"]` (base mobile).
- **Se añadió al steering una sección de REGLAS DE DISEÑO PERMANENTES (R1–R4)** para no volver a
  perder estas reglas con futuros cambios: R1 lienzo fijo vs capas responsivas, R2 navbar ancho
  completo, R3 fondo de sección `auto 100%`, R4 variables de ancho única fuente de verdad.
- **PENDIENTE:** validación al configurar imagen de fondo que advierta si es horizontal (no óptima
  en mobile), sin bloquear. Video de fondo sigue con `cover` (pendiente menor).

Build OK, contenedor reconstruido (`--no-cache`), arriba.

---

## Estado actual del proyecto: 2026-10-15 (b)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: fix Preview iframe no respetaba el dispositivo seleccionado

Reporte del usuario: (1) el modo Preview (iframe) no respetaba el dispositivo elegido; (2) duda de
si el canvas desktop quedó atado al dispositivo mobile.

- **FIX (1):** `.builder-preview-frame.mobile` tenía `flex:1; width:100%` + override `width:var(--canvas-mobile-w)`
  que pisaba el `[style.width/height.px]` inline del dispositivo. Cambiado a
  `flex:0 0 auto; width:auto; margin:0 auto` + nueva clase condicional `.builder-preview-area.center-frame`
  (`justify-content:center; overflow:auto`), espejo del `.center-frame` del canvas. Ahora el iframe
  toma el ancho×alto exacto del dispositivo, centrado y con scroll si no cabe.
- **ACLARACIÓN (2):** el canvas/preview DESKTOP ya es independiente del `canvasDevice` (ternario
  `previewDevice()==='mobile' ? canvasDeviceWidth() : null`). Marco desktop 900px, lienzo 600px
  centrado → franjas laterales que replican FIELMENTE la landing real desktop (fondo 100vw + columna
  600px). No es bug. El selector solo existe en mobile (`@if previewDevice()==='mobile'`); si se vio
  en desktop era bundle viejo (Ctrl+F5).

Build OK, contenedor reconstruido (`--no-cache`), bundle verificado.

---

## Estado del proyecto: 2026-10-15

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: ancho de lienzo FIJO por dispositivo en las 4 secciones de apertura (paridad en los 5 contextos) + navbar acotado

Se atacó el problema reportado: al cambiar el dispositivo del selector del canvas mobile se movían
y reescalaban los objetos drag-and-drop, y lo configurado en el canvas no coincidía con la landing
real. CAUSA RAÍZ (confirmada por context-gatherer): posición (x,y centro) y tamaño (w,h) de cada
objeto están en **% del contenedor `data-drag-bounds`**; el font-size va en px fijos aparte. Tamaño
físico = (% guardado) × (ancho real del contenedor). Si el ancho del contenedor cambia (selector de
dispositivos agranda el marco, o distinto ancho entre canvas/preview/landing), el objeto se reescala
aunque el % sea idéntico. Invitación ya estaba pineada (360/680); el resto NO.

**Solución: ancho de referencia del lienzo FIJO por dispositivo en los 5 contextos** (canvas mobile,
canvas desktop, preview mobile iframe, preview desktop iframe, landing real):

- **Nueva variable CSS global `--canvas-desktop-w: 600px`** en `styles.scss :root` (hermana de
  `--canvas-mobile-w: 360px`; fuente de verdad ÚNICA, la heredan canvas, iframes de preview y
  landing). Desktop bajó de 680 → **600px** (petición del usuario).
- **Columna de la landing (`landing.component.ts .section-block`)**: el `@media(min-width:768px)`
  pasó de `50vw - 340px` a `50vw - (var(--canvas-desktop-w)/2)` → 600px en cualquier viewport ≥768px.
- **Pines de ancho FIJO centrado por dispositivo (desktop + mobile) en las 4 secciones**:
  - Invitación: `.inv-fg.canvas-desktop/.canvas-mobile` (680→var). Ya tenía ambos.
  - Intro: `.intro-fg.intro-fg-desktop` (680→var) + NUEVO `.intro-fg.intro-fg-mobile` (getter
    `introMobileFixed`). Antes solo tenía desktop.
  - Plano (envelope): `.plain-container.plain-desktop` (680→var) + NUEVO `.plain-container.plain-mobile`
    (getter `plainMobileFixed`). Antes solo desktop.
  - Carátula (hero): el `.hero-fg` (data-drag-bounds, antes `inset:0` = sin acotar) ahora toma
    NUEVAS clases `.hero-fg-desktop`/`.hero-fg-mobile` (getters `heroDesktopFixed`/`heroMobileFixed`)
    que lo acotan a `var(--canvas-desktop-w)` / `var(--canvas-mobile-w)` centrado. Era la única sección
    sin ningún pin → por eso se reescalaba con el selector. Era el pendiente abierto.
- **Pines `::ng-deep` del canvas (`builder.component.ts`)**: 680→`var(--canvas-desktop-w)` y añadidos
  los pines MOBILE que faltaban para plano/intro/hero (antes solo invitación tenía mobile). Son la
  excepción al `::ng-deep * { max-width:100% }` universal del canvas.
- **Navbar acotado**: `.nav-inner` dejó de ocupar el 100% del ancho; ahora `margin:auto` +
  `max-width` por dispositivo (`.landing-nav.nav-desktop/.nav-mobile .nav-inner` →
  `var(--canvas-desktop-w)`/`var(--canvas-mobile-w)`). El `<nav>` recibe las clases nav-desktop/
  nav-mobile vía `heroDesktopFixed`/`heroMobileFixed`. Resuelve que el menú se expandiera al ancho
  de la ventana en el canvas. (Usa clases y no media query porque en el canvas mobile la ventana del
  navegador es ancha pero el viewport del canvas es angosto.)

**Build/deploy:** `npm run build` OK (solo warnings NG8107 preexistentes). `docker-compose build
--no-cache frontend` + `docker rm -f invitaciones-frontend` + `docker compose up -d --no-deps
frontend`. Bundle verificado: contiene `canvas-desktop-w`, `hero-fg-mobile`, `nav-mobile`. Ctrl+F5
obligatorio (cambió el hash JS).

**⚠️ PENDIENTE (reajuste de datos, no de código):** las posiciones ya guardadas de Valeria quedaron
contra 680px (desktop) y 375px (mobile histórico); al pasar a 600/360 habrá que reajustarlas UNA vez
por sección. Verificación visual del usuario pendiente (cambiar de dispositivo no debe mover objetos;
canvas desktop = landing desktop; navbar acotado).

---

## Estado del proyecto: 2026-10-13 (noche 5)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: Selector de dispositivos en el canvas mobile (feature) + ancho de referencia 360px

Implementado el feature acordado del selector de dispositivos. Dos entregas:

**Entrega 1 — ancho de referencia mobile 375 → 360px (reutilizable):**
- Nueva variable CSS GLOBAL `--canvas-mobile-w: 360px` en `styles.scss :root` (fuente de verdad
  única; vive en :root → la heredan canvas, iframe de preview y landing real).
- Invitación (`.inv-fg.canvas-mobile`), la excepción del canvas y el marco mobile del builder
  (`.builder-canvas-viewport.mobile`, `.builder-preview-frame.mobile`, media query) usan
  `var(--canvas-mobile-w, 360px)` en vez de 375px. 360 = mínimo seguro del mercado (Android gama
  baja = 360 CSS px), para que lo configurado quepa en cualquier teléfono.

**Entrega 2 — selector de dispositivos (canvas mobile):**
- Catálogo `canvasDevices` (builder.component): 360×800 Android baja/media, 375×667 iPhone SE,
  384×854 Android media-alta, 390×844 iPhone 14-16, 412×915 Android alta, 414×896 iPhone XR/11,
  440×956 iPhone 16 Pro Max. Signal `canvasDevice` (default android-360) + helpers
  `canvasDeviceWidth/Height`, `canvasDeviceOptions`, `setCanvasDevice`.
- El MARCO del canvas mobile y el iframe de preview toman ancho×ALTO CSS del dispositivo elegido
  (`[style.width.px]`/`[style.height.px]`). El fondo y las secciones ocupan todo el marco
  (responsivo). El LIENZO de drag se mantiene a `--canvas-mobile-w` (360px) CENTRADO → los objetos
  NO se salen del área segura aunque el marco sea más ancho (Filosofía A acordada con el usuario).
- Alto fijo del marco = alto del dispositivo (con `max-height:100%` → scroll interno si no cabe),
  así se ve el "corte" de la pantalla del dispositivo. El área se centra con `.center-frame`
  (align-items:center + overflow:auto) solo en mobile; desktop sigue flex-start (scrollea).
- UBICACIÓN responsive del selector: escritorio → toolbar del canvas (`.builder-device-select`,
  junto a los botones mobile/desktop); móvil (angosto, `!isWide()`) → dropdown en el panel de
  Secciones ARRIBA de "Tema Global" (`.builder-device-select-panel`). La versión toolbar se oculta
  en el media query móvil. Reutiliza `app-custom-select`. Todo verificado por el usuario.

**PENDIENTE:** reajustar una vez las posiciones mobile ya guardadas (Valeria) al nuevo ancho 360px.
Replicar la paridad (desktop 680 / mobile 360) a la CARÁTULA (hero), que aún no la tiene.

---

## Estado del proyecto: 2026-10-13 (noche 4)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: Pantalla de Inicio + Intro (paridad + fondo banner + transición) + fixes drag-box + paridad mobile Invitación

Tanda grande, continuación del Problema 2 (fidelidad canvas↔preview↔landing) aplicado a más
secciones, más mejoras del drag-box. TODO en esta entrada se commitea junto.

**1. Pantalla de Inicio (template Plano) — paridad del lienzo de texto (680px desktop):**
- El `.plain-container` (data-drag-bounds) se acota a 680px CENTRADO en desktop (getter
  `plainDesktopFixed = !isMobilePos`, clase `plain-desktop`), INCLUSO en modo banner (el banner
  define el ancho de la IMAGEN de fondo vía --banner-w, pero el lienzo de TEXTO va a 680px fijo;
  antes en banner usaba --banner-w que era '%' en canvas pero 'vw' en landing → divergía).
  Excepción al `*{max-width:100%}` del canvas para no recortarlo. Verificado por el usuario.

**2. Intro — Parte A (paridad del lienzo de texto):** nuevo `.intro-fg` (data-drag-bounds)
  envuelve la frase; en desktop se acota a 680px centrado (`intro-fg-desktop`). Excepción al
  max-width del canvas. El overlay de la intro es fixed, por eso en landing el lienzo medía el
  ancho de la ventana.

**3. Intro — Parte B (fondo homologado con MediaBackground):** nuevo `IntroConfig.media?`
  (MediaBackground). La intro usa `resolveMedia` → cover (mobile/default) o BANNER (desktop,
  columna centrada) + overlay configurable, igual que las secciones. El builder usa
  `<app-background-control>` (helpers `introMediaModel`/`setIntroMediaModel`, que sincronizan el
  legacy `background` para el trimmer de video). Backend sin cambios (spread de intro preserva
  media). Fixes: banner descentrado (el keyframe introBgZoom pisaba el translateX(-50%) de
  centrado → `animation:none` en `.bg-banner`); overlay oscuro FIJO eliminado (ahora solo pinta
  si overlay>0).

**4. Intro — transición de SALIDA + relevo a la Carátula (sin parpadeo ni hueco):**
- CAUSA del parpadeo de salida: la animación de ENTRADA `introFadeIn` con fill-mode `both`
  retenía la opacity y le ganaba a la `transition` de salida → la intro desaparecía de golpe.
  FIX: la salida ahora usa ANIMACIONES dedicadas (`@keyframes introOutFade/SlideUp/.../Blur`),
  no transition (igual que el canvas con builderFade). Una animation de salida sí sustituye a la
  de entrada sin conflicto.
- CAUSA del hueco (fondo vacío 1-2s entre intro y carátula): la carátula no se montaba hasta que
  la intro se desmontaba (`showIntro=false`). FIX (crossfade): la intro emite `fadingStart` al
  INICIAR el fade-out → la landing monta la carátula DETRÁS ya mismo (`heroEntering`), con la
  intro (z-index 9999) tapándola; al terminar el fade la carátula ya está lista. El fade-out
  arranca 300ms ANTES del fin de la duración (`dur-300`) para solapar.
- Carátula entra suave: `.landing-wrapper.hero-entering` (fade 1.2s) + `.hero-bg-media` con
  `heroBgFadeIn` (1s). Verificado por el usuario (quedó perfecto).

**5. DragBox — 2 fixes de usabilidad:**
- Snap: umbral separado por eje (SNAP_X_THRESHOLD=3, SNAP_Y_THRESHOLD=1.2) y guías Y reducidas a
  SOLO el centro (50) — antes 5 guías Y hacían "brincar" el objeto en mobile. X sin cambios.
- Resize ya no recentra: `lastX/lastY` se SIEMBRAN en `initResize` con el centro real actual del
  objeto. Antes quedaban en el default 50 para el eje no tocado → el objeto saltaba al centro al
  soltar (y a veces quedaba detrás de otro objeto, inseleccionable).

**6. Invitación — paridad en MOBILE (faltaba):** el fix previo era solo desktop (680px). En
  modo posicionado `.landing-section.positioned` quita el padding lateral → el `.inv-fg` cubría
  TODO el ancho del dispositivo (variable 360-440px) mientras el canvas mobile es 375px fijo →
  el texto hacía otro wrapping. FIX: clase `canvas-mobile` (getter `fgMobile`) acota el lienzo a
  375px centrado en canvas/preview/landing móvil. (⚠️ Ver decisión 360px abajo — PENDIENTE de
  cambiar 375→360 y de crear el selector de dispositivos.)

**Build/deploy:** cada cambio con `npm run build` + `docker-compose build --no-cache frontend` +
`rm -f` + `up -d --no-deps`. Backend reconstruido para el fix del import. OJO recurrente: un
backtick dentro de un comentario en los `styles[]` de un componente ROMPE el build (el template
usa backticks). Pasó varias veces esta sesión.

**Importación de invitados (fix):** el import de `routes/guests.js` saltaba filas sin
`guest_names` (`if (!guestNames) continue`) → descartaba las familias de la Opción B (sin
nombres). FIX: salta solo si no hay NI family_name NI guest_names; detecta `family` por
family_name si no viene guest_type; dedup por `family_name` o `guest_names` (reimportar NO
duplica). Backend reconstruido.

**PENDIENTE acordado (feature próximo) — Selector de dispositivos en el canvas mobile:**
- Cambiar el ancho de referencia del lienzo mobile de 375 → **360px** (mínimo seguro del mercado;
  gama baja Android = 360 CSS px; 375 no cabe en 360). Aplica a Invitación y, al replicar, a las
  demás secciones (hacerlo REUTILIZABLE).
- Selector tipo DevTools (solo modo mobile): el MARCO del canvas adopta ancho×ALTO del dispositivo
  elegido (proporción real), pero el LIENZO de drag se mantiene limitado a 360px centrado (área
  segura). Catálogo: 360×800 (Android baja/media), 375×667 (iPhone SE), 384×854 (Android media-alta),
  390×844 (iPhone 14-16), 412×915 (Android alta S24/Pixel9), 414×896 (iPhone XR/11), 440×956
  (iPhone 16 Pro Max). Responsabilidad del cliente: asegurar su diseño por gama (si configura en
  alta/media y descuadra en baja, lo acepta).
- UBICACIÓN responsive del selector: escritorio → toolbar del canvas; MÓVIL (configurando desde
  un celular, sin espacio en toolbar) → dropdown dentro del panel de Secciones, ARRIBA de
  "Tema Global". Un solo control reposicionado por `isWide()`.
- Detalle del ALTO: hoy el canvas usa `--canvas-vh` (área disponible). Con el selector, el marco
  debe tomar el alto proporcional del dispositivo para no verse desproporcionado.

---

## Estado del proyecto: 2026-10-13 (noche 3)

### Rama activa: `feature/drag-elementos-secciones`

### Sesión: Importación lista Valeria (Opción B) + familias sin nombres en landing + feature Mesa/Recuerdo documentado

**Petición:** convertir la lista del cliente Valeria (hombres/mujeres/menores/total/mesa/recuerdos)
al formato de importación de invitados de la plataforma.

**Formato de importación (backend `routes/guests.js` → `/import/:eventId`):** columnas reconocidas
`guest_type` (family|individual), `family_name`, `guest_names` (o `nombre`), `max_companions` (o
`acompanantes`), `phone` (o `telefono`/`celular`), `notes` (o `notas`). El conteo de asistentes en
la landing: family = contar nombres en `guest_names`; individual = `max_companions + 1`.

**Generado (Opción B elegida por el usuario):** `C:\Portafolio\Datos Invitacion Clientes\Valeria\
Import Lista Invitados Valeria.xlsx`, 56 filas (22 familias + 34 individuales, 104 asistentes).
Reglas: nombre con "famil*" (cubre "Familia", "y familia", "famila") → `guest_type=family`,
`family_name`=nombre, `guest_names` VACÍO, `max_companions`=Total; si no → `individual`,
`guest_names`=nombre, `max_companions`=Total−1. Mesa/Recuerdos → `notes` ("Mesa: X | Recuerdos: Y").
El script generador fue puntual y se eliminó tras usarlo.

**Cambio en landing (`invitation.component.ts`) — familias SIN lista de nombres:** antes, una
familia con `guest_names` vacío mostraba un chip vacío y "1 asistente" (`"".split(',')`=['']→len 1).
Ahora:
- `guestNames()` filtra vacíos (trim + length>0).
- nuevo `hasGuestNames()`; el template solo pinta los chips si `guest_type=family && hasGuestNames()`.
- `guestCount()`: para family sin nombres usa `max_companions` como total (ahí se guarda el total);
  con nombres sigue contando nombres; individual = `max_companions+1`.
Resultado: familia sin nombres muestra solo "Familia X" + "N asistentes" (sin chips). Build OK.

**Feature DOCUMENTADO (NO implementado) — campos "Mesa/Asiento" y "Recuerdo" por invitado:** el
usuario pidió a futuro campos propios `guests.table_assignment` (TEXTO libre: nº de mesa, nombre de
mesa como "Mesa Familia Gómez Prado", o asiento con letra/numeración) y `guests.souvenir` (opcional,
boolean o texto/cantidad; en conferencias = check de obsequio). Deben salir en la IMPRESIÓN de
tarjetas (variables `{mesa}`/`{recuerdo}`). Plan completo en `docs/PENDING.md` (modelo+initDB,
backend POST/PUT/export/template/import, modal+grid en guests.component, variables en cards.component,
opcional landing). Por ahora el dato vive en `notes`.

**Nota:** el frontend se reconstruyó para reflejar el cambio de landing. El Excel está listo para
importar al evento 17 (Valeria) desde el dashboard (Invitados → importar).

---

## Estado del proyecto: 2026-10-13 (noche 2)

### Rama: `feature/drag-elementos-secciones`

### Sesión: Problema 2 — fidelidad canvas↔preview↔landing del drag (piloto Invitación, desktop)

**Problema:** lo configurado con drag & drop en la sección Invitación NO se veía igual en los 3
contextos. En el CANVAS el encabezado "Están cordialmente invitados" cabía en 2 líneas y la card
tenía su ancho; en PREVIEW y LANDING el texto se cortaba (3 líneas) y la card se veía más chica.

**Causa raíz (confirmada con context-gatherer):** el drag guarda posiciones y ancho `w` en %
relativos al contenedor de la sección (`.inv-fg` = data-drag-bounds), pero ese contenedor mide
distinto ancho físico en cada contexto, y los font-size de los textos son px FIJOS (no escalan):
- Canvas desktop: viewport hasta 900px (`.builder-canvas-viewport.desktop { max-width:900px }`).
- Preview: es un IFRAME que carga la landing real (`/invitacion/:slug?preview=1`) en un marco de
  ~900px (`.builder-preview-frame.desktop { max-width:900px }`).
- Landing real: columna de contenido `clamp(520px, 50vw, 680px)` vía el padding de `.section-block`.
El `50vw` colapsaba al MÍNIMO (520px) en viewports desktop estrechos (iframe de 900px → 25vw=225px
→ min 260px → contenido 520px), mientras que en monitor completo daba 680px. Por eso Preview (520)
≠ landing a pantalla completa (680) ≠ canvas (900). Mismo % ⇒ ancho físico distinto ⇒ wrapping
distinto.

**Fix (piloto Invitación, SOLO desktop; mobile intacto):** homologar el ancho del lienzo a 680px
FIJO en desktop en los 3 contextos.
- `invitation.component.ts`: el `.inv-fg` recibe `[class.canvas-desktop]="previewDevice==='desktop'"`.
  Reglas nuevas: `.inv-fg.canvas-desktop { max-width:680px; margin:0 auto }` y
  `.inv-fg.canvas-desktop.positioned { left:50%; width:680px; max-width:680px; transform:translateX(-50%) }`.
  Esto cubre el CANVAS y el PREVIEW (ambos pasan previewDevice). La LANDING real tiene
  previewDevice=null → NO lleva la clase (conserva su columna responsiva).
- `landing.component.ts`: se ESTABILIZA la columna de `.section-block` en DESKTOP a 680px fijo
  (en vez de depender de 50vw) con `@media (min-width:768px) { .section-block { padding-left/right:
  max(20px, calc(50vw - 340px)) } }` → contenido = 2×340 = 680px en cualquier viewport ≥768px
  (iframe de preview incluido). Esto hace que PREVIEW (iframe 900px) y LANDING (monitor) den ambos
  680px. En MÓVIL (<768px) no aplica: se conserva el padding fluido original.
- Resultado: canvas = preview = landing en desktop. Verificado por el usuario.

**IMPORTANTE — reajuste de posiciones:** las posiciones de la Invitación de Valeria se habían
guardado contra ~900px (ancho viejo del canvas). Tras acotar a 680px es esperable tener que
reajustarlas UNA vez en desktop. No es bug.

**Notas de alcance / próximos pasos:**
- Esto es PILOTO solo de Invitación. Las otras secciones con drag (hero/carátula, intro, envelope/
  plano) siguen SIN el acotado `canvas-desktop`; replicar el patrón cuando se trabajen.
- El `@media` de `.section-block` aplica a TODAS las secciones (no solo Invitación), pero es seguro:
  en monitores normales la columna ya daba 680px; solo cambia los viewports desktop estrechos.
- Build OK (warnings NG8107 preexistentes). Imagen reconstruida `--no-cache` + `rm -f` + `up -d
  --no-deps`. Bundle contiene `canvas-desktop`. Ctrl+F5 para refrescar el hash JS.
- OJO con los backticks en comentarios DENTRO de los styles[] de componentes: el template string
  usa backticks, así que un backtick en un comentario CSS rompe el build (pasó esta sesión).

---

## Estado del proyecto: 2026-10-13 (noche)

### Rama: `feature/drag-elementos-secciones`

### Sesión: Animación de SALIDA configurable del template Plano (Pantalla de Inicio)

**Problema reportado:** al tocar "Toca para iniciar" en la Pantalla de Inicio (template PLANO),
el texto se "deslizaba a la derecha" antes de desaparecer, y esa animación de SALIDA no era
configurable (solo existía la animación de la instrucción al cargar).

**Causa raíz:** la salida estaba hardcodeada en `envelope.component.ts` como
`.opened .plain-container { animation: splashOut ... }` con `splashOut = scale(1.1)`. El
`scale` se aplicaba desde el centro del contenedor, y como los textos del plano están
posicionados con `app-drag-box` (`position:absolute; left:X%`), al escalar se corrían
lateralmente → se percibía como "deslizamiento a la derecha".

**Fix (Opción C — configurable, EXCLUSIVO del template `plain`):**
- `models.ts`: nuevo campo opcional `EnvelopeConfig.plainExitAnimation`
  (`'fade' | 'zoom-out' | 'zoom-in' | 'slide-up' | 'blur' | 'none'`). Default = `fade`.
- `envelope.component.ts`: `.plain-container` ahora lleva
  `[attr.data-exit]="config.plainExitAnimation || 'fade'"` + `transform-origin: center center`.
  Se eliminó el `splashOut` del plano y se añadieron keyframes por `data-exit`
  (`plainExitFade/ZoomOut/ZoomIn/SlideUp/Blur`). `fade` desvanece sin desplazamiento lateral.
  OJO: `splashOut` SIGUE usándose en los templates ticket/minimal-splash (no se tocó ahí).
- `props-panel.component.ts`: nuevo control "Animación de salida" en el acordeón "Opciones Plano"
  (solo visible con template `plain`) + array `plainExitAnimOptions`.
- Backend: SIN cambios. `ensureConfigDefaults` usa `...(cfg.envelope || {})` → el campo nuevo se
  preserva solo en la landing pública.

**Verificación:** `npm run build` OK (solo warnings NG8107 preexistentes del hero). Imagen
reconstruida con `docker-compose build --no-cache frontend` + `docker rm -f` + `docker compose up
-d --no-deps frontend`. Bundle del contenedor contiene `plainExitAnimation` y
`plainExitAnimOptions`. Verificado por el usuario en el builder (control visible, salida sin
deslizamiento lateral). Ctrl+F5 necesario para cargar el bundle nuevo (cambia el hash JS).

**NO SE TOCÓ el fix del banner** (lo que el usuario pidió cuidar): las reglas
`.envelope-bg-image.bg-banner` / `.plain-container.bg-banner` / `--banner-w` /
`background-size: auto 100%` quedaron intactas. El cambio solo añadió un atributo al div y
keyframes de salida al final de los estilos.

**En curso / pruebas (sin cambios de código esta tanda):** el usuario sigue probando la
fidelidad canvas↔preview↔landing del TAMAÑO y POSICIÓN de los objetos (Problema 2): como se ven
en el canvas no coincide del todo con preview/landing. Pendiente de definir estrategia (dar al
canvas la misma columna de contenido ~680px que la landing).

---

## Estado del proyecto: 2026-10-13 (tarde)

### Rama: `feature/drag-elementos-secciones`

### Sesión: Ajustes dashboard + banner de sección + alto mínimo de secciones

- **Dashboard carrusel:** fondo de card con cascada landing-media → hero-media → color+textura
  (home.component.ts, backend /themes, api.service). Textos de card: título+tipo centrados,
  fecha+modo abajo.
- **Banner de sección:** el slider "Ancho del banner" ya NO escala la imagen; pinta una columna
  centrada (::before) de ancho --sec-banner-w con cover. Imagen se adapta al alto de la sección;
  el slider define el ancho de la franja (recorta lados). Fix adicional: banner solo en desktop
  (hero usaba media query que en el canvas evaluaba la ventana; ahora depende de previewDevice).
- **Alto mínimo de secciones = alto de ventana (responsivo):** landing `.section-block`
  min-height:100svh; canvas `.preview-section-click` min-height:var(--canvas-vh); ambos con
  contenido centrado. Excluye hero/envelope/intro. Secciones cortas se estiran; extensibles crecen.
- **angular.json:** budget anyComponentStyle 40/48kb.
- Pendiente: afinar alto de secciones extensibles una por una; mejorar precisión del scroll del canvas.

---

## Estado del proyecto: 2026-10-13 (mañana)

### Rama: `feature/drag-elementos-secciones` (nace de int-008)

### Sesión: Drag & drop selectivo por sección — piloto Invitación TERMINADO

Nueva rama desde `int-008` (que ya incluye el merge de fondos-independientes, PR #4). Objetivo:
poder reubicar los elementos de cada sección sobre el fondo (legibilidad), tratando partes como
"objetos" (algunos individuales, otros como conjunto). Se trabaja sección por sección.

**Invitación (validada por el usuario):**
- 5 objetos arrastrables: ornamento superior, título, subtítulo, card (conjunto), ornamento
  inferior. Reutiliza `app-drag-box` + `ElementPositions` (`invitation.positions`), patrón hero.
- Modo posicionado: al mover el primer objeto, todos pasan a absolute (sembrados) para no
  desacomodarse. `.inv-fg` = `data-drag-bounds`; posicionado = `absolute; inset:0` y la sección
  quita padding lateral → lienzo de borde a borde.
- DragBox extendido (inputs opt-in, defaults = comportamiento previo): `maxSize`, `posMargin`,
  `centerContent`.
- Decoradores configurables (Opción A): los `✦✦✦` ahora usan `app-heading-ornament`
  (`sectionStyle.headingOrnament`). Nuevos tipos de símbolo: stars/hearts/diamonds/leaves.
  Tipo `none` oculta. Default invitation = stars.

**Pendiente menor:** resize de ALTO en objetos de texto (los dots inferiores estiran la caja pero
el texto no crece). Se decidirá luego (propuesta: ocultar handles de alto en adornos/títulos).

**Próximo:** replicar en las demás secciones. En varias no hay decorador o no se ve por el tamaño
del texto; ofrecer configurarlo por sección.

---

## Estado del proyecto: 2026-10-12

### Rama: `feature/fondos-independientes`

### Sesión: Temas C/A + fix override de texto por sección (canvas↔landing) + PR a int-008

**Tema C (uploads con preview + control de audio):** `BackgroundControlComponent` muestra
miniatura/ícono + badge de tipo; nuevo `AudioControlComponent` (play/pausa, se detiene al clic
fuera, límite 15MB) integrado en el audio del hero; 3 uploads sueltos homologados con miniatura
(sealImage, splashImage, intro.background). Commit `a7d37a5`.

**Tema A (override de texto por sección, de Invitación hacia abajo):** se inyectaron las variables
de tamaño que faltaban en `getSectionBg`, se ampliaron reglas `::ng-deep` (fuente/tamaño + más
selectores de título), e Invitación recibe `[sectionStyle]`. Commit `a7d37a5`.

**Fix paridad canvas (1er intento):** `getSectionBgStyle` del canvas no inyectaba las variables
`--section-*` de texto ni tenía reglas `::ng-deep`. Se añadieron. Commit `4d88109`. PERO seguía
sin aplicar de forma fiable.

**Fix REAL del override de texto (el que funciona, verificado por el usuario) — piloto Detalles:**
el mecanismo de variables CSS + `::ng-deep` era frágil (dependía de re-render, guards de
atributo y la cascada; un parche intermedio además quedó mal escrito con comillas en vez de
backticks). ENFOQUE NUEVO: el propio componente resuelve el estilo con prioridad
`sectionStyle` > tema global > default en helpers TS, y el binding inline usa ese valor directo.
`details.component.ts` migrado; el canvas ahora pasa `[sectionStyle]` a `app-landing-details`.
⚠️ SOLO Detalles está migrado; las otras 7 secciones siguen con el mecanismo viejo (pendiente
replicar + retirar la capa redundante de variables/`::ng-deep`).

**Nota Docker:** `docker-compose up --build` reutilizó una capa cacheada y dejó el contenedor con
una build vieja (detectado por timestamp de `index.html` vs fuente). Se forzó
`docker-compose build --no-cache frontend` + `up -d`. Verificar siempre la fecha del build.

**Siguiente:** PR de `feature/fondos-independientes` → `int-008`. Desde `int-008` saldrá una rama
nueva para el drag & drop SELECTIVO de elementos por sección (mover textos sobre el fondo para
legibilidad; ver `docs/PENDING.md`).

### Rama activa previa: `feature/canvas-posicionamiento`

### Sesión: Revisión sección por sección de la Invitación Valeria + fixes de fidelidad canvas↔landing

Tanda enfocada en la invitación Valeria (evento id=17), revisando sección por sección contra
las imágenes de ejemplo del usuario. Varios fixes resultaron ser bugs de fondo que afectan a
TODAS las invitaciones, no solo Valeria.

**Pantalla de Inicio (template Plano):**
- Nuevo campo opcional `EnvelopeConfig.instructionColor` + control "Color instruccion" en el
  props-panel. La instrucción del plano usa ese color (con sombra para legibilidad) si está
  definido; si no, comportamiento previo. Retrocompatible.
- Valeria: instrucción "Toca para iniciar", color crema `#f3efe4`, contenido desktop reubicado
  (y:44, w:88) para que calce como en mobile.

**Intro — editor enriquecido + drag + línea de carga:**
- Nuevo `IntroConfig.phraseHtml`: la frase ahora se edita con `app-rich-text-editor` (homologado
  al del plano). Retrocompatible: sin `phraseHtml` cae a `phrase` + `phraseStyle`. Migra el texto
  plano la primera vez. Se quitaron los controles viejos (fuente/tamaño/color/grosor).
- La frase se envuelve en `app-drag-box` (posicionamiento asistido como en el plano), con
  `editable`/`previewDevice`/`(positionsChange)` desde el builder (`onIntroPositionsChange`).
- Nuevo `IntroConfig.progressBar` { enabled, color, style(solid/glow/gradient/dashed), thickness,
  width } + acordeón "Linea de carga" en el props-panel.
- Fix: en modo canvas (`editable`) la intro NO dispara la transición de salida (antes desaparecía
  todo al terminar la animación). Queda estática y editable; la barra se muestra llena.
- Fix: la textura del tema global solo se renderiza en la intro cuando NO hay multimedia de fondo
  (antes se superponía sobre la imagen/gif/video restándole detalle).

**Carátula (hero) en landing/preview — bug de datos perdidos (CRÍTICO, resuelto):**
- `ensureConfigDefaults` (backend) reconstruía el `hero` campo por campo SIN spread raíz, por lo
  que la landing pública DESCARTABA `positions`, `countdownValueColor`, `countdownLabelColor`,
  `showCountdown`. Por eso en el canvas se veía bien (lee config crudo vía /config) pero en
  landing/preview (vía /public con ensureConfigDefaults) se perdían posiciones y colores.
- Fix: `...(cfg.hero || {})` al inicio del hero. Y por consistencia se añadió el mismo spread a
  TODAS las secciones de contenido (invitation, details, venues, itinerary, gallery, dresscode,
  gifts, rsvp) para no perder nunca campos nuevos (p. ej. invitation.guestChipBg/countBg que
  también se perdían). Mismo patrón que ya tenían envelope/intro/sharing/theme.

**Velo oscuro del fondo global — eliminado:**
- `.landing-bg-overlay` tenía `rgba(0,0,0,0.55)` fijo que oscurecía TODA la landing (pensado para
  fondos oscuros; con imágenes claras tipo Ghibli oscurecía de más). Ahora es transparente.

**Countdown — tamaño estable canvas↔landing:**
- `.countdown-value/label/sep` usaban `clamp(...vw...)` dependiente del ancho del viewport (grande
  en canvas, chico en mobile real). Cambiado a px fijos (32/10/26) para que se vea igual en todos
  lados.
- Reforzada la medición de `--canvas-vh`: ignora alturas 0 (canvas oculto en modo preview) y se
  re-mide al volver a modo canvas (antes el hero/intro perdían el alto al alternar preview↔canvas).

**Fondo de sección en modo banner (foco mobile):**
- Mobile (prioridad): la imagen CUBRE ancho y alto (cover) y la sección toma `min-height:100svh`,
  para que abarque el alto de pantalla y NO quede hueco con el fondo de la landing entre secciones.
  (Antes `cover` recortaba lateralmente / A1 dejaba huecos.)
- Desktop: columna centrada `--sec-banner-w` (se afina en otra sesión).
- El canvas (`getSectionBgStyle`) replica banner por `previewDevice` y aplica el oscurecido por
  sección (`bgOverlay`) como capa de gradiente, para verse igual que la landing.

**sanitize.js (backend):** permite `font-family`, `line-height` y tags `<div style>` para que el
editor enriquecido conserve fuente/interlineado; `phraseHtml` añadido a campos sanitizados.

**Pendientes de verificación visual del usuario (en navegador / Galaxy A55):**
- Flechas del scroll-indicator de la carátula: el usuario las vio ligeramente descentradas; no se
  halló causa clara en CSS (`left:50%` debería centrar). Reconfirmar tras estos cambios.
- Cards de Detalles: el toggle "Fondo" per-card solo controla visibilidad; NO hay color/opacidad
  por card (el color viene del acordeón global "Apariencia de Cards"). Si se quiere control de
  fondo por card, es una mejora pendiente por decidir.
- Banner en DESKTOP: pendiente de afinar (anchos laterales uniformes por sección).

---

## Estado anterior: 2026-10-07

### Rama: `feature/canvas-posicionamiento`

### Feature: Posicionamiento asistido de elementos (spec `canvas-posicionamiento`)
Editor tipo Word/PowerPoint para mover (y redimensionar) los elementos de texto de las
secciones de apertura directamente en el canvas del builder, con posiciones independientes
mobile/desktop. Spec en `.kiro/specs/canvas-posicionamiento/`.

**Implementado y funcional:**
- Modelo `ElementPosition` / `ElementPositions` + campos opcionales en los configs:
  `EnvelopeConfig.plainPositions`, `IntroConfig.positions`, `HeroConfig.positions`. Aditivo y
  retrocompatible (configs viejos sin cambios).
- Helper de render `posStyle(key, positions, isMobile)` en `core/utils/element-position.util.ts`:
  devuelve `{}` (layout flex por defecto) o un objeto `position:absolute` centrado en (x,y)%.
- Componente de arrastre `app-drag-box` (`core/components/drag-box.component.ts`) +
  `drag-box-selection.service.ts`. Mueve y redimensiona (ancho/alto en %), snap a guías,
  confinamiento, mouse + touch. Reemplazó al enfoque inicial de directiva `appAssistedDrag`
  (que queda como variante previa en `core/directives/assisted-drag.directive.ts`).
- Integrado en **Plano (envelope)**, **Intro** y **Carátula (hero)** con `editable`,
  `previewDevice`, `(positionsChange)`. El contenedor de cada sección usa `data-drag-bounds`.
- Builder pasa `editable=true` + `previewDevice` en modo canvas (`editable=false` en preview)
  y persiste con `onEnvelopePositionsChange` / `onHeroPositionsChange` / handler de intro.
- Landing real elige mapa mobile/desktop por ancho (breakpoint 768px) con fallback al otro
  dispositivo.
- Reset de tamaño al recargar resuelto: el ancho/alto arrastrado persiste tras refrescar.

**Pendiente (próxima sesión):**
- Botón "Restablecer posiciones" en el props-panel (Plano, Intro, Carátula) con confirmación
  vía `DialogService` que borre las posiciones de la sección y vuelva al layout por defecto
  (tareas 18-19 del spec).

### Feature: Configurabilidad de la sección Invitación
Tres mejoras sobre el config de la sección Invitación:
1. **Estilo de Sección reducido**: al activar "Estilo de Sección" en Invitación solo aparecen
   Fondo de Sección, Transición Superior y Animación. Ocultos (solo en Invitación): Texto de
   Sección, Presets Rápidos y Adorno de Título. Las demás secciones los conservan.
2. **Colores propios de invitados y asistentes**: nuevo acordeón "Invitados y Asistentes" con
   colores independientes del Tema Global — chips de invitados (fondo, texto, borde) y contador
   de asistentes (fondo, texto, borde). Si no se definen, caen por defecto a los colores del
   tema; al definirlos mandan sobre la sección sin afectar botones globales.
3. **Imagen de fondo con banner / pantalla completa**: homologado con Multimedia de Carátula.
   Al elegir "Imagen" en Fondo de Sección aparece "Ajuste en escritorio" (Pantalla completa /
   Banner centrado) + slider de ancho en modo banner. Desktop ya no deforma la imagen; móvil
   siempre cover.
   - Nota: en el canvas del builder la imagen de fondo de sección se ve en modo cover siempre;
     el modo banner se aplica en Preview y landing real. (Replicar banner en el CSS del canvas
     queda como posible mejora.)

> Recordatorio: el autoguardado del builder está deshabilitado. Hay que pulsar "Guardar"
> para persistir a Preview/landing.

---

## Estado anterior: 2025-07-07

### Rama: `feature/dashboard-redesign`

### Lo que esta funcionando:
- **Page Builder Visual** completo con canvas + preview iframe
- **Panel de propiedades** con acordeones para todas las secciones
- **Toggle Canvas/Preview** — Canvas para editar, Preview con landing real en iframe
- **Intro con loop**, transiciones de salida (7 tipos), particulas reactivas, stepper duracion
- **AG Grid** en Eventos, Usuarios, Invitados y Registrados
- **Dropdown menus** para acciones en grids (overlay posicionado)
- **Itinerario rediseñado** — iconos centrados en la linea (sin fondo negro), time picker, emoji grid
- **Dashboard layout** — height 100vh, sidebar fixed, main-content scrollable
- **Light mode** completo (dashboard, cards mobile, grids, builder)
- **Responsive toolbar** del builder (wrap a 850px)
- **Mobile cards** con boton "Acciones" centrado (shimmer on-click) y menu desplegable
- **Busqueda dinamica** en todos los modulos (filtra grid en desktop + cards en mobile)
- **Boton "Volver"** fijo en la parte inferior en mobile para scroll-to-top
- **Scrollbar oculta en mobile** (estilo app nativa)
- **Header fijo en mobile** — solo las cards se scrolean

---

## PROXIMA SESION — Plan de trabajo

### 1. AG Grid (Prioridad Alta) ✅ COMPLETADO
**Objetivo**: Reemplazar tablas HTML por AG Grid Community para resolver sticky headers, scroll horizontal visible, y paginacion.

**Fase 1 — Eventos** ✅
- AG Grid con ColDef: Nombre, Tipo, Fecha, Invitados, Confirmados, Estado, Acciones
- Cell renderer para badges (tipo, estado)
- Cell renderer para acciones (dropdown menu overlay)
- Tema oscuro personalizado (ag-theme-quartz + ag-theme-custom-dark)
- Paginacion 50 por pagina

**Fase 2 — Usuarios** ✅
- Columnas: Usuario, Rol, Contraseña, Gestión, Eventos, Creado, Acciones
- Cell renderer para chips de eventos y badges de rol

**Fase 3 — Invitados** ✅
- Columnas: Código, Tipo, Familia/Nombre, Teléfono, Estado, Enviado, Acciones
- quickFilterText integrado (reemplaza barra de búsqueda manual)

**Fase 4 — Estilos globales** ✅
- CSS tema oscuro para ag-grid (colores purpura/gold)
- Light mode overrides
- Responsive: ajuste de padding y font-size en mobile
- Cards mobile preservados como fallback
- Columnas centradas para datos numericos/fechas/estados/tipos
- sizeColumnsToFit() inteligente (solo si hay espacio, sino scroll horizontal)
- Busqueda con quickFilterText integrada en todos los grids

**Fase 5 — Mobile UX** ✅
- Cards rediseñadas con layout flex-row (labels uppercase, alineados)
- Boton "Acciones" unico (full-width, fondo morado, shimmer on-click)
- Menu desplegable con animacion slide-down
- Header fijo + cards scrollables independientes
- Boton "Volver" fijo en la parte inferior (aparece al scrollear >100px)
- Scrollbar oculta en mobile (scrollbar-width: none + webkit)
- Input de busqueda en todos los modulos (filtra cards en tiempo real)
- Overflow-x bloqueado a nivel html/body en mobile

**Notas tecnicas:**
- AG Grid v31.3.4 instalado (ag-grid-community + ag-grid-angular)
- Usar `AgGridAngular` standalone component
- `ColDef` con `cellRenderer` para badges/acciones
- Layout flex completo: :host → div raiz → header(fixed) + cards(scroll) + boton volver
- `pagination: true, paginationPageSize: 50`
- Tema base: ag-theme-quartz con overrides en .ag-theme-custom-dark
- `.ag-header-center` class para centrar headers
- Budget angular actualizado a 800kb warning / 1.5mb error
- Dockerfile usa `npm install` (no npm ci) por compatibilidad Alpine/rollup
- Usuarios ordenados: root → admin → client
- Registrations component migrado a AG Grid

### 2. Otros pendientes (post AG Grid)
- [ ] Nombre del evento visible en modulos Invitados/Config/Tarjetas
- [ ] Fondo de landing en canvas (mejorar escala de imagen)
- [ ] Estilo de seccion completo en canvas (dividers/transiciones)
- [ ] Video trimmer simplificado para intro
- [ ] Gestion de imagenes en cards de vestimenta
- [ ] Mobile responsive del builder completo
- [ ] Pruebas de cada seccion en el canvas

### 3. Elementos Libres (futuro, post-pruebas)
- Documentado en `docs/BUILDER-FREE-ELEMENTS.md`
- 5 fases: render basico, drag&drop, props panel, pulido, landing real

---

## Archivos clave modificados en esta sesion

- `frontend/src/app/dashboard/pages/events/events.component.ts` — AG Grid + mobile cards + busqueda + scroll-to-top
- `frontend/src/app/dashboard/pages/users/users.component.ts` — AG Grid + mobile cards + busqueda + scroll-to-top
- `frontend/src/app/dashboard/pages/guests/guests.component.ts` — AG Grid + mobile cards compactos + busqueda + scroll-to-top
- `frontend/src/app/dashboard/pages/registrations/registrations.component.ts` — Migrado a AG Grid
- `frontend/src/app/dashboard/pages/home/home.component.ts` — Light mode fixes (action buttons, mobile actions)
- `frontend/src/app/dashboard/dashboard.component.ts` — Nombre usuario visible en mobile
- `frontend/src/app/landing/sections/itinerary/itinerary.component.ts` — Iconos centrados, sin fondo negro
- `frontend/src/styles.scss` — Tema AG Grid, light mode cards, mobile layout, scrollbar hidden, overflow fixes
- `frontend/angular.json` — CSS imports de ag-grid + budgets actualizados
- `frontend/package.json` — ag-grid-community@31.3.4, ag-grid-angular@31.3.4
- `frontend/Dockerfile` — Restaurado a npm install (compatibilidad Alpine)

---

## Docker

- **Rebuild frontend**: `docker-compose up -d --build frontend` en `c:\Portafolio\invitaciones-digitales`
- **GitHub**: IrvingPavia/invitaciones-digitales
- **Rama**: feature/dashboard-redesign
