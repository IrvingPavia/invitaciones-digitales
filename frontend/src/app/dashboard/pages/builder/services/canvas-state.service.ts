import { Injectable, signal, computed } from '@angular/core';
import {
  CanvasElement,
  CanvasElementType,
  CanvasSectionData,
  EventConfigV2,
  ELEMENT_DEFAULTS,
  AnyCanvasElement
} from '../../../../core/models/canvas.models';
import { EventConfig } from '../../../../core/models/models';

interface CanvasState {
  config: EventConfigV2 | null;
  selectedSection: string | null;
  selectedElement: string | null;
  editingMode: 'desktop' | 'mobile';
}

@Injectable({ providedIn: 'root' })
export class CanvasStateService {
  // Core state
  private state = signal<CanvasState>({
    config: null,
    selectedSection: null,
    selectedElement: null,
    editingMode: 'desktop'
  });

  // Undo/Redo stacks
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private readonly MAX_UNDO = 50;

  // Public signals
  readonly config = computed(() => this.state().config);
  readonly selectedSection = computed(() => this.state().selectedSection);
  readonly selectedElement = computed(() => this.state().selectedElement);
  readonly editingMode = computed(() => this.state().editingMode);
  readonly isDirty = signal(false);

  /** Get the selected element object */
  readonly activeElement = computed(() => {
    const s = this.state();
    if (!s.config || !s.selectedSection || !s.selectedElement) return null;
    const section = (s.config as any)[s.selectedSection];
    if (!section?.canvas?.elements) return null;
    return section.canvas.elements.find((el: CanvasElement) => el.id === s.selectedElement) || null;
  });

  /** Get elements for the selected section */
  readonly sectionElements = computed(() => {
    const s = this.state();
    if (!s.config || !s.selectedSection) return [];
    const section = (s.config as any)[s.selectedSection];
    return section?.canvas?.elements || [];
  });

  // ===== Initialization =====

  initializeState(config: EventConfig): EventConfigV2 {
    const v2 = this.ensureV2(config);
    this.state.set({
      config: v2,
      selectedSection: null,
      selectedElement: null,
      editingMode: 'desktop'
    });
    this.undoStack = [];
    this.redoStack = [];
    this.isDirty.set(false);
    return v2;
  }

  /** Convert V1 config to V2 if needed (adds canvas property to sections) */
  private ensureV2(config: EventConfig): EventConfigV2 {
    if ((config as EventConfigV2)._version === 2) {
      return config as EventConfigV2;
    }
    // Mark as V2 but don't auto-migrate elements yet — let user trigger migration per section
    return { ...config, _version: 2 } as EventConfigV2;
  }

  // ===== Selection =====

  selectSection(sectionKey: string | null) {
    this.state.update(s => ({ ...s, selectedSection: sectionKey, selectedElement: null }));
  }

  selectElement(sectionKey: string, elementId: string | null) {
    this.state.update(s => ({ ...s, selectedSection: sectionKey, selectedElement: elementId }));
  }

  setEditingMode(mode: 'desktop' | 'mobile') {
    this.state.update(s => ({ ...s, editingMode: mode }));
  }

  // ===== Element CRUD =====

  addElement(sectionKey: string, type: CanvasElementType, initialProps?: Partial<CanvasElement>): string {
    this.pushUndo();
    const config = this.state().config;
    if (!config) return '';

    const section = (config as any)[sectionKey];
    if (!section) return '';

    // Ensure canvas exists
    if (!section.canvas) {
      section.canvas = { version: 2, minHeight: 60, elements: [] };
    }

    const defaults = ELEMENT_DEFAULTS[type];
    const maxZ = section.canvas.elements.length > 0
      ? Math.max(...section.canvas.elements.map((e: CanvasElement) => e.zIndex))
      : 0;

    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      x: 25,
      y: 25,
      width: defaults.width,
      height: defaults.height,
      zIndex: maxZ + 1,
      ...initialProps
    };

    // Add type-specific defaults
    if (type === 'text') {
      (newElement as any).content = 'Nuevo texto';
      (newElement as any).fontSize = 24;
      (newElement as any).textAlign = 'center';
      (newElement as any).color = '#ffffff';
    }

    section.canvas.elements.push(newElement);
    this.state.update(s => ({ ...s, config: { ...config } }));
    this.isDirty.set(true);
    return newElement.id;
  }

  removeElement(sectionKey: string, elementId: string) {
    this.pushUndo();
    const config = this.state().config;
    if (!config) return;

    const section = (config as any)[sectionKey];
    if (!section?.canvas?.elements) return;

    section.canvas.elements = section.canvas.elements.filter((e: CanvasElement) => e.id !== elementId);

    // Deselect if removed element was selected
    const s = this.state();
    const newSelected = s.selectedElement === elementId ? null : s.selectedElement;

    this.state.update(st => ({ ...st, config: { ...config }, selectedElement: newSelected }));
    this.isDirty.set(true);
  }

  updateElementPosition(sectionKey: string, elementId: string, x: number, y: number) {
    const config = this.state().config;
    if (!config) return;

    const section = (config as any)[sectionKey];
    if (!section?.canvas?.elements) return;

    const el = section.canvas.elements.find((e: CanvasElement) => e.id === elementId);
    if (!el || el.locked) return;

    // Clamp within bounds
    const clampedX = Math.max(0, Math.min(100 - el.width, Math.round(x)));
    const clampedY = Math.max(0, Math.min(100 - el.height, Math.round(y)));

    if (this.state().editingMode === 'mobile') {
      if (!el.mobileOverride) el.mobileOverride = {};
      el.mobileOverride.x = clampedX;
      el.mobileOverride.y = clampedY;
    } else {
      el.x = clampedX;
      el.y = clampedY;
    }

    this.state.update(s => ({ ...s, config: { ...config } }));
    this.isDirty.set(true);
  }

  resizeElement(sectionKey: string, elementId: string, width: number, height: number) {
    this.pushUndo();
    const config = this.state().config;
    if (!config) return;

    const section = (config as any)[sectionKey];
    if (!section?.canvas?.elements) return;

    const el = section.canvas.elements.find((e: CanvasElement) => e.id === elementId);
    if (!el || el.locked) return;

    // Enforce minimums and bounds
    const newWidth = Math.max(5, Math.min(100, Math.round(width)));
    const newHeight = Math.max(5, Math.min(100, Math.round(height)));

    // Ensure it stays within section
    if (el.x + newWidth > 100) return;

    if (this.state().editingMode === 'mobile') {
      if (!el.mobileOverride) el.mobileOverride = {};
      el.mobileOverride.width = newWidth;
      el.mobileOverride.height = newHeight;
    } else {
      el.width = newWidth;
      el.height = newHeight;
    }

    this.state.update(s => ({ ...s, config: { ...config } }));
    this.isDirty.set(true);
  }

  updateElementProperties(sectionKey: string, elementId: string, props: Partial<AnyCanvasElement>) {
    this.pushUndo();
    const config = this.state().config;
    if (!config) return;

    const section = (config as any)[sectionKey];
    if (!section?.canvas?.elements) return;

    const el = section.canvas.elements.find((e: CanvasElement) => e.id === elementId);
    if (!el) return;

    Object.assign(el, props);
    this.state.update(s => ({ ...s, config: { ...config } }));
    this.isDirty.set(true);
  }

  lockElement(sectionKey: string, elementId: string, locked: boolean) {
    const config = this.state().config;
    if (!config) return;

    const section = (config as any)[sectionKey];
    if (!section?.canvas?.elements) return;

    const el = section.canvas.elements.find((e: CanvasElement) => e.id === elementId);
    if (!el) return;

    el.locked = locked;
    this.state.update(s => ({ ...s, config: { ...config } }));
    this.isDirty.set(true);
  }

  // ===== Z-Index =====

  bringForward(sectionKey: string, elementId: string) {
    this.pushUndo();
    const elements = this.getElements(sectionKey);
    if (!elements) return;

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(e => e.id === elementId);
    if (idx < 0 || idx === sorted.length - 1) return;

    // Swap zIndex with element above
    const temp = sorted[idx].zIndex;
    sorted[idx].zIndex = sorted[idx + 1].zIndex;
    sorted[idx + 1].zIndex = temp;

    this.notifyChange();
  }

  sendBackward(sectionKey: string, elementId: string) {
    this.pushUndo();
    const elements = this.getElements(sectionKey);
    if (!elements) return;

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(e => e.id === elementId);
    if (idx <= 0) return;

    const temp = sorted[idx].zIndex;
    sorted[idx].zIndex = sorted[idx - 1].zIndex;
    sorted[idx - 1].zIndex = temp;

    this.notifyChange();
  }

  bringToFront(sectionKey: string, elementId: string) {
    this.pushUndo();
    const elements = this.getElements(sectionKey);
    if (!elements) return;

    const maxZ = Math.max(...elements.map(e => e.zIndex));
    const el = elements.find(e => e.id === elementId);
    if (!el) return;
    el.zIndex = maxZ + 1;

    this.notifyChange();
  }

  sendToBack(sectionKey: string, elementId: string) {
    this.pushUndo();
    const elements = this.getElements(sectionKey);
    if (!elements) return;

    const el = elements.find(e => e.id === elementId);
    if (!el) return;

    // Shift all others up, set this to 0
    elements.forEach(e => { if (e.id !== elementId) e.zIndex++; });
    el.zIndex = 0;

    this.notifyChange();
  }

  // ===== Undo / Redo =====

  pushUndo() {
    const config = this.state().config;
    if (!config) return;
    this.undoStack.push(JSON.stringify(config));
    if (this.undoStack.length > this.MAX_UNDO) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const config = this.state().config;
    if (config) {
      this.redoStack.push(JSON.stringify(config));
    }
    const prev = JSON.parse(this.undoStack.pop()!);
    this.state.update(s => ({ ...s, config: prev }));
    this.isDirty.set(true);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const config = this.state().config;
    if (config) {
      this.undoStack.push(JSON.stringify(config));
    }
    const next = JSON.parse(this.redoStack.pop()!);
    this.state.update(s => ({ ...s, config: next }));
    this.isDirty.set(true);
  }

  get canUndo(): boolean { return this.undoStack.length > 0; }
  get canRedo(): boolean { return this.redoStack.length > 0; }

  // ===== Config Access =====

  getConfig(): EventConfigV2 | null {
    return this.state().config;
  }

  // ===== Validation =====

  validateElements(elements: CanvasElement[]): CanvasElement[] {
    return elements.filter(el => {
      const valid = el.id && el.type && typeof el.x === 'number' && typeof el.y === 'number'
        && typeof el.width === 'number' && typeof el.height === 'number'
        && typeof el.zIndex === 'number';
      if (!valid) {
        console.warn('[CanvasState] Removed invalid element:', el);
      }
      return valid;
    });
  }

  // ===== Helpers =====

  private getElements(sectionKey: string): CanvasElement[] | null {
    const config = this.state().config;
    if (!config) return null;
    const section = (config as any)[sectionKey];
    return section?.canvas?.elements || null;
  }

  private notifyChange() {
    const config = this.state().config;
    this.state.update(s => ({ ...s, config: config ? { ...config } : null }));
    this.isDirty.set(true);
  }
}
