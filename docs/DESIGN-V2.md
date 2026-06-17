# 🎨 Vitely v2 — Documento de Diseño

> Visión completa para la evolución del proyecto. Incluye rediseño del dashboard, landing de presentación y page builder visual.

---

## Paleta de Colores

| Rol | Color | Uso |
|-----|-------|-----|
| Background principal | `#0a0a14` | Fondo general del dashboard |
| Background elevado | `#12121f` | Cards, sidebar, modales |
| Glow primario | `#7c5cbf` | Acento principal, botones, borders activos |
| Glow secundario | `#9d6ee7` | Hover states, highlights |
| Glow terciario | `#c084fc` | Gradientes, efectos de luz |
| Texto primario | `#ffffff` | Títulos, contenido principal |
| Texto secundario | `rgba(255,255,255,0.6)` | Subtítulos, labels |
| Texto muted | `rgba(255,255,255,0.35)` | Hints, placeholders |
| Border glass | `rgba(255,255,255,0.08)` | Bordes de cards/contenedores |
| Success | `#10b981` | Confirmaciones, estados positivos |
| Danger | `#ef4444` | Errores, eliminar |
| Warning | `#f59e0b` | Alertas |

---

## Fase 1 — Dashboard Redesign

### 1.1 Layout General

```
┌─────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░ BACKGROUND CON GLOW ░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ┌─────────┐ ┌────────────────────────────────────────┐  │ │
│ │ │         │ │ TOP BAR: Logo | Search | Theme | User  │  │ │
│ │ │ SIDEBAR │ ├────────────────────────────────────────┤  │ │
│ │ │  with   │ │                                        │  │ │
│ │ │  glow   │ │         CONTENIDO PRINCIPAL            │  │ │
│ │ │         │ │         (router-outlet)                │  │ │
│ │ │         │ │                                        │  │ │
│ │ └─────────┘ └────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Efectos visuales clave

- **Glow ambiental**: Gradiente radial púrpura que emana desde el centro-izquierdo del layout
- **Contenedor glass**: Todo el dashboard dentro de un div con `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 24px`, `backdrop-filter: blur(12px)`
- **Background rays**: Fondo con rayos diagonales sutiles (CSS gradients cónicos)
- **Cards**: Glassmorphism con `background: rgba(18,18,31,0.7)`, border glass, hover glow

### 1.3 Sidebar

- Logo "Vitely" con tipografía estilizada arriba
- Categorías con labels separadores (MENÚ, EQUIPO)
- Item activo: fondo con glow + border-left púrpura
- Avatar de usuario en la parte inferior
- En tablet: colapsa a solo íconos manteniendo glow
- Barra de búsqueda con shortcut ⌘K (decorativa por ahora)

### 1.4 Top Bar

- Ancho completo arriba del contenido (no del sidebar)
- Izquierda: Breadcrumb o título de página
- Derecha: Botón tema (con animación clip-path), nombre + avatar del usuario
- Border-bottom glass sutil

### 1.5 Transición de tema (dark/light)

- Al hacer click en el botón sol/luna, se dispara una animación `clip-path: circle()` que se expande desde el botón hasta cubrir toda la pantalla con el nuevo tema
- Duración: ~600ms
- Implementación: CSS `view-transition-api` o fallback con `clip-path` animado

### 1.6 Welcome message

- En la página Home: "Hola, {nombre} 👋" con Montserrat bold grande
- Debajo: fecha actual, resumen de actividad

---

## Fase 2 — Landing de Presentación del Producto

### 2.1 Ruta

- `/` → Landing pública (presentación de Vitely)
- `/login` → Login (se mantiene)
- `/dashboard` → Dashboard (autenticado)

### 2.2 Estructura de la página

```
┌─────────────────────────────────────────┐
│ Nav: Logo | Features | Pricing | Login  │
├─────────────────────────────────────────┤
│ HERO: Animación + Título + CTA          │
│ "Crea invitaciones digitales únicas"    │
│ [Ver demo] [Iniciar sesión]             │
├─────────────────────────────────────────┤
│ FEATURES: 3-4 cards con beneficios      │
│ Landing personalizable | QR | RSVP      │
├─────────────────────────────────────────┤
│ DEMO: Preview interactivo de una        │
│ invitación de ejemplo                   │
├─────────────────────────────────────────┤
│ FOOTER: Links | Copyright               │
└─────────────────────────────────────────┘
```

### 2.3 Animaciones (GSAP, $0)

- **Hero**: Texto que aparece con stagger animation, partículas/estrellas flotantes con canvas
- **Scroll reveal**: Secciones que aparecen al scrollear (similar al landing de invitaciones)
- **Parallax sutil**: Elementos decorativos que se mueven a diferente velocidad
- **Hover interactivos**: Cards de features con tilt 3D al pasar el mouse

### 2.4 Dependencias

- `gsap` (~25KB gzipped) — animaciones
- CSS: partículas, parallax, gradientes animados
- Sin Three.js por ahora (se puede agregar después para un hero más impactante)

---

## Fase 3 — Page Builder Visual (Editor de Landing)

### 3.1 Concepto

Reemplazar el sistema actual de tabs+formularios por un editor visual donde el usuario:
1. Ve su landing en tiempo real (preview central)
2. Arrastra componentes de un panel lateral al canvas
3. Selecciona un componente para editar sus propiedades
4. Reordena secciones con drag & drop
5. Recibe sugerencias del asistente inteligente

### 3.2 Layout del editor

```
┌──────────────────────────────────────────────────────────┐
│ TOOLBAR: ← Volver | Evento | 💾 Guardar | 📱 Responsive │
├────────┬─────────────────────────────────┬───────────────┤
│ PANEL  │                                 │  PROPIEDADES  │
│ COMPO- │     CANVAS / PREVIEW            │  DEL BLOQUE   │
│ NENTES │     (landing renderizada)       │  SELECCIONADO │
│        │                                 │               │
│ [Hero] │  ┌───────────────────────┐      │  Título: ____ │
│ [Count]│  │ Vista previa de la    │      │  Color: ████  │
│ [Detai]│  │ landing tal como se   │      │  Fondo: ____  │
│ [Venue]│  │ verá en el celular    │      │  Font: ____   │
│ [Galer]│  │ del invitado          │      │               │
│ [RSVP] │  └───────────────────────┘      │  [Presets]    │
│        │                                 │  [Asistente]  │
├────────┴─────────────────────────────────┴───────────────┤
│ ASISTENTE: "💡 Tip: Agrega una galería de fotos..."      │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Componentes arrastrables

| Componente | Propiedades |
|-----------|-------------|
| Hero | Nombres, countdown, frase, fondo, audio |
| Invitación | Título, subtítulo, estilo |
| Detalles | N cards con ícono + texto |
| Lugares | Cards con mapa, dirección, hora |
| Itinerario | Timeline de actividades |
| Galería | Fotos + estilo de visualización |
| Vestimenta | Cards con imágenes de ejemplo |
| Regalos | Link + transferencia bancaria |
| RSVP | Formulario de confirmación |
| Separador | Línea, espacio, divider decorativo |
| Texto libre | Párrafo editable |

### 3.4 Asistente inteligente ($0, basado en reglas)

| Tipo de regla | Ejemplo |
|---------------|---------|
| Completitud | "Tu invitación está al 60%. Falta: galería, mesa de regalos" |
| Contraste | "El texto blanco sobre fondo claro es poco legible" |
| Contexto por tipo | "Para bodas, recomendamos incluir sección de vestimenta" |
| Orden sugerido | "La galería funciona mejor después de la invitación" |
| Textos ejemplo | "¿No sabes qué escribir? Aquí tienes ejemplos para XV años" |
| Auto-align | Guías magnéticas al mover/redimensionar |
| Performance | "La galería tiene 30 fotos. Recomendamos máximo 15 para carga rápida" |

### 3.5 Migración

- El sistema actual (config JSON) se mantiene como almacenamiento
- El page builder es una nueva UI que lee/escribe el mismo config JSON
- Los landing pages existentes siguen funcionando sin cambios
- El viejo editor de tabs podría mantenerse como "modo avanzado"

---

## Plan de Implementación por Fases

### Fase 1A — Dashboard Glow & Glass (2-3 sesiones)
1. Background con glow ambiental + rayos
2. Contenedor glass principal (border + radius + blur)
3. Sidebar rediseñado con glow y categorías
4. Top bar con usuario + búsqueda
5. Cards con glassmorphism
6. Transición de tema animada

### Fase 1B — Dashboard UX (1-2 sesiones)
7. Welcome message personalizado
8. Progress/completitud de evento
9. Animaciones de entrada (stagger en cards)
10. Responsive con glow adaptado

### Fase 2 — Landing de Presentación (2-3 sesiones)
11. Ruta / con página pública
12. Hero con GSAP animations
13. Secciones de features
14. Demo preview interactivo
15. Responsive + partículas

### Fase 3A — Page Builder Base (en progreso)
16. [x] Layout del editor (3 paneles: componentes, preview, propiedades)
17. [x] Lista de secciones con toggle enabled/disabled
18. [x] Drag & drop para reordenar secciones (CDK)
19. [x] Preview responsive (mobile/tablet/desktop)
20. [x] Botón "Builder" accesible desde dashboard
21. [ ] Edición inline: click en texto del preview → editar directamente
22. [ ] Panel de propiedades funcional: al seleccionar sección muestra controles reales (colores, fuentes, toggles)
23. [ ] Guardar cambios de propiedades en tiempo real al config JSON
24. [ ] Preview reactivo: se actualiza al editar

### Fase 3B — Libertad de posición (canvas por bloque)
25. [ ] Cada sección es un "canvas" donde los elementos internos se posicionan libremente
26. [ ] Drag de elementos dentro de su sección (x%, y%)
27. [ ] Resize de elementos (width, height)
28. [ ] Snap guides / alineación magnética
29. [ ] Modelo de datos: posiciones por elemento en config JSON

### Fase 3 — Concepto Híbrido

El page builder usa un modelo **híbrido**:
- **Entre secciones**: apiladas verticalmente, reordenables con drag
- **Dentro de cada sección**: libertad de posición tipo canvas (Fase 3B)
- **Panel de propiedades**: siempre visible al seleccionar un elemento
- **Edición inline**: textos editables con click directo

```
┌─── SECCIÓN: HERO (canvas interno) ────────┐
│  [Título] ← movible con drag (x%, y%)     │
│  [Countdown] ← movible con drag           │
│  [Frase] ← movible con drag               │
└────────────────────────────────────────────┘
         ↕ (drag vertical = reordenar secciones)
┌─── SECCIÓN: DETALLES (canvas interno) ────┐
│  [Card 1] [Card 2] ← movibles con drag    │
└────────────────────────────────────────────┘
```

---

## Dependencias a instalar

| Paquete | Uso | Tamaño |
|---------|-----|--------|
| `gsap` | Animaciones (landing presentación + dashboard) | ~25KB gz |
| `@angular/cdk` | Drag & drop para page builder | Ya incluido en Angular |

**Total costo: $0**

---

## Archivos principales a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/app/public/` | Nuevo módulo: landing de presentación |
| `frontend/src/app/dashboard/` | Rediseño completo de estilos |
| `frontend/src/app/builder/` | Nuevo módulo: page builder visual |
| `frontend/src/styles.scss` | Variables de paleta + glass utilities |
| `frontend/src/app/app.routes.ts` | Nueva ruta `/` para landing pública |

---

## Notas

- El page builder lee/escribe el mismo `config_json` — no requiere cambios en backend
- La landing de presentación es 100% frontend (componente estático + animaciones)
- El asistente corre en frontend (reglas hardcodeadas, sin API)
- Cada fase es independiente y deployable por separado


---

## Progreso de Implementación

### Fase 1A — Dashboard Glow & Glass ✅
- [x] Background oscuro profundo (#06060e) con glow ambiental sutil
- [x] Sidebar flotante con border-radius 20px, glass bg, glow border púrpura
- [x] Main content flotante con matching glass border + glow
- [x] Layout con padding/gap 12px (paneles flotantes)
- [x] Nav item activo: fondo translúcido + borde brillante + box-shadow glow
- [x] Dark mode: glow intenso (rgba 101,32,246 0.4)
- [x] Light mode: glow sutil + colores adaptados

### Fase 1B — Dashboard UX (en progreso)
- [x] Top bar con perfil de usuario (nombre + avatar circular púrpura)
- [x] Botón toggle tema (sol/luna) movido al top bar
- [x] Dropdown "Cerrar sesión" al click en avatar (cierra al click fuera)
- [x] Sidebar footer eliminado (todo movido al top bar)
- [x] Collapse del sidebar: flecha en zona del logo (solo visible expandido), click en favicon para expandir
- [x] user-select: none en todo el dashboard
- [x] Light mode fixes: username color, dropdown styling, hover states
- [ ] Welcome message personalizado ("Hola, {nombre}")
- [ ] Transición de tema animada (clip-path circle)
- [ ] Cards con glassmorphism refinado
- [ ] Responsive con glow adaptado

### Fase 2 — Landing de Presentación (pendiente)
### Fase 3 — Page Builder Visual (pendiente)


---

## Ideas Adicionales (por implementar)

### Animación de selección en sidebar
- Al seleccionar un item del sidebar, el botón activo debe tener una animación tipo **flash/shimmer** que recorra el botón de derecha a izquierda (como un brillo que pasa sobre el fondo)
- Implementación CSS: `@keyframes shimmer` con un gradiente lineal translúcido que se mueve con `background-position` o un pseudo-elemento `::after` que se desplaza

### Transiciones de entrada del contenido
- Al cambiar de módulo (click en sidebar), los elementos del contenido deben entrar con animaciones **staggered** (uno por uno con delay):
  - Los cards/items aparecen con fade-in + translateY desde abajo
  - Cada item tiene un delay incremental (0ms, 50ms, 100ms, 150ms...)
  - Duración: ~300-400ms por item, easing: ease-out
- Referencia: similar al comportamiento de las secciones de la landing (scroll reveal) pero activado por cambio de ruta
- Implementación: CSS `animation` + Angular `@routeAnimations` o clases que se aplican al cargar el componente

### Persistencia del evento activo
- [x] Al navegar a Invitados/Config/Tarjetas y luego dar "Volver", el carrusel vuelve al evento que estaba seleccionado (sessionStorage)

### Guard de cambios sin guardar
- [x] En Config y Tarjetas, si hay cambios sin guardar y el usuario intenta salir, se muestra diálogo de confirmación


---

## Referencia Visual — Landing de Presentación (Fitonist)

### Parte 1 — Hero
- Fondo con gradiente claro suave (lavanda → púrpura → rosa)
- Navbar oscuro flotante arriba con border-radius (logo + links + CTAs)
- Título grande y bold centrado (tipografía gruesa, ~60px)
- Subtítulo pequeño debajo con color acento
- Botones CTA tipo pill (bordes redondeados, fondo claro con borde)
- Mockups de celulares flotando con perspectiva/ángulo
- Elementos decorativos fuera de los celulares (cards/badges que "salen" del frame, esferas 3D abstractas)
- Todo con sombras suaves y profundidad

### Parte 2 — Sección Categorías (patrón a replicar para "Diseñado para cada ocasión")
- Layout 2 columnas: texto + controles a la izquierda, visual grande a la derecha
- **Iconos circulares** como tabs seleccionables arriba del texto
- Icono activo con color diferente (acento)
- Al seleccionar un icono: cambia título + descripción + imagen/video de la derecha con transición
- Imagen/video con border-radius grande (~20px)
- Fondo general claro/neutro

### Aplicación para Vitely

La sección "Diseñado para cada ocasión" debe seguir este patrón:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ● ● ● ● ● ●   ← Iconos circulares (Material Icons)│
│                                                      │
│  Bodas                    ┌──────────────────┐       │
│  ────────                 │                  │       │
│  Están cordialmente       │   PREVIEW DEL    │       │
│  invitados a celebrar     │   TEMPLATE       │       │
│  nuestra unión...         │   (mockup con    │       │
│                           │   colores/fuente │       │
│                           │   del tema)      │       │
│                           └──────────────────┘       │
└──────────────────────────────────────────────────────┘
```

- Izquierda: iconos como tabs + título del evento + descripción
- Derecha: mockup visual del template (gradiente + tipografía representativa)
- Transición fade al cambiar de tab
- En mobile: stacked (iconos arriba, preview abajo)

### Hero para Vitely (inspirado en Fitonist)
- Gradiente de fondo: púrpura oscuro → lavanda (estilo Vitely invertido — oscuro arriba, claro en centro)
- O mantener dark con glow (como está ahora) que va más con la identidad
- Agregar mockups de celulares con invitaciones ejemplo
- Elementos decorativos abstractos (esferas, partículas) generados con CSS
- Navbar: usar el logo PNG de Vitely más grande


---

## Pendientes Landing de Presentación (Fase 2)

- [ ] Hero visual: mockup de celular con CSS (o imagen generada con AI prompts)
- [ ] Navbar mobile: menú hamburguesa para links en pantallas pequeñas
- [ ] Sección "Cómo funciona": línea conectora entre pasos, más visual
- [ ] Animaciones adicionales: parallax sutil en el hero, partículas decorativas
- [ ] Optimizar para SEO: meta tags específicos de la landing pública


---

## Notas de implementación — Builder (próxima sesión)

### Problemas identificados:
1. El iframe muestra toda la landing sin posicionarse en la sección seleccionada
2. El builder se sale del viewport (overflow abajo)
3. La edición en panel separado se siente desconectada del preview

### Plan de acción:
- El iframe debe scrollear automáticamente a la sección seleccionada (usar postMessage)
- Todo el builder debe caber dentro del área de contenido (sin overflow en la página principal)
- El scroll solo debe ocurrir DENTRO de cada panel (izquierdo, centro, derecho)
- El panel de propiedades debe tener TODOS los controles de la sección (no solo título)
- Al editar una propiedad, el iframe se recarga para reflejar el cambio

### Enfoque técnico:
- Comunicación builder → iframe con `window.postMessage` para scroll a sección
- El iframe escucha mensajes y ejecuta `document.getElementById(sectionId).scrollIntoView()`
- Propiedades completas: título, subtítulo, descripción, enabled, colores de fondo, fuentes
- Auto-save o save explícito que recarga el iframe
