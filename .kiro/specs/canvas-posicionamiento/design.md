# Diseño — Posicionamiento asistido de elementos en secciones de apertura

## Visión general

Se añade a los tres componentes de apertura (envelope/plain, intro, hero) la capacidad de posicionar sus elementos de texto mediante **coordenadas relativas (x/y en %)** por dispositivo, con una capa de **interacción de arrastre asistida** que solo se activa en el canvas del builder. El render (landing, preview, canvas) usa las mismas coordenadas; la diferencia es que el canvas además monta los *listeners* de drag y dibuja guías.

Principio rector: **aditivo y retrocompatible**. Si no hay posición guardada, el elemento conserva el layout flex actual.

## Modelo de datos

Se agrega una estructura de posiciones opcional a cada config de sección involucrada. Reutilizamos un tipo común.

```ts
// models.ts (nuevo tipo compartido)
export interface ElementPosition {
  x: number;   // 0-100 (% del ancho de la sección), centro del elemento
  y: number;   // 0-100 (% del alto de la sección), centro del elemento
}

export interface ElementPositions {
  desktop?: Record<string, ElementPosition>;  // key = id del elemento
  mobile?:  Record<string, ElementPosition>;
}
```

Se añade el campo opcional a cada config:
- `EnvelopeConfig.plainPositions?: ElementPositions` (keys: `title`, `subtitle`, `content`, `instruction`)
- `IntroConfig.positions?: ElementPositions` (keys: `phrase`)
- `HeroConfig.positions?: ElementPositions` (keys: `eventType`, `names`, `description`, `phrase`, `countdown`)

Notas:
- Las coordenadas representan el **centro** del elemento (facilita snap al centro de la sección y confinamiento).
- Mobile y desktop son mapas independientes. Fallback: si falta el del dispositivo activo, usar el otro; si faltan ambos, layout por defecto (sin posición).

## Render: aplicar posición sin romper el layout por defecto

Cada elemento movible se envuelve/condiciona así:

- SI existe posición para el dispositivo actual → `position: absolute; left: x%; top: y%; transform: translate(-50%, -50%)`.
- SI NO → se mantiene el flujo flex actual (sin `position:absolute`).

Para lograrlo, el contenedor de la sección (`.plain-container`, `.intro-content`/overlay, `.hero-content`) pasa a `position: relative` siempre (no cambia el layout si los hijos no son absolutos). Cada elemento recibe un `[ngStyle]`/`[style]` calculado por un helper `posStyle(key)` del componente, que devuelve `{}` cuando no hay posición (deja el flex) o el objeto absolute cuando sí la hay.

```ts
// patrón en cada componente de sección
posStyle(key: string): Record<string,string> {
  const dev = this.isMobile ? 'mobile' : 'desktop';
  const pos = this.positions?.[dev]?.[key] ?? this.positions?.[dev === 'mobile' ? 'desktop' : 'mobile']?.[key];
  if (!pos) return {};
  return { position: 'absolute', left: pos.x + '%', top: pos.y + '%', transform: 'translate(-50%, -50%)', margin: '0' };
}
```

El flag `isMobile`:
- **Landing real:** por `window.innerWidth <= 768` (reactivo a resize), consistente con el resto del proyecto.
- **Canvas/Preview:** por el `previewDevice` del builder (mobile/desktop), que ya se pasa a estas secciones o se puede pasar como `@Input`.

## Interacción de arrastre (solo canvas)

Un **directivo/servicio de arrastre asistido** reutilizable, activado solo en modo canvas del builder. No se usa CDK (igual que el patrón del editor de tarjetas), para control fino del snap y del cálculo en %.

Responsabilidades:
1. `mousedown`/`touchstart` sobre un elemento marcado como movible → inicia drag, guarda offset inicial, hace `preventDefault` y `stopPropagation` (no abre envelope ni selecciona-deselecciona de más).
2. `mousemove`/`touchmove` (en document) → calcula la posición del cursor relativa al rect de la sección, la convierte a % (centro del elemento), aplica **snap** a guías (centro X, bordes, tercios Y) si está dentro del umbral, y actualiza una posición "en vivo".
3. Dibuja **guías** (líneas) cuando el elemento está alineado a una guía durante el arrastre.
4. `mouseup`/`touchend` → confina a límites [margen..100-margen], persiste la posición vía callback (que llama a `setSec`/`updateCanvas` del builder) para el dispositivo activo, y marca dirty/auto-save.

Snap:
- Horizontales: centro (50%), ~izquierda (p. ej. 15%), ~derecha (85%).
- Verticales: tercios (25%, 50%, 75%) y centro.
- Umbral de snap: ~3% de la dimensión correspondiente.

Confinamiento: `x` y `y` se limitan a un rango seguro (p. ej. 5–95%) para que el elemento no se salga de la sección.

### ¿Dónde vive el drag?
Como las tres secciones usan los componentes de landing (`app-landing-envelope`, `app-landing-intro`, `app-landing-hero`) tanto en canvas como en landing, se añade a cada componente:
- `@Input() editable = false` → true solo cuando el builder lo renderiza en modo canvas.
- `@Input() previewDevice: 'mobile'|'desktop'` → para elegir el mapa de posiciones.
- `@Output() positionsChange` → emite el nuevo `ElementPositions` para que el builder lo persista con `setSec`.

La lógica de drag se encapsula en una **directiva** `appAssistedDrag` (o un pequeño servicio) para no duplicar el código en los tres componentes. La directiva se aplica a cada elemento movible y recibe su `key`, el `rect` de la sección y emite cambios de posición.

## Guías visuales

Durante el arrastre, se renderizan líneas absolutas dentro del contenedor de la sección:
- Línea vertical en el centro / bordes cuando `x` coincide con una guía.
- Línea horizontal en tercios/centro cuando `y` coincide.
Estilo sobrio (1px, color de acento con opacidad), visibles solo mientras `dragging === true`.

## Panel de propiedades

En el panel de cada sección (props-panel del builder) se agrega:
- Un botón **"Restablecer posiciones"** por sección, con confirmación (DialogService ya existe).
- Reset borra `positions`/`plainPositions` del dispositivo activo (o ambos — decidir en implementación; propuesta: botón principal resetea el dispositivo activo, con opción de "ambos").

No se agregan inputs numéricos de x/y (el posicionamiento es por arrastre asistido, no manual numérico), para mantener la UX simple.

## Reflejo en Preview y landing

- **Canvas (editable=true):** monta drag + guías + handles/cursor move.
- **Preview (editable=false):** sin interacción; aplica posiciones.
- **Landing real (editable=false):** sin interacción; aplica posiciones según `window.innerWidth`.

## Consideraciones y riesgos

- **Animaciones de entrada:** hoy los elementos tienen animaciones escalonadas (`splashTextIn`, `animate-in`). Al pasar a `position:absolute` hay que verificar que las animaciones (que usan transform) no colisionen con el `translate(-50%,-50%)`. Solución: aplicar el translate de centrado en el contenedor del elemento y la animación en un hijo, o combinar transforms con cuidado.
- **Countdown (hero):** es un bloque compuesto (varias cajas). Se mueve como una sola unidad (un wrapper).
- **Contenido rich text (plain):** es HTML con `[innerHTML]`; al moverlo se mueve el bloque completo.
- **Scroll del canvas vs drag:** el drag debe `preventDefault` en touchmove solo cuando el gesto es sobre un elemento movible, para no bloquear el scroll normal del canvas.
- **Resize del navegador (landing):** `isMobile` reactivo para recalcular el mapa de posiciones al cruzar el breakpoint.
- **Fallback de dispositivo:** evita que un elemento "desaparezca" si solo se posicionó en un dispositivo.

## Estrategia de pruebas

- Mover cada elemento en canvas desktop y mobile; verificar persistencia independiente.
- Verificar snap a centro/bordes/tercios y confinamiento.
- Verificar que configs sin posiciones se ven igual que hoy (retrocompat).
- Verificar reflejo fiel en Preview y landing real (desktop y mobile).
- Verificar reset global por sección (con confirmación).
- Verificar que el drag no abre el envelope ni rompe el scroll.
- Verificar animaciones de entrada tras reposicionar.
