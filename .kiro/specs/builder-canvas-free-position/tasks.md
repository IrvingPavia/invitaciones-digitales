# Implementation Plan: Builder Canvas Free Position

## Overview

Transform the Vitely Builder from a fixed-layout section editor into a free-position canvas editor. Each section becomes an independent canvas where elements are freely positioned using percentage-based coordinates. The implementation follows a progressive approach: data models first, then core state management, then builder UI with drag/resize, then landing page rendering, and finally migration logic.

## Tasks

- [ ] 1. Define data models and core interfaces
  - [ ] 1.1 Create canvas element interfaces and types in `frontend/src/app/core/models/canvas.models.ts`
    - Define `CanvasElement` base interface with id, type, x, y, width, height, zIndex, locked, visible, mobileOverride
    - Define `CanvasElementType` union type with all supported element types
    - Define `ResponsiveOverride` interface
    - Define type-specific element interfaces: `TextCanvasElement`, `ImageCanvasElement`, `IconCanvasElement`, `DecoratorCanvasElement`, `CountdownCanvasElement`, `GalleryCanvasElement`, `DetailCardsCanvasElement`, `VenueCardsCanvasElement`, `RsvpFormCanvasElement`
    - Define `CanvasSectionConfig` interface with version, minHeight, elements
    - Define `EventConfigV2` interface extending existing `EventConfig` with optional `canvas` per section and `_version` field
    - Define `SnapGuides` interface with vertical/horizontal number or null
    - _Requirements: 1.1, 1.2, 2.1, 3.4, 6.2, 7.1, 11.1_

  - [ ] 1.2 Update existing models file to export canvas types from `frontend/src/app/core/models/models.ts`
    - Add re-export of all canvas model types
    - Ensure backward compatibility with existing imports
    - _Requirements: 5.2, 6.1_

- [ ] 2. Implement CanvasStateService
  - [ ] 2.1 Create `frontend/src/app/dashboard/pages/builder/services/canvas-state.service.ts`
    - Implement Angular injectable service using signals for state management
    - Define canvas state signal holding all sections with their canvas elements
    - Implement `initializeState(config)` method that detects V1/V2 format
    - Implement `selectElement(sectionKey, elementId)` method
    - Implement `getConfig()` method to serialize state back to EventConfigV2
    - Implement `isDirty` signal flag
    - _Requirements: 10.1, 10.3, 5.1_

  - [ ] 2.2 Implement element CRUD operations in CanvasStateService
    - Implement `addElement(sectionKey, elementType, initialProps?)` — assigns UUID, zIndex = max+1, default position (x=25, y=25, width=50, height=30)
    - Implement `removeElement(sectionKey, elementId)`
    - Implement `updateElementPosition(sectionKey, elementId, newX, newY)` — with bounds clamping
    - Implement `resizeElement(sectionKey, elementId, newWidth, newHeight)` — with min 5% and bounds check, preserves x/y
    - Implement `updateElementProperties(sectionKey, elementId, props)` — for type-specific property edits
    - Implement `lockElement(sectionKey, elementId, locked)` — prevents moves/resizes when locked
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 11.4_

  - [ ] 2.3 Implement undo/redo system in CanvasStateService
    - Implement `pushUndo()` to save current state to undo stack
    - Implement `undo()` method that restores previous state and pushes current to redo stack
    - Implement `redo()` method that restores next state from redo stack
    - Cap undo stack at 50 entries (drop oldest when exceeded)
    - Clear redo stack on new state modification
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.4 Implement canvas data validation in CanvasStateService
    - Implement `validateElements(elements)` — checks required fields (id, type, x, y, width, height, zIndex)
    - Remove invalid elements and log warnings
    - Fall back to legacy rendering if all elements in a section are invalid
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 2.5 Write property tests for CanvasStateService using fast-check
    - **Property 1: Elements stay within section bounds** — after any updateElementPosition or resizeElement, verify x >= 0, x + width <= 100, y >= 0, y + height <= 100
    - **Validates: Requirements 1.2, 2.2, 8.4**

  - [ ]* 2.6 Write property test for element ID uniqueness
    - **Property 2: Element IDs are unique within a section** — after any addElement calls, count of unique IDs equals total element count
    - **Validates: Requirements 3.1, 9.1**

  - [ ]* 2.7 Write property test for undo/redo round-trip
    - **Property 5: Undo/Redo round-trip consistency** — N operations then undo equals state after N-1 operations; undo then redo equals state before undo
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 2.8 Write property test for resize preserving position
    - **Property 11: Resize preserves element position** — after any resizeElement call, x and y remain unchanged
    - **Validates: Requirements 2.3**

  - [ ]* 2.9 Write property test for zIndex assignment
    - **Property 12: New element zIndex assignment** — addElement assigns zIndex = max(existing) + 1
    - **Validates: Requirements 3.2**

  - [ ]* 2.10 Write property test for undo stack cap
    - **Property 20: Undo stack cap** — after more than 50 operations, stack size never exceeds 50
    - **Validates: Requirements 4.3**

  - [ ]* 2.11 Write property test for locked element immutability
    - **Property 19: Locked elements are immutable** — drag/resize on locked element produces no change
    - **Validates: Requirements 11.4**

  - [ ]* 2.12 Write property test for dirty flag
    - **Property 17: Dirty flag on modification** — any state change sets isDirty to true
    - **Validates: Requirements 10.1**

- [ ] 3. Checkpoint - Core state management
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement drag algorithm and snap guides
  - [ ] 4.1 Create `frontend/src/app/dashboard/pages/builder/utils/drag.utils.ts`
    - Implement `onDragMove(clientX, clientY, dragging, sectionRect, dragStartX, dragStartY, elStartX, elStartY, siblingElements, snapThreshold)` function
    - Convert pixel delta to percentage of section dimensions
    - Clamp position within bounds [0, 100 - elementWidth] and [0, 100 - elementHeight]
    - Implement snap-to-center logic (section center at 50%)
    - Implement snap-to-siblings logic (center and edge alignment)
    - Return integer percentage values (rounded) and active snap guides
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 4.2 Write property tests for drag algorithm
    - **Property 9: Drag produces integer percentage coordinates** — any drag output has integer x, y values
    - **Property 10: Snap guide triggers at threshold** — snap guides appear when within 2% of center/sibling
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5**

- [ ] 5. Implement MigrationService
  - [ ] 5.1 Create `frontend/src/app/dashboard/pages/builder/services/migration.service.ts`
    - Implement `migrateToCanvasFormat(config: EventConfig): EventConfigV2` function
    - Implement section-specific element builders: `buildHeroElements`, `buildDetailElements`, `buildVenueElements`, `buildInvitationElements`, `buildItineraryElements`, `buildGalleryElements`, `buildDresscodeElements`, `buildGiftsElements`, `buildRsvpElements`
    - Preserve all original section fields unchanged alongside new canvas data
    - Set `_version: 2` on migrated config
    - Handle edge cases: disabled sections (skip canvas generation), missing fields (wrap in try/catch)
    - Make migration idempotent — if config already has `_version === 2`, return unchanged
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property tests for migration
    - **Property 3: Migration is lossless** — all original field values preserved after migration
    - **Property 8: Migration idempotency** — migrateConfig(migrateConfig(config)) === migrateConfig(config)
    - **Validates: Requirements 5.2, 5.4**

- [ ] 6. Checkpoint - State and logic layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement SectionCanvasComponent (Builder UI)
  - [ ] 7.1 Create `frontend/src/app/dashboard/pages/builder/components/section-canvas/section-canvas.component.ts`
    - Standalone Angular component with OnPush change detection
    - Inputs: `sectionKey`, `elements` (CanvasElement array), `sectionStyle`
    - Render section background (color, gradient, image) with `position: relative`
    - Apply `minHeight` from canvas config in vh units
    - Render child elements using `@for` with `track el.id`
    - Handle mousedown/touchstart on elements to initiate drag
    - Attach document-level mousemove/mouseup listeners during drag (with requestAnimationFrame throttle)
    - Call `onDragMove` utility and update state via CanvasStateService
    - Display snap guide lines (vertical/horizontal) during active drag
    - Emit element selection on click
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3_

  - [ ] 7.2 Create `frontend/src/app/dashboard/pages/builder/components/canvas-element/canvas-element.component.ts`
    - Standalone Angular component with OnPush change detection
    - Input: `element` (CanvasElement), `selected` (boolean)
    - Render at absolute position using `[style.left.%]`, `[style.top.%]`, `[style.width.%]`, `[style.height.%]`, `[style.z-index]`
    - Show selection outline (border/handles) when selected
    - Provide resize handle at bottom-right corner
    - Implement resize logic: mousedown on handle → track mousemove → compute new width/height as percentage → call `resizeElement`
    - Render element content based on type (text content, countdown, image, etc.)
    - Prevent drag/resize when element is locked
    - _Requirements: 2.1, 2.2, 2.3, 3.5, 9.2, 11.4_

  - [ ] 7.3 Create `frontend/src/app/dashboard/pages/builder/components/elements-panel/elements-panel.component.ts`
    - Standalone Angular component listing available element types to add
    - Buttons/cards for each CanvasElementType
    - On click: call `canvasState.addElement(sectionKey, type)` with defaults
    - _Requirements: 3.3, 3.4_

  - [ ] 7.4 Create `frontend/src/app/dashboard/pages/builder/components/properties-panel/properties-panel.component.ts`
    - Standalone Angular component displaying context-sensitive properties for selected element
    - Dynamically render property editors based on `element.type`
    - Include position fields (x, y, width, height) with number inputs
    - Include type-specific fields (font, color, content for text; imageUrl for image; etc.)
    - Include lock toggle and visibility toggle
    - Include zIndex reorder controls (bring forward, send backward)
    - Update properties via `canvasState.updateElementProperties()`
    - _Requirements: 3.5, 9.3, 11.4_

- [ ] 8. Refactor BuilderComponent to integrate canvas editor
  - [ ] 8.1 Update `frontend/src/app/dashboard/pages/builder/builder.component.ts`
    - Inject CanvasStateService
    - On config load: pass config to `canvasState.initializeState(config)` which triggers migration if needed
    - Replace section-level fixed rendering with SectionCanvas components for V2 sections
    - Wire save button to call `canvasState.getConfig()` and persist via existing API
    - Add undo/redo buttons wired to `canvasState.undo()` / `canvasState.redo()`
    - Add mobile preview toggle that sets editing mode to mobile (updates mobileOverride)
    - Integrate ElementsPanel and PropertiesPanel in layout
    - _Requirements: 5.1, 7.4, 10.1, 10.2, 4.1, 4.2_

  - [ ]* 8.2 Write unit tests for BuilderComponent integration
    - Test config load triggers migration for V1 configs
    - Test save action serializes V2 config correctly
    - Test undo/redo buttons invoke correct service methods
    - _Requirements: 5.1, 10.2, 10.3_

- [ ] 9. Checkpoint - Builder UI complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement FreePositionRenderer for landing page
  - [ ] 10.1 Create `frontend/src/app/landing/components/free-position-section/free-position-section.component.ts`
    - Standalone Angular component with OnPush change detection
    - Input: `canvas` (CanvasSectionConfig.canvas), `sectionStyle`, `config` (full EventConfigV2 for referencing data)
    - Render section container with `position: relative`, `min-height` from canvas.minHeight in vh
    - Apply section background styling
    - Filter out elements with `visible === false`
    - Apply `mobileOverride` positions when viewport < 768px (use `BreakpointObserver` or media query signal)
    - Render elements sorted by ascending zIndex
    - Position each element absolutely using percentage left/top/width/height
    - Clamp overflowing positions at render time: `Math.min(x, 100 - width)`
    - _Requirements: 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.4, 11.2_

  - [ ] 10.2 Create `frontend/src/app/landing/components/canvas-element-renderer/canvas-element-renderer.component.ts`
    - Standalone Angular component rendering element content by type
    - Input: `element` (CanvasElement), `config` (EventConfigV2)
    - Switch on `element.type` to render: text (with styles), image, icon, countdown, gallery, detail-cards, venue-cards, rsvp-form, gifts-block, dresscode-block, separator, spacer
    - Reuse existing landing sub-components internally for complex blocks (gallery, rsvp-form, etc.)
    - _Requirements: 6.2, 3.4_

  - [ ] 10.3 Update `frontend/src/app/landing/landing.component.ts` to support dual rendering
    - Implement `getSectionRenderer(sectionKey, sectionConfig)` logic: returns 'free-position' if canvas.version === 2 and elements non-empty, else 'legacy'
    - For 'free-position' sections: render using `FreePositionSectionComponent`
    - For 'legacy' sections: continue using existing section components
    - _Requirements: 6.1, 6.2_

  - [ ]* 10.4 Write property tests for renderer selection logic
    - **Property 4: Renderer selection based on canvas presence** — absence or empty elements → 'legacy'; version 2 with elements → 'free-position'
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 10.5 Write property tests for rendering logic
    - **Property 6: zIndex render ordering** — output elements sorted ascending by zIndex
    - **Property 13: Visibility filtering** — elements with visible=false excluded; mobile overrides respected
    - **Property 14: Mobile position resolution** — mobileOverride used on mobile, base position on desktop
    - **Validates: Requirements 6.3, 6.4, 7.1, 7.2, 7.3**

- [ ] 11. Checkpoint - Landing page rendering complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement zIndex reordering and stacking
  - [ ] 12.1 Add zIndex reorder methods to CanvasStateService
    - Implement `bringForward(sectionKey, elementId)` — increment target zIndex by 1, swap with element above
    - Implement `sendBackward(sectionKey, elementId)` — decrement target zIndex by 1, swap with element below
    - Implement `bringToFront(sectionKey, elementId)` — set to max zIndex + 1
    - Implement `sendToBack(sectionKey, elementId)` — set to 0, shift all others up
    - Preserve relative order of unaffected elements
    - _Requirements: 9.2, 9.3_

  - [ ]* 12.2 Write property test for stacking reorder
    - **Property 21: Stacking reorder preserves relative order** — reorder on one element preserves relative order of all others
    - **Validates: Requirements 9.3**

- [ ] 13. Implement mobile editing mode
  - [ ] 13.1 Add mobile editing mode to CanvasStateService and SectionCanvasComponent
    - Add `editingMode` signal: 'desktop' | 'mobile'
    - When in mobile mode, drag/resize updates write to `element.mobileOverride` instead of base position
    - SectionCanvasComponent reads mobileOverride positions when in mobile mode
    - Ensure base x, y, width, height remain unchanged during mobile editing
    - _Requirements: 7.4_

  - [ ]* 13.2 Write property test for mobile edit isolation
    - **Property 15: Mobile edit isolation** — edits in mobile mode only modify mobileOverride, base position unchanged
    - **Validates: Requirements 7.4**

- [ ] 14. Update backend config route for V2 support
  - [ ] 14.1 Update `backend/src/routes/config.js` and `backend/src/utils/ensureConfigDefaults.js`
    - Update `ensureConfigDefaults` to handle `_version` field and `canvas` properties gracefully
    - Ensure saving V2 config does not strip or modify canvas data
    - Validate `canvas.version` and `canvas.elements` structure on save (basic schema check)
    - Maintain backward compatibility: V1 configs without `_version` continue to work
    - _Requirements: 10.2, 10.3, 8.1_

  - [ ]* 14.2 Write unit tests for backend config handling
    - Test saving and loading V2 config round-trip preserves all canvas data
    - Test V1 config without _version still loads correctly
    - Test malformed canvas data is handled gracefully
    - **Property 18: Save/load round-trip** — serializing and deserializing produces equivalent config
    - **Validates: Requirements 10.3, 5.2**

- [ ] 15. Implement validation clamping on frontend display
  - [ ] 15.1 Add display-time clamping utility in `frontend/src/app/landing/utils/position.utils.ts`
    - Implement `clampPosition(element: CanvasElement): { x, y, width, height }` that ensures x + width <= 100 and y + height <= 100 at render time
    - Stored values remain unchanged; clamping is visual only
    - Use in FreePositionSectionComponent when setting element styles
    - _Requirements: 8.4_

  - [ ]* 15.2 Write property test for validation filtering
    - **Property 16: Validation filters invalid elements** — elements missing required fields are removed from active canvas
    - **Validates: Requirements 8.1, 8.2**

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- The implementation leverages Angular 18 standalone components and signals throughout
- Custom drag implementation (no CDK for free-form positioning) following the existing CardsComponent pattern
- `fast-check` needs to be added as a dev dependency for property-based testing

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "4.1"] },
    { "id": 2, "tasks": ["2.1", "5.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "4.2", "5.2"] },
    { "id": 4, "tasks": ["2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11", "2.12"] },
    { "id": 5, "tasks": ["7.1", "7.3", "7.4", "14.1"] },
    { "id": 6, "tasks": ["7.2", "12.1", "13.1"] },
    { "id": 7, "tasks": ["8.1", "12.2", "13.2", "14.2"] },
    { "id": 8, "tasks": ["8.2", "10.1", "15.1"] },
    { "id": 9, "tasks": ["10.2"] },
    { "id": 10, "tasks": ["10.3", "15.2"] },
    { "id": 11, "tasks": ["10.4", "10.5"] }
  ]
}
```
