# Tareas — Posicionamiento asistido de elementos en secciones de apertura

> Orden sugerido. Cada tarea referencia los requerimientos (R1–R7) que cubre.

## Fase 1 — Modelo y base de render

- [ ] 1. Agregar tipos `ElementPosition` y `ElementPositions` en `core/models/models.ts`. (R3, R4)
- [ ] 2. Agregar campos opcionales a los configs:
  - [ ] 2.1 `EnvelopeConfig.plainPositions?: ElementPositions`.
  - [ ] 2.2 `IntroConfig.positions?: ElementPositions`.
  - [ ] 2.3 `HeroConfig.positions?: ElementPositions`.
  (R3, R4)
- [ ] 3. Verificar/ajustar `MigrationService`/`ensureConfigDefaults` para que los campos nuevos sean opcionales y no rompan configs viejos (no forzar defaults). (R4)

## Fase 2 — Render de posiciones (sin interacción aún)

- [ ] 4. Crear helper compartido `posStyle(key, positions, isMobile)` (util o mixin) que devuelva `{}` o el objeto `position:absolute` centrado. (R3, R4)
- [ ] 5. Envelope (plain): poner `.plain-container` en `position:relative`; aplicar `posStyle` a título, subtítulo, contenido e instrucción; recibir `@Input() previewDevice` y `isMobile`. (R4, R6)
- [ ] 6. Intro: `position:relative` en el contenedor; aplicar `posStyle` a la frase. (R4, R6)
- [ ] 7. Hero: `position:relative` en `.hero-content`; aplicar `posStyle` a tipo de evento, nombres, descripción, frase y countdown (wrapper). (R4, R6)
- [ ] 8. Verificar que sin posiciones guardadas las tres secciones se ven idénticas a hoy (desktop y mobile). (R4)
- [ ] 9. Verificar animaciones de entrada con elementos posicionados (ajustar transforms si colisionan). (R6, riesgo del diseño)

## Fase 3 — Interacción de arrastre asistido (solo canvas)

- [ ] 10. Crear directiva `appAssistedDrag` (sin CDK): maneja mouse/touch, calcula posición en % relativa al rect de la sección, snap a guías (centro/bordes/tercios), confinamiento 5–95%, y emite la nueva posición. (R1, R2, R7)
- [ ] 11. Añadir a los tres componentes: `@Input() editable`, `@Input() previewDevice`, `@Output() positionsChange`. Montar la directiva en cada elemento movible solo si `editable`. (R1, R6)
- [ ] 12. Implementar `preventDefault`/`stopPropagation` para que el drag no abra el envelope ni rompa el scroll del canvas. (R1, R7)
- [ ] 13. Dibujar guías de alineación durante el arrastre (líneas absolutas dentro de la sección). (R2)
- [ ] 14. Indicadores de usabilidad: cursor `move` y/o contorno al hover/touch sobre elemento movible. (R7)

## Fase 4 — Integración con el builder

- [ ] 15. En `builder.component.ts`, pasar `editable=true` y `previewDevice` a las tres secciones en modo canvas; `editable=false` en preview. (R6)
- [ ] 16. Conectar `(positionsChange)` → persistir con `setSec` en el dispositivo activo + marcar dirty/auto-save. (R1, R3)
- [ ] 17. Asegurar que el click de arrastre no interfiera con la selección de sección existente. (R7)

## Fase 5 — Panel de propiedades (reset)

- [ ] 18. Agregar botón "Restablecer posiciones" en el panel de Pantalla de Inicio (solo si template Plano), Intro y Carátula. (R5)
- [ ] 19. Implementar reset con confirmación (DialogService): borra las posiciones de la sección y vuelve al layout por defecto. (R5)

## Fase 6 — Landing real y responsive

- [ ] 20. En la landing real, pasar `isMobile` reactivo (window resize, breakpoint 768px) a las tres secciones para elegir el mapa de posiciones. (R3, R6)
- [ ] 21. Verificar fallback de dispositivo (si solo hay posición en uno). (R3)

## Fase 7 — Verificación y build

- [ ] 22. Pruebas manuales: mover cada elemento en desktop y mobile; snap; confinamiento; reset; reflejo en preview y landing; retrocompat; sin romper envelope/scroll/animaciones. (R1–R7)
- [ ] 23. Rebuild Docker del frontend y validar en navegador.

## Notas de implementación
- Reutilizar el patrón de drag custom del editor de tarjetas (mousedown/move/up + cálculo relativo), no CDK.
- Mantener todo aditivo: ningún cambio debe alterar invitaciones sin posiciones guardadas.
- El breakpoint mobile/desktop debe ser coherente con el resto del proyecto (768px).
