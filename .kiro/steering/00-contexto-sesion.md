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

### 🔽 ACTUALIZACIÓN 2026-10-17 (b) — Lugares mini-secciones + fixes del editor enriquecido + encabezados ocultables

Rama `feature/drag-elementos-secciones`. Tanda COMMITEADA. Detalle completo en
**`docs/TAREA-LUGARES-MINISECCIONES.md`**. Compilado y desplegado en local; pendiente validación visual
final del usuario.

- **Lugares = mini-secciones por venue (A/B/C):** mismo modelo que Detalles sobre `config.venues.items[]`
  (Opción A, retrocompatible). Cada venue = "Lugar N" con encabezado + card (objeto único) arrastrables,
  estilos/fondo/drag propios. Horario (icono reloj Material MONOCROMÁTICO + color compartido icono+texto),
  botón "Cómo llegar" (icono mapa + props que heredan del tema), nombre y DIRECCIÓN con editor
  enriquecido. Migración `migrateVenuesToMiniSections` (idempotente, `venues._miniMigrated`). Acordeones:
  Encabezado / Contenido / Horario / Ubicación (dir+maps+botón) / Apariencia de Cards. Horario ANTES de
  la dirección.

- **FIX editor enriquecido (TRANSVERSAL, afecta a TODAS las secciones que usan el editor):**
  `core/components/rich-text-editor.component.ts` gana `onPaste` + `sanitizePastedHtml`. Al pegar HTML
  (p.ej. una dirección copiada de Google) se depura: quita `background/background-color/box-shadow/
  border/line-height/position/display/width/height/margin/padding/...`, degrada `h1-h6` a `span`, y
  elimina nodos basura (`style/script/img/...`) y atributos `on*`. RESUELVE dos bugs:
  1. **Fondo negro** en la dirección (venía de `background-color: rgb(34,36,42)` pegado).
  2. **Interlineado ignorado**: además, `execLineHeight` ahora limpia el `line-height` inline de los
     descendientes (`clearLineHeightDescendants`) antes de aplicar el elegido — un `<h1>` pegado con
     `line-height: 1.75rem` fijo lo pisaba.
  Red de seguridad CSS en `.venue-name/.venue-address` (background transparent !important).

- **FIX opacidad de card en Lugares (doble opacidad):** la card multiplica alpha-del-color-picker ×
  `cardBgOpacity`. En el RESTO de secciones `cardBgOpacity` queda neutro (100) y manda solo el alpha
  (el slider de opacidad se quitó hace tiempo). Los venues arrastraban `cardBgOpacity` 30/vacío de la
  migración → la opacidad "cambiaba" respecto al picker. FIX: `getCardBgOpacity` en venues devuelve
  SIEMPRE 100 (ignora el heredado). Se quitó el slider de opacidad que se había añadido por error al
  panel de Lugares. REGLA: en todas las secciones la opacidad de card se controla SOLO con el alpha del
  color picker.

- **Encabezado de sección OCULTABLE si queda vacío:** borrar el título oculta el encabezado completo
  (título+adorno+líneas); el default solo se usa si el campo nunca se definió (legacy=undefined). Backend
  `ensureConfigDefaults.js`: `||`→`??` en `title` de details/itinerary/gallery/dresscode/gifts/rsvp (el
  `||` reponía el default al recibir `''`). Frontend: helper `headingText()` (`?? default`) +
  `@if (headingText())` en las 6 secciones simples (details/venues ya lo tenían).

- **FIXES DE DATOS de Valeria (BD LOCAL, event_id=17):** (1) `REPLACE` quitó `background-color:
  rgb(34,36,42);` del addressHtml; (2) `REPLACE` quitó `line-height: 1.75rem;` fijo; (3) script
  `scripts/migrate-valeria/fix-venue-card-opacity.js` (parsea JSON con mysql2 del backend, ignorado por
  git) puso `cardBgOpacity: 100` en los 2 venues. ⚠️ **FALTAN EN PROD** al desplegar.

- **OJO datos BD:** el config de la invitación vive en `event_config.config_json` (NO en `events`).
  Para scripts Node dentro del contenedor backend: ejecutar en `/app` (ahí resuelve `mysql2`) y usar las
  env `DB_HOST/DB_USER/DB_PASSWORD/DB_NAME` del backend (usuario `invitaciones_user`, NO root).

### 🔽 ACTUALIZACIÓN 2026-10-16 (d) — Detalles como MINI-SECCIONES por card (Entregas A y B; falta drag)

Rama `feature/drag-elementos-secciones`. SIN commit todavía (pendiente de validación del usuario en el
builder). Build OK, frontend reconstruido. Tarea completa documentada en
**`docs/TAREA-DETALLES-MINISECCIONES.md`** (plan por fases + estado).

**Objetivo:** convertir Detalles (1 sección con N cards) en N MINI-SECCIONES, una por card, cada una
con lienzo/estilo propio y arrastrable de forma independiente. OPCIÓN A (confirmada): se mantiene
`config.details.cards[]` como almacén (retrocompatible); cada card se COMPORTA como sección en UI/
landing. En el MENÚ: "Detalles" = encabezado agrupador; sub-entradas "Detalle 1..N" (renombrables vía
`card.label`), drag SOLO dentro del grupo, botón eliminar por card (con confirmación) y "+ Agregar
Detalle". Reglas: alto FLEXIBLE por card (no 100vh), fondo que se adapta al alto (si no cuadra, se ve
el fondo global); card = objeto único; 1ª card lleva el encabezado general (`details.title`), las
demás `card.heading` (vacío = oculto).

**Modelo (models.ts):** nueva `CardStyle` + `DetailCard` extendido con `label?`, `heading?`,
`sectionStyle?`, `cardStyle?`, `positions?`. Todo opcional/retrocompatible.

**ENTREGA A (landing) — HECHA:** `details.component.ts` REESCRITO: cada card es una `<section
.details-mini>` (padding 48px, alto flexible). Encabezado por card (`headingText`). TODOS los helpers
de estilo reciben `card` y resuelven: estilo de card `cs(card)` = `card.cardStyle` > campos sueltos de
`config` (retrocompat); estilo de sección `ss(card)` = `card.sectionStyle` > `this.sectionStyle`. Fondo
por card `miniBg(card)` (solid/linear/image con `auto 100%` centrado, REGLA R3). `@Input() onlyIndex`
para renderizar 1 card (canvas). `realIndex()`/`visibleCards()`.

**ENTREGA B (builder) — HECHA:**
- canvasState: nuevo signal `selectedDetailIndex` (-1 = ninguna).
- builder (menú): "Detalles" `.is-group`; sub-entradas "Detalle N" con CDK dropList propio
  (`onDetailDrop`), eliminar (`removeDetail` con `DialogService.confirm`), "+ Agregar" (`addDetail`),
  `detailCards()`/`selectDetail()`. `selectSection` resetea `selectedDetailIndex`.
- builder (canvas): `@for` de cards → cada una en `.preview-section-click data-section="details:<id>"`
  con `[onlyIndex]=di`, seleccionable. Ya NO inyecta getSectionBgStyle en details (el fondo lo pinta el
  componente por card).
- props-panel: edita la card activa. Helpers `dcard/dIdx/updateDCard/updateDCardStyle/dCardStyle/
  styleHolder`. `ss/setSS/sectionMediaModel/setSectionMediaModel/hasSectionStyle/toggleSectionStyle/
  getOrnamentType/getOrnamentProp/setOrnament` REDIRIGIDOS a la card activa (vía styleHolder) cuando es
  details+card. Acordeones: "Encabezado de la sección" (solo 1ª card, edita details.title),
  "Contenido" (label/heading/title/content/icon/align), "Apariencia de Cards" (ahora POR CARD vía
  cardStyle), y el "Estilo de Sección" común (oculto en details sin card). Add/remove viejo ELIMINADO.
- Backend: `ensureConfigDefaults` ya pasa `cards` completo → NO requirió cambios.

**FIX post-B (fallback de estilos + migración Opción 2 + botón eliminar) — HECHO:**
- BUG reportado: el fondo de imagen aparecía en TODAS las cards con el toggle "Estilo de Sección"
  APAGADO y "se reseteaba" al activarlo. CAUSA: `ss(card)`/`cs(card)` en details.component hacían
  fallback a `this.sectionStyle`/campos sueltos de la sección global (Valeria sí tenía fondo ahí).
- FIX: quitado el fallback → `ss(card)=card.sectionStyle`, `cs(card)=card.cardStyle||{}` (cada card
  usa SOLO lo suyo; sin estilo propio, el texto cae al tema global).
- MIGRACIÓN Opción 2 (`migration.service.migrateDetailsToMiniSections`, idempotente vía
  `details._miniMigrated`): al cargar copia UNA vez `details.sectionStyle` global + campos de card
  sueltos a cada `card.sectionStyle`/`card.cardStyle`, para no perder lo ya configurado. Valeria
  conserva su fondo/estilos en ambas cards y quedan independientes. ⚠️ Tras migrar, el toggle "Estilo
  de Sección" sale ACTIVADO por card (esperado). El usuario debe GUARDAR para persistir la migración.
- Botón eliminar del menú: ahora con fondo/borde rojizo + hover sólido (antes casi invisible).

**ENTREGA C (drag) — HECHA:** en `details.component.ts` el encabezado y la card se envuelven en
`app-drag-box` (objeto único por tipo), posiciones POR CARD (`card.positions`, mobile/desktop).
Objetos: `heading` (si existe) y `card`. Helpers `hasAnyPosition/pos/posData/resolvePos/onPosChange`
reciben `card`. Lienzo `data-drag-bounds` = `.details-mini-inner`, acotado a ancho FIJO por dispositivo
(`.canvas-desktop`=600 / `.canvas-mobile`=360, REGLA R1/R4, getters `fgDesktop/fgMobile`) en modo
posicionado + pines `::ng-deep` en el builder. Inputs `editable`/`positionsChange` (emite
`{cardId, positions}`). Canvas pasa `[editable]`+`drag-enabled` y persiste con `onDetailPositionsChange`.
El fondo va en `.details-mini` (llena el marco), el lienzo acotado en `.details-mini-inner`.

**MEJORA props-panel (controles de texto movidos):** los controles de estilo de texto (Encabezado/
Título/Contenido: fuente/color/tamaño/degradado) se movieron del acordeón "Texto de Sección" al
acordeón "Contenido" de cada Detalle. "Texto de Sección" se OCULTA en Detalles. Heredan del Tema Global
y lo sustituyen si se configuran. Sub-grupo Encabezado solo si la card tiene encabezado. El control de
Contenido es la BASE del editor enriquecido (los estilos inline del editor mandan sobre él).

**FEATURE DETALLES MINI-SECCIONES: COMPLETO (fases 1-7 + fixes + mejoras props-panel).** Validado por
el usuario en el builder. Detalle completo en `docs/TAREA-DETALLES-MINISECCIONES.md`.

**Ajustes finales del props-panel de Detalles (validados):**
- Controles de texto junto a su campo: estilo del Encabezado en el acordeón "Encabezado de la sección"
  (UNIFICADO para TODAS las cards: 1ª edita `details.title`, las demás `card.heading` opcional); estilo
  del Título junto al campo título en "Contenido".
- CONTENIDO: se estiliza SOLO desde el editor enriquecido (se quitaron los controles de texto y el de
  alineación duplicados del panel).
- FIX gradiente bicolor del título: `useTitleGradient(card)`/`getTitleGradient(card)` resuelven el
  degradado desde `card.sectionStyle` (headingColor/headingColor2/angle/intensity) con fallback al tema
  global (antes se desactivaba al tener color propio y leía solo el global).
- FIX canvas no reflejaba el editor en el contenido: `[innerHTML]` crudo → Angular saneaba y borraba los
  `style` inline. Ahora `safeContent()` con `DomSanitizer.bypassSecurityTrustHtml` (patrón hero/envelope).
- PENDIENTE menor: GUARDAR en el builder persiste la migración Opción 2 de las cards de Valeria.

### 🔽 ACTUALIZACIÓN 2026-10-16 (c) — indicador de scroll configurable (carátula) + fix canvas no toma el dispositivo al 1er render

Rama `feature/drag-elementos-secciones`. Build OK, frontend reconstruido. Ctrl+F5.

**1. Indicador de scroll (flechas al pie de la carátula) CONFIGURABLE + fix de centrado/color:**
- Problema: las flechas (`.scroll-indicator`) no se distinguían (color heredaba de `--theme-text-primary`
  con opacity, se perdía en fondos claros) y estaban descentradas (usaban `left:50%`+`translateX`
  dependiente del box del glyph).
- Modelo: nuevo `HeroConfig.scrollIndicator?` (`ScrollIndicatorConfig` en models.ts): `show`, `type`
  (single-chevron/double-chevron/arrow-down/chevron-circle/mouse/dot), `color`, `size`, `animation`
  (bounce/pulse/fade/slide-down/none). Todo opcional/retrocompatible (default: double-chevron, bounce,
  color texto primario, 32px).
- `hero.component.ts`: el `.scroll-indicator` ahora centra con `left:0;right:0`+flex (robusto, ya no
  depende del glyph). Color/tamaño inline desde la config; `text-shadow` para legibilidad. Switch de
  tipos de icono (material-icons/punto) + animaciones por `data-anim`. Getter `scrollIndicator()` con
  defaults. Backend ya preserva el campo (spread raíz del hero en ensureConfigDefaults).
- `props-panel.component.ts`: NUEVO acordeón "Indicador de scroll" en Carátula (toggle mostrar + tipo
  + color + tamaño + animación). Helpers `si()`/`setSI()` (usan `setSecNested('hero','scrollIndicator',…)`).
  Arrays `scrollIndicatorTypeOptions` / `scrollIndicatorAnimOptions`.

**2. FIX: el canvas no tomaba el tamaño del dispositivo al PRIMER render (solo al cambiar de disp.):**
- Causa: `canvasDeviceWidth()/Height()` leían un plain getter `activeDevice`; en el primer ciclo (el
  canvas se monta DESPUÉS de cargar la config async) el `[style.width/height.px]` inline no se
  reflejaba hasta que un cambio de signal forzaba reflow.
- Fix: `activeDevice` → `computed` signal (`activeDeviceSig`); los métodos leen el computed (reactivo
  desde el 1er render). Además, tras cargar la config, en rAF se reafirma `canvasDevice.set(canvasDevice())`
  + `_applyCanvasHeight()` para que el marco tome ancho×alto del dispositivo por defecto de inmediato.
  `setCanvasDevice` también re-mide el alto en rAF.

### 🔽 ACTUALIZACIÓN 2026-10-16 (b) — scripts de migración MANUAL de Valeria + limpieza (NO se versionan)

Rama `feature/drag-elementos-secciones`. Generados en `scripts/migrate-valeria/` para que el usuario
los ejecute A MANO en el server. Separa DATOS (esto) de ESQUEMA (lo hace el runner de migraciones).
**La carpeta está en `.gitignore`** (datos personales reales de 55 invitados; migración manual) →
NO se commitea. Las imágenes las sube el usuario manualmente (el evento queda registrado).

- **Hallazgos en dev:** hay DOS eventos Valeria → `id=1` slug `xv-valeria` (asignado a KarlaAzarcoya,
  user 3) y `id=17` slug `invitacion-valeria` (el de la tarea Totoro). El 17 NO está en `user_events`
  (sin dueño). Evento 17: 1 config, 55 invitados, 0 itinerario/fotos/tarjetas. El config referencia
  8 imágenes en `/uploads/images/` (todas existen en el volumen).
- **Carpeta `scripts/migrate-valeria/` (ignorada por git):**
  - `00-limpiar-invitaciones.sql` — DESTRUCTIVO: borra TODOS los eventos y su contenido (config,
    guests, itinerary, photos, card_templates, registrations, user_events, postponements; suggestions
    a NULL). PRESERVA users/plans/purchases/transactions y el esquema. FK_CHECKS=0 y vaciado explícito
    en orden seguro. Para dejar el server limpio antes de migrar.
  - `01-valeria-data.sql` — upsert IDEMPOTENTE (evento + event_config + 55 guests). Claves:
    events.id/slug, event_config.event_id, guests.unique_code → re-ejecutar actualiza, no duplica.
  - `README.md` — pasos manuales (docker cp + mysql < script), nombres exactos de las 8 imágenes a
    subir, y el INSERT opcional de user_events si se quiere asignar dueño.
  - **AMBOS scripts VERIFICADOS en una BD temporal `valeria_test` (esquema clonado): migrar dio
    1/1/55; limpiar dejó todo en 0, sin errores de FK.** Se usó `--default-character-set=utf8mb4`.
- **OJO ENCODING (lección):** `Out-File -Encoding utf8` de PowerShell CORROMPE los acentos UTF-8 del
  dump (quedaba `Invitaci├│n`). Solución usada: generar el dump DENTRO del contenedor y sacarlo con
  `docker cp` (binario, sin reinterpretar); el .sql final se escribió con UTF8 SIN BOM. Al ejecutar,
  usar `SET NAMES utf8mb4` + `mysql --default-character-set=utf8mb4`.
- **Pre-requisito del script:** el backend del server debe tener ya el runner de migraciones (esquema
  homologado) para que el import no falle por columnas inexistentes.
- **NO asigna user_events** (el 17 no tenía dueño en dev); si un cliente debe administrarlo, crear la
  fila aparte. **DATO SENSIBLE:** el .sql lleva nombres reales de 55 invitados (repo privado).

### 🔽 ACTUALIZACIÓN 2026-10-16 — sistema de migraciones AUTOMÁTICAS (resuelve la deuda de homologación BD)

Rama `feature/drag-elementos-secciones`. Se implementó el mecanismo HÍBRIDO acordado para homologar
la BD en cada despliegue sin tocar datos. Esto resuelve la DEUDA TÉCNICA de desincronización
dev↔prod (`initDB()` no registraba todas las tablas/columnas nuevas).

- **`backend/src/migrations/runner.js`** (NUEVO): crea tabla `schema_migrations`, lee los `.sql` de
  `backend/src/migrations/sql/` ordenados por nombre y ejecuta SOLO los no registrados; registra cada
  uno. Idempotente, se detiene si una migración falla (no la marca aplicada). Incluye un
  `splitSqlStatements` que respeta comentarios/strings/backticks para partir por `;`.
- **`backend/src/index.js`**: ahora `await initDB(); await runMigrations(); await fixUrls();`.
- **`backend/src/migrations/sql/001_homologacion_esquema_prod.sql`** (NUEVA migración): homologa prod
  con dev. CAUSA de la deuda confirmada al inspeccionar dev (16 tablas) vs `initDB()` (13): faltaban
  5 TABLAS (`plans`, `purchases`, `transactions`, `postponements`, `email_verifications`) + columnas
  en `users` (email, email_verified, verification_status, self_registered, full_name, trial_used +
  idx), `events` (lifecycle_status, deactivation_date, purchase_id + FK a purchases, postponed,
  plan_type + idx), `photos` (thumb_url, gallery_url). Patrón idempotente: `CREATE TABLE IF NOT
  EXISTS` + `SET @ddl := IF(COUNT(*)=0,'<ALTER>','SELECT 1') FROM information_schema...; PREPARE/
  EXECUTE/DEALLOCATE` para columnas/índices/FKs. Orden de FK respetado (plans→purchases→
  transactions→postponements; events.purchase_id→purchases).
- **VERIFICADO:** backend reconstruido; el runner aplicó las 73 sentencias sobre la BD de dev (que ya
  tenía todo) SIN error (prueba de idempotencia); registró `001` en `schema_migrations`; al reiniciar
  dice "BD al dia, nada que aplicar" (no reejecuta). Backend `healthy`.
- **Cómo añadir migraciones futuras:** crear `sql/NNN_descripcion.sql` idempotente (ver
  `docs/MIGRATIONS.md`, sección "Sistema de migraciones AUTOMÁTICAS"). Ej. futuro: los campos
  `guests.table_assignment` / `guests.souvenir` (feature documentado no implementado) irían como
  `002_...`.
- **Flujo prod:** push a `deploy_prod` → `docker compose up -d --build` → backend arranca → migra →
  BD homologada. Cero pasos manuales. ⚠️ PENDIENTE aparte: migrar los DATOS de Valeria (evento 17 +
  config + 7 imágenes a uploads) al server — eso NO lo hace este runner (es esquema, no datos).

### 🔽 ACTUALIZACIÓN 2026-10-15 (d) — integrados los cambios de despliegue de `deploy_prod` en la rama feature

Rama `feature/drag-elementos-secciones`. Se mezcló `origin/deploy_prod` (FAST-FORWARD limpio, sin
conflictos) para que la config de deploy del server NO se planche al subir el feature a prod.

- **Contexto:** `deploy_prod` nació de mi último commit (`4300902`) y le sumó 3 commits SOLO de
  despliegue; ya contenía TODO mi trabajo del builder. merge-base = `4300902`. Por eso el merge fue
  un fast-forward (HEAD avanzó `4300902 → 11245e7`). OJO: `origin/deploy_prod` había tenido un
  FORCE-PUSH reciente (`59e7acd...11245e7 forced update`); por eso 2 de los commits son "reponer tras
  force-push".
- **Los 3 commits traídos (solo tocan 3 archivos de infra, nada del builder):**
  - `56b7537` fix(db): en `backend/src/models/database.js` se crea `events` ANTES de `user_events`
    (user_events tiene FK a events(id); antes fallaba el orden). No cambia el esquema final, solo el
    orden de CREATE.
  - `94dc0bc` fix(prod): `docker-compose.yml` frontend expone `8080:80` (antes `80:80`) para no
    chocar con el nginx del HOST en el puerto 80.
  - `11245e7` ci(prod): NUEVO `.github/workflows/deploy.yml` — auto-deploy por SSH que se dispara
    SOLO `on: push: branches: [deploy_prod]` (hace `git reset --hard origin/deploy_prod` +
    `docker compose up -d --build` + prune en `/opt/pavi`). Tenerlo en la rama feature NO dispara
    nada (solo corre al pushear a deploy_prod).
- **Estado git tras el merge:** HEAD local = `11245e7` = `origin/deploy_prod`. La rama feature local
  quedó 1 commit por delante de `origin/feature/drag-elementos-secciones` (que sigue en `4300902`)
  hasta que se pushee.
- **Para desplegar a prod (flujo):** cuando el feature esté listo, llevar estos cambios a
  `deploy_prod` y pushear esa rama → el workflow despliega por SSH. El puerto del frontend en el host
  es 8080 (nginx del host enruta el 80→8080). Prod sigue necesitando `client_max_body_size 25m` en el
  nginx del host (deuda conocida).

---

## 🧱 REGLAS DE DISEÑO PERMANENTES (INVARIANTES — NO romper con cambios)

> Estas NO son una foto de sesión: son reglas acordadas con el usuario que deben respetarse en
> TODO cambio futuro. Si un cambio las rompe, es un bug. Antes de tocar canvas/landing/fondos,
> releer esta sección.

### R1 — Lienzo de drag vs capas responsivas (canvas y landing)
En cada sección conviven DOS tipos de capa con comportamiento OPUESTO:
- **Lienzo de drag** (`data-drag-bounds`: `.hero-fg`, `.inv-fg`, `.intro-fg`, `.plain-container`):
  ancho **FIJO** por dispositivo → `--canvas-mobile-w` (360px) / `--canvas-desktop-w` (600px),
  CENTRADO. NO se reescala al cambiar el dispositivo del selector ni el ancho de la ventana. Esto
  mantiene el tamaño/posición de los objetos (guardados en % del bounds). El font-size de los
  objetos va en px FIJOS, aparte del %.
- **Capas responsivas** (fondo global, fondo de sección, navbar, y todo lo que NO sea objeto de
  drag): se ADAPTAN al ancho del marco/ventana. Deben LLENAR el marco del dispositivo.
- El **selector de dispositivos** (canvas mobile) solo cambia el ancho×alto del MARCO; el lienzo de
  drag se queda fijo (franjas si el dispositivo es más ancho que 360). Lo responsivo sí sigue al marco.

### R2 — Navbar
El navbar (`.landing-nav` / `.nav-inner`) ocupa el **ancho completo de la ventana** (NO se acota a la
columna del lienzo). Es `position:fixed; left:0; right:0` en la landing; en el canvas pasa a
`relative` y ocupa el viewport del canvas. NUNCA limitarlo al ancho del lienzo (eso dejaba el título
pegado a un lado con una franja hasta el botón de menú). ⚠️ Ya se cometió este error una vez y se
revirtió.

### R3 — Fondo de SECCIÓN (imagen/gif) — dimensionado (los 4 contextos: canvas mobile/desktop +
landing mobile/desktop)
Regla única y consistente en TODOS los contextos:
- **Alto** del fondo = alto de la ventana/sección (`100svh` en landing, `--canvas-vh` en canvas).
- **Ancho** = PROPORCIONAL al alto → `background-size: auto 100%`, CENTRADO. La imagen **NUNCA se
  deforma**.
- Imagen **vertical**: se adapta bien (llena el alto; si es muy delgada, se ve como franja/banner
  central con franjas laterales del fondo global).
- Imagen **horizontal**: en mobile se verá como banner central (franjas a los lados) — es el precio
  de no deformar. Para horizontales está la propiedad adicional **"imagen distinta para escritorio"**
  (override desktop), que SÍ debe verse bien en desktop y ser responsiva al ancho de la ventana.
- **Mobile en horizontal (rotación):** no afecta; aplica la misma regla (alto completo + banner).
- **Pantalla completa (cover):** sigue existiendo como opción explícita de `fit`; pero el modo
  BANNER es el que usa `auto 100%`. El default/criterio buscado por el usuario es `auto 100%` (no
  deformar). El `cover` NO debe usarse como fallback de mobile (ese era el bug: landing mobile y
  canvas mobile usaban `cover` y deformaban/recortaban).
- **PENDIENTE asociado:** validación al CONFIGURAR imagen de fondo → si la imagen es horizontal
  (ratio ancho>alto) advertir al usuario que no se verá óptima en mobile (tomando como referencia la
  resolución mínima del mercado), sin bloquear; si acepta, mobile respeta la regla (alto completo).

### R4 — Anchos de referencia (fuente de verdad única)
`--canvas-mobile-w: 360px` y `--canvas-desktop-w: 600px` viven SOLO en `styles.scss :root`. Todo
(canvas, iframes de preview, landing, lienzos, columna `.section-block`) las consume vía
`var(--canvas-*-w)`. NO hard-codear 360/600/680 en ningún componente.

---

### 🔽 ACTUALIZACIÓN 2026-10-15 (c) — revertir navbar + fondo de sección a `auto 100%` (REGLA R3)

Rama `feature/drag-elementos-secciones`. COMMITEADO junto con las tandas (a) y (b) del 2026-10-15
(lienzo fijo por dispositivo + navbar + preview iframe + fondo de sección + reglas R1–R4). Build OK,
contenedor reconstruido. Ctrl+F5.

- **Navbar REVERTIDO (R2):** se quitó el acotamiento `.nav-inner` a la columna del lienzo (clases
  `nav-desktop`/`nav-mobile` + getters) que había metido en la tanda anterior. El navbar vuelve a
  ocupar el ancho de la ventana (comportamiento histórico). Mi acotamiento había dejado el título
  pegado a la izquierda con franja hasta el botón de menú. ⚠️ Error ya cometido y revertido (ver R2).
- **Fondo de SECCIÓN unificado a `auto 100%` centrado (R3):** antes landing mobile y canvas mobile
  usaban `cover` (deformaba/recortaba). Ahora los 4 contextos usan `background-size: auto 100%`
  centrado: alto = ventana, ancho proporcional, SIN deformar. Verticales llenan; horizontales se ven
  como banner con franjas (precio de no deformar) → responsivo al cambiar de dispositivo.
  - Canvas (`builder.component.ts getSectionBgStyle`, rama banner mobile): `center/cover` →
    `center / auto 100%`.
  - Landing (`landing.component.ts .section-block[style*="--sec-bg-image"]`, regla base mobile):
    `background-size: cover` → `auto 100%`. El banner desktop (`@media` `::before`) ya usaba `auto 100%`.
- **PENDIENTE asociado (R3):** validación al configurar imagen de fondo → advertir si la imagen es
  horizontal (ratio ancho>alto) que no se verá óptima en mobile (ref: resolución mínima del mercado),
  sin bloquear. Si acepta, mobile respeta la regla (alto completo + banner). NO implementado aún.
- NOTA: el VIDEO de fondo de sección sigue con `object-fit:cover` (no se tocó; el reporte era sobre
  imágenes). Pendiente menor si se quiere homologar el video a la misma regla.

### 🔽 ACTUALIZACIÓN 2026-10-15 (b) — fix Preview iframe no respetaba el dispositivo + aclaración canvas desktop

Rama `feature/drag-elementos-secciones`. SIN commit (documentado por regla del usuario). Build OK,
contenedor reconstruido (`--no-cache` + `rm -f` + `up -d --no-deps`), bundle verificado. Ctrl+F5.

**Reporte del usuario (2 puntos):** (1) el PREVIEW del canvas (modo Preview, iframe) NO respetaba
el dispositivo seleccionado; (2) duda de si el canvas DESKTOP se quedó con el tamaño del dispositivo
mobile (deben ser independientes).

- **FIX (1) — Preview iframe:** `.builder-preview-frame.mobile` tenía `flex:1; width:100%` y un
  override `&.mobile { width: var(--canvas-mobile-w) }` que PISABA el `[style.width/height.px]`
  inline del dispositivo → el iframe se estiraba y no tomaba el ancho×alto del dispositivo. FIX:
  `&.mobile { flex:0 0 auto; width:auto; max-width:100%; margin:0 auto; align-self:center }` (toma el
  tamaño inline del dispositivo, centrado, sin estirarse) + nueva clase `.builder-preview-area.center-frame`
  (`justify-content:center; overflow:auto`) condicionada a mobile, espejo del `.center-frame` del
  canvas, para permitir scroll si el dispositivo es más alto que el área. El cableado del iframe
  (`[style.width/height.px]="previewDevice()==='mobile' ? canvasDeviceWidth() : null"`) ya estaba bien.
- **ACLARACIÓN (2) — canvas desktop NO toma el tamaño del dispositivo:** el ternario
  `previewDevice()==='mobile' ? canvasDeviceWidth() : null` ya deja el canvas/preview DESKTOP
  independientes del `canvasDevice`. El marco desktop sigue a `max-width:900px`; el LIENZO de
  contenido a 600px (`--canvas-desktop-w`) CENTRADO → por eso en desktop se ven FRANJAS laterales
  (fondo a 900px, contenido a 600px). Esto es FIEL a la landing real desktop (el hero/secciones se
  expanden a 100vw con la columna de contenido en 600px centrada vía `.landing-wrapper > app-landing-hero`
  y `.section-block` con `margin:calc(-50vw+50%)`). NO es un bug: las franjas replican la landing.
- **Selector de dispositivos solo en mobile:** `@if (previewDevice()==='mobile')` en toolbar y panel
  (ya estaba). Si se vio en desktop, era bundle viejo del navegador (requiere Ctrl+F5, cambia el
  hash JS). El canvas desktop es independiente del selector por el ternario.
- ⏳ Pendiente de verificación del usuario: Preview mobile ahora igual al canvas mobile (mismo marco
  por dispositivo); desktop sin selector y con franjas = landing.

### 🔽 ACTUALIZACIÓN 2026-10-15 — ancho de lienzo FIJO por dispositivo en las 4 secciones de apertura + navbar acotado + desktop 680→600px

Rama `feature/drag-elementos-secciones`. SIN commit todavía (documentado por regla del usuario:
siempre dejar el contexto en disco aunque no se haga commit). Build OK, contenedor reconstruido
(`--no-cache` + `rm -f` + `up -d --no-deps`), bundle verificado (`canvas-desktop-w`,
`hero-fg-mobile`, `nav-mobile`). Ctrl+F5 obligatorio (cambió el hash JS).

**Problema reportado:** al cambiar el dispositivo del selector del canvas mobile se MOVÍAN y
reescalaban los objetos drag-and-drop; y lo configurado en el canvas (ej. tamaño del título de
Invitación en desktop) NO coincidía con la landing real. Además el menú/navbar se expandía al ancho
completo de la ventana.

**CAUSA RAÍZ (context-gatherer):** posición (x,y centro) y tamaño (w,h) de cada objeto se guardan
en **% del contenedor `data-drag-bounds`**; el font-size va en px FIJOS aparte. Tamaño físico =
(% guardado) × (ancho real del contenedor). Si el ancho del contenedor cambia (el selector agranda
el MARCO, o difiere entre canvas/preview/landing), el objeto se reescala aunque el % sea idéntico.
**Invitación ya estaba pineada (360/680); el resto de secciones NO** → por eso solo esas se movían.

**FIX — ancho de referencia del lienzo FIJO por dispositivo en los 5 contextos** (canvas mobile,
canvas desktop, preview mobile iframe, preview desktop iframe, landing real):

- **Nueva variable CSS global `--canvas-desktop-w: 600px`** en `styles.scss :root` (hermana de
  `--canvas-mobile-w: 360px`). Fuente de verdad ÚNICA; la heredan canvas, iframes de preview y
  landing. Desktop bajó de 680 → **600px** (petición del usuario). Antes 680 estaba hard-codeado en
  varios sitios.
- **Columna de la landing (`landing.component.ts .section-block`):** el `@media(min-width:768px)`
  pasó de `50vw - 340px` a `50vw - (var(--canvas-desktop-w)/2)` → 600px en cualquier viewport ≥768px.
- **Pines de ancho FIJO centrado (desktop + mobile) en las 4 secciones de apertura:**
  - Invitación: `.inv-fg.canvas-desktop`/`.canvas-mobile` (680→var). Ya tenía ambos.
  - Intro: `.intro-fg.intro-fg-desktop` (680→var) + NUEVO `.intro-fg.intro-fg-mobile`
    (getter `introMobileFixed`). Antes solo desktop.
  - Plano (envelope): `.plain-container.plain-desktop` (680→var) + NUEVO `.plain-container.plain-mobile`
    (getter `plainMobileFixed`). Antes solo desktop.
  - **Carátula (hero):** era la ÚNICA sección SIN ningún pin (su `.hero-fg` ocupaba `inset:0`). Ahora
    `.hero-fg` toma NUEVAS clases `.hero-fg-desktop`/`.hero-fg-mobile` (getters `heroDesktopFixed`/
    `heroMobileFixed`) que lo acotan a `var(--canvas-desktop-w)` / `var(--canvas-mobile-w)` centrado.
    Esto resuelve el pendiente abierto de la paridad del hero.
- **Pines `::ng-deep` del canvas (`builder.component.ts`):** 680→`var(--canvas-desktop-w)` y añadidos
  los pines MOBILE que faltaban para plano/intro/hero (antes solo invitación tenía mobile). Son la
  excepción al `::ng-deep * { max-width:100% }` universal del canvas.
- **Navbar acotado:** `.nav-inner` dejó de ocupar el 100%; ahora `margin:auto` + `max-width` por
  dispositivo (`.landing-nav.nav-desktop/.nav-mobile .nav-inner` → `var(--canvas-desktop-w)` /
  `var(--canvas-mobile-w)`). El `<nav>` recibe las clases `nav-desktop`/`nav-mobile` vía
  `heroDesktopFixed`/`heroMobileFixed`. Se usan CLASES (no media query) porque en el canvas mobile la
  ventana del navegador es ancha pero el viewport del canvas es angosto.

**⚠️ PENDIENTE (reajuste de DATOS, no de código):** las posiciones ya guardadas de Valeria quedaron
contra 680px (desktop) y 375px (mobile histórico). Al pasar a 600/360 hay que reajustarlas UNA vez
por sección. Verificación visual del usuario pendiente: (1) cambiar de dispositivo NO debe mover
objetos en hero/intro/plano; (2) canvas desktop = landing desktop (tamaño del título); (3) navbar
acotado a la columna.

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
