# Builder — Elementos Libres (Futuro)

> **Estado**: Planificado — No implementado
> **Prioridad**: Post-pruebas del builder actual
> **Secciones aplicables**: Invitacion, Detalles, Lugares, Itinerario, Galeria, Vestimenta, Regalos, Confirmacion
> **Secciones excluidas**: Pagina de Inicio, Intro, Caratula (tienen interfaces propias)

## Concepto

Cada seccion (excepto las excluidas) tendra una capa transparente superpuesta donde el usuario puede colocar elementos libres (texto, imagenes, iconos, decoradores) con posicion drag & drop. Esto permite personalizar la landing mas alla de las propiedades predefinidas.

## Arquitectura

```
Seccion en el Canvas
+-- Componente real de landing (fondo, contenido nativo)
+-- Overlay de elementos libres (position: absolute, inset: 0)
    +-- Elemento libre 1 (texto "Felicidades", posicion x:20% y:10%)
    +-- Elemento libre 2 (imagen decorativa, posicion x:70% y:5%)
    +-- Elemento libre 3 (icono estrella, posicion x:50% y:90%)
```

## Tipos de Elementos

| Tipo | Propiedades | Uso |
|------|-------------|-----|
| Texto | contenido, fuente, tamano, color, peso, alineacion | Titulos, frases personalizadas |
| Imagen | URL (upload), tamano (width/height), radius, opacity | Fotos decorativas, logos |
| Icono | nombre (Material), color, tamano | Decoraciones sutiles |
| Decorador | tipo preset (floral, linea, sparkle), color, tamano, rotacion | Ornamentos visuales |
| Separador | tipo (linea, puntos, ornamental), color, ancho | Separacion visual |
| Espacio | altura (px) | Espacio vertical entre contenido |

## Propiedades Comunes

- **Posicion**: x, y (en % del contenedor de la seccion)
- **Tamano**: width, height
- **Z-index**: orden de apilamiento
- **Rotacion**: 0-360 grados
- **Opacidad**: 0-1
- **Bloqueado**: evita movimiento accidental
- **Visible mobile/desktop**: toggle de visibilidad por dispositivo

## Interaccion en el Canvas

1. **Agregar**: Click en boton del panel izquierdo -> elemento aparece centrado en la seccion seleccionada
2. **Seleccionar**: Click en elemento -> muestra handles de resize + propiedades en panel derecho
3. **Mover**: Drag & drop libre dentro de los limites de la seccion
4. **Redimensionar**: Handles en esquinas/bordes
5. **Eliminar**: Boton Delete o X en propiedades
6. **Ordenar**: Bring forward / Send backward (z-index)

## Almacenamiento (ya existe en el modelo)

```typescript
// En config_json de cada seccion
{
  "invitation": {
    "title": "...",
    "canvas": {
      "version": 2,
      "elements": [
        {
          "id": "uuid",
          "type": "text",
          "x": 20, "y": 10,
          "width": 60, "height": 15,
          "zIndex": 1,
          "content": "Con amor",
          "fontSize": 24,
          "color": "#d4a017",
          "fontFamily": "script"
        }
      ]
    }
  }
}
```

## Servicios Existentes

- `CanvasStateService` — Ya tiene: addElement, removeElement, updateElementPosition, resizeElement, updateElementProperties, lockElement, bringForward, sendBackward, bringToFront, sendToBack
- `MigrationService` — Ya genera `canvas.elements` por seccion al migrar de V1 a V2
- `canvas.models.ts` — Interfaces definidas: CanvasElement, TextCanvasElement, CountdownCanvasElement, etc.

## Fases de Implementacion

### Fase 1 — Render basico (~1 sesion)
- Renderizar `canvas.elements` como divs absolutos sobre cada seccion
- Click para seleccionar -> mostrar propiedades en panel derecho
- Propiedades basicas (texto/color/tamano)

### Fase 2 — Drag & Drop (~1 sesion)
- CDK Drag para mover elementos libremente
- Resize handles (esquinas)
- Guardar posicion al soltar

### Fase 3 — Panel de propiedades por tipo (~1 sesion)
- Cada tipo muestra controles especificos
- Upload de imagenes directo
- Presets de decoradores

### Fase 4 — Pulido (~1 sesion)
- Snap to grid (opcional)
- Duplicar elemento
- Undo/redo para cambios de elementos
- Alineacion (centrar horizontal/vertical)
- Visibilidad mobile/desktop

### Fase 5 — Landing Real (~1 sesion)
- El `landing.component` renderiza los `canvas.elements` de cada seccion
- Posicionamiento responsive (% basado)
- mobileOverride para ajustes por dispositivo

## Notas

- Los botones de "Agregar elemento" estan ocultos en el builder actual (se activaran al implementar Fase 1)
- El modelo de datos ya soporta elementos libres — solo falta el render visual y la interaccion
- Considerar limitar la cantidad de elementos por seccion (max 10-15) para evitar sobrecarga
