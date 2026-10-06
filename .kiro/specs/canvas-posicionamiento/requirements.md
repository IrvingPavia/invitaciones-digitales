# Requerimientos — Posicionamiento asistido de elementos en secciones de apertura

## Introducción

Actualmente las secciones de apertura de la invitación (Pantalla de Inicio en template Plano, Intro y Carátula/Hero) renderizan sus textos con un layout fijo centrado (flexbox). El usuario no puede reposicionar los elementos. Esta feature permite **mover los elementos de texto dentro de cada sección** desde el canvas del builder, con un sistema **asistido** (guías de alineación y snap, no posicionamiento libre absoluto), guardando posiciones **independientes para mobile y desktop**. El resultado se refleja en el canvas, en el modo Preview y en la landing real.

Objetivo: dar control de composición sobre estas tres secciones sin sacrificar orden visual ni romper invitaciones existentes.

## Alcance

### Secciones y elementos reposicionables
- **Pantalla de Inicio — SOLO template "Plano":** Título, Subtítulo, Contenido, Instrucción.
- **Intro:** Frase.
- **Carátula (Hero):** Tipo de evento, Nombres, Descripción, Frase, Countdown.

### Fuera de alcance (esta spec)
- Otras secciones del builder (Detalles, Lugares, etc.) — ya tienen su propio flujo.
- Otros templates de Pantalla de Inicio (Sobre, Ticket, Splash) — solo Plano.
- Redimensionar elementos (solo mover).
- Rotación, capas (z-index), o edición de contenido vía drag (el contenido se sigue editando en el panel).

## Requerimientos

### R1 — Mover elementos con clic y arrastre en el canvas
**Historia:** Como usuario del builder, quiero arrastrar un elemento de texto en el canvas para reposicionarlo, para componer la sección a mi gusto.

Criterios de aceptación:
1. CUANDO el usuario hace clic sostenido sobre un elemento reposicionable en el canvas (modo canvas, no preview), ENTONCES el elemento sigue el cursor/dedo mientras se arrastra.
2. CUANDO el usuario suelta, ENTONCES la posición se guarda en el config de la sección.
3. El arrastre funciona con mouse (desktop) y touch (mobile/tablet) sobre el canvas.
4. Solo los elementos listados en el Alcance son arrastrables; los demás elementos de la sección permanecen fijos.
5. El arrastre NO dispara la acción de "abrir" del envelope ni la navegación; se consume el evento.

### R2 — Posicionamiento asistido con guías de alineación
**Historia:** Como usuario, quiero que al mover un elemento aparezcan guías y se "imante" a posiciones ordenadas, para no desalinear la composición.

Criterios de aceptación:
1. CUANDO el usuario arrastra un elemento cerca del centro horizontal, borde izquierdo o borde derecho de la sección, ENTONCES aparece una guía visual y el elemento hace *snap* a esa línea.
2. CUANDO el usuario arrastra cerca del centro vertical o de los tercios (arriba/medio/abajo), ENTONCES aparece una guía y hace *snap*.
3. Las guías solo son visibles durante el arrastre.
4. El *snap* tiene un umbral pequeño (p. ej. ~3% del alto/ancho) para no estorbar el movimiento fino fuera de las guías.
5. El elemento queda confinado dentro de los límites de la sección (no se puede sacar del área visible).

### R3 — Posiciones independientes mobile / desktop
**Historia:** Como usuario, quiero posicionar distinto en mobile y en desktop, porque el espacio y la composición cambian según el dispositivo.

Criterios de aceptación:
1. El canvas tiene selector de dispositivo (mobile/desktop) ya existente; la posición se guarda para el dispositivo activo.
2. CUANDO el usuario mueve un elemento con el canvas en "mobile", ENTONCES se guarda la posición mobile sin afectar la desktop, y viceversa.
3. La landing real aplica la posición mobile o desktop según el ancho de pantalla del visitante (breakpoint coherente con el resto del proyecto, 768px).
4. SI una sección no tiene posición definida para un dispositivo, ENTONCES usa la del otro dispositivo como fallback, o el layout por defecto si ninguno existe.

### R4 — Retrocompatibilidad y layout por defecto
**Historia:** Como dueño del producto, quiero que las invitaciones existentes no cambien su apariencia al desplegar esta feature.

Criterios de aceptación:
1. SI un elemento no tiene posición guardada, ENTONCES se renderiza con el layout actual (flex centrado), idéntico a hoy.
2. La feature solo altera la posición cuando el usuario mueve explícitamente un elemento.
3. El modelo de datos es aditivo (campos opcionales); configs viejos siguen válidos sin migración.

### R5 — Reset global por sección
**Historia:** Como usuario, quiero poder volver una sección a su composición original con un solo botón.

Criterios de aceptación:
1. El panel de propiedades de cada sección afectada tiene un botón "Restablecer posiciones".
2. CUANDO el usuario lo pulsa, ENTONCES se eliminan todas las posiciones personalizadas de esa sección (para el dispositivo activo o ambos — ver diseño) y los elementos vuelven al layout por defecto.
3. El reset pide confirmación (diálogo) para evitar pérdidas accidentales.

### R6 — Reflejo en Preview y landing real
**Historia:** Como usuario, quiero ver la posición final tal cual en Preview y en la invitación publicada.

Criterios de aceptación:
1. La edición de posición (drag + guías) ocurre SOLO en modo canvas del builder.
2. En modo Preview del builder y en la landing real, los elementos se renderizan en la posición guardada (sin handles ni interacción de arrastre), fiel a lo compuesto.
3. El render de posición respeta el dispositivo (mobile/desktop) en todos los contextos.

### R7 — Indicador de selección y usabilidad
**Historia:** Como usuario, quiero saber qué elemento voy a mover y que sea fácil de manipular.

Criterios de aceptación:
1. CUANDO el usuario pasa el cursor o toca un elemento movible en el canvas, ENTONCES hay una indicación visual (cursor "move" y/o contorno) de que es arrastrable.
2. El área de agarre es cómoda en touch (sin requerir precisión excesiva).
3. El arrastre no interfiere con el scroll del canvas ni con la selección de la sección.
