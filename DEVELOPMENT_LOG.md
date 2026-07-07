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

## Estado actual del proyecto: 2025-07-01

### Rama activa: `feature/dashboard-redesign`

### Lo que esta funcionando:
- **Page Builder Visual** completo con canvas + preview iframe
- **Panel de propiedades** con acordeones para todas las secciones
- **Toggle Canvas/Preview** — Canvas para editar, Preview con landing real en iframe
- **Intro con loop**, transiciones de salida (7 tipos), particulas reactivas, stepper duracion
- **Dropdown menus** para acciones en grids (Eventos, Usuarios, Invitados)
- **Itinerario rediseñado** — iconos sobre la linea, time picker, emoji grid, controles de estilo
- **Dashboard layout** — height 100vh, sidebar fixed, main-content scrollable
- **Light mode** completo para el builder (tonos purpura)
- **Responsive toolbar** del builder (wrap a 850px)

---

## PROXIMA SESION — Plan de trabajo

### 1. AG Grid (Prioridad Alta)
**Objetivo**: Reemplazar tablas HTML por AG Grid Community para resolver sticky headers, scroll horizontal visible, y paginacion.

**Fase 1 — Eventos** (~30 min)
- Importar `AgGridAngular` en events component
- Definir `ColDef[]`: Nombre, Tipo, Fecha, Invitados, Confirmados, Estado, Acciones
- Cell renderer para badges (tipo, estado)
- Cell renderer para acciones (dropdown menu)
- Tema oscuro personalizado (dark-blue)
- Paginacion 50 por pagina

**Fase 2 — Usuarios** (~20 min)
- Replicar patron de Eventos
- Columnas: Usuario, Rol, Contrasena, Gestion, Eventos, Creado, Acciones

**Fase 3 — Invitados** (~20 min)
- Columnas: Codigo, Tipo, Familia/Nombre, Telefono, Estado, Enviado, Acciones
- Filtro rapido integrado (reemplaza barra de busqueda)

**Fase 4 — Estilos globales** (~15 min)
- CSS tema oscuro para ag-grid (colores purpura/gold)
- Light mode overrides
- Responsive: ocultar columnas en mobile

**Notas tecnicas:**
- AG Grid v36 ya instalado en package.json
- Usar `AgGridAngular` standalone component
- `ColDef` con `cellRenderer` para badges/acciones
- `domLayout: 'normal'` + height fijo para scroll interno
- `pagination: true, paginationPageSize: 50`

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

## Archivos clave para la proxima sesion

- `frontend/src/app/dashboard/pages/events/events.component.ts`
- `frontend/src/app/dashboard/pages/users/users.component.ts`
- `frontend/src/app/dashboard/pages/guests/guests.component.ts`
- `frontend/src/styles.scss` (seccion TABLE y AG Grid theme)
- `frontend/package.json` (ag-grid-angular: ^36.0.0 ya instalado)

---

## Docker

- **Rebuild frontend**: `docker-compose up -d --build frontend` en `c:\Portafolio\invitaciones-digitales`
- **GitHub**: IrvingPavia/invitaciones-digitales
- **Rama**: feature/dashboard-redesign
