# 🧭 Persistencia de contexto entre sesiones — Vitely

> Este archivo se carga automáticamente en TODAS las sesiones. Su objetivo es que
> ninguna sesión nueva empiece "en blanco" aunque la anterior se haya cortado o
> perdido el contexto.

## Regla #1 — Al INICIAR cualquier sesión de desarrollo

Antes de responder a la primera petición de trabajo, el agente debe leer, en este orden,
para reconstruir el estado del proyecto:

1. `DEVELOPMENT_LOG.md` — el bloque **"Estado actual del proyecto"** (lo más reciente arriba).
   Dice la rama activa, la feature en curso y qué quedó pendiente.
2. `docs/PENDING.md` — pendientes vivos (ítems `[ ]`) y bitácora de completados.
3. Cualquier archivo `docs/TAREA-*.md` que exista — son tareas puntuales en pausa con todo
   el contexto ya investigado listo para retomar.
4. Ejecutar `git branch --show-current` y `git status --short` para confirmar la rama real y
   si hay trabajo sin commitear (señal de una sesión que se cortó a medias).

Luego, resumir brevemente al usuario "dónde nos quedamos" ANTES de hacer cambios, y confirmar
con él si ese estado coincide con lo que recuerda.

## Regla #2 — Durante la sesión

- Si una tarea se va a dejar en pausa, registrar su estado en `docs/TAREA-<nombre>.md`
  (bloqueadores, decisiones acordadas, plan de ejecución ya investigado, rutas y comandos).
- No depender de "recordar" entre mensajes: lo importante va al disco (docs o steering).

## Regla #3 — Al CERRAR / terminar un bloque de trabajo

Antes de dar por terminada una tanda de cambios, actualizar la documentación para la próxima
sesión:
- `DEVELOPMENT_LOG.md`: nueva entrada "Estado actual" con fecha, rama, qué se hizo y qué queda.
- `docs/PENDING.md`: marcar `[x]` lo completado y añadir `[ ]` lo nuevo pendiente.
- Si era una `docs/TAREA-*.md`, actualizar su estado (o marcarla como terminada).

## Cómo pedirle al agente que retome (frase sugerida para el usuario)

> **"Retoma el contexto de la sesión anterior"** o **"¿En qué nos quedamos?"**

Con eso el agente ejecuta la Regla #1 y te dice el estado antes de tocar nada. Si quieres algo
más específico, puedes decir **"Retoma la tarea de la Invitación Valeria"** o
**"Continúa con el spec canvas-posicionamiento"**.

---

## 📍 Estado conocido al crear este steering (2026-10-08)

> Esto es una foto del momento. La fuente de verdad siempre es `DEVELOPMENT_LOG.md` +
> `docs/PENDING.md` + git. Si algo aquí contradice esos archivos, mandan ellos.

### 🔽 ACTUALIZACIÓN 2026-10-13 (noche 5) — selector de dispositivos en canvas mobile + ancho 360px

Rama `feature/drag-elementos-secciones`. Implementado el feature del selector de dispositivos.

- **Ancho de referencia mobile 375 → 360px** vía variable CSS GLOBAL `--canvas-mobile-w: 360px`
  (styles.scss :root; fuente de verdad única, la heredan canvas/iframe/landing). Invitación y el
  marco del builder la consumen. 360 = mínimo seguro (Android gama baja).
- **Selector de dispositivos (solo canvas mobile):** catálogo `canvasDevices` en builder.component
  (360×800, 375×667, 384×854, 390×844, 412×915, 414×896, 440×956). Signal `canvasDevice`
  (default android-360). El MARCO (viewport canvas + iframe preview) toma ancho×ALTO del dispositivo
  (`[style.width/height.px]`); el fondo/secciones ocupan todo el marco; el LIENZO de drag se queda
  a 360px centrado (los objetos no se salen). Marco con alto fijo (max-height:100% → scroll si no
  cabe) muestra el corte de pantalla; se centra en el área con `.center-frame` (solo mobile).
- **Ubicación responsive del selector:** escritorio → toolbar (`.builder-device-select`); móvil
  `!isWide()` → dropdown en panel de Secciones sobre "Tema Global" (`.builder-device-select-panel`).
  Reutiliza `app-custom-select`. Verificado por el usuario.
- **PENDIENTE:** reajustar posiciones mobile de Valeria al nuevo 360px; replicar la paridad
  (desktop 680 / mobile 360 vía clases `canvas-desktop`/`canvas-mobile`) a la CARÁTULA (hero).

### 🔽 ACTUALIZACIÓN 2026-10-13 (noche 4) — Pantalla Inicio + Intro completas + fixes drag-box + decisión selector dispositivos

Rama `feature/drag-elementos-secciones`. Tanda grande (todo commiteado junto). Resumen:

- **Pantalla de Inicio (Plano):** lienzo de texto a 680px centrado en desktop (`plain-desktop`),
  incluso en banner (el banner solo afecta la imagen; el texto va a 680px fijo). Verificado.
- **Intro — paridad:** nuevo `.intro-fg` (data-drag-bounds) a 680px centrado en desktop
  (`intro-fg-desktop`).
- **Intro — fondo homologado:** `IntroConfig.media?` (MediaBackground) + `resolveMedia` +
  `<app-background-control>` → banner/cover + override desktop + overlay, igual que las secciones.
  Banner centrado (fix: `animation:none` en `.bg-banner`, el zoom pisaba el translateX). Overlay
  oscuro fijo eliminado.
- **Intro — salida + relevo a carátula:** salida por `@keyframes introOut*` (NO transition: la
  animación de entrada con fill-mode both la pisaba → parpadeo). Crossfade: `fadingStart` monta la
  carátula detrás antes de que la intro termine (evita el hueco de 1-2s). Fade-out 300ms antes del
  fin. Carátula entra con `hero-entering` + `heroBgFadeIn`. Verificado (quedó perfecto).
- **DragBox:** snap Y menos agresivo (umbral 1.2% y guías Y solo el centro; X intacto) + resize ya
  no recentra (siembra lastX/lastY con el centro real en initResize).
- **Invitación — MOBILE:** faltaba la paridad mobile; acotado a 375px centrado (`canvas-mobile`).
  ⚠️ PENDIENTE cambiarlo a 360px (ver abajo).
- **Import invitados (fix):** ya no salta familias sin guest_names; dedup por family_name o
  guest_names (reimportar no duplica). Backend reconstruido.

**DECISIÓN para la próxima tanda — Selector de dispositivos (canvas mobile):**
- Lienzo de drag mobile = **360px fijo** (cambiar el 375 actual). Mínimo seguro del mercado
  (Android gama baja = 360 CSS px). Hacerlo REUTILIZABLE para todas las secciones.
- Selector tipo DevTools (solo mobile): el MARCO del canvas toma ancho×ALTO proporcional del
  dispositivo; el lienzo de drag se queda en 360px (área segura). Filosofía A: lo que se configura
  dentro de 360px se ve consistente en cualquier teléfono; el cliente es responsable por gama.
- Catálogo: 360×800, 375×667, 384×854, 390×844, 412×915, 414×896, 440×956.
- Ubicación responsive: escritorio → toolbar del canvas; móvil → dropdown en panel de Secciones
  ARRIBA de "Tema Global". Un control reposicionado por `isWide()`.
- OJO build recurrente: backtick en comentario dentro de `styles[]` de un componente ROMPE el
  build (el template usa backticks). Evitarlos.

### 🔽 ACTUALIZACIÓN 2026-10-13 (noche 3) — import lista Valeria + familias sin nombres + feature Mesa/Recuerdo

Tema aparte del drag (módulo de Invitados). Rama `feature/drag-elementos-secciones`.

- **Import lista Valeria (Opción B):** generado `C:\Portafolio\Datos Invitacion Clientes\Valeria\
  Import Lista Invitados Valeria.xlsx` (56 filas: 22 familias + 34 individuales, 104 asistentes)
  desde la lista original (hoja "Invitados": Familia/varones/mujeres/Adultos/Menores/Total/Mesa/
  Recuerdos). Reglas: nombre con "famil*" → `guest_type=family`, `family_name`=nombre, `guest_names`
  VACÍO, `max_companions`=Total; si no → `individual`, `guest_names`=nombre, `max_companions`=Total−1.
  Mesa/Recuerdos → `notes` ("Mesa: X | Recuerdos: Y"). Formato de import del backend (guests.js):
  columnas guest_type/family_name/guest_names(o nombre)/max_companions(o acompanantes)/phone(o
  telefono/celular)/notes(o notas). El script generador fue puntual y se borró.
- **Landing — familias SIN nombres (`invitation.component.ts`):** `guestNames()` filtra vacíos;
  nuevo `hasGuestNames()`; chips solo si `family && hasGuestNames()`; `guestCount()` usa
  `max_companions` como total cuando la familia no tiene nombres. Antes mostraba chip vacío + "1
  asistente". Ahora muestra solo "Familia X" + "N asistentes". Build OK, frontend reconstruido.
- **Feature DOCUMENTADO (sin implementar) — Mesa/Asiento + Recuerdo por invitado:** campos propios
  `guests.table_assignment` (TEXTO libre) y `guests.souvenir` (opcional) para mostrar en la
  IMPRESIÓN de tarjetas (`{mesa}`/`{recuerdo}`) y check de obsequio en conferencias. Plan completo
  en `docs/PENDING.md`. Por ahora el dato va en `notes`.
- Pendiente para el usuario: importar el Excel al evento 17 (Valeria) desde el dashboard (Invitados
  → importar) y validar en la landing que las familias sin nombres se ven bien.

### 🔽 ACTUALIZACIÓN 2026-10-13 (noche 2) — Problema 2: fidelidad canvas↔preview↔landing (piloto Invitación)

Rama `feature/drag-elementos-secciones`. Se atacó el Problema 2 (lo configurado con drag en la
sección Invitación no se veía igual en canvas vs preview vs landing).

- **Causa raíz (context-gatherer):** el drag guarda posición y ancho `w` en % relativos al
  contenedor de la sección (`.inv-fg` = data-drag-bounds), pero ese contenedor mide distinto en
  cada contexto y los font-size son px FIJOS:
  - Canvas desktop: viewport hasta 900px (`.builder-canvas-viewport.desktop { max-width:900px }`).
  - Preview: IFRAME que carga la landing real (`/invitacion/:slug?preview=1`) en marco ~900px
    (`.builder-preview-frame.desktop { max-width:900px }`). NO es el `.preview-mode-canvas`.
  - Landing real: columna `clamp(520px, 50vw, 680px)` vía padding de `.section-block`. El `50vw`
    colapsaba a 520px en viewports estrechos (iframe de 900px) y daba 680px en monitor completo.
  → mismo % = ancho físico distinto = wrapping distinto. (520 preview vs 680 landing vs 900 canvas.)
- **Fix (piloto Invitación, SOLO desktop, mobile intacto):** homologar el lienzo a 680px FIJO.
  - `invitation.component.ts`: `.inv-fg` con `[class.canvas-desktop]="previewDevice==='desktop'"`.
    `.inv-fg.canvas-desktop { max-width:680px; margin:0 auto }` +
    `.inv-fg.canvas-desktop.positioned { left:50%; width:680px; max-width:680px; transform:translateX(-50%) }`.
    Cubre canvas y preview (ambos pasan previewDevice). Landing real = previewDevice null → sin clase.
  - `landing.component.ts`: `@media (min-width:768px) { .section-block { padding-left/right:
    max(20px, calc(50vw - 340px)) } }` → columna de contenido = 2×340 = 680px fijo en cualquier
    viewport desktop (iframe de preview incluido). Mobile (<768px) conserva el padding fluido.
  - Resultado: canvas = preview = landing en desktop. Verificado por el usuario.
- ⚠️ **Reajustar UNA vez** las posiciones de la Invitación de Valeria (guardadas contra 900px).
- **Pendiente:** replicar el acotado `canvas-desktop` a hero/intro/envelope (el `@media` de
  `.section-block` ya cubre landing/preview para todas; falta el lado canvas por sección).
- OJO build: un backtick dentro de un comentario CSS en los `styles[]` de un componente rompe el
  build (el template usa backticks). Pasó esta sesión; evitar backticks en esos comentarios.

### 🔽 ACTUALIZACIÓN 2026-10-13 (noche) — animación de SALIDA configurable del template Plano

Rama `feature/drag-elementos-secciones`. Tanda enfocada en la Pantalla de Inicio:

- **Problema:** al tocar "Toca para iniciar" en la Pantalla de Inicio (template PLANO), el texto
  se deslizaba a la derecha antes de desaparecer; esa animación de SALIDA no era configurable
  (solo existía la de la instrucción al cargar).
- **Causa raíz:** salida hardcodeada en `envelope.component.ts`:
  `.opened .plain-container { animation: splashOut }` con `splashOut = scale(1.1)`. El `scale`
  desde el centro del contenedor, con los textos del plano posicionados vía `app-drag-box`
  (`position:absolute; left:X%`), los corría lateralmente → "deslizamiento a la derecha".
- **Fix (Opción C — configurable, EXCLUSIVO del template `plain`):**
  - `models.ts`: nuevo `EnvelopeConfig.plainExitAnimation`
    (`fade`/`zoom-out`/`zoom-in`/`slide-up`/`blur`/`none`), opcional, default `fade`.
  - `envelope.component.ts`: `.plain-container` con `[attr.data-exit]` + `transform-origin:center`.
    Se quitó `splashOut` del plano; nuevos keyframes `plainExitFade/ZoomOut/ZoomIn/SlideUp/Blur`.
    `fade` desvanece sin desplazamiento lateral. ⚠️ `splashOut` SIGUE usándose en ticket y
    minimal-splash (no se tocó ahí).
  - `props-panel.component.ts`: control "Animación de salida" en acordeón "Opciones Plano" (solo
    template `plain`) + array `plainExitAnimOptions`.
  - Backend SIN cambios: `ensureConfigDefaults` hace `...(cfg.envelope || {})` → preserva el campo.
- **NO se tocó el fix del banner** (pedido expreso de cuidar): reglas `.envelope-bg-image.bg-banner`
  / `.plain-container.bg-banner` / `--banner-w` / `background-size:auto 100%` intactas.
- Verificado por el usuario (control visible + salida sin deslizamiento). Build OK; contenedor
  reconstruido con `--no-cache` + `rm -f` + `up -d --no-deps`; bundle contiene los campos nuevos.
  Ctrl+F5 obligatorio para cargar el bundle (cambia el hash JS).
- ⏳ EN CURSO (pruebas del usuario, sin código esta tanda): Problema 2 = fidelidad
  canvas↔preview↔landing del TAMAÑO y POSICIÓN de los objetos. Como se ven en el canvas no coincide
  con preview/landing. Estrategia propuesta: dar al canvas la misma columna de contenido (~680px)
  que la landing. Sin empezar.

### 🔽 ACTUALIZACIÓN 2026-10-13 (tarde) — ajustes de dashboard, banner y alto de secciones

Rama `feature/drag-elementos-secciones`. Tanda posterior al drag de Invitación:

- **Dashboard — fondo de card del carrusel con CASCADA** (home.component.ts + backend events.js
  `/themes` + api.service): la card usa, en orden: 1) fondo global de la landing
  (`theme.landingBg`, fallback legacy `hero.backgroundGif`), 2) si no hay, media de la CARÁTULA
  (`hero.heroBackground`), 3) si ninguna, color+textura del tema. El endpoint `/themes` ahora
  expone `landingBg` y `heroMedia` además del `heroBackground` legacy. Reutiliza
  `resolveMedia`/`resolveGlobalBackground`/`isVideoUrl`.
- **Dashboard — textos de la card** reorganizados: título + tipo de evento CENTRADOS
  verticalmente (`.card-center`); fecha + modo (Privado/Abierto) ANCLADOS abajo (`.card-bottom`
  con margin-top:auto). `.card-body` pasó a `justify-content:center`.
- **Banner de sección (fit=banner) CORREGIDO** (landing.component.ts + builder.component.ts): el
  slider "Ancho del banner" dejó de ESCALAR la imagen; ahora pinta una COLUMNA CENTRADA de ancho
  `--sec-banner-w` con `background-size: cover` en un `::before` (landing) / `::before`+`::after`
  (canvas, el ::after es el overlay `--sec-ov`). La imagen se adapta al alto de la sección y el
  slider define el ancho de la franja (recorta lados). Para imágenes horizontales en escritorio
  usar "imagen distinta para escritorio"; en móvil, verticales.
- **Banner SOLO en escritorio (fix mobile)** (hero.component.ts): el banner del hero se activaba
  por `@media(min-width:768px)`, que en el canvas evalúa el ancho de la VENTANA (desktop), no el
  del preview mobile → mostraba franjas en móvil. Ahora `[class.bg-banner]="heroBannerActive"`
  depende de `previewDevice`/`isDesktopMedia` (ambos públicos). En móvil la media cubre todo el
  ancho. (Las secciones ya decidían por previewDevice en getSectionBgStyle; en landing real el
  media query es correcto porque ahí la ventana sí es móvil.)
- **Alto mínimo de secciones = alto de ventana (Opción B, responsivo):** `.section-block`
  (landing) con `min-height:100svh` + flex column centrado; `.preview-section-click` (canvas) con
  `min-height:var(--canvas-vh)` + centrado (el ResizeObserver ya recalcula --canvas-vh en
  desktop). Se EXCLUYEN hero/envelope/intro (manejan su propio alto). Secciones cortas se estiran
  a la ventana con contenido centrado; las extensibles (details/venues/itinerary/dresscode/
  gallery/gifts) crecen más allá del mínimo. Pendiente: trabajar el alto de esas extensibles una
  por una si hace falta afinar.
- **angular.json:** budget de `anyComponentStyle` subido a 40kb/48kb (el builder.component ya
  estaba al límite y las reglas nuevas de banner/texto lo excedían por bytes).
- ⏳ Pendiente observado por el usuario: el scroll del canvas no permite posicionar con precisión
  el inicio de cada sección (el alto sí es correcto). Mejora de navegación para otra tanda.
- **Banner por sección: `cover` → `auto 100%`** (landing + canvas + hero): el banner ahora ajusta
  la imagen al ALTO y su ancho va a proporción (antes `cover` recortaba distinto según el alto de
  cada sección). El slider define el ancho de la columna.
- **FIX Carátula banner recortado (causa raíz encontrada por el usuario vía DevTools):** la
  Carátula (`app-landing-hero`) vive dentro de `.landing-wrapper` (max-width ~680px), mientras que
  las secciones (`.section-block`) rompen ese límite con `margin: calc(-50vw + 50%)` para ocupar
  100vw. El hero NO lo hacía → su banner (45%) se calculaba sobre ~680px y la imagen vertical
  recortaba los lados, distinto a las secciones (que lo calculan sobre 100vw). FIX: en los STYLES
  DE LA LANDING (no del componente hero) se añadió `.landing-wrapper > app-landing-hero { margin:
  calc(-50vw+50%) }`. OJO: ponerlo DENTRO del componente hero rompe el canvas (ahí `vw` = ancho de
  la ventana, no del canvas, y empuja el hero fuera). Como el canvas NO usa `.landing-wrapper`, el
  selector solo afecta la landing real. Verificado: canvas OK + landing con Carátula consistente.
- ⏳ PENDIENTE abierto (Problema 2): fidelidad canvas↔landing de TAMAÑOS. El canvas desktop usa
  ancho ~900px y la landing una columna ~520–680px (`.landing-wrapper`); los font-size son px
  fijos, así que el texto ocupa distinta proporción y el wrapping difiere entre canvas y landing.
  Estrategia propuesta: dar al canvas la MISMA columna de contenido que la landing (~680px). Sin
  empezar.

### 🔽 ACTUALIZACIÓN 2026-10-13 — rama `feature/drag-elementos-secciones`

- **Rama activa:** `feature/drag-elementos-secciones` (nace de `int-008` tras mergear
  `feature/fondos-independientes` vía PR #4). `int-008` remoto = `21296d0`.
- **Feature en curso:** drag & drop SELECTIVO de elementos por sección (reubicar objetos sobre el
  fondo para legibilidad). Se va SECCIÓN POR SECCIÓN; el usuario define qué objetos son
  individuales y cuáles van como conjunto.
- **Sección INVITACIÓN — TERMINADA (validada por el usuario):**
  - Objetos arrastrables: ornamento superior, título, subtítulo, card (conjunto completo),
    ornamento inferior. Keys en `invitation.positions`: ornamentTop/title/subtitle/card/ornamentBottom.
  - Reutiliza `app-drag-box` + `ElementPositions` + patrón de hero. El canvas pasa `[editable]`,
    `[previewDevice]`, `(positionsChange)` y marca `drag-enabled`; handler
    `onInvitationPositionsChange` en builder.
  - **Modo posicionado:** en cuanto se mueve el 1er objeto, TODOS pasan a position:absolute
    (sembrados con su posición efectiva) para que mover uno no desacomode a los demás. `.inv-fg`
    es el `data-drag-bounds`; cuando está posicionado se vuelve `position:absolute; inset:0` y la
    sección quita su padding lateral para que el lienzo llegue de borde a borde del canvas.
  - **DragBox extendido con inputs nuevos** (defaults = comportamiento previo, no afecta
    hero/intro/plano): `maxSize` (máx ancho/alto %, default 96 → invitation usa 100),
    `posMargin` (margen de confinamiento, default 2 → invitation usa 0), `centerContent`
    (centra el contenido en la caja, default false → invitation lo usa en los ornamentos).
  - **Decoradores configurables (Opción A):** los `✦ ✦ ✦` hardcodeados ahora usan
    `app-heading-ornament` vía `sectionStyle.headingOrnament` (acordeón "Adorno de Título").
    Se añadieron 4 tipos de símbolo al componente: `stars`(✦), `hearts`(♥), `diamonds`(◆),
    `leaves`(❧). Default de invitation = `stars`. Tipo `none` oculta ambos adornos. En invitation
    se oculta el control de "Posición" del adorno (no aplica). Centrado del símbolo: 3 spans con
    gap uniforme (sin letter-spacing) + ancho de caja fijo (ornamentos w:40) + centerContent.
  - ⏳ Pendiente menor (lo retomamos luego si molesta): afinar resize de ALTO en objetos de texto
    (hoy los dots inferiores estiran la caja pero el texto/símbolo no crece; se propuso ocultar
    handles de alto en adornos/títulos — sin decidir).
- **Próximas secciones:** replicar el drag selectivo + decoradores en las demás. NOTA del usuario:
  no todas las secciones tienen decorador y en algunas no se ve por el tamaño del texto; al
  pasar por cada una, ofrecer configurar/añadir decorador si el cliente quiere.
- **Build/Docker:** `docker-compose build --no-cache frontend` SIEMPRE termina antes de recrear;
  luego `docker rm -f invitaciones-frontend` + `docker compose up -d --no-deps frontend` (el
  `up --build`/`up` solo reusa la imagen vieja). Verificar timestamp de `index.html` vs fuente.

---

- **Rama activa (histórico):** `feature/fondos-independientes` (desde 2026-10-09).
- **Estructura de ramas (2026-10-09):**
  - `feature/canvas-posicionamiento` — tenía todo el trabajo acumulado hasta el commit `cce56be`.
  - `int-008` — CORTE de integración con todo lo último (desde `cce56be`). Reemplaza
    funcionalmente a la vieja `int-007` (que quedó muy desactualizada). Es el snapshot del estado
    actual del proyecto. El proyecto está publicado pero aún NO expuesto como producto.
  - `feature/fondos-independientes` — RAMA DE TRABAJO ACTUAL para el spec del mismo nombre.
    Nace de `cce56be`. Aquí se implementa el Tema 2 (fondos independientes).
- **Último commit base de las 3 ramas:** `cce56be` (spec fondos-independientes + steering).
- **Trabajo de la sesión 2026-10-08:** editor enriquecido + drag + línea de carga en la Intro;
  color de instrucción en el Plano; fix CRÍTICO de `ensureConfigDefaults` (hero y todas las
  secciones perdían campos en la landing pública → posiciones/colores de carátula ahora sí se
  ven); velo oscuro global eliminado; countdown en px fijo; `--canvas-vh` robusto; fondo de
  sección banner mobile = cover + min-height de pantalla. Todo ya commiteado.

- **Trabajo de la sesión 2026-10-09 (EN CURSO, revisar antes de seguir):**
  - **Tema 1 (fix salto de fondo en móvil) — HECHO, sin commitear aún:** cambiado `dvh`→`svh` en
    las capas de fondo global (`.landing-bg`, `.landing-bg-video`, `.landing-bg-overlay`,
    `.landing-bg-solid`, `.landing-bg-texture`) en `landing.component.ts`, y `.hero-section`
    homologada a `min-height:100svh` en `hero.component.ts`. Causa: `dvh` recalcula al
    mostrar/ocultar la barra del navegador en Chrome Android → saltaba el fondo fixed. Build OK.
    FALTA: reconstruir frontend + verificar en móvil real + commitear.
  - **Tema 2 (fondos independientes) — SPEC CREADO en `.kiro/specs/fondos-independientes/`
    (requirements.md, design.md, tasks.md). Implementación NO empezada.** Resumen de lo acordado:
    - Fondo GLOBAL de la landing = única capa FIJA (ambientación). Carátula y secciones tendrán
      su propia media que SCROLLEA con su contenido (la carátula pasa a tener fondo propio).
    - Modelo HÍBRIDO mobile/desktop (opción 2): imagen BASE para ambos + toggle "Imagen distinta
      para escritorio" (override solo desktop; mobile usa base). No duplicar toda la config.
    - Homologar TODOS los fondos (global, carátula, sección) con mismos controles y soporte
      imagen/GIF/VIDEO (hoy las secciones solo soportan imagen; el global sí distingue video).
    - Límites de subida POR TIPO: imagen 10MB, gif 15MB, video 25MB (recomendado mucho menos).
      Alinear Multer + nginx del contenedor + nginx del HOST prod (`client_max_body_size 25m`).
    - Validación en frontend antes de subir + tooltips con formatos/dimensiones/peso.
    - Retrocompatible: campos nuevos opcionales; si no hay `theme.landingBg`, usar
      `hero.backgroundGif` como global (como hoy). No romper Valeria ni prod.
    - Plan en `tasks.md`: Fase 0 (Tema1 ✅) → Fase 1 modelo ✅ → Fase 2 helper resolveMedia →
      Fase 3 render (global/carátula/secciones) → Fase 4 builder (BackgroundControlComponent
      reutilizable) → Fase 5 uploads límites+validación → Fase 6 retrocompat+verificación.
    - **Fase 1 HECHA (2026-10-09):** en `models.ts` se añadió `MediaBackground` + `theme.landingBg`
      + `hero.heroBackground` + `sectionStyle.media` (todos opcionales/retrocompatibles). Build OK.
    - **Fase 2 HECHA (2026-10-09):** `core/utils/media-background.util.ts` con `resolveMedia`,
      `isVideoUrl`, `sectionStyleToMedia` (fallback legacy) y `resolveGlobalBackground` (fallback a
      hero.backgroundGif). Build OK.
    - **Fase 3 HECHA (2026-10-09):** render de la landing. Fondo global usa `theme.landingBg` con
      fallback a `backgroundGif` (fijo). Carátula tiene fondo propio (`.hero-bg-media`) que
      SCROLLEA. Las 8 secciones soportan video (`.section-bg-video`). Todo vía `resolveMedia`.
    - **Fase 4 HECHA (2026-10-09):** `BackgroundControlComponent`
      (`builder/components/background-control/`) con upload img/gif/video + validación tamaño por
      tipo (10/15/25) + tooltip + toggle override desktop + ajuste. Integrado en Tema Global,
      Carátula y Fondo de Sección. Canvas: `canvasGlobalBg()`/`canvasSectionMedia()`.
      LIMITACIÓN: canvas no pinta video de fondo por sección (sí en preview/landing).
    - **Fase 5 HECHA (2026-10-09):** backend `uploads.js` con límites por tipo (SIZE_LIMITS_MB:
      image 10/gif 15/video 25/audio 15), valida y devuelve 413 si excede. Frontend ya validaba.
      `docs/DEPLOY.md` actualizado: nginx host `client_max_body_size 25m` + tabla de límites.
    - **Fase 6 HECHA (2026-10-09):** verificado que ensureConfigDefaults preserva los nuevos
      campos y que Valeria no tiene regresión (usa backgroundGif como fondo global fallback).
      Contenedores reconstruidos, landing HTTP 200.
    - **SPEC fondos-independientes COMPLETO (todas las fases 0-6).**
    - **Fixes posteriores (2026-10-09, commit c952d55):**
      - REGRESIÓN de la carátula corregida: el fondo propio rompía el posicionamiento (los
        drag-box pasaban a referenciar `.hero-content`). Se envolvió el contenido en `.hero-fg`
        (`position:absolute; inset:0; z-index:1`, NUEVO `data-drag-bounds`) y el fondo quedó en
        `z-index:0`. Así textos/countdown/flechas mantienen su posición y el navbar queda sobre
        el fondo. (hero.component.ts)
      - MIGRACIÓN de fondo global legacy (migration.service.ts > ensureDefaults): si hay
        `hero.backgroundGif` y no `theme.landingBg`, se promueve a `theme.landingBg` y se limpia
        `backgroundGif`. Evita el "fallback fantasma" (antes, al quitar la imagen del fondo global,
        reaparecía backgroundGif). Se aplica al abrir el builder y guardar.
      - Valeria: se limpió su fondo global (vacío backgroundGif + landingBg) vía API; quedó solo
        color #caf0f0 + textura paper. (cambio de datos en BD, no en git)
    - **PENDIENTE ABIERTO — Tema 2 (imagen de carátula vs navbar):** el usuario reporta que la
      imagen de fondo de la carátula "empieza debajo del navbar" y quiere que la imagen vaya DETRÁS
      del navbar (navbar por encima, imagen de borde a borde arriba). Falta confirmar si lo ve en
      el canvas (navbar relative) o en la landing real (navbar fixed) y aplicar el ajuste. NO
      resuelto aún.
    - Pendiente general: verificación visual del usuario en navegador/móvil + `client_max_body_size
      25m` en el nginx del server prod al desplegar.

- **Trabajo de la sesión 2026-10-09 (continuación — Temas C y A, misma rama `feature/fondos-independientes`):**
  - **Tema C (uploads homologados + control de audio) — HECHO, compila y desplegado:**
    - `BackgroundControlComponent`: preview con miniatura (imagen/gif) o ícono `movie` (video) +
      badge de tipo (IMG/GIF/VIDEO) + nombre. Métodos `isVideo()`, `mediaKindLabel()`.
    - NUEVO `AudioControlComponent` (`builder/components/audio-control/`): ícono audiotrack, badge
      AUDIO, botón play/pausa (`togglePlay`), se pausa al hacer clic FUERA del control
      (`@HostListener('document:click')`) y al destruirse. Límite 15MB. API `[url]`/`(urlChange)`.
      Integrado en el audio del hero del props-panel (reemplazó el upload de solo texto).
    - props-panel: 3 uploads sueltos homologados con miniatura/ícono + badge: `envelope.sealImage`,
      `envelope.splashImage`, `intro.background`. Helpers nuevos `thumbIsVideo()`, `thumbKind()` +
      clases CSS `.media-preview-row/.media-thumb/.media-type-icon/.media-meta/.media-badge/.media-actions`.
      (Los uploads de venue/detail/itinerary icon y dresscode YA mostraban miniatura, sin cambios.)
  - **Tema A (override de texto por sección, de Invitación hacia abajo) — HECHO, compila y desplegado:**
    - `landing.component.ts > getSectionBg`: ahora inyecta también los TAMAÑOS que faltaban:
      `--section-h2-size` (sectionHeadingSize), `--section-heading-size` (headingFontSize),
      `--section-content-size` (contentFontSize).
    - Reglas `::ng-deep` ampliadas: se añadieron reglas para `--section-heading-font`,
      `--section-content-font` y los 3 tamaños (antes faltaban). Selectores de título ampliados a
      `.timeline-title`, `.transfer-title`, `.rsvp-name`, `.invitation-name`, `.invitation-subtitle`,
      `.gallery-desc`, `.gifts-desc`; contenido ampliado a `.timeline-desc`; H2 incluye
      `.invitation-title`.
    - Invitation cableada: `landing.component.ts` pasa `[sectionStyle]="...invitation.sectionStyle"`;
      `invitation.component.ts` declara `@Input() sectionStyle?: SectionStyle`. Se quitó la
      exclusión de `invitation` en los acordeones 'sec-txt' y 'sec-presets' del props-panel (ahora
      Invitación también configura texto/presets por sección).
    - NOTA: se usaron los 3 niveles de texto que YA existían (Encabezado / Títulos / Contenido).
      NO se añadió un 4º nivel "Subtítulo" independiente (los subtítulos tipo `.invitation-subtitle`
      y `.gallery-desc` se controlan con el nivel "Títulos").
  - **Tema B (drag de títulos de sección) — DESCARTADO en esta rama** (riesgo de romper el flujo de
    cards con position:absolute). Va a otra rama futura si se retoma.
  - Build frontend OK (solo warnings NG8107 preexistentes). Docker frontend reconstruido; landing
    `invitacion-valeria` HTTP 200; bundle del contenedor contiene `section-content-font`,
    `section-heading-size` y `audio-control`.
  - ⏳ FALTA: verificación visual del usuario en el builder (previews de audio/uploads) y en la
    landing (herencia de estilos por sección desde Invitación). Commit pendiente de esta tanda.
  - **FIX paridad canvas↔landing del override de texto por sección — HECHO, compila y desplegado:**
    - DIAGNÓSTICO (context-gatherer): el override de "Texto de Sección" NO se aplicaba en el CANVAS
      por 2 fallos: (1) `getSectionBgStyle()` en `builder.component.ts` solo inyectaba fondo+clip-path,
      nunca las variables `--section-*` de texto; (2) aunque las inyectara, el canvas envuelve las
      secciones en `.preview-section-click` (no `.section-block`) y no tenía reglas `::ng-deep` que
      las consumieran. La persistencia (`setSS`/`ss`) sí funcionaba; la landing sí aplicaba (Tema A).
    - FIX en `builder.component.ts`: (A) `getSectionBgStyle()` ahora inyecta las mismas variables de
      texto que la landing (`--section-h2-color/font/size`, `--section-heading-color/color2/angle/
      mid-a/mid-b/weight/size/font`, `--section-content-color/size/font`) con nuevo helper
      `getCanvasFont()` (espejo de `getThemeFont`). (B) Se añadieron reglas `::ng-deep` scopeadas a
      `.preview-section-click[style*="--section-..."]` que aplican esas variables a h2/.section-heading/
      .invitation-title/h3/.venue-title/.timeline-title/.transfer-title/.rsvp-name/.invitation-name/
      .invitation-subtitle/.gallery-desc/.gifts-desc/p/.detail-content/.venue-name/.timeline-desc, etc.
    - Las fuentes `--font-*` ya están en `styles.scss :root`, así que el canvas las resuelve igual.
    - NOTA: el canvas sigue sin pasar `[sectionStyle]` a los componentes de sección (igual que antes);
      no hace falta para el override de texto (va por las variables CSS del wrapper). Build OK,
      contenedor reconstruido, landing HTTP 200, bundle contiene las reglas de `.preview-section-click`.
    - ⏳ FALTA: verificación visual del usuario (editar texto de una sección y ver el cambio en vivo
      en el canvas, no solo en Preview/landing).
  - **FIX REAL override de texto por sección (2º intento, el que SÍ funciona) — HECHO y VERIFICADO
    por el usuario en Detalles:**
    - El enfoque anterior (inyectar variables `--section-*` + reglas `::ng-deep` en el wrapper) NO
      aplicaba en el canvas de forma fiable. CAUSA DE FONDO: los componentes de sección pintan el
      texto con estilos inline (`[style.color]` etc.) leídos SOLO del tema global (`styles`
      GlobalTextStyles), NUNCA de `sectionStyle`. Las variables CSS externas + `::ng-deep` eran
      frágiles (dependían de re-render del método `getSectionBgStyle`, del guard `[style*=...]` y de
      la cascada). ADEMÁS un primer parche quedó mal: usé comillas en vez de backticks y el template
      `var(--x, ${...})` se emitió literal (sin interpolar).
    - ENFOQUE NUEVO (determinista, piloto en Detalles): el PROPIO componente resuelve el estilo con
      prioridad `sectionStyle` > `styles` (tema global) > default, en helpers TS que devuelven el
      valor final, y el binding inline usa ese valor directo. Sin depender de variables CSS externas
      ni de reglas `::ng-deep`. Funciona igual en canvas y landing.
      - `details.component.ts`: helpers `headingColor/Font/Size` (lee `sectionStyle.sectionHeading*`),
        `titleColor/Font/Size/Weight` (lee `sectionStyle.heading*`), `contentColor/Font/Size`
        (lee `sectionStyle.content*`), `useTitleGradient()` (desactiva el gradiente del tema si la
        sección define color de título propio). Los `<h2>/<h3>/.detail-content` usan esos helpers.
      - `builder.component.ts` (canvas): ahora pasa `[sectionStyle]="...details.sectionStyle"` a
        `app-landing-details` (antes no lo pasaba).
    - ⚠️ SOLO DETALLES ESTÁ MIGRADO. Las otras 7 secciones (venues, itinerary, gallery, dresscode,
      gifts, rsvp, invitation) SIGUEN con el mecanismo viejo de variables CSS `--section-*` +
      `::ng-deep` (que puede fallar igual). PENDIENTE: replicar el patrón de Detalles en las 7 y
      luego RETIRAR la capa redundante de variables/`::ng-deep` para dejar una sola fuente de verdad.
    - ⚠️ DESCUBRIMIENTO sobre Docker: `docker-compose up --build frontend` REUTILIZÓ una capa de
      build cacheada y dejó el contenedor con una build ANTERIOR al último cambio (verificado por
      timestamp de `index.html` vs del fuente). Si un cambio "no se ve", comparar
      `docker exec invitaciones-frontend ls -l --full-time /usr/share/nginx/html/index.html` contra
      el `LastWriteTimeUtc` del fuente, y reconstruir con `docker-compose build --no-cache frontend`
      seguido de `docker-compose up -d frontend`. Hacer Ctrl+F5 en el navegador (cambia el hash JS).

### Features en curso / pendientes concretos

1. **Spec `canvas-posicionamiento`**: drag en Plano/Intro/Carátula ✅, reset de tamaño ✅.
   - ⏳ **Único pendiente:** botón **"Restablecer posiciones"** en el props-panel (tareas 18-19
     del spec). Baja prioridad.

2. **Tarea `docs/TAREA-INVITACION-VALERIA.md`** — invitación Totoro/Ghibli (evento `id=17`).
   - ✅ Creada y configurada; se está revisando sección por sección con el usuario (ver abajo).
   - ⏳ **Pendiente de esa tarea:**
     - Ubicaciones/direcciones reales de los lugares (ahora links de Maps de las imágenes).
     - Decidir y colocar la **Recepción** (imagen 5, Casa F&F Banquetes, 9:30/10:00 pm):
       ¿segundo venue o itinerario?
     - Seguir la revisión visual sección por sección.

3. **Pendientes abiertos (ver `docs/PENDING.md` para el detalle completo):**
   - ⏳ Flechas del scroll-indicator de la carátula: usuario las vio descentradas; sin causa clara
     en CSS. Reconfirmar en navegador.
   - ⏳ Modo banner en DESKTOP: afinar anchos laterales uniformes por sección (esta sesión se
     enfocó en mobile).
   - ⏳ **Título de sección se desborda en landing mobile real** (ej. "Lugares del Evento" en
     Galaxy A55 se sale por los lados; en canvas se ve bien). El `<h2>` script no se ajusta en
     pantallas angostas. Falta `word-break`/`overflow-wrap` o reducir tamaño en móvil.
   - ⏳ Subida de imágenes: bajar Multer a ~10 MB + validación en frontend con leyenda de error.
   - ✅ Toggle "Fondo" por card arreglado en Detalles/Vestimenta/Lugares (commit 53d9c8f).

4. **DEUDA TÉCNICA — sincronización de esquema BD en deploys (importante):**
   El esquema del server prod se desincroniza del local porque `initDB()` no registra todas las
   columnas/tablas nuevas. Se homologó el server el 2026-10-08 migrando estructura completa +
   datos de admin/Karla/Valeria (root OMITIDO). Pendiente: completar `initDB()` con los
   ALTER/CREATE faltantes para que cada deploy auto-sincronice. Ver `docs/PENDING.md`.
   - ⚠️ En prod el `root` de la plataforma NO quedó al recrear `users`; crear con INSERT (hash de
     Bonie123). `admin`/`admin123` sí quedó. Login tiene rate limit 5/15min por IP (reiniciar
     backend lo resetea).

### Estado del server prod (2026-10-08)
- Esquema homologado con el local (16 tablas recreadas). Datos: admin, KarlaAzarcoya, invitación
  Valeria (evento 17 + config). Faltan: crear usuario root, subir las 7 imágenes de Valeria a
  `/uploads/images/` con sus nombres exactos, y poner `client_max_body_size 10m` en el nginx del
  host (da 413 al subir imágenes hasta que se ajuste).

### Datos útiles del entorno

- **Credenciales reales:** `root` / `Bonie123` · `admin` / `admin123` (seed). El pass de root
  NO es admin123 (ya fue cambiado). Están en la tabla `users.plain_password`.
- **Levantar frontend:** `docker-compose up -d --build frontend` en la raíz. Si nginx del
  frontend crashea con `host not found in upstream "backend"`, es porque el backend no está
  arriba: levantar `backend` y reiniciar `frontend`.
- **El endpoint de screenshot** (`/api/events/:id/screenshot`) falla en local porque Puppeteer
  corre dentro del contenedor backend y `http://localhost` ahí es el backend, no el frontend.
  No es un bug de las invitaciones; la verificación visual la hace el usuario en el navegador.
- **Recordatorio:** el **autoguardado del builder está deshabilitado** — hay que pulsar "Guardar"
  para persistir a Preview/landing.

### Mejora de UX anotada (pendiente, no empezada)
- Botón de **"ojito"** en el login para mostrar/ocultar la contraseña.
