# 🎨 Feature: Estilos por Sección — Vitely

> Documentación de diseño y contexto para el feature de personalización visual per-sección en la landing page.

## Estado actual

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 | ✅ Completa | Fondos per-sección + 7 dividers SVG + UI en todas las tabs |
| Fase 2 | ✅ Completa | Override de colores de texto (títulos + contenido) per sección |
| Fase 3 | ⏳ Pendiente | Presets de layout, override de fuentes, animaciones individuales |

## Problema que resuelve

Actualmente la landing aplica un solo tema global (colores, fuentes, fondo) a todas las secciones. Esto es suficiente para invitaciones simples, pero limita a clientes que quieren diseños más elaborados donde cada sección tiene su propia identidad visual — fondos alternados, degradados, imágenes de fondo, tipografías distintas, y transiciones orgánicas entre secciones.

## Referencia visual

Invitaciones profesionales (como maryinvite.ru) usan:
- **Fondos alternados** por sección (crema ↔ burdeos, claro ↔ oscuro)
- **Imágenes de fondo** en secciones específicas (fotos en B&N, texturas)
- **Bordes orgánicos** entre secciones (ondas, curvas, diagonales — no líneas rectas)
- **Colores de texto adaptados** al fondo de cada sección (oscuro sobre claro, claro sobre oscuro)
- **Tipografías distintas** por sección (más decorativa en invitación, más legible en itinerario)

## Arquitectura: Global + Override

### Principio fundamental
> La configuración global sigue siendo el **default**. Cada sección puede opcionalmente sobreescribir propiedades específicas. Si no se personaliza, hereda todo del global.

Esto mantiene la simplicidad para el 80% de clientes que quiere algo bonito rápido, mientras da poder al 20% que quiere diseños elaborados.

### Modelo de datos

```typescript
export interface SectionStyle {
  // === FONDO ===
  bgType: 'inherit' | 'solid' | 'linear' | 'radial' | 'image';
  bgColor1?: string;         // Color principal
  bgColor2?: string;         // Color secundario (para degradados)
  bgAngle?: number;          // Ángulo del degradado (0-360)
  bgImage?: string;          // URL de imagen de fondo
  bgOverlay?: number;        // Opacidad del overlay oscuro (0-100)
  bgBlur?: number;           // Blur sobre imagen de fondo (0-20px)

  // === TEXTO (override, null = hereda global) ===
  headingFont?: string;      // Fuente del heading de sección
  headingColor?: string;     // Color del heading
  titleFont?: string;        // Fuente de títulos internos
  titleColor?: string;       // Color de títulos
  contentFont?: string;      // Fuente del contenido
  contentColor?: string;     // Color del contenido

  // === DIVIDER (separador SVG superior) ===
  dividerType: 'none' | 'wave' | 'curve' | 'slant' | 'zigzag' | 'mountains' | 'drops' | 'arrow';
  dividerColor?: string;     // Color del SVG (default: hereda fondo sección anterior)
  dividerFlip?: boolean;     // Invertir dirección horizontal
  dividerHeight?: number;    // Alto del divider en px (20-80)

  // === SPACING ===
  paddingTop?: number;       // Padding top en px (default: 80)
  paddingBottom?: number;    // Padding bottom en px (default: 80)
}
```

### Integración con configs existentes

Cada sección config existente (`DetailsConfig`, `VenuesConfig`, etc.) recibe una propiedad opcional:

```typescript
export interface DetailsConfig {
  enabled: boolean;
  title: string;
  cards: DetailCard[];
  // ...existing props...
  sectionStyle?: SectionStyle;  // NUEVO
}
```

### Compatibilidad

- Configs existentes no tienen `sectionStyle` → hereda global (comportamiento actual, sin cambios)
- Si `sectionStyle.bgType === 'inherit'` → hereda global (default explícito)
- Solo se aplica override cuando el usuario activa la personalización

---

## Diseño del Dashboard (Config UI)

### Toggle "Personalizar estilo" en cada tab de sección

Cada pestaña del config (Detalles, Venues, Itinerario, Vestimenta, Regalos, Confirmación) tendrá un card colapsable:

```
┌─────────────────────────────────────────────┐
│ ✨ Estilo de sección         [toggle ON/OFF] │
├─────────────────────────────────────────────┤
│ Fondo:  [inherit] [sólido] [degradado] [img]│
│                                             │
│ Color 1: ████  Color 2: ████                │
│ Ángulo: ═══○═══ 135°                        │
│                                             │
│ Separador superior:                         │
│ [none] [wave] [curve] [slant] [zigzag] ...  │
│ Color: ████   Alto: 40px                    │
│                                             │
│ Textos:                                     │
│ ☐ Usar colores personalizados               │
│ Heading: ████   Contenido: ████             │
│                                             │
│ Espaciado:                                  │
│ Top: 80px   Bottom: 80px                    │
└─────────────────────────────────────────────┘
```

- Si el toggle está OFF → la sección no muestra nada extra (hereda global)
- Si está ON → muestra los controles

---

## Diseño de la Landing (renderizado)

### Estructura HTML por sección

```html
<div class="section-block" [style]="sectionBgStyles">
  <!-- Divider SVG (separador orgánico) -->
  <svg class="section-divider" ...>
    <path d="..." />
  </svg>

  <!-- Contenido real de la sección -->
  <div class="section-content" [style]="sectionTextStyles">
    <app-landing-details ... />
  </div>
</div>
```

### Dividers SVG — Catálogo

| Tipo | SVG Path | Visual |
|------|----------|--------|
| `wave` | Onda suave sinusoidal | ∿∿∿∿ |
| `curve` | Curva cóncava simple | ⌒ |
| `slant` | Diagonal recta | ╱ |
| `zigzag` | Triángulos | ∧∧∧∧ |
| `mountains` | Picos irregulares | ⛰️ |
| `drops` | Gotas/semicírculos | ◠◠◠ |
| `arrow` | Flecha central | ▽ |

Cada divider es un SVG `viewBox="0 0 1200 120"` posicionado en `position: absolute; top: -Xpx` para superponerse entre secciones.

### CSS Variables per sección

```css
.section-block {
  --section-bg: var(--value-or-inherit);
  --section-heading-color: var(--or-global);
  --section-content-color: var(--or-global);
  position: relative;
  padding: var(--section-padding-top, 80px) 20px var(--section-padding-bottom, 80px);
}
```

---

## Plan de implementación

### Fase 1 — Fondos por sección + Dividers SVG
**Prioridad: Alta | Impacto visual: Máximo**

1. Agregar `SectionStyle` interface al modelo
2. Agregar `sectionStyle?` a cada config de sección
3. Backend: actualizar `ensureConfigDefaults` 
4. Landing: wrapper `<div class="section-block">` con estilos inline dinámicos
5. Componente SVG divider (`section-divider.component.ts`) con 7 paths
6. Dashboard: card "Estilo de sección" en cada tab con:
   - Tipo de fondo (inherit/solid/linear/image)
   - Colores + ángulo
   - Upload de imagen de fondo
   - Selector de divider (visual, tipo cards)
   - Slider de alto del divider

### Fase 2 — Override de texto por sección
**Prioridad: Media | Refinamiento**

1. Controles de fuente/color para heading y contenido per sección
2. Auto-detect de contraste (si fondo es oscuro → sugiere texto claro y viceversa)
3. Preview en tiempo real en el config

### Fase 3 — Presets de layout por sección
**Prioridad: Baja | Diferenciador premium**

1. Templates de sección predefinidos ("Foto + texto lateral", "Texto centrado", etc.)
2. Animación de entrada per sección (override del global)
3. Overlay patterns per sección (textura, no solo global)

---

## Impacto en el proyecto

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `models.ts` | Agregar `SectionStyle`, agregar `sectionStyle?` a cada config |
| `ensureConfigDefaults.js` | Default `sectionStyle` con `bgType: 'inherit'` |
| `landing.component.ts` | Wrapper div per sección con estilos dinámicos |
| `config.component.html` | Card "Estilo de sección" en cada tab |
| `config.component.ts` | Métodos de upload, preview bg, etc. |
| **NUEVO** `section-divider.component.ts` | Componente SVG con paths dinámicos |

### No requiere migración de BD

Todo se almacena en `config_json` — solo es una propiedad nueva en el JSON. Configs existentes no la tienen → hereda global. Zero breaking changes.

### Complejidad estimada

- Fase 1: ~300-400 líneas de código nuevo + 200 de modificaciones
- Tiempo estimado: 1 sesión de desarrollo
- Riesgo: Bajo (aditivo, no modifica comportamiento existente)

---

## Notas de diseño

- El max-width de 520px de la landing se mantiene — los fondos se aplican **full-width** pero el contenido sigue centrado
- Los dividers van entre el `section-block` anterior y el actual (overlap negativo)
- Para imágenes de fondo: reusar el sistema de uploads existente + compresión con sharp
- Los dividers se colorean automáticamente con el color de fondo de la sección **de arriba** para crear la ilusión de continuidad
- Mobile: dividers se reducen en altura (50-60% del desktop)

---

## Ejemplo de config JSON resultante

```json
{
  "details": {
    "enabled": true,
    "title": "Detalles del Evento",
    "cards": [...],
    "sectionStyle": {
      "bgType": "solid",
      "bgColor1": "#f5f0eb",
      "dividerType": "wave",
      "dividerColor": "#0d1117",
      "dividerHeight": 50,
      "headingColor": "#4a3728",
      "contentColor": "#5c4a3a"
    }
  },
  "venues": {
    "enabled": true,
    "items": [...],
    "sectionStyle": {
      "bgType": "image",
      "bgImage": "uploads/images/foto-bw.jpg",
      "bgOverlay": 60,
      "dividerType": "curve",
      "dividerColor": "#f5f0eb",
      "dividerHeight": 40
    }
  },
  "itinerary": {
    "enabled": true,
    "title": "Itinerario",
    "sectionStyle": {
      "bgType": "linear",
      "bgColor1": "#6b1d1d",
      "bgColor2": "#4a1515",
      "bgAngle": 180,
      "dividerType": "slant",
      "headingColor": "#f5f0eb",
      "contentColor": "rgba(255,255,255,0.8)"
    }
  }
}
```

---

## Decisiones pendientes

- [ ] ¿Los dividers van solo arriba de cada sección, o también abajo?
  - Recomendación: solo arriba (el de abajo es el "arriba" de la siguiente sección)
- [ ] ¿Permitir imagen de fondo con parallax (background-attachment: fixed)?
  - Recomendación: opcional, toggle simple
- [ ] ¿Limitar el número de secciones con override (para no sobrecargar al cliente)?
  - Recomendación: no limitar, pero el default es "inherit" y el toggle está apagado
- [ ] ¿Agregar esto como feature de "plan premium" en el SaaS?
  - Recomendación: sí, es un diferenciador claro para clientes que pagan más
