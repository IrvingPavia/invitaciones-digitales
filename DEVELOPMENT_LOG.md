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

## Estado actual del proyecto: 2025-07-07

### Rama activa: `feature/dashboard-redesign`

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
