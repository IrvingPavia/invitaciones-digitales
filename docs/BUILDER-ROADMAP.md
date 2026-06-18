# 🏗️ Builder Roadmap — Plan de Integración Completa

> El Builder debe convertirse en el ÚNICO configurador de la landing, reemplazando por completo la sección de "Configuración" actual. Este documento detalla qué falta, qué se perdió, y el plan para lograrlo.

---

## Estado Actual

### ✅ Lo que funciona en el Builder:
- Canvas con secciones posicionables
- Elementos arrastrables (texto, countdown, imagen, icono, decorador, separador, spacer)
- Panel de propiedades por elemento (posición, tamaño, propiedades de tipo)
- Undo/Redo
- Auto-save (4s debounce)
- Agregar/eliminar elementos
- zIndex (traer al frente, enviar atrás)
- Lock de elementos
- Propiedades del Hero (fondo, audio)

### ❌ Lo que se perdió vs Configuración anterior:
- Galería de fotos (subir, eliminar, reordenar fotos)
- Lugares (agregar/editar/eliminar venues con nombre, dirección, hora, mapa)
- Itinerario (agregar/editar/eliminar items con hora, título, descripción, icono)
- Detalles (agregar/editar/eliminar cards con título, contenido, icono)
- Vestimenta (agregar/editar cards con título, descripción, imágenes de ejemplo)
- Regalos (link mesa de regalos, transferencia bancaria completa)
- RSVP/Registro (campos configurables, selector de lada)
- Estilos por sección (fondo, degradado, imagen, dividers SVG, stroke, colores de texto override)
- Tema global (colores, fuentes, fondo de landing, texturas)
- Pantalla de inicio (4 templates, colores, textos)
- Intro (frase, partículas, video trimmer, duración)
- Hero completo (nombres con degradado, countdown con cards, navbar config)
- Templates de landing predefinidos
- Preview en iframe (mockup celular)

---

## Bugs Activos

| # | Bug | Estado |
|---|-----|--------|
| 1 | Radius cards baja de 1 a 8 (default `\|\| 8` en template) | 🔴 Pendiente |
| 2 | Guard de cambios: solo tiene "OK/Cancel", necesita Cancelar/Guardar/Descartar | 🔴 Pendiente |
| 3 | Migración pierde datos existentes (fotos, venues, itinerary items, etc.) | 🔴 Crítico |

---

## Plan: Integrar TODO en el Builder

### Principio

El Builder es el ÚNICO editor. La sección "Configuración" (config component) se mantiene visible temporalmente como referencia pero se eliminará cuando el builder cubra todas sus funcionalidades.

### Fases de integración

#### Fase A — Bloques complejos con panel de propiedades completo

Al seleccionar un bloque tipo `gallery`, `venue-cards`, `detail-cards`, etc., el panel derecho debe mostrar TODAS las propiedades que tenía la pestaña correspondiente en el configurador.

| Bloque | Propiedades que necesita en el panel |
|--------|--------------------------------------|
| `gallery` | Lista de fotos (upload multiple, reordenar, eliminar), estilo (8 tipos), título |
| `venue-cards` | Lista de venues (agregar/editar/eliminar: nombre, dirección, hora, maps URL, icono emoji/imagen), estilo icono, fondo cards, radius |
| `detail-cards` | Lista de cards (agregar/editar/eliminar: título, contenido, icono emoji/imagen, alineación), fondo, radius |
| `itinerary` | Lista de items (agregar/editar/eliminar: hora, título, descripción, icono), título sección, fondo, radius |
| `dresscode-block` | Lista de cards (agregar/editar: título, descripción, imágenes ejemplo hasta 4), título sección |
| `gifts-block` | Título, descripción, link, botón texto + Transferencia (enabled, banco, tipo cuenta, número, nombre, animación) |
| `rsvp-form` | Título, campos configurables (nombre fijo, email, teléfono con lada, empresa, cargo — activables/obligatorios) |
| `countdown` | Fecha, colores (valores, labels), fondo cards toggle, border-radius, fuente |

#### Fase B — Propiedades de sección (panel al seleccionar sección sin elemento)

| Propiedad | Descripción |
|-----------|-------------|
| Fondo de sección | Tipo (hereda/sólido/degradado/imagen), colores, ángulo, overlay, blur |
| Transición/Divider | 7 tipos SVG (wave, curve, slant...), alto, invertir |
| Stroke de transición | Color, grosor, opacidad |
| Colores de texto override | Heading color, content color, heading font, content font |
| Adornos de título | 7 tipos (line, dots, sparkles...), posición, color, tamaño |
| Animación de entrada | Hereda/fade-up/fade-in/slide-left/slide-right/scale/none |
| Spacing | Padding top/bottom |

#### Fase C — Tema Global (panel especial tipo "Tema Global" en el sidebar)

| Propiedad | Descripción |
|-----------|-------------|
| Colores del tema | textPrimary, textSecondary, navFooterText, buttonBg, buttonText, cardBg, cardBorder |
| Fuentes del tema | textPrimaryFont, textSecondaryFont, navFooterFont, buttonFont |
| Fondo de landing | Color 1, Color 2, tipo (solid/linear/radial/mesh), ángulo, intensidad |
| Textura | 8 tipos + opacidad |
| Estilos globales | Heading font/size/color, title gradient, subtitle, content, separador |
| Animación de scroll | 6 opciones globales |
| Templates | Selector de template predefinido (aplicar colores/fuentes) |

#### Fase D — Pantalla de Inicio + Intro

| Propiedad | Descripción |
|-----------|-------------|
| Pantalla de inicio | Template (sobre/ticket/splash/plano), colores, textos, sello |
| Intro | Frase, fondo (video/imagen), duración, video trimmer, partículas (tipo, dirección, colores, cantidad, velocidad, tamaño, opacidad) |

#### Fase E — Hero completo

| Propiedad | Descripción |
|-----------|-------------|
| Nombres celebrantes | Texto, mostrar/ocultar, fuente, tamaño, degradado (2 colores + ángulo + intensidad + peso) |
| Descripción evento | Texto, mostrar/ocultar, fuente, tamaño, degradado |
| Frase hero | Texto, fuente, tamaño, color |
| Countdown | Fecha, mostrar fondo cards, radius |
| Audio | URL, upload |
| Fondo | GIF/video/imagen, upload |
| Descripción adicional | Texto, mostrar/ocultar |

#### Fase F — Eliminar config component

Una vez que el builder soporte TODO lo anterior:
1. Remover el link "Configurar" de la tabla de eventos
2. Remover la ruta `/dashboard/config/:eventId`
3. Eliminar `config.component.ts` y `config.component.html`
4. El builder se convierte en el único editor

---

## Migración: No perder datos

### Problema actual

La migración V1→V2 genera canvas elements pero NO conecta con los datos existentes de la config. Por ejemplo:
- `config.venues.items` tiene 3 venues con datos reales
- La migración genera un `venue-cards` element en el canvas pero NO referencia esos items
- Los datos están en la config original pero el canvas no los usa

### Solución

**Los bloques complejos NO duplican datos**. En vez de copiar `items` dentro del canvas element, el bloque simplemente **referencia** los datos del config original:

```typescript
// El canvas element solo tiene posición + referencia
interface VenueCardsCanvasElement extends CanvasElement {
  type: 'venue-cards';
  // Los items vienen de config.venues.items — NO se duplican
  // Solo se configura la posición y display del bloque
  iconStyle?: 'circle' | 'plain' | 'none';
  showCardBg?: boolean;
}

// Al renderizar: usa config.venues.items para los datos
// Al editar items: modifica config.venues.items directamente
```

Esto significa:
- El canvas controla **posición y display** de cada bloque
- Los **datos reales** (fotos, venues, items, cards) siguen en su lugar original de config
- El panel de propiedades del bloque edita los datos originales + las propiedades de display del canvas element

### Beneficios
- Zero pérdida de datos en migración
- Backward compatible (la landing sigue leyendo `config.venues.items`)
- Solo se agrega información de posición, no se duplica contenido

---

## Prioridades de implementación

1. 🔴 **Fix bug radius** (1 línea)
2. 🔴 **Fix guard** (3 opciones: cancelar/guardar/descartar)
3. 🔴 **Fix migración** — bloques referencian datos existentes, no los duplican
4. 🟡 **Fase A** — Paneles completos de bloques (venues, gallery, details, itinerary, dresscode, gifts, rsvp)
5. 🟡 **Fase B** — Propiedades de sección (estilos, dividers, colores)
6. 🟡 **Fase C** — Tema global completo
7. 🟢 **Fase D** — Pantalla de inicio + intro
8. 🟢 **Fase E** — Hero completo
9. ⚪ **Fase F** — Eliminar config component

---

## Nota sobre la sección de "Configuración"

**NO se oculta todavía**. Se mantiene accesible como referencia para:
- Verificar qué propiedades se pueden configurar actualmente
- Comparar paridad de funcionalidades builder vs config
- Servir como fallback mientras el builder se completa

Se elimina SOLO cuando el builder cubra 100% de las funcionalidades.
