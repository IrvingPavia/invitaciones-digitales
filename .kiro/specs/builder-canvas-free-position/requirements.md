# Requirements Document

## Introduction

This document specifies the requirements for the Builder Canvas Free Position feature, which transforms the Vitely Builder from a fixed-layout section editor into a free-position canvas editor. Each section becomes an independent canvas where elements (text, countdown, gallery, icons, decorators) can be freely positioned using percentage-based coordinates. The system maintains backward compatibility with existing configurations while enabling a more flexible design experience.

## Glossary

- **Builder**: The dashboard component where event organizers design and customize their invitation landing page
- **Canvas**: A section rendered in free-position mode where child elements are absolutely positioned using percentage-based coordinates
- **CanvasElement**: A positioned item within a section canvas (text, image, icon, countdown, etc.) with x, y, width, height as percentages
- **SectionCanvas**: A single section container acting as a relative-positioned canvas for its child elements
- **CanvasStateService**: Central Angular service managing canvas editor state using signals, including undo/redo
- **MigrationService**: Service responsible for converting legacy V1 configurations to V2 canvas format
- **LandingPage**: The public-facing invitation page rendered from event configuration data
- **EventConfig**: The JSON configuration object stored in the database that defines all aspects of an event's landing page
- **EventConfigV2**: Extended EventConfig with `_version: 2` and optional `canvas` property per section
- **SnapGuide**: Visual alignment aid displayed during drag operations when elements align with section center or sibling edges
- **MobileOverride**: Optional per-element position/size overrides applied when viewport width is below 768px
- **LegacyRenderer**: The existing section rendering approach used for configs without canvas data
- **FreePositionRenderer**: The new rendering mode that positions elements absolutely within a section based on percentage coordinates

## Requirements

### Requirement 1: Free-Position Element Placement

**User Story:** As an event organizer, I want to drag and position elements freely within a section canvas, so that I can create custom layouts without being limited to fixed templates.

#### Acceptance Criteria

1. WHEN a user drags an element within a section canvas, THE Builder SHALL update the element position using percentage-based coordinates relative to the section container
2. THE Builder SHALL constrain element positions so that `x >= 0`, `x + width <= 100`, `y >= 0`, and `y + height <= 100` at all times
3. WHEN an element is being dragged, THE Builder SHALL display snap guides when the element center aligns with the section center (50%) within a 2% threshold
4. WHEN an element is being dragged near a sibling element, THE Builder SHALL display snap guides for center-to-center and edge-to-edge alignment within a 2% threshold
5. WHEN a drag operation completes, THE Builder SHALL store the final position as integer percentage values (rounded)

### Requirement 2: Element Resize

**User Story:** As an event organizer, I want to resize elements within the canvas, so that I can control how much space each element occupies in my layout.

#### Acceptance Criteria

1. WHEN a user resizes an element, THE Builder SHALL update element width and height while enforcing a minimum of 5% for both dimensions
2. WHEN a user resizes an element, THE Builder SHALL prevent the element from exceeding section bounds (x + newWidth <= 100)
3. WHEN a resize operation occurs, THE Builder SHALL preserve the element position (x, y) unchanged

### Requirement 3: Element Management

**User Story:** As an event organizer, I want to add, remove, and configure elements in my section canvas, so that I can compose my invitation layout with the content I need.

#### Acceptance Criteria

1. WHEN a user adds a new element to a section, THE Builder SHALL assign a unique UUID as the element ID
2. WHEN a user adds a new element to a section, THE Builder SHALL assign a zIndex value equal to the maximum existing zIndex plus one
3. WHEN a user adds a new element without specifying position, THE Builder SHALL place the element at default position (x=25, y=25, width=50, height=30)
4. THE Builder SHALL support the following element types: text, image, icon, decorator, countdown, gallery, detail-cards, venue-cards, itinerary, rsvp-form, gifts-block, dresscode-block, separator, spacer
5. WHEN a user selects an element, THE Builder SHALL display a context-sensitive properties panel with type-specific editing options

### Requirement 4: Undo and Redo

**User Story:** As an event organizer, I want to undo and redo my canvas editing actions, so that I can experiment freely without fear of making irreversible mistakes.

#### Acceptance Criteria

1. WHEN a user performs an undo action after N operations, THE CanvasStateService SHALL restore the state to the result of N-1 operations
2. WHEN a user performs a redo action after an undo, THE CanvasStateService SHALL restore the state to the value before the undo
3. THE CanvasStateService SHALL cap the undo stack at 50 entries to limit memory usage
4. WHEN any element position, size, or property change occurs, THE CanvasStateService SHALL push the previous state to the undo stack

### Requirement 5: Configuration Migration

**User Story:** As an event organizer with existing events, I want my current invitation configurations to be automatically upgraded to the canvas format, so that I can use the new editor without losing my existing content.

#### Acceptance Criteria

1. WHEN the Builder loads a legacy EventConfig (without `_version` or `_version === 1`), THE MigrationService SHALL convert it to EventConfigV2 format with `_version: 2`
2. WHEN migrating a legacy config, THE MigrationService SHALL preserve all original field values unchanged alongside the new canvas data
3. WHEN migrating a section, THE MigrationService SHALL generate canvas elements with sensible default positions based on section type
4. THE MigrationService SHALL produce identical output when applied to an already-migrated V2 config (idempotent migration)
5. IF migration fails due to unexpected config structure, THEN THE MigrationService SHALL leave the section without canvas data and fall back to legacy rendering

### Requirement 6: Backward-Compatible Rendering

**User Story:** As a visitor viewing an invitation, I want the landing page to display correctly regardless of whether the event uses the new canvas format or the legacy format, so that all invitations remain functional.

#### Acceptance Criteria

1. WHEN the LandingPage loads a config without a `canvas` property on a section, THE FreePositionRenderer SHALL not be used and THE LegacyRenderer SHALL render that section
2. WHEN the LandingPage loads a config with `canvas.version === 2` and non-empty elements array, THE FreePositionRenderer SHALL render elements using absolute positioning within a relative container
3. WHEN rendering in free-position mode, THE FreePositionRenderer SHALL position elements sorted by ascending zIndex order (lower zIndex rendered first, higher on top)
4. WHEN rendering elements, THE FreePositionRenderer SHALL filter out elements with `visible === false`

### Requirement 7: Responsive Mobile Rendering

**User Story:** As a visitor viewing an invitation on a mobile device, I want the elements to be appropriately positioned for my screen size, so that the invitation is readable and well-designed on any device.

#### Acceptance Criteria

1. WHEN the viewport width is below 768px and an element has a `mobileOverride`, THE FreePositionRenderer SHALL use the override values for x, y, width, and height
2. WHEN the viewport width is below 768px and an element has no `mobileOverride`, THE FreePositionRenderer SHALL use the default desktop percentage positions
3. WHEN the viewport width is below 768px and a `mobileOverride` sets `visible: false`, THE FreePositionRenderer SHALL hide that element on mobile
4. WHEN editing in mobile preview mode, THE Builder SHALL update the `mobileOverride` property instead of the base position

### Requirement 8: Canvas Data Validation

**User Story:** As a system operator, I want the system to validate canvas data on load, so that corrupted or malformed configurations do not crash the editor or landing page.

#### Acceptance Criteria

1. WHEN loading canvas elements, THE CanvasStateService SHALL validate each element for required fields (id, type, x, y, width, height, zIndex)
2. IF a canvas element has invalid or missing required fields, THEN THE CanvasStateService SHALL remove the invalid element from the canvas and log a warning
3. IF all elements in a section are invalid, THEN THE CanvasStateService SHALL fall back to legacy rendering for that section
4. WHEN an element position overflows bounds (x + width > 100), THE FreePositionRenderer SHALL clamp the position at display time using `Math.min(x, 100 - width)`

### Requirement 9: Element Uniqueness and Ordering

**User Story:** As an event organizer, I want each element to have a unique identity and predictable stacking order, so that my layout behaves consistently.

#### Acceptance Criteria

1. THE Builder SHALL ensure all element IDs within a single section are unique
2. WHEN elements overlap visually, THE FreePositionRenderer SHALL render them according to their zIndex value (higher zIndex appears in front)
3. WHEN a user reorders element stacking, THE Builder SHALL update zIndex values while preserving relative order of unaffected elements

### Requirement 10: State Persistence

**User Story:** As an event organizer, I want my canvas changes to be saved reliably, so that I do not lose my work.

#### Acceptance Criteria

1. WHEN any canvas state change occurs, THE CanvasStateService SHALL set a dirty flag to indicate unsaved changes
2. WHEN the user triggers a save action, THE Builder SHALL persist the complete EventConfigV2 (including all canvas data) to the backend API
3. WHEN the Builder reloads a previously saved V2 config, THE CanvasStateService SHALL restore element positions and properties exactly as saved

### Requirement 11: Section Canvas Container

**User Story:** As an event organizer, I want each section to act as an independent canvas with its own background and minimum height, so that I can design each part of my invitation separately.

#### Acceptance Criteria

1. THE SectionCanvas SHALL render with `position: relative` to serve as the positioning context for child elements
2. WHEN a section has a `minHeight` value defined, THE SectionCanvas SHALL apply it as minimum height in viewport height units (vh)
3. THE SectionCanvas SHALL support section-level background styling (color, gradient, image) independently from element positioning
4. WHEN a user locks an element, THE Builder SHALL prevent position and size changes to that element until unlocked
