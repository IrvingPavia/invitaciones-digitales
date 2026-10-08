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

## Estado actual del proyecto: 2026-10-08

### Rama activa: `feature/canvas-posicionamiento`

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
