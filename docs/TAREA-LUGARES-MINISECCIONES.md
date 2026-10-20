# Tarea — Lugares como MINI-SECCIONES por venue (igual que Detalles)

> **Estado:** COMPLETO (A/B/C + reorganización + fixes). Rama `feature/drag-elementos-secciones`.
> Fecha inicio: 2026-10-17. Cierre: 2026-10-17. Pendiente solo validación visual final del usuario.

## Objetivo
Replicar en **Lugares** el modelo de mini-secciones de Detalles: cada venue = una sección independiente
("Lugar 1, Lugar 2…") en el menú, con lienzo/estilo/drag propios. OPCIÓN A: se mantiene
`config.venues.items[]` como almacén (retrocompatible).

## Objetos por mini-sección (como Detalles)
- **Encabezado** (opcional; la 1ª usa el título general "Lugares del Evento").
- **Card del lugar** = objeto único con: título, nombre (=contenido, editor enriquecido), horario, botón.

## Especificidades de Lugares (acordadas con el usuario)
- **Título**: con opción bicolor (gradiente), igual que Detalles.
- **Nombre del lugar** = CONTENIDO con editor de texto enriquecido (`venue.nameHtml`, fallback `name`).
- **Horario** (etiqueta reloj + texto): icono MONOCROMÁTICO (Material Icon) de un catálogo de relojes
  (`schedule/access_time/alarm/watch_later/hourglass_empty/event/none`), color COMPARTIDO icono+texto,
  fuente y tamaño (el tamaño del texto escala el icono con `font-size:1.1em`).
- **Botón "Cómo llegar"**: icono de mapa/ubicación (`place/location_on/map/near_me/directions/explore/
  none`), texto configurable, y props propias (bg/text/border/radius/font/size) que heredan del Tema
  Global y lo sustituyen si se definen.
- Iconos = Material Icons (monocromáticos, toman color del texto; nada de emojis para reloj/botón).

## Modelo (models.ts) — HECHO (Entrega A)
- Nuevos tipos `VenueTimeStyle` (icon/font/fontSize/color) y `VenueButtonStyle` (icon/text/bgColor/
  textColor/borderColor/borderRadius/font/fontSize).
- `VenueItem` extendido: `label`, `heading`, `nameHtml`, `sectionStyle`, `cardStyle`, `positions`,
  `timeStyle`, `buttonStyle`. Todo opcional/retrocompatible.

## Entrega A (landing + migración) — HECHA
- `venues.component.ts` REESCRITO con el patrón de Detalles: cada venue = `<section .venues-mini>`
  (alto `var(--canvas-vh,100svh)`), encabezado por venue (drag-box), card como objeto único (drag-box),
  estilos resueltos por venue (`ss(venue)`/`cs(venue)`, sin fallback a sección), fondo por venue
  (`miniBg`), `@Input() onlyIndex` para el canvas. Nombre con `safeName` (bypassSecurityTrustHtml,
  editor enriquecido). Horario y botón con sus helpers (timeIcon/timeColor/… y btnIcon/btnBg/…).
  Título con gradiente por venue (useTitleGradient/getTitleGradient). Inputs `editable`/`previewDevice`/
  `positionsChange` (emite `{venueId, positions}`).
- `migration.service.migrateVenuesToMiniSections` (idempotente, `venues._miniMigrated`): copia el
  estilo de sección + card globales a cada venue para no perder lo existente (Valeria: 1 lugar).
- Backend sin cambios (`ensureConfigDefaults` ya pasa `items` completo).
- Build OK, desplegado. ⚠️ En el CANVAS aún se pinta `app-landing-venues` SIN `onlyIndex` (todos los
  venues apilados en un wrapper, no seleccionables por-venue) → eso se cierra en la Entrega B.

## Entrega B (builder) — HECHA
- canvasState: signal `selectedVenueIndex` (-1 = ninguno). `selectSection` lo resetea.
- Menú: "Lugares" como agrupador (`.is-group`) + sub-entradas "Lugar N" (`venue.label || 'Lugar n'`) con
  CDK dropList propio (`onVenueDrop`), eliminar con confirmación (`removeVenueMini`), "+ Agregar Lugar"
  (`addVenueMini`), `venueItems()`/`selectVenue()`.
- Canvas: `@for` de venues → cada uno en `.preview-section-click data-section="venues:<id>"` con
  `[onlyIndex]=vi`, seleccionable, `[editable]` + `drag-enabled`. Excluido del min-height genérico.
- Props-panel edita el venue activo (helpers `vcard/vIdx/updateVCard/vCardStyle/updateVCardStyle/vTime/
  setVTime/vBtn/setVBtn`; `styleHolder`/`ss`/`setSS`/`sectionMediaModel` redirigidos al venue). Acordeones:
  "Encabezado de la sección" (1ª=title general, resto=heading opcional, unificado), "Contenido"
  (label/título+estilo bicolor/nombre enriquecido/dirección/hora/maps/icono), "Horario" (icono reloj
  del catálogo + fuente/tamaño/color compartido), "Botón Cómo llegar" (texto/icono mapa/colores/forma/
  tipografía, hereda del tema global), "Apariencia de Cards" (por venue vía cardStyle), + "Estilo de
  Sección" común (fondo/transición/animación/adorno). Arrays `venueTimeIconOptions`/`venueBtnIconOptions`.
- Backend: `ensureConfigDefaults` ya pasa `items` completo → sin cambios.

## Entrega C (drag) — HECHA (incluida en el componente + cableada en el canvas)
- Encabezado y card arrastrables/redimensionables por venue (`venue.positions`), lienzo acotado 600/360
  por dispositivo (`.venues-mini-inner.canvas-desktop/.canvas-mobile` + pines `::ng-deep` en el builder).
  Canvas persiste con `onVenuePositionsChange`.

## Ajuste de acordeones (reorganización por tipo) — HECHO
- "Contenido" quedó solo con: nombre en el menú, título (+estilo bicolor) y nombre del lugar (editor
  enriquecido). Se le QUITARON dirección/hora/maps/icono.
- "Horario": ahora incluye el control de HORA (wheel-time-picker) + icono reloj + fuente/tamaño/color.
- Acordeón "Botón Cómo llegar" RENOMBRADO a **"Ubicación"**: contiene Dirección + URL Google Maps +
  los controles del botón (texto/icono/colores/forma/tipografía).
- "Apariencia de Cards": ahora incluye la elección de icono del lugar (Sin icono/Emoji/Imagen) + su
  estilo de contenedor, además del estilo del recuadro (fondo/borde/forma).

## Ajustes de orden y dirección — HECHO
- Landing: HORARIO ahora va ANTES de la dirección (orden pedido). Horario y botón cada uno en su línea
  centrados (`.venue-time` flex centrado; `.venue-maps-btn` display:flex width:fit-content margin auto).
- DIRECCIÓN con editor de texto enriquecido: nuevo `VenueItem.addressHtml` (fallback a `address`);
  landing la pinta con `safeAddress` (bypassSecurityTrustHtml) + `hasAddress`; props-panel usa
  `app-rich-text-editor` en el acordeón "Ubicación".

## Fixes posteriores (misma sesión, tras validación parcial) — HECHOS

### 1. Fondo negro en la DIRECCIÓN (HTML pegado desde web oscura)
- Causa: el `addressHtml` pegado desde Google traía `background-color: rgb(34,36,42)` inline; como se
  renderiza con `bypassSecurityTrustHtml`, pintaba un recuadro negro.
- Fix de raíz en `core/components/rich-text-editor.component.ts`: nuevo handler `onPaste` +
  `sanitizePastedHtml` que depura el HTML pegado (quita `background/box-shadow/border/line-height/
  position/display/...`, degrada `h1-h6` a `span`, elimina nodos basura y atributos `on*`).
- Red de seguridad en `venues.component.ts`: `.venue-name, .venue-address` y descendientes con
  `background: transparent !important; box-shadow: none !important`.
- Dato Valeria (BD local): `REPLACE` quitó el `background-color: rgb(34,36,42);` del addressHtml.

### 2. INTERLINEADO no se respetaba en "Nombre del Lugar"
- Causa: el `nameHtml` pegado traía un `<h1>` con `line-height: 1.75rem` inline FIJO que pisaba el
  line-height del `<div>` contenedor donde el editor aplica el interlineado.
- Fix en el editor: `execLineHeight` ahora limpia el `line-height` inline de TODOS los descendientes
  del bloque antes de aplicar el elegido (`clearLineHeightDescendants`). Además `line-height` entró a
  la lista de props prohibidas al pegar.
- Dato Valeria (BD local): `REPLACE` eliminó el `line-height: 1.75rem;` fijo del config.

### 3. OPACIDAD de card distinta a las demás secciones (doble opacidad)
- Causa: la card multiplica dos opacidades (alpha del color picker × `cardBgOpacity`). En el resto de
  secciones `cardBgOpacity` queda neutro (100) y manda solo el alpha; pero los venues arrastraban
  `cardBgOpacity` 30/vacío de la migración → la opacidad "cambiaba" respecto al picker.
- Fix: `getCardBgOpacity` en venues devuelve SIEMPRE 100 (ignora el heredado) → la opacidad viene solo
  del alpha del color picker, igual que las demás secciones. Se quitó el slider de opacidad que se
  había añadido por error al panel de Lugares.
- Dato Valeria (BD local): script `scripts/migrate-valeria/fix-venue-card-opacity.js` (ignorado por
  git) normalizó `cardBgOpacity` a 100 en los 2 venues.

## Encabezado de sección que se oculta si queda vacío (tema aparte, misma sesión)
- Si el usuario borra el título del encabezado, la sección NO muestra el encabezado (ni título, ni
  adorno, ni líneas). Solo se usa el default cuando el campo nunca se definió (legacy = undefined).
- Backend `ensureConfigDefaults.js`: `||` → `??` en `title` de details/itinerary/gallery/dresscode/
  gifts/rsvp (el `||` convertía `''` de vuelta al default).
- Frontend: `details`/`venues` ya tenían `headingText()` con `?? default` + `@if (headingText())`. Se
  replicó el patrón (helper + envoltura `@if`) en itinerary/gallery/dresscode/gifts/register/rsvp.

## Pendiente
- [ ] Validación visual final del usuario (builder + landing de Valeria, Ctrl+F5) + GUARDAR para
  persistir la migración de cards/venues.
- [ ] "No se ajustan bien los controles" (time-picker/chips/sliders apretados en el panel): pendiente
  de que el usuario señale cuáles exactamente para afinar el CSS sin afectar otras secciones.
- [ ] PRODUCCIÓN: al desplegar, replicar en el server los 3 fixes de datos de Valeria (fondo negro de
  dirección, line-height fijo, cardBgOpacity→100). El script `fix-venue-card-opacity.js` sirve para el
  tercero; los otros dos son `REPLACE` puntuales ya documentados arriba.
