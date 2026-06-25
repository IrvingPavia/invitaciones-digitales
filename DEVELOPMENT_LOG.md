# 📋 DEVELOPMENT LOG — Vitely

> **Documentación distribuida en `docs/`**
> - `docs/CONTEXT.md` — Contexto general del proyecto (compartir al iniciar sesión)
> - `docs/ARCHITECTURE.md` — Stack, estructura, BD, roles
> - `docs/DEPLOY.md` — Instrucciones de despliegue al server
> - `docs/MIGRATIONS.md` — Scripts SQL para aplicar en producción
> - `docs/PENDING.md` — Pendientes, bugs, mejoras recomendadas

---

## Última sesión: 2025-06-25

### Builder — Preview con Landing Real (iframe)
- **Modo Preview ahora carga la landing real** en un iframe (`/invitacion/{slug}?preview=1`)
- **Envelope e Intro se muestran** en el preview (fix: `?preview=1` indica a la landing que NO skip las pantallas de inicio)
- **Scroll animations habilitadas** en preview mode (fix: directive ScrollReveal ahora permite animaciones cuando `preview=1`)
- **Panel izquierdo oculto** en preview mode (layout cambia a 1 columna)
- **Botón de recarga** (refresh) aparece solo en preview mode, al lado del toggle
- **Auto-save al cambiar a preview** — si hay cambios sin guardar, se guardan antes de cargar el iframe
- **previewKey signal** — fuerza recarga del iframe con timestamp único

### Builder — Intro Loop Mejorado
- **Transición de salida empieza ANTES de que termine la duración** (`triggerTime = dur - transitionDuration`)
- **7 tipos de transición**: fade, slide-up, slide-down, zoom-in, zoom-out, blur, none
- **CSS Animations (keyframes)** en vez de transitions en el builder — evita el problema de animación inversa al entrar
- **Fix transición solo al salir** — no hay transition en estado base, solo en `.fade-out`
- **overflow: hidden en .preview-section-click** — las transiciones slide/zoom no invaden secciones vecinas
- **Corte con fondo de landing visible** — después de la transición, 1s de pausa mostrando el fondo configurado
- **Video MP4 se reinicia durante el corte** — `video.play()` después de rebobinar
- **Partículas reactivas** — `ngDoCheck` regenera partículas cuando la config cambia en tiempo real

### Builder — Duración Intro Rediseñada
- **Control stepper** `[ - ] 4 seg [ + ]` en vez de slider — incrementos de 0.5s, rango 0.5-30s
- **Toggle "Usar duración del video"** — si activo, la intro dura lo que dure el video completo
- **Detección automática de duración** — al subir video, se detecta duración con `loadedmetadata`
- **Etiqueta de tipo de archivo** — muestra "Video — Xs" o "GIF / Imagen (loop)" debajo del upload
- **Botón "Saltar intro"** — configurable, aparece en esquina superior derecha de la landing real
- **Transición de salida configurable** — selector con 7 opciones en el panel de propiedades

### Builder — Background Global
- **Fondo multimedia visible en canvas** — si hay backgroundGif (imagen/GIF), se usa como `background: url() center/cover fixed` en `.preview-mode-canvas`
- **Videos como fondo** — si es MP4, se renderiza un `<video>` absoluto con autoplay loop muted
- **Overlay oscuro (30%)** para legibilidad del contenido encima
- **Secciones con z-index: 1** — se renderizan encima del fondo

### Builder — Archivo Upload Mejorado
- **Nombre del archivo visible** — en vez de "Ok", muestra el nombre truncado (max 20 chars)
- **Botones "Cambiar" + "X"** — reemplazan el "Quitar" genérico
- **`getFileName()` helper** — extrae nombre de archivo de la URL

### Builder — Responsive Toolbar
- **flex-wrap** en la toolbar — se adapta a pantallas angostas
- **Breakpoint 850px** — debajo: título arriba (100% width), controles + guardar en segunda línea
- **Controles centrados** en pantalla ancha (`flex: 1; justify-content: center` en toolbar-center)

### Builder — Light Mode Completo
- **Tonos púrpura** en labels, accordion headers, toggle titles, section descriptions
- **Inputs con fondo lavanda** (`#faf8ff`) y bordes púrpura translúcido
- **Chips con fondo lavanda** y texto púrpura
- **Stepper con tonos púrpura**
- **Focus con shadow púrpura** en inputs
- **Mode toggle visible** — fondo claro con texto legible, verde en preview
- **Canvas area** gris claro, viewport blanco

### Builder — Otros Ajustes
- **Countdown centrado** — `display: flex; justify-content: center` en value y label + padding simétrico
- **Botón Guardar profesional** — min-width 120px, sin salto de tamaño, delay mínimo 800ms "Guardando..."
- **Auto-scroll a sección** — al seleccionar del panel izquierdo, el canvas scrollea suavemente
- **Navbar del hero** siempre muestra background (estilo scrolled) para apreciar colores
- **Estilo de Sección** como toggle — las propiedades genéricas (fondo, transición, colores, animación) se ocultan con un toggle "Estilo de Sección" que hereda del tema global por defecto

### Archivos modificados
- `frontend/src/app/dashboard/pages/builder/builder.component.ts` — Preview iframe, responsive toolbar, background, transitions
- `frontend/src/app/dashboard/pages/builder/components/props-panel/props-panel.component.ts` — Stepper, media upload, duración, transición
- `frontend/src/app/landing/landing.component.ts` — Preview mode detection, scroll reveal fix
- `frontend/src/app/landing/sections/intro/intro.component.ts` — Loop timing, transitions CSS, particles ngDoCheck, skip button, effectiveDuration
- `frontend/src/app/landing/sections/hero/hero.component.ts` — Countdown centering
- `frontend/src/app/core/models/models.ts` — IntroConfig: transition, useVideoDuration, showSkip
- `frontend/src/styles.scss` — Light mode completo para builder

### Pendientes para próxima sesión
- [ ] Pruebas completas de cada sección en el canvas (verificar que propiedades se reflejan)
- [ ] Video trimmer simplificado para intro (actualmente solo en Config avanzada)
- [ ] Gestión de imágenes en cards de vestimenta
- [ ] Verificar mobile responsive del builder completo
- [ ] Fix: select "FUENTE" vacío en light mode (no muestra texto de la opción seleccionada)
- [ ] Verificar que el fondo de sección (cuando activado) se vea correctamente en el canvas
- [ ] Documentar y subir cambios a la rama feature/dashboard-redesign

---

## Sesión anterior: 2025-06-22

### Builder — Fix Error Crítico `Cannot read properties of undefined (reading 'enabled')`
- **Causa raíz**: El config del evento no tenía todas las secciones/sub-objetos definidos. Components como `gifts.component` accedían a `config.transfer.enabled` sin null check, y `hero.component` accedía a `config.eventDescriptionStyle.fontFamily` directamente.
- **Fix MigrationService**: Nuevo método `ensureDefaults()` que garantiza que TODAS las secciones y sub-objetos requeridos existan con defaults (envelope, intro, hero styles, gifts.transfer, globalStyles, theme, etc.)
- **Fix landing components**: Optional chaining (`?.`) añadido en hero (eventDescriptionStyle, celebrantNamesStyle, heroPhraseStyle) y gifts (transfer.enabled, transfer.accountType, transfer.sectionIcon)
- **Fix builder template**: Envuelto `<app-landing-hero>` y `<app-landing-invitation>` en `@if` guards

### Builder — Panel de Propiedades Completo (Estilo IDE/Photoshop)
- **Reemplazo del panel inline** por el componente `BuilderPropsPanelComponent` con acordeones colapsables
- **Scroll habilitado**: `:host { overflow-y: auto }` + `padding-bottom: 60px` para no cortar último acordeón
- **Spacing mejorado**: padding en accordion-body (14px/16px), margin-bottom en fields (14px), gaps en rows (10px)
- **Secciones completas implementadas**:
  - **Envelope (Pantalla de Inicio)**: Template cards visuales (Sobre/Ticket/Splash/Plano), estilo de sobre, estilo de sello, colores sobre/sello, contenido del sello (selector Emoji/Icono/Vacío), imagen del sello, instrucción, fondos color 1/2, color texto, opciones condicionales por template
  - **Intro**: Frase + estilo (fuente 15 opciones, tamaño, peso, color), fondo multimedia, duración, partículas completas (toggle, tipo 6, dirección, 2 colores, cantidad/velocidad/tamaño/opacidad con sliders)
  - **Hero (Carátula)**: Nombres (toggle mostrar, texto), tipo de evento, frase, descripción toggle, countdown (fecha, toggle fondo cards, radio borde), estilos de texto por elemento (fuente, tamaño, color1, color2 gradiente), multimedia (fondo + audio)
  - **Invitación**: Título, subtítulo, apariencia card (toggle fondo, radio borde)
  - **Detalles**: Título, CRUD cards (título, contenido, tipo icono, emoji, alineación), apariencia
  - **Lugares**: CRUD venues (nombre, dirección, hora, maps URL, icono), estilo icono (círculo/simple/ninguno), apariencia
  - **Itinerario**: Título, CRUD actividades (hora, título, descripción, emoji), apariencia
  - **Galería**: Título, descripción, selector estilo (8 tipos), gestión fotos (subir/eliminar con grid preview)
  - **Vestimenta**: Título, descripción, CRUD cards (título, descripción), apariencia
  - **Regalos**: Título, descripción, link, botón, transferencia bancaria completa (toggle, titular, banco, tipo+número, animación monedas/billetes), apariencia
  - **RSVP**: Título, apariencia card
- **Acordeones genéricos** (Fondo Sección, Transición, Colores Texto, Animación) excluidos para envelope, intro, hero (tienen su propio manejo)
- **15 fuentes** en todos los selectores: Lato, Montserrat, Raleway, Josefin Sans, Playfair Display, Cormorant Garamond, Cinzel, Libre Baskerville, Great Vibes, Spumoni, Dancing Script, Sacramento, Tangerine, Alex Brush, Pinyon Script

### Builder — Toggle Canvas / Preview
- **Botón en toolbar** al lado de los device buttons: alterna entre modo Canvas (edición) y Preview (interactivo)
- **Modo Canvas**: Todo estático, sin animaciones. Clic selecciona secciones → muestra propiedades. pointer-events: none en children
- **Modo Preview**: Landing interactiva (se puede abrir sobre, ver intro, scroll). pointer-events habilitados. No se seleccionan secciones al clic. Cambios en propiedades se reflejan en tiempo real
- **Loop de animaciones**: Envelope se resetea a 3s después de abrirse (previewLoop Input). Intro siempre en loop (fade out → reset → restart)
- **Reset al volver a Canvas**: Sobre se resetea a visible, clase 'opened' removida

### Builder — Ajustes de Canvas
- **Navbar sticky**: `position: sticky; top: 0` dentro del canvas para que siempre sea visible al scroll
- **Hero min-height reducido**: De `100vh` a `500px` en canvas (evita que se monte sobre la intro)
- **Intro/Envelope min-height**: 500px para que se aprecien correctamente en el canvas
- **Countdown centrado**: Añadido `text-align: center; width: 100%` a `.countdown-value` y `.countdown-label`
- **Canvas mode override**: En canvas `.envelope-overlay.opened` fuerza `opacity: 1` (nunca desaparece)

### Archivos modificados principales
- `frontend/src/app/dashboard/pages/builder/builder.component.ts` — Template canvas + toggle mode
- `frontend/src/app/dashboard/pages/builder/components/props-panel/props-panel.component.ts` — Panel completo
- `frontend/src/app/dashboard/pages/builder/services/migration.service.ts` — ensureDefaults()
- `frontend/src/app/landing/sections/hero/hero.component.ts` — Optional chaining + countdown center
- `frontend/src/app/landing/sections/gifts/gifts.component.ts` — Optional chaining en transfer
- `frontend/src/app/landing/sections/envelope/envelope.component.ts` — previewLoop Input
- `frontend/src/app/landing/sections/intro/intro.component.ts` — previewLoop Input + loop timer

### Pendientes para próxima sesión
- [ ] Verificar que cambios en propiedades se reflejan en canvas en tiempo real
- [ ] Light mode del builder (algunos controles pueden no verse)
- [ ] Revisar sección por sección que todas las propiedades de Configuraciones estén en el builder
- [ ] Video trimmer simplificado para la intro (actualmente solo editable desde Config avanzada)
- [ ] Gestión de imágenes en cards de vestimenta (actualmente solo título + descripción)
- [ ] Mobile: FAB para mostrar/ocultar panel de secciones (ya implementado, verificar)

---

### Vista simplificada para rol Client
- **Home client**: Cards de acceso rápido (Invitados, Configurar, Tarjetas, Ver Landing) en vez del selector genérico
- **Sidebar dinámico**: Para clients con 1 evento muestra links directos a sus secciones
- **Sin acceso a Eventos/Usuarios**: Ocultos en sidebar y sin botón "Nuevo Evento"
- **Mensaje vacío personalizado**: Si no tiene eventos asignados, indica contactar al admin

### Módulo de Sugerencias
- **Backend**: Tabla `suggestions` + CRUD en `/api/suggestions` (filtrado por rol)
- **Frontend**: Componente con formulario (categoría + texto) + lista con estados
- **Client**: Envía sugerencias, ve estado y respuesta del admin
- **Admin/Root**: Ve todas, filtra por estado, cambia estado, responde con nota, elimina
- **Categorías**: Landing, Tarjetas, Invitados, General
- **Estados**: nueva → leída → implementada/descartada

### Bug fixes
- **Editor tarjetas**: Nuevos elementos ya no se superponen (offset 12% vertical + 4% horizontal)
- **Landing bg flash**: Gif de fondo hace fade-in (1.2s) solo después de sobre+intro (fondo sólido como fallback)
- **Landing scroll mobile**: `overscroll-behavior-y: contain` en `:host` del landing

### Rama: `int-003`
- Push a GitHub: `origin/int-003`
- Migración pendiente: tabla `suggestions` (ver `docs/MIGRATIONS.md`)

---

## Sesión anterior: 2025-05-27

### Módulo de Tarjetas de Invitación (Rediseño completo)
- **Arquitectura**: Eliminado fabric.js + PDFKit, reemplazado por HTML/CSS editor + Puppeteer
- **Editor visual**: Canvas WYSIWYG con elementos posicionables (texto, imagen, QR, separador)
- **Drag & drop**: Mover elementos con mouse/touch, valores redondeados
- **Resize**: Handle en esquina inferior-derecha
- **Guías de alineación**: Snap al centro y a otros elementos (±2%)
- **Fondo**: Color sólido, degradado bicolor (ángulo 0-360° + intensidad 0-100%), imagen
- **QR**: Color configurable, fondo transparente (SVG), label on/off con color
- **Separadores**: Estilo (sólida/guiones/puntos/doble/degradado), grosor, color
- **Layout PDF**: Tamaño tarjeta (mm), página (Carta/A4/Oficio), orientación, márgenes, marcas de corte
- **Preview dinámico**: Aspect-ratio real según dimensiones configuradas
- **Variables de texto**: {nombre}, {evento}, {fecha}, {tipo}, {asistentes}, {codigo}, {invitados}
- **Feedback de guardado**: Botón cambia a verde "Guardado ✓" o rojo "Error" (3s)
- **Backend Puppeteer**: Chromium en Alpine Docker, genera PDF desde HTML con fuentes Google

### Otros cambios de la sesión
- Font de títulos del dashboard: Montserrat (antes Playfair)
- Login: logo Vitely actualizado
- Documentación distribuida en `docs/`

---

## Sesión anterior: 2025-05-26

### Sistema de usuarios y roles
- Roles: root, admin, client
- Tabla user_events (muchos-a-muchos)
- Middleware de roles (requireRole, requireUserManagement, requireEventAccess)
- CRUD usuarios con reset password, contraseña visible (plain_password)
- Import dedup de invitados
- Sidebar condicional por rol

### Branding Vitely
- Paleta púrpura (#7c5cbf / #9d6ee7)
- Logo + favicon
- Favicon dinámico por evento en landing

### Landing improvements
- Sobre de invitación (5 estilos)
- Partículas configurables (6 tipos, size, opacity, direction)
- Mobile cards para eventos/invitados
- Navegación con scrollIntoView
- Fix fondo mobile (110dvh)
