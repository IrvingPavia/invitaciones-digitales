import { Component, Input, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasElement, SnapGuides } from '../../../../../core/models/canvas.models';
import { CanvasStateService } from '../../services/canvas-state.service';
import { onDragMove, onResizeMove } from '../../utils/drag.utils';

@Component({
  selector: 'app-section-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #canvasContainer class="section-canvas-container"
         [style.min-height.vh]="minHeight"
         [style.background]="background"
         (click)="onCanvasClick($event)">

      <!-- Snap Guides -->
      @if (guides().vertical !== null) {
        <div class="snap-guide-v" [style.left.%]="guides().vertical!"></div>
      }
      @if (guides().horizontal !== null) {
        <div class="snap-guide-h" [style.top.%]="guides().horizontal!"></div>
      }

      <!-- Elements -->
      @for (el of elements; track el.id) {
        <div class="canvas-el"
             [class.selected]="canvasState.selectedElement() === el.id"
             [class.locked]="el.locked"
             [style.left.%]="el.x"
             [style.top.%]="el.y"
             [style.width.%]="el.width"
             [style.height.%]="el.height"
             [style.z-index]="el.zIndex"
             (mousedown)="onElMouseDown($event, el)"
             (touchstart)="onElTouchStart($event, el)"
             (click)="onElClick($event, el)">

          <!-- Element content render -->
          <div class="canvas-el-content">
            @switch (el.type) {
              @case ('text') {
                <p class="el-text"
                   [style.font-size.px]="$any(el).fontSize || 16"
                   [style.font-weight]="$any(el).fontWeight || 400"
                   [style.color]="$any(el).color || '#ffffff'"
                   [style.text-align]="$any(el).textAlign || 'center'"
                   [style.font-family]="getFontFamily($any(el).fontFamily)">
                  {{ $any(el).content }}
                </p>
              }
              @case ('countdown') {
                <div class="el-countdown" [class.show-card-bg]="$any(el).showCardBg !== false">
                  <div class="cd-item" [style.border-radius.px]="$any(el).cardBorderRadius ?? 0">
                    <span class="cd-val" [style.color]="$any(el).valueColor || 'var(--theme-text-primary, #fff)'">00</span>
                    <span class="cd-label" [style.color]="$any(el).labelColor || 'rgba(255,255,255,0.5)'">DÍAS</span>
                  </div>
                  <span class="cd-sep">:</span>
                  <div class="cd-item" [style.border-radius.px]="$any(el).cardBorderRadius ?? 0">
                    <span class="cd-val" [style.color]="$any(el).valueColor || 'var(--theme-text-primary, #fff)'">00</span>
                    <span class="cd-label" [style.color]="$any(el).labelColor || 'rgba(255,255,255,0.5)'">HRS</span>
                  </div>
                  <span class="cd-sep">:</span>
                  <div class="cd-item" [style.border-radius.px]="$any(el).cardBorderRadius ?? 0">
                    <span class="cd-val" [style.color]="$any(el).valueColor || 'var(--theme-text-primary, #fff)'">00</span>
                    <span class="cd-label" [style.color]="$any(el).labelColor || 'rgba(255,255,255,0.5)'">MIN</span>
                  </div>
                  <span class="cd-sep">:</span>
                  <div class="cd-item" [style.border-radius.px]="$any(el).cardBorderRadius ?? 0">
                    <span class="cd-val" [style.color]="$any(el).valueColor || 'var(--theme-text-primary, #fff)'">00</span>
                    <span class="cd-label" [style.color]="$any(el).labelColor || 'rgba(255,255,255,0.5)'">SEG</span>
                  </div>
                </div>
              }
              @case ('image') {
                <img class="el-image" [src]="$any(el).imageUrl" [style.border-radius.px]="$any(el).borderRadius || 0" [style.opacity]="$any(el).opacity ?? 1">
              }
              @case ('icon') {
                <span class="el-icon" [style.font-size.px]="$any(el).iconSize || 32" [style.color]="$any(el).iconColor || '#ffffff'">
                  @if ($any(el).iconType === 'emoji') { {{ $any(el).icon }} }
                  @else if ($any(el).iconType === 'material') { <span class="material-icons">{{ $any(el).icon }}</span> }
                </span>
              }
              @case ('decorator') {
                <div class="el-decorator" [style.opacity]="$any(el).opacity ?? 0.6" [style.color]="$any(el).color || '#d4a017'">✦ ✦ ✦</div>
              }
              @case ('separator') {
                <div class="el-separator" [style.background]="$any(el).color || 'rgba(255,255,255,0.2)'"></div>
              }
              @case ('spacer') {
                <div class="el-spacer"></div>
              }
              @default {
                <div class="el-block-placeholder">
                  <span class="material-icons">{{ getBlockIcon(el.type) }}</span>
                  <span>{{ getBlockLabel(el.type) }}</span>
                </div>
              }
            }
          </div>

          <!-- Resize handle -->
          @if (canvasState.selectedElement() === el.id && !el.locked) {
            <div class="resize-handle" (mousedown)="onResizeStart($event, el)" (touchstart)="onResizeTouchStart($event, el)"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .section-canvas-container {
      position: relative; width: 100%; min-height: 200px;
      overflow: hidden; cursor: default;
    }
    .canvas-el {
      position: absolute; cursor: grab;
      border: 1px solid transparent; border-radius: 4px;
      transition: border-color 0.15s;
      &:hover { border-color: rgba(139,92,246,0.3); }
      &.selected { border-color: rgba(139,92,246,0.7); box-shadow: 0 0 0 1px rgba(139,92,246,0.3); }
      &.locked { cursor: not-allowed; opacity: 0.7; }
    }
    .canvas-el-content {
      width: 100%; height: 100%; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
    }
    .el-text { width: 100%; margin: 0; line-height: 1.4; word-break: break-word; }
    .el-countdown {
      display: flex; align-items: center; gap: 8px; justify-content: center; width: 100%;
    }
    .el-countdown.show-card-bg .cd-item {
      background: var(--theme-card-bg, rgba(255,255,255,0.08));
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      padding: 8px 12px;
    }
    .cd-item { display: flex; flex-direction: column; align-items: center; border-radius: 8px; }
    .cd-val { font-size: 24px; font-weight: 700; color: var(--theme-text-primary, #fff); }
    .cd-label { font-size: 9px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
    .cd-sep { font-size: 20px; color: var(--theme-nav-text, #d4a017); font-weight: 700; }
    .el-image { width: 100%; height: 100%; object-fit: cover; }
    .el-icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .el-decorator { text-align: center; font-size: 18px; letter-spacing: 8px; }
    .el-separator { width: 100%; height: 1px; border-radius: 1px; }
    .el-spacer { width: 100%; height: 100%; }
    .el-block-placeholder {
      width: 100%; height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 4px;
      background: rgba(139,92,246,0.05); border: 1px dashed rgba(139,92,246,0.2);
      border-radius: 8px; color: rgba(255,255,255,0.4); font-size: 11px;
      .material-icons { font-size: 24px; color: rgba(139,92,246,0.4); }
    }
    .resize-handle {
      position: absolute; bottom: -4px; right: -4px;
      width: 12px; height: 12px; border-radius: 2px;
      background: rgba(139,92,246,0.8); cursor: se-resize;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .snap-guide-v {
      position: absolute; top: 0; bottom: 0; width: 1px;
      background: rgba(139,92,246,0.6); pointer-events: none; z-index: 9999;
    }
    .snap-guide-h {
      position: absolute; left: 0; right: 0; height: 1px;
      background: rgba(139,92,246,0.6); pointer-events: none; z-index: 9999;
    }
  `]
})
export class SectionCanvasComponent {
  @Input() sectionKey!: string;
  @Input() elements: CanvasElement[] = [];
  @Input() minHeight = 60;
  @Input() background = '';

  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  canvasState = inject(CanvasStateService);
  guides = signal<SnapGuides>({ vertical: null, horizontal: null });

  // Drag state
  private dragging: CanvasElement | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private elStartX = 0;
  private elStartY = 0;

  // Resize state
  private resizing: CanvasElement | null = null;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartW = 0;
  private resizeStartH = 0;

  private moveBound = this.onMouseMove.bind(this);
  private upBound = this.onMouseUp.bind(this);

  onCanvasClick(e: MouseEvent) {
    // Click on empty area deselects
    if (e.target === this.canvasContainer.nativeElement) {
      this.canvasState.selectElement(this.sectionKey, null);
    }
  }

  onElClick(e: MouseEvent, el: CanvasElement) {
    e.stopPropagation();
    this.canvasState.selectElement(this.sectionKey, el.id);
  }

  // ===== DRAG =====

  onElMouseDown(e: MouseEvent, el: CanvasElement) {
    if (el.locked || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    this.startDrag(e.clientX, e.clientY, el);
  }

  onElTouchStart(e: TouchEvent, el: CanvasElement) {
    if (el.locked) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.startDrag(touch.clientX, touch.clientY, el);
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private startDrag(clientX: number, clientY: number, el: CanvasElement) {
    this.canvasState.pushUndo();
    this.canvasState.selectElement(this.sectionKey, el.id);
    this.dragging = el;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.elStartX = el.x;
    this.elStartY = el.y;
    document.addEventListener('mousemove', this.moveBound);
    document.addEventListener('mouseup', this.upBound);
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.dragging) return;
    this.processDrag(e.clientX, e.clientY);
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.dragging) return;
    e.preventDefault();
    this.processDrag(e.touches[0].clientX, e.touches[0].clientY);
  }

  private processDrag(clientX: number, clientY: number) {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const result = onDragMove(
      clientX, clientY, this.dragging!, rect,
      this.dragStartX, this.dragStartY,
      this.elStartX, this.elStartY,
      this.elements, 2
    );
    this.canvasState.updateElementPosition(this.sectionKey, this.dragging!.id, result.newX, result.newY);
    this.guides.set(result.guides);
  }

  private onMouseUp() {
    this.endDrag();
  }

  private onTouchEnd() {
    this.endDrag();
    document.removeEventListener('touchmove', this.onTouchMove.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private endDrag() {
    this.dragging = null;
    this.guides.set({ vertical: null, horizontal: null });
    document.removeEventListener('mousemove', this.moveBound);
    document.removeEventListener('mouseup', this.upBound);
  }

  // ===== RESIZE =====

  onResizeStart(e: MouseEvent, el: CanvasElement) {
    e.preventDefault();
    e.stopPropagation();
    this.canvasState.pushUndo();
    this.resizing = el;
    this.resizeStartX = e.clientX;
    this.resizeStartY = e.clientY;
    this.resizeStartW = el.width;
    this.resizeStartH = el.height;
    document.addEventListener('mousemove', this.onResizeMove.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
  }

  onResizeTouchStart(e: TouchEvent, el: CanvasElement) {
    e.preventDefault();
    e.stopPropagation();
    this.canvasState.pushUndo();
    this.resizing = el;
    this.resizeStartX = e.touches[0].clientX;
    this.resizeStartY = e.touches[0].clientY;
    this.resizeStartW = el.width;
    this.resizeStartH = el.height;
    document.addEventListener('touchmove', this.onResizeTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onResizeEnd.bind(this));
  }

  private onResizeMove(e: MouseEvent) {
    if (!this.resizing) return;
    this.processResize(e.clientX, e.clientY);
  }

  private onResizeTouchMove(e: TouchEvent) {
    if (!this.resizing) return;
    e.preventDefault();
    this.processResize(e.touches[0].clientX, e.touches[0].clientY);
  }

  private processResize(clientX: number, clientY: number) {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const result = onResizeMove(
      clientX, clientY, this.resizing!, rect,
      this.resizeStartX, this.resizeStartY,
      this.resizeStartW, this.resizeStartH
    );
    this.canvasState.resizeElement(this.sectionKey, this.resizing!.id, result.newWidth, result.newHeight);
  }

  private onResizeEnd() {
    this.resizing = null;
    document.removeEventListener('mousemove', this.onResizeMove.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));
    document.removeEventListener('touchmove', this.onResizeTouchMove.bind(this));
    document.removeEventListener('touchend', this.onResizeEnd.bind(this));
  }

  // ===== Helpers =====

  getFontFamily(key?: string): string {
    if (!key) return 'inherit';
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'cormorant': 'var(--font-cormorant)', 'dancing': 'var(--font-dancing)', 'sacramento': 'var(--font-sacramento)',
    };
    return map[key] || 'inherit';
  }

  getBlockIcon(type: string): string {
    const icons: Record<string, string> = {
      'gallery': 'photo_library', 'detail-cards': 'info', 'venue-cards': 'place',
      'itinerary': 'schedule', 'rsvp-form': 'how_to_reg', 'gifts-block': 'redeem',
      'dresscode-block': 'checkroom'
    };
    return icons[type] || 'widgets';
  }

  getBlockLabel(type: string): string {
    const labels: Record<string, string> = {
      'gallery': 'Galería', 'detail-cards': 'Detalles', 'venue-cards': 'Lugares',
      'itinerary': 'Itinerario', 'rsvp-form': 'Confirmación', 'gifts-block': 'Regalos',
      'dresscode-block': 'Vestimenta'
    };
    return labels[type] || type;
  }
}
