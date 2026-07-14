# 🎛️ Rediseño del Panel de Propiedades — Builder

## Objetivo

El panel de propiedades del builder debe tener un diseño tipo **IDE/Photoshop**:
- Grupos colapsables con header clickeable (chevron `>` / `∨`)
- Cerrados por defecto, se expanden al hacer click
- Contiene TODAS las propiedades que ya existen en Configuración
- Diseño compacto, profesional, funcional en mobile

## Estructura del Panel

Al seleccionar una sección del canvas, el panel muestra estos grupos colapsables:

### Para cualquier sección:
```
> Fondo de sección
> Transición superior  
> Colores de texto
> Animación de entrada
> Espaciado
```

### Propiedades específicas por sección:

#### Hero (Carátula):
```
> Nombres de celebrantes (texto, mostrar/ocultar, fuente, degradado)
> Descripción del evento (texto, fuente, degradado)
> Frase (texto, fuente, color)
> Countdown (fecha, fondo cards, radius, colores)
> Fondo (imagen/video/GIF upload)
> Audio (upload)
```

#### Pantalla de Inicio:
```
> Template (selector visual)
> Textos (instrucción, sello)
> Colores (sobre, sello, fondo, texto)
```

#### Intro:
```
> Frase (textarea, fuente, tamaño, color, peso)
> Fondo (upload imagen/video)
> Duración
> Partículas (tipo, dirección, colores, cantidad, velocidad, tamaño, opacidad)
```

#### Invitación:
```
> Título (texto, fuente/tamaño/color)
> Subtítulo (texto)
> Card (fondo toggle, radius)
```

#### Detalles:
```
> Título
> Cards (lista: agregar/editar/eliminar con icono, título, contenido)
> Estilo de cards (fondo, radius)
```

#### Lugares:
```
> Venues (lista: nombre, dirección, hora, maps, icono)
> Estilo (icono style, fondo, radius)
```

#### Itinerario:
```
> Título
> Actividades (lista: hora, título, descripción, icono)
> Estilo (fondo, radius)
```

#### Galería:
```
> Estilo (8 tipos)
> Fotos (upload múltiple, grid, eliminar)
> Título y descripción
```

#### Vestimenta:
```
> Título
> Cards (lista: título, descripción, imágenes hasta 4)
```

#### Regalos:
```
> Mesa de regalos (título, descripción, link, botón)
> Transferencia bancaria (toggle, banco, titular, tipo, número, animación)
```

#### Confirmación:
```
> Título
> Campos de registro (lista configurable)
```

### Tema Global (al seleccionar "Tema Global" en sidebar):
```
> Aplicar Template (selector visual)
> Colores del tema (7 pickers)
> Fuentes del tema (4 selects + previews)
> Fondo de la landing (tipo, colores, ángulo, textura)
> Animación de scroll
> Estilos globales (headings, títulos, subtítulos, contenido, separadores)
> Favicon
```

## Diseño Visual

```
┌─── PANEL DE PROPIEDADES ──────────────────┐
│ ≡ Propiedades                         ✕  │
│ ┌────────────────────────────────────────┐│
│ │ 🖼 Carátula                            ││ ← badge sección
│ └────────────────────────────────────────┘│
│                                           │
│ > Nombres de celebrantes                  │ ← colapsado
│ ∨ Countdown                               │ ← expandido
│ │  Fecha: [_________]                    ││
│ │  Fondo cards: [✓]  Radius: [8]        ││
│ │  Color valores: [████]                 ││
│ │  Color labels: [████]                  ││
│ > Fondo del hero                          │ ← colapsado
│ > Audio                                   │
│ ─────────────────────────────────────     │
│ > Fondo de sección                        │
│ > Transición superior                     │
│ > Colores de texto                        │
│ > Animación de entrada                    │
│ > Espaciado                               │
└───────────────────────────────────────────┘
```

## Implementación

### Componente: `BuilderPropsPanel`

Extraer toda la lógica del panel en un componente independiente:
- Input: `selectedSection`, `config`, señales del canvasState
- Maneja sus propios estados de expandir/colapsar
- Emite cambios via el CanvasStateService

### Acordeón reutilizable

```html
<div class="prop-accordion">
  <button class="prop-accordion-header" (click)="toggle('countdown')">
    <span class="material-icons">{{ expanded['countdown'] ? 'expand_more' : 'chevron_right' }}</span>
    <span>Countdown</span>
  </button>
  @if (expanded['countdown']) {
    <div class="prop-accordion-body">
      <!-- controles -->
    </div>
  }
</div>
```

### CSS del acordeón

```css
.prop-accordion-header {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 8px 10px;
  background: none; border: none; border-bottom: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.prop-accordion-header:hover { background: rgba(139,92,246,0.05); }
.prop-accordion-header .material-icons { font-size: 16px; color: rgba(255,255,255,0.4); }
.prop-accordion-body { padding: 10px 12px; }
```

## Plan de ejecución

1. Crear componente `BuilderPropsPanel` separado
2. Implementar sistema de acordeones colapsables
3. Migrar TODAS las propiedades del config por sección
4. Integrar en el builder principal
5. Eliminar las propiedades inline actuales del builder.component.ts
