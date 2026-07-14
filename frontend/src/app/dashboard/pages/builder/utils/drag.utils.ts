import { CanvasElement, SnapGuides } from '../../../../core/models/canvas.models';

/**
 * Core drag algorithm — converts pixel movement to percentage-based positioning
 * with snap guides for alignment.
 */
export function onDragMove(
  clientX: number,
  clientY: number,
  dragging: CanvasElement,
  sectionRect: DOMRect,
  dragStartX: number,
  dragStartY: number,
  elStartX: number,
  elStartY: number,
  siblingElements: CanvasElement[],
  snapThreshold: number = 2
): { newX: number; newY: number; guides: SnapGuides } {
  // Convert pixel delta to percentage
  const dx = ((clientX - dragStartX) / sectionRect.width) * 100;
  const dy = ((clientY - dragStartY) / sectionRect.height) * 100;

  // Clamp within bounds [0, 100 - elementWidth]
  let newX = Math.max(0, Math.min(100 - dragging.width, elStartX + dx));
  let newY = Math.max(0, Math.min(100 - dragging.height, elStartY + dy));

  const guides: SnapGuides = { vertical: null, horizontal: null };

  // Element center
  const elCenterX = newX + dragging.width / 2;
  const elCenterY = newY + dragging.height / 2;

  // Snap to section center (50%)
  if (Math.abs(elCenterX - 50) < snapThreshold) {
    newX = 50 - dragging.width / 2;
    guides.vertical = 50;
  }
  if (Math.abs(elCenterY - 50) < snapThreshold) {
    newY = 50 - dragging.height / 2;
    guides.horizontal = 50;
  }

  // Snap to sibling elements
  for (const sibling of siblingElements) {
    if (sibling.id === dragging.id) continue;

    const sibCenterX = sibling.x + sibling.width / 2;
    const sibCenterY = sibling.y + sibling.height / 2;
    const updatedCenterX = newX + dragging.width / 2;
    const updatedCenterY = newY + dragging.height / 2;

    // Center-to-center alignment (X)
    if (Math.abs(updatedCenterX - sibCenterX) < snapThreshold) {
      newX = sibCenterX - dragging.width / 2;
      guides.vertical = sibCenterX;
    }

    // Center-to-center alignment (Y)
    if (Math.abs(updatedCenterY - sibCenterY) < snapThreshold) {
      newY = sibCenterY - dragging.height / 2;
      guides.horizontal = sibCenterY;
    }

    // Left-edge alignment
    if (Math.abs(newX - sibling.x) < snapThreshold) {
      newX = sibling.x;
      guides.vertical = sibling.x;
    }

    // Right-edge alignment
    if (Math.abs((newX + dragging.width) - (sibling.x + sibling.width)) < snapThreshold) {
      newX = sibling.x + sibling.width - dragging.width;
      guides.vertical = sibling.x + sibling.width;
    }

    // Top-edge alignment
    if (Math.abs(newY - sibling.y) < snapThreshold) {
      newY = sibling.y;
      guides.horizontal = sibling.y;
    }

    // Bottom-edge alignment
    if (Math.abs((newY + dragging.height) - (sibling.y + sibling.height)) < snapThreshold) {
      newY = sibling.y + sibling.height - dragging.height;
      guides.horizontal = sibling.y + sibling.height;
    }
  }

  return {
    newX: Math.round(Math.max(0, Math.min(100 - dragging.width, newX))),
    newY: Math.round(Math.max(0, Math.min(100 - dragging.height, newY))),
    guides
  };
}

/**
 * Compute resize based on mouse movement.
 */
export function onResizeMove(
  clientX: number,
  clientY: number,
  element: CanvasElement,
  sectionRect: DOMRect,
  resizeStartX: number,
  resizeStartY: number,
  elStartWidth: number,
  elStartHeight: number
): { newWidth: number; newHeight: number } {
  const dx = ((clientX - resizeStartX) / sectionRect.width) * 100;
  const dy = ((clientY - resizeStartY) / sectionRect.height) * 100;

  let newWidth = Math.max(5, Math.round(elStartWidth + dx));
  let newHeight = Math.max(5, Math.round(elStartHeight + dy));

  // Ensure element doesn't overflow section
  if (element.x + newWidth > 100) {
    newWidth = 100 - element.x;
  }
  if (element.y + newHeight > 100) {
    newHeight = 100 - element.y;
  }

  return { newWidth: Math.max(5, newWidth), newHeight: Math.max(5, newHeight) };
}
