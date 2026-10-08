# Tareas — Posicionamiento asistido de elementos en secciones de apertura

> Orden sugerido. Cada tarea referencia los requerimientos (R1–R7) que cubre.
>
> **Estado (actualizado):** La feature está implementada y funcional en Plano (envelope),
> Intro y Carátula (hero). El enfoque evolucionó de una directiva simple (`appAssistedDrag`)
> a un componente `app-drag-box` (`core/components/drag-box.component.ts`) con servicio de
> selección (`drag-box-selection.service.ts`), que además de mover permite redimensionar
> (ancho/alto en %). El helper de render retrocompatible es `posStyle`
> (`core/utils/element-position.util.ts`). Único pendiente: botón "Restablecer posiciones"
> (Fase 5, tareas 18-19).

## Fase 1 — Modelo y base de render

- [x] 1. Agregar tipos `ElementPosition` y `ElementPositions` en `core/models/models.ts`. (R3, R4)
- [x] 2. Agregar campos opcionales a los configs:
  - [x] 2.1 `EnvelopeConfig.plainPositions?: ElementPositions`.
  - [x] 2.2 `IntroConfig.positions?: ElementPositions`.
  - [x] 2.3 `HeroConfig.positions?: ElementPositions`.
  (R3, R4)
- [x] 3. Verificar/ajustar `MigrationService`/`ensureConfigDefaults` para que los campos nuevos sean opcionales y no rompan configs viejos (no forzar defaults). (R4)

## Fase 2 — Render de posiciones (sin interacción aún)

- [x] 4. Crear helper compartido `posStyle(key, positions, isMobile)` (util o mixin) que devuelva `{}` o el objeto `position:absolute` centrado. (R3, R4)
- [x] 5. Envelope (plain): poner `.plain-container` en `position:relative`; aplicar `posStyle` a título, subtítulo, contenido e instrucción; recibir `@Input() previewDevice` y `isMobile`. (R4, R6)
- [x] 6. Intro: `position:relative` en el contenedor; aplicar `posStyle` a la frase. (R4, R6)
- [x] 7. Hero: `position:relative` en `.hero-content`; aplicar `posStyle` a tipo de evento, nombres, descripción, frase y countdown (wrapper). (R4, R6)
- [x] 8. Verificar que sin posiciones guardadas las tres secciones se ven idénticas a hoy (desktop y mobile). (R4)
- [x] 9. Verificar animaciones de entrada con elementos posicionados (ajustar transforms si colisionan). (R6, riesgo del diseño)

## Fase 3 — Interacción de arrastre asistido (solo canvas)

- [x] 10. Interacción de arrastre asistido. Nota: se implementó como componente `app-drag-box` (`core/components/drag-box.component.ts`) en lugar de la directiva `appAssistedDrag` original. Maneja mouse/touch, calcula posición en % relativa al rect de la sección (`[data-drag-bounds]`), snap a guías, confinamiento, y emite la nueva posición. También soporta redimensionado (ancho/alto en %). La directiva `appAssistedDrag` (`core/directives/assisted-drag.directive.ts`) queda como variante previa. (R1, R2, R7)
- [x] 11. Añadir a los componentes: `@Input() editable`, `@Input() previewDevice`, `@Output() positionsChange`. Montar `app-drag-box` en cada elemento movible solo si `editable` (envelope, hero e intro). (R1, R6)
- [x] 12. Implementar `preventDefault`/`stopPropagation` para que el drag no abra el envelope ni rompa el scroll del canvas. (R1, R7)
- [x] 13. Dibujar guías de alineación durante el arrastre (líneas absolutas dentro de la sección). (R2)
- [x] 14. Indicadores de usabilidad: cursor `move` y/o contorno al hover/touch sobre elemento movible. (R7)

## Fase 4 — Integración con el builder

- [x] 15. En `builder.component.ts`, pasar `editable=true` y `previewDevice` a las tres secciones en modo canvas; `editable=false` en preview. (R6)
- [x] 16. Conectar `(positionsChange)` → persistir con `setSec`/handlers (`onEnvelopePositionsChange`, `onHeroPositionsChange`, intro) en el dispositivo activo + marcar dirty. (R1, R3)
- [x] 17. Asegurar que el click de arrastre no interfiera con la selección de sección existente. (R7)

## Fase 5 — Panel de propiedades (reset)

- [ ] 18. Agregar botón "Restablecer posiciones" en el panel de Pantalla de Inicio (solo si template Plano), Intro y Carátula. (R5)  **← PENDIENTE**
- [ ] 19. Implementar reset con confirmación (DialogService): borra las posiciones de la sección y vuelve al layout por defecto. (R5)  **← PENDIENTE**

## Fase 6 — Landing real y responsive

- [x] 20. En la landing real, pasar `isMobile` reactivo (window resize, breakpoint 768px) a las tres secciones para elegir el mapa de posiciones. (R3, R6)
- [x] 21. Verificar fallback de dispositivo (si solo hay posición en uno). (R3)

## Fase 7 — Verificación y build

- [x] 22. Pruebas manuales: mover cada elemento en desktop y mobile; snap; confinamiento; reflejo en preview y landing; retrocompat; sin romper envelope/scroll/animaciones. (R1–R7)
- [x] 23. Rebuild Docker del frontend y validar en navegador.

## Notas de implementación
- Se reutilizó el patrón de drag custom del editor de tarjetas (mousedown/move/up + cálculo relativo), no CDK.
- Todo es aditivo: ningún cambio altera invitaciones sin posiciones guardadas.
- El breakpoint mobile/desktop es 768px, coherente con el resto del proyecto.
- El autoguardado del builder está deshabilitado: los cambios se persisten a Preview/landing al pulsar "Guardar".
- El reset de tamaño al recargar ya está resuelto (el ancho/alto arrastrado persiste tras refrescar).

## Pendiente para próxima sesión
- **Botón "Restablecer posiciones"** (tareas 18-19): control en el props-panel para Plano, Intro y Carátula que borre las posiciones personalizadas de la sección (con confirmación vía `DialogService`) y devuelva el layout por defecto.
