import { Component, Input, Output, EventEmitter, ElementRef, inject, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementPosition } from '../models/models';
import { DragBoxSelectionService } from './drag-box-selection.service';

/**
 * Wrapper estilo Word/PowerPoint para posicionar y redimensionar un elemento.
 *
 * - El CUERPO del wrapper (no los handles) mueve todo el bloque al arrastrar.
 * - Los 8 HANDLES (esquinas + medios) redimensionan al arrastrar.
 * - El contenido se proyecta con <ng-content> y queda con pointer-events:none
 *   durante la edicion, asi el browser no puede iniciar seleccion/resize nativos.
 * - Al clickear fuera se deselecciona.
 */
@Component({
  selector: 'app-drag-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Un único <ng-content> para que el contenido SIEMPRE se proyecte
         (tener dos ng-content sin selector hace que Angular proyecte en uno solo
         y deje vacío el otro, lo que ocultaba el texto en la landing). -->
    <div class="db-frame" [class.db-interactive]="editable" [class.db-selected]="editable && selected" [class.db-dragging]="editable && dragging"
         (mousedown)="onBodyDown($event)" (touchstart)="onBodyTouchDown($event)">
      <div class="db-content" [class.db-content-locked]="editable"><ng-content></ng-content></div>
      @if (editable && selected && showHandles) {
        <div class="db-handle db-h-tl" (mousedown)="onHandleDown($event,'tl')" (touchstart)="onHandleTouchDown($event,'tl')"></div>
        <div class="db-handle db-h-tc" (mousedown)="onHandleDown($event,'tc')" (touchstart)="onHandleTouchDown($event,'tc')"></div>
        <div class="db-handle db-h-tr" (mousedown)="onHandleDown($event,'tr')" (touchstart)="onHandleTouchDown($event,'tr')"></div>
        <div class="db-handle db-h-ml" (mousedown)="onHandleDown($event,'ml')" (touchstart)="onHandleTouchDown($event,'ml')"></div>
        <div class="db-handle db-h-mr" (mousedown)="onHandleDown($event,'mr')" (touchstart)="onHandleTouchDown($event,'mr')"></div>
        <div class="db-handle db-h-bl" (mousedown)="onHandleDown($event,'bl')" (touchstart)="onHandleTouchDown($event,'bl')"></div>
        <div class="db-handle db-h-bc" (mousedown)="onHandleDown($event,'bc')" (touchstart)="onHandleTouchDown($event,'bc')"></div>
        <div class="db-handle db-h-br" (mousedown)="onHandleDown($event,'br')" (touchstart)="onHandleTouchDown($event,'br')"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .db-frame { position: relative; height: 100%; }
    /* Interactividad solo en modo edición (canvas). En landing el frame es transparente. */
    .db-interactive { cursor: move; user-select: none; -webkit-user-select: none; }
    .db-interactive:hover { outline: 1px dashed rgba(255,255,255,0.3); outline-offset: 2px; }
    .db-selected { outline: 2px solid rgba(157,110,231,0.8) !important; outline-offset: 2px !important; }
    .db-dragging { outline: 2px solid rgba(157,110,231,1) !important; outline-offset: 2px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.4); opacity: 0.92; }
    /* El contenido solo bloquea punteros durante la edición (evita selección nativa). */
    .db-content-locked { pointer-events: none; }
    .db-handle {
      position: absolute; width: 10px; height: 10px; background: rgba(157,110,231,0.95);
      border: 1.5px solid #fff; border-radius: 2px; z-index: 10;
    }
    .db-h-tl { top: -5px; left: -5px; cursor: nwse-resize; }
    .db-h-tc { top: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .db-h-tr { top: -5px; right: -5px; cursor: nesw-resize; }
    .db-h-ml { top: 50%; left: -5px; transform: translateY(-50%); cursor: ew-resize; }
    .db-h-mr { top: 50%; right: -5px; transform: translateY(-50%); cursor: ew-resize; }
    .db-h-bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
    .db-h-bc { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .db-h-br { bottom: -5px; right: -5px; cursor: nwse-resize; }
  `]
})
export class DragBoxComponent {
  private el = inject(ElementRef<HTMLElement>);
  private selection = inject(DragBoxSelectionService);

  constructor() {
    // Si el activo global deja de ser este DragBox, deseleccionarse.
    effect(() => {
      const active = this.selection.active();
      if (active !== this && this.selected) {
        this.selected = false;
      }
    });
  }

  @Input() editable = false;
  @Input() showHandles = true;
  /** Posicion actual guardada (para preservar el ancho `w` al mover). */
  @Input() position: ElementPosition | null = null;

  /** Emite la nueva posicion (centro, en %) al soltar tras mover. */
  @Output() positionChange = new EventEmitter<ElementPosition>();
  /** Emite las guias activas durante el arrastre. */
  @Output() guidesChange = new EventEmitter<{ x?: number; y?: number } | null>();
  /** Emite true/false al iniciar/terminar drag. */
  @Output() draggingChange = new EventEmitter<boolean>();

  selected = false;
  dragging = false;
  private bounds!: DOMRect;
  private clickOffsetX = 0;
  private clickOffsetY = 0;
  private lastX = 50;
  private lastY = 50;
  private lastW: number | undefined;
  private lastH: number | undefined;
  private moved = false;
  private startClientX = 0;
  private startClientY = 0;

  private readonly SNAP = 3;
  private readonly MIN = 2;
  private readonly MAX = 98;
  private readonly SNAP_X = [10, 25, 50, 75, 90];
  private readonly SNAP_Y = [10, 25, 50, 75, 90];

  // Deseleccionar al clickear fuera
  @HostListener('document:mousedown', ['$event'])
  onDocMouseDown(e: MouseEvent) {
    if (!this.selected || this.dragging) return;
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.selected = false;
      this.selection.clear(this);
    }
  }

  // ========== MOVER (body del frame) ==========
  private markSelected() {
    this.selected = true;
    this.selection.select(this);
  }

  onBodyDown(e: MouseEvent) {
    if (!this.editable) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    this.markSelected();
    this.initMove(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => { ev.preventDefault(); this.processMove(ev.clientX, ev.clientY); };
    const onUp = () => { this.endMove(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  onBodyTouchDown(e: TouchEvent) {
    if (!this.editable) return;
    e.stopPropagation();
    this.markSelected();
    const t = e.touches[0];
    this.initMove(t.clientX, t.clientY);
    const onMove = (ev: TouchEvent) => { if (ev.cancelable) ev.preventDefault(); this.processMove(ev.touches[0].clientX, ev.touches[0].clientY); };
    const onEnd = () => { this.endMove(); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  private initMove(cx: number, cy: number) {
    this.moved = false;
    this.startClientX = cx;
    this.startClientY = cy;
    const boundsEl = this.resolveBounds();
    this.bounds = boundsEl.getBoundingClientRect();
    const host = this.el.nativeElement;
    const frame = host.querySelector('.db-frame') as HTMLElement;
    const r = frame.getBoundingClientRect();
    // Fijar el ancho/alto actual del host para que no cambie durante el movimiento
    host.style.width = r.width + 'px';
    this.clickOffsetX = ((cx - (r.left + r.width / 2)) / this.bounds.width) * 100;
    this.clickOffsetY = ((cy - (r.top + r.height / 2)) / this.bounds.height) * 100;
  }

  private processMove(cx: number, cy: number) {
    if (!this.bounds.width || !this.bounds.height) return;
    if (!this.moved) {
      if (Math.abs(cx - this.startClientX) < 3 && Math.abs(cy - this.startClientY) < 3) return;
      this.dragging = true;
      this.draggingChange.emit(true);
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      this.moved = true;
    }
    let x = ((cx - this.bounds.left) / this.bounds.width) * 100 - this.clickOffsetX;
    let y = ((cy - this.bounds.top) / this.bounds.height) * 100 - this.clickOffsetY;

    // Snap
    const guides: { x?: number; y?: number } = {};
    for (const gx of this.SNAP_X) { if (Math.abs(x - gx) <= this.SNAP) { x = gx; guides.x = gx; break; } }
    for (const gy of this.SNAP_Y) { if (Math.abs(y - gy) <= this.SNAP) { y = gy; guides.y = gy; break; } }

    // Confinar (sin cambiar tamaño, solo frena)
    x = Math.max(this.MIN, Math.min(this.MAX, x));
    y = Math.max(this.MIN, Math.min(this.MAX, y));

    // Aplica posicion al HOST (no al frame)
    const host = this.el.nativeElement;
    host.style.position = 'absolute';
    host.style.left = x + '%';
    host.style.top = y + '%';
    host.style.right = 'auto';
    host.style.bottom = 'auto';
    host.style.transform = 'translate(-50%, -50%)';
    host.style.margin = '0';

    this.lastX = x; this.lastY = y;
    this.guidesChange.emit(Object.keys(guides).length > 0 ? guides : null);
  }

  private endMove() {
    if (!this.moved) return;
    this.dragging = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    this.draggingChange.emit(false);
    this.guidesChange.emit(null);
    // Preservar ancho/alto guardados al mover (si existen), para no perder el resize previo.
    const w = this.position?.w;
    const hVal = this.position?.h;
    this.positionChange.emit({
      x: Math.round(this.lastX * 10) / 10,
      y: Math.round(this.lastY * 10) / 10,
      ...(w != null ? { w } : {}),
      ...(hVal != null ? { h: hVal } : {}),
    });
  }

  // ========== RESIZE (handles) ==========
  private resizing = false;
  private resizeHandle = '';
  // Bordes iniciales del frame en px (relativos al viewport)
  private rLeft = 0; private rRight = 0; private rTop = 0; private rBottom = 0;

  onHandleDown(e: MouseEvent, handle: string) {
    if (!this.editable) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    this.initResize(handle);
    const onMove = (ev: MouseEvent) => { ev.preventDefault(); this.processResize(ev.clientX, ev.clientY); };
    const onUp = () => { this.endResize(); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  onHandleTouchDown(e: TouchEvent, handle: string) {
    if (!this.editable) return;
    e.stopPropagation();
    this.initResize(handle);
    const onMove = (ev: TouchEvent) => { if (ev.cancelable) ev.preventDefault(); this.processResize(ev.touches[0].clientX, ev.touches[0].clientY); };
    const onEnd = () => { this.endResize(); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  private initResize(handle: string) {
    this.resizing = true;
    this.resizeHandle = handle;
    this.lastW = this.position?.w;
    this.lastH = this.position?.h;
    this.dragging = true;
    this.draggingChange.emit(true);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    const boundsEl = this.resolveBounds();
    this.bounds = boundsEl.getBoundingClientRect();
    const frame = this.el.nativeElement.querySelector('.db-frame') as HTMLElement;
    const r = frame.getBoundingClientRect();
    this.rLeft = r.left; this.rRight = r.right; this.rTop = r.top; this.rBottom = r.bottom;
  }

  private processResize(cx: number, cy: number) {
    if (!this.resizing || !this.bounds.width || !this.bounds.height) return;
    const h = this.resizeHandle;
    const minPxW = (this.bounds.width * 6) / 100;  // ancho mínimo 6% de la sección
    const minPxH = (this.bounds.height * 4) / 100; // alto mínimo 4% de la sección

    let left = this.rLeft;
    let right = this.rRight;
    let top = this.rTop;
    let bottom = this.rBottom;

    // --- Eje horizontal ---
    const touchesLeft = h === 'tl' || h === 'ml' || h === 'bl';
    const touchesRight = h === 'tr' || h === 'mr' || h === 'br';
    if (touchesLeft) left = Math.min(cx, this.rRight - minPxW);
    if (touchesRight) right = Math.max(cx, this.rLeft + minPxW);

    // --- Eje vertical ---
    const touchesTop = h === 'tl' || h === 'tc' || h === 'tr';
    const touchesBottom = h === 'bl' || h === 'bc' || h === 'br';
    if (touchesTop) top = Math.min(cy, this.rBottom - minPxH);
    if (touchesBottom) bottom = Math.max(cy, this.rTop + minPxH);

    const widthPx = right - left;
    const heightPx = bottom - top;
    const centerXPx = left + widthPx / 2;
    const centerYPx = top + heightPx / 2;

    // Convertir a % de la sección
    let wPct = (widthPx / this.bounds.width) * 100;
    let hPct = (heightPx / this.bounds.height) * 100;
    let xPct = ((centerXPx - this.bounds.left) / this.bounds.width) * 100;
    let yPct = ((centerYPx - this.bounds.top) / this.bounds.height) * 100;

    // Confinar
    wPct = Math.max(6, Math.min(96, wPct));
    hPct = Math.max(4, Math.min(96, hPct));
    xPct = Math.max(this.MIN, Math.min(this.MAX, xPct));
    yPct = Math.max(this.MIN, Math.min(this.MAX, yPct));

    // Aplicar al host
    const host = this.el.nativeElement;
    host.style.position = 'absolute';
    host.style.right = 'auto';
    host.style.bottom = 'auto';
    host.style.transform = 'translate(-50%, -50%)';
    host.style.margin = '0';

    // Horizontal: solo si el handle afecta el ancho
    if (touchesLeft || touchesRight) {
      host.style.width = wPct + '%';
      host.style.left = xPct + '%';
      this.lastX = Math.round(xPct * 10) / 10;
      this.lastW = Math.round(wPct * 10) / 10;
    } else if (!host.style.left) {
      // Fijar el centro X actual si aún no estaba posicionado
      const curX = ((this.rLeft + (this.rRight - this.rLeft) / 2 - this.bounds.left) / this.bounds.width) * 100;
      host.style.left = curX + '%';
      this.lastX = Math.round(curX * 10) / 10;
    }

    // Vertical: solo si el handle afecta el alto
    if (touchesTop || touchesBottom) {
      host.style.height = hPct + '%';
      host.style.top = yPct + '%';
      this.lastY = Math.round(yPct * 10) / 10;
      this.lastH = Math.round(hPct * 10) / 10;
    } else if (!host.style.top) {
      // Fijar el centro Y actual si aún no estaba posicionado
      const curY = ((this.rTop + (this.rBottom - this.rTop) / 2 - this.bounds.top) / this.bounds.height) * 100;
      host.style.top = curY + '%';
      this.lastY = Math.round(curY * 10) / 10;
    }
  }

  private endResize() {
    if (!this.resizing) return;
    this.resizing = false;
    this.dragging = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    this.draggingChange.emit(false);
    this.guidesChange.emit(null);
    // Conservar w/h previos del input si este resize no los tocó.
    const w = this.lastW ?? this.position?.w;
    const hVal = this.lastH ?? this.position?.h;
    this.positionChange.emit({
      x: Math.round(this.lastX * 10) / 10,
      y: Math.round(this.lastY * 10) / 10,
      ...(w != null ? { w } : {}),
      ...(hVal != null ? { h: hVal } : {}),
    });
  }

  private resolveBounds(): HTMLElement {
    let el: HTMLElement | null = this.el.nativeElement;
    while (el) {
      if (el.hasAttribute && el.hasAttribute('data-drag-bounds')) return el;
      el = el.parentElement;
    }
    return (this.el.nativeElement.offsetParent as HTMLElement) || this.el.nativeElement.parentElement!;
  }
}
