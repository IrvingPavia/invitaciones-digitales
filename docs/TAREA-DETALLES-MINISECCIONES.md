# Tarea — Detalles como MINI-SECCIONES por card (drag & drop selectivo)

> **Estado:** EN CURSO. Rama `feature/drag-elementos-secciones`. Fase 1 ✅.
> **Fecha inicio:** 2026-10-16

## Objetivo (acordado con el usuario)

Convertir la sección **Detalles** (hoy 1 sección con N cards apiladas) en **N mini-secciones**, una
por card, para poder posicionar (drag & drop) cada card de forma independiente.

### Reglas acordadas
- Cada card = **mini-sección real** con **alto FLEXIBLE** (crece/encoge según su contenido, NO
  forzada a 100vh). El fondo de la mini-sección se adapta a su alto; si la imagen no cuadra, se ve el
  fondo global fijo detrás (el cliente debe proveer imágenes acordes).
- Cada card es **UN solo objeto arrastrable** (como la card de Invitación): el recuadro con su
  título+contenido adentro se mueve/redimensiona como una unidad.
- Cada mini-sección tiene **su propio encabezado** (campo `heading`). Si está vacío, NO se muestra el
  objeto. En la **PRIMERA** card el encabezado es el título general de Detalles (`details.title`,
  "Con el amor de las personas...").
- Cada card tiene **sus propias propiedades**: Estilo de Card (apariencia del recuadro) + Estilo de
  Sección (fondo, transición, texto, animación, adorno).
- **Retrocompatible**: si una card no define `sectionStyle`/`cardStyle`, hereda el de la sección
  (comportamiento actual). Valeria (2 cards: Mis Padres / Mis Padrinos) no se debe romper.

### DISEÑO FINAL (Opción A, confirmado 2026-10-16)
- **Modelo:** se mantiene `config.details.cards[]` como almacén (retrocompatible). Cada card se
  COMPORTA como una sección independiente en UI y landing, pero por debajo sigue siendo una card del
  array. El "+ Agregar Detalle" hace push al array; eliminar hace splice; reordenar mueve en el array.
- **Menú de secciones:** la entrada "Detalles" es un ENCABEZADO AGRUPADOR (no seleccionable como
  sección). Debajo, indentadas, las sub-entradas **"Detalle 1", "Detalle 2", …** (numeradas; `card.label`
  permite renombrar; vacío = "Detalle {n}"). "Detalle 1" existe por defecto (1ª card siempre).
  Botón **"+ Agregar Detalle"** al final del grupo. Cada "Detalle N" con botón ELIMINAR + confirmación
  (DialogService.confirm). Reordenamiento con drag SOLO DENTRO del grupo Detalles (CDK dropList propio,
  no se mezclan con otras secciones) → reordena `cards[]`.
- **Selección:** al clickear "Detalle N" se selecciona esa card. Como `selectedSection` es un string,
  se usará un identificador tipo `details:<cardId>` (o un signal aparte `selectedDetailIndex`) para
  saber qué card está activa. DECIDIR en impl: lo más simple es un signal `selectedDetailCardId` en
  canvasState/builder + que el props-panel lea esa card.
- **Props-panel:** al seleccionar "Detalle N" edita ESA card: nombre (label), encabezado (heading),
  contenido, icono/alineación, Apariencia de Card PROPIA (cardStyle) y Estilo de Sección PROPIO
  (sectionStyle). Se QUITA el add/remove del acordeón viejo "Cards de Detalles".
- **Campos nuevos en DetailCard:** `label?` (nombre en menú), `heading?` (encabezado visible),
  `sectionStyle?`, `cardStyle?`, `positions?`. Todos opcionales/retrocompatibles.

## Modelo (Fase 1 — HECHA)

En `core/models/models.ts`:
- Nueva interface `CardStyle` (showCardBg, cardBgColor, cardBgOpacity, cardBorderStyle,
  cardBorderWidth, cardBorderColor, cardGlowColor, cardShape, cardBorderRadius). Todo opcional.
- `DetailCard` extendido con: `heading?`, `sectionStyle?: SectionStyle`, `cardStyle?: CardStyle`,
  `positions?: ElementPositions`.
- Build OK.

## Plan por fases

- [x] **Fase 1 — Modelo** (`CardStyle` + campos en `DetailCard`). Build OK.
- [x] **Fase 2 — Landing (ENTREGA A, HECHA)** (`details.component.ts`): REESCRITO. Cada card es ahora
      una `<section class="details-mini">` independiente (alto flexible `padding:48px 20px`, sin
      100vh). Encabezado por card vía `headingText(card,i)` (1ª usa `config.title`; resto `card.heading`;
      vacío = oculto). TODOS los helpers de estilo pasan a recibir `card` y resolver por card con
      fallback: estilo de card `cs(card)` = `card.cardStyle` > campos sueltos de `config` (retrocompat);
      estilo de sección `ss(card)` = `card.sectionStyle` > `this.sectionStyle`. Fondo propio por card
      con `miniBg(card)` (solid/linear/image con `auto 100%` centrado, REGLA R3; transparent si no hay).
      ⚠️ FALTA en entregas siguientes: envolver la card en `app-drag-box` (ahora es estática).
- [x] **Fase 7 parcial — Backend/retrocompat**: `ensureConfigDefaults` ya hace `cards: cfg.details?.cards||[]`
      → pasa el array completo con los campos nuevos. NO requiere cambios. Valeria (2 cards sin estilos
      propios) debe heredar y verse igual.
- [ ] **PENDIENTE verificación usuario (Entrega A):** abrir la LANDING real de Valeria y confirmar que
      Detalles (Mis Padres / Mis Padrinos) se ve igual que antes. ⚠️ En el CANVAS puede verse doble
      fondo (wrapper de sección + mini) hasta la Entrega B (Fase 3).
- [x] **Fase 3 — Canvas (ENTREGA B)**: cada card se pinta como `.preview-section-click` propio
      (`data-section="details:<id>"`) con `[onlyIndex]=di`, seleccionable, sin inyectar getSectionBgStyle
      (el fondo/estilo lo resuelve el componente por card). `app-landing-details` ganó `@Input() onlyIndex`
      + `visibleCards()`.
- [x] **Fase 4 — Menú de secciones (ENTREGA B)**: "Detalles" como encabezado agrupador (`.is-group`);
      sub-entradas "Detalle N" (`card.label || 'Detalle n'`) con drag (CDK `onDetailDrop`) SOLO dentro
      del grupo, botón eliminar por card (confirmación DialogService) y botón "+ Agregar Detalle".
      Métodos en builder: `detailCards`/`selectDetail`/`addDetail`/`removeDetail`/`onDetailDrop`.
      `selectSection` resetea `selectedDetailIndex=-1`. Signal `selectedDetailIndex` en canvasState.
- [x] **Fase 5 — Props-panel (ENTREGA B)**: al seleccionar "Detalle N" edita ESA card (helpers
      `dcard()`/`dIdx()`/`updateDCard()`/`updateDCardStyle()`/`dCardStyle()`/`styleHolder()`). Contenido
      (label/heading/title/content/icon/align), Apariencia de Card PROPIA (card.cardStyle), y Estilo de
      Sección PROPIO (ss/setSS/sectionMediaModel/ornamento redirigidos a la card vía styleHolder).
      "Estilo de Sección" se oculta en details sin card seleccionada. Add/remove viejo del acordeón
      "Cards de Detalles" ELIMINADO (ahora en el menú). La 1ª card muestra acordeón "Encabezado de la
      sección" (edita details.title).
- [x] **Fase 7 — Backend/retrocompat**: `ensureConfigDefaults` ya pasa `cards` completo (no requirió
      cambios). Build OK, frontend reconstruido.
- [ ] **PENDIENTE verificación usuario (Entrega B):** en el BUILDER: menú muestra Detalles > Detalle 1,
      Detalle 2 + "Agregar Detalle"; seleccionar cada uno edita su contenido/estilo propio; agregar/
      eliminar (con confirmación) y reordenar funcionan; cada card con fondo/estilo propio. ⚠️ El DRAG
      (mover la card en el lienzo) aún NO está (Entrega C).
- [x] **Fix post-Entrega B (fallback de estilos + migración Opción 2 + botón eliminar)**:
      - BUG: el fondo de imagen aparecía en todas las cards cuando el toggle "Estilo de Sección" estaba
        APAGADO (y desaparecía al activarlo). Causa: `ss(card)`/`cs(card)` hacían fallback a
        `this.sectionStyle`/campos sueltos de la sección global, que en Valeria SÍ tenían fondo.
      - FIX: en `details.component.ts` se QUITÓ el fallback → `ss(card)=card.sectionStyle`,
        `cs(card)=card.cardStyle||{}`. Cada card usa SOLO lo suyo; sin estilo propio, el texto cae al
        tema global.
      - MIGRACIÓN Opción 2 (migration.service `migrateDetailsToMiniSections`, idempotente vía
        `details._miniMigrated`): copia UNA vez el `details.sectionStyle` global y los campos de card
        sueltos (showCardBg/cardBg.../cardShape) a cada `card.sectionStyle`/`card.cardStyle`, para no
        perder lo ya configurado (Valeria conserva su fondo/estilos en ambas cards y quedan
        independientes). Respeta `card.showCardBg`/`cardBorderRadius` per-card previos.
      - Botón eliminar del menú ahora con fondo/borde rojizo y hover sólido (antes casi invisible).
      - ⚠️ Tras migrar, el toggle "Estilo de Sección" aparece ACTIVADO por card (esperado: cada card ya
        tiene su sectionStyle con el fondo). Build OK, desplegado. Falta validación del usuario.
- [x] **Fix 2 post-B (título con recuadro de color + fondo pequeño/cortado)** — context-gatherer:
      - BUG título (recuadro de color): `[style.background-image]="getTitleGradient()"` se aplicaba
        SIEMPRE (lee del tema global) mientras `[class.gradient-text]` dependía de la card. Si la card
        migrada tenía `headingColor` Y el tema global `titleStyle.color2` → se pintaba el gradiente
        como fondo de BLOQUE sin la clase que lo recorta al texto. FIX: `[style.background-image]="useTitleGradient(card) ? getTitleGradient() : null"`.
      - BUG fondo pequeño: `miniBg` usaba `auto 100%` SIEMPRE y `.details-mini` tenía alto flexible
        (padding 48px) → "100%" = alto corto del contenido → imagen chica. Además ignoraba fit/
        bannerWidth/overlay/override desktop. FIX: `miniBg` ahora usa `resolveMedia(sectionStyleToMedia(ss),
        isDesktopBg)` → cover = llena; banner = `auto 100%` centrado (no deforma); aplica overlay. Nuevo
        `@Input() previewDevice` + getter `isDesktopBg`. Clase `.details-mini.has-image-bg` → `min-height:100svh`
        + centrado vertical (para que la imagen se dimensione a pantalla, no al alto corto). Canvas pasa
        `[previewDevice]`. Build OK, desplegado. Falta validación.
- [x] **Fix 3 post-B (alto de mini-sección = pantalla + quitar opacidad duplicada)**:
      - ALTO: ahora TODAS las `.details-mini` usan `min-height: var(--canvas-vh, 100svh)` + centrado
        vertical → arrancan con el alto de pantalla (dispositivo/desktop) y crecen si el contenido se
        alarga (igual que las demás secciones). En canvas se excluyó `data-section^="details:"` del
        min-height genérico del wrapper para no sumar doble alto.
      - OPACIDAD: se quitó el slider "Opacidad fondo" del acordeón Apariencia de Cards (redundante; el
        color-picker ya trae el alfa embebido). La opacidad va en el color rgba/hex8.
      - Build OK, desplegado.
- [x] **Fase 6 — Drag (ENTREGA C) — HECHA**: en `details.component.ts` el encabezado y la card se
      envuelven en `app-drag-box` (objeto único por tipo), con posiciones POR CARD (`card.positions`,
      mapas mobile/desktop). Objetos arrastrables: `heading` (solo si hay encabezado) y `card`.
      Helpers `hasAnyPosition(card)/pos(card,key)/posData(card,key)/resolvePos/onPosChange(card,key,pos)`.
      El lienzo `data-drag-bounds` es `.details-mini-inner`, acotado a ancho FIJO por dispositivo
      (`.canvas-desktop`=600 / `.canvas-mobile`=360, REGLA R1/R4, getters `fgDesktop`/`fgMobile`) en modo
      posicionado + pines `::ng-deep` en el builder. Inputs nuevos: `editable`, `positionsChange`
      (emite `{cardId, positions}`). El canvas pasa `[editable]` + `drag-enabled` y persiste con
      `onDetailPositionsChange` (busca la card por id). Modo posicionado: al mover el 1º, siembra
      heading+card con su posición efectiva (salta heading si vacío). Guías de alineación añadidas.
      Build OK, desplegado. Falta validación del usuario.
      ⚠️ El `data-drag-bounds` acotado y el fondo que llena el marco conviven: el fondo va en
      `.details-mini` (llena), el lienzo en `.details-mini-inner` (fijo). Revisar en validación que el
      modo posicionado no rompa el alto (la mini sigue con min-height var(--canvas-vh,100svh)).
- [x] **Mejora UX props-panel (controles de texto movidos a "Contenido")**: los controles de estilo de
      texto (Encabezado/Título/Contenido: fuente/color/tamaño/degradado) se MOVIERON del acordeón "Texto
      de Sección" al acordeón "Contenido" de cada Detalle, junto a los campos de texto. El acordeón
      "Texto de Sección" se OCULTA en Detalles (`@if selectedSection!=='details'`). Siguen escribiendo en
      `card.sectionStyle` vía `ss()`/`setSS()` (sin cambio de render); heredan del Tema Global y lo
      sustituyen si se configuran. El sub-grupo "Encabezado" solo aparece si la card tiene encabezado
      (1ª card o con `heading`). Nota: el control de Contenido es la BASE del editor enriquecido (si el
      usuario aplica estilos inline en el editor, esos mandan). Build OK, desplegado.
- [x] **Ajuste props-panel 2 (texto junto a su campo + contenido solo por editor + fix render)**:
      - Estilo del ENCABEZADO ahora en el acordeón "Encabezado de la sección" (1ª card) / junto al campo
        heading (2ª+); estilo del TÍTULO junto al campo título. Cada estilo pegado a su texto.
      - CONTENIDO: se quitaron los controles de texto del props-panel (el contenido se estiliza SOLO
        desde la barra del editor enriquecido). Nota en el panel.
      - FIX render: `.detail-content` ya NO fuerza color/font/size inline (pisaban el HTML del editor →
        el canvas no reflejaba lo editado). El tema global pasa a ser BASE HEREDABLE vía variables CSS
        (`--dc-font/--dc-size/--dc-color`) en la regla `.detail-content`; los `<span style>` del editor
        GANAN. Build OK, desplegado.
- [x] **Ajuste props-panel 3 (gradiente título + contenido refleja editor + alineación duplicada)** —
      context-gatherer:
      - BUG gradiente bicolor del título NO aplicaba: `useTitleGradient` se desactivaba justo cuando la
        card tenía `headingColor`, y `getTitleGradient()` leía del tema GLOBAL (ignoraba la card). FIX:
        `useTitleGradient(card)` = true si la card tiene `headingColor2` (degradado propio), false si solo
        `headingColor` (color plano), si no cae al global; `getTitleGradient(card)` resuelve color1/color2/
        ángulo/intensidad desde `card.sectionStyle` con fallback al tema global. Binding pasa `card`.
      - BUG contenido no reflejaba el editor en el canvas: `[innerHTML]="card.content"` crudo → Angular
        SANEA y ELIMINA los `style` inline de los spans del editor. FIX: inyectado `DomSanitizer` +
        `safeContent()` cacheado con `bypassSecurityTrustHtml` (patrón hero/envelope/intro; el contenido
        ya se sanea en backend). Binding `[innerHTML]="safeContent(card.content)"`. Las variables `--dc-*`
        quedan como base heredable para el texto sin estilizar.
      - Quitado el control "Alineacion" del props-panel de Detalles (la alineación ya está en el editor
        de texto; estaba duplicada). También se quitó el `[style.text-align]` del `.detail-content`.
      - Build OK, desplegado.
- [x] **Ajuste props-panel 4 (acordeón "Encabezado" unificado para todas las cards)**: ahora TODAS las
      cards tienen el acordeón "Encabezado de la sección" arriba (antes solo la 1ª; las demás lo tenían
      dentro de "Contenido"). 1ª card edita `details.title` (encabezado general); las demás `card.heading`
      (opcional, vacío = sin encabezado). El estilo del encabezado (fuente/tamaño/color) va dentro del
      acordeón, visible si hay encabezado (1ª o `heading` no vacío). Build OK, desplegado.
- [ ] **Fase 2b (histórica, ya cubierta por Entrega A):** renderizar cada card como BLOQUE independiente
      (lienzo `data-drag-bounds` propio, alto flexible, fondo propio adaptable al alto). Encabezado
      por card (vacío = oculto); 1ª card usa `details.title`. Helpers de estilo resueltos POR CARD
      (card.cardStyle/sectionStyle > sección > global). Card = objeto único arrastrable (patrón de
      la card de Invitación con app-drag-box). Inputs `editable`/`previewDevice`/`(positionsChange)`.
- [ ] **Fase 3 — Canvas builder** (`builder.component.ts`): pintar cada card como `.preview-section-click`
      seleccionable independiente (data-section="details:<cardId>" o similar), pasar editable/
      previewDevice/drag y fondo por card (getSectionBgStyle por card).
- [ ] **Fase 4 — Menú de secciones** (`builder.component.ts`): sub-selectores bajo Detalles (uno por
      card) + botón "+ Agregar Detalle" + botón eliminar por card con confirmación (DialogService).
- [ ] **Fase 5 — Props-panel** (`props-panel.component.ts`): al seleccionar una card, mostrar SUS
      propiedades (contenido + heading + Apariencia de Card propia + Estilo de Sección propio).
      Quitar add/remove del acordeón (movido al menú).
- [ ] **Fase 6 — Drag**: card arrastrable/redimensionable como objeto único (maxSize/posMargin como
      Invitación); encabezado arrastrable en cada mini-sección (oculto si vacío).
- [ ] **Fase 7 — Backend/retrocompat + verificación**: `ensureConfigDefaults` preserva los nuevos
      campos de card (spread). Verificar que Valeria se ve igual. Reconstruir y validar.

## Notas técnicas
- `DialogService.confirm(title, message, 'Eliminar')` → `Promise<boolean>` (ya existe en
  `core/services/dialog.service.ts`). Usar para la confirmación de borrado.
- Patrón de referencia para "card como objeto único + drag": sección Invitación
  (`invitation.component.ts`, objeto `card` con `app-drag-box`, `[maxSize]=100`, `[posMargin]=0`).
- Estilo de card hoy (sección): cardBgColor, cardBorderColor, cardBorderStyle, cardBorderWidth,
  cardGlowColor, cardShape, cardBorderRadius, showCardBg, cardBgOpacity (helpers get* en
  details.component). Pasarán a resolver por card con fallback a sección.
- ⚠️ Alto flexible: NO aplicar `min-height:100svh`/`--canvas-vh` a estas mini-secciones (a diferencia
  del resto). Deben crecer con el contenido.
