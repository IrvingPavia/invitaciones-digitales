import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject, OnInit, OnDestroy } from '@angular/core';
import { ElementPosition } from '../models/models';

/**
 * Directiva de arrastre ASISTIDO estilo Word/PowerPoint (fase A: solo mover).
 *
 * - Al hacer clic en el elemento, lo "selecciona" (borde visible).
 * - Al arrastrar desde el cuerpo del elemento, lo MUEVE (no redimensiona, no selecciona texto).
 * - Previene completamente la selección de texto nativa y el drag nativo del browser.
 * - Calcula la posición del centro del elemento en % relativo al contenedor con [data-drag-bounds].
 * - Aplica snap a guías y confina dentro de la sección.
 */
@Directive({
  selector: '[appAssistedDrag]',
  standalone: true,
  host: {
    '[class.ad-movable]': 'adEditable',
    '[class.ad-selected]': 'adEditable && selected',
    '[class.ad-dragging]': 'adEditable && dragging',
    '[attr.draggable]': 'adEditable ? "false" : null',
    '[style.resize]': 'adEditable ? "none" : null',
    '[style.-webkit-user-select]': 'adEditable ? "none" : null',
    '[style.user-select]': 'adEditable ? "none" : null',
  }
})
export class AssistedDragDirective implements OnInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);

  @Input() adEditable = false;
  @Input() adKey = '';

  @Output() adPositionChange = new EventEmitter<ElementPosition>();
  @Output() adGuides = new EventEmitter<{ x?: number; y?: number } | null>();
  @Output() adDragging = new EventEmitter<boolean>();

  selected = false;
  dragging = false;
  private bounds!: DOMRect;
  private startClientX = 0;
  private startClientY = 0;
  private startElX = 0;
  private startElY = 0;
  private moved = false;
  private lastX = 50;
  private lastY = 50;

  private readonly SNAP = 3;
  private readonly MIN = 3;
  private readonly MAX = 97;
  private readonly SNAP_X = [10, 25, 50, 75, 90];
  private readonly SNAP_Y = [10, 25, 50, 75, 90];

  // Cierra selección al clickear fuera del elemento
  private outsideClickHandler = (e: MouseEvent) => {
    if (!this.selected || this.dragging) return;
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.selected = false;
    }
  };

  ngOnInit() {
    document.addEventListener('mousedown', this.outsideClickHandler, true);
  }
  ngOnDestroy() {
    document.removeEventListener('mousedown', this.outsideClickHandler, true);
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(e: DragEvent) {
    if (this.adEditable) { e.preventDefault(); e.stopPropagation(); }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (!this.adEditable) return;
    // Previene: selección de texto + drag nativo del browser + propagación a capas superiores
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.selected = true;
    this.moved = false;
    this.startClientX = e.clientX;
    this.startClientY = e.clientY;
    this.captureStartPos();

    const onMove = (ev: MouseEvent) => {
      ev.preventDefault();
      // Umbral mínimo de movimiento (3px) para distinguir click de drag
      if (!this.moved) {
        const dx = Math.abs(ev.clientX - this.startClientX);
        const dy = Math.abs(ev.clientY - this.startClientY);
        if (dx < 3 && dy < 3) return;
        this.startDrag();
        this.moved = true;
      }
      this.processDrag(ev.clientX, ev.clientY);
    };
    const onUp = () => {
      if (this.moved) this.endDrag();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    if (!this.adEditable) return;
    e.stopPropagation();

    this.selected = true;
    this.moved = false;
    const t = e.touches[0];
    this.startClientX = t.clientX;
    this.startClientY = t.clientY;
    this.captureStartPos();

    const onMove = (ev: TouchEvent) => {
      if (ev.cancelable) ev.preventDefault();
      const tt = ev.touches[0];
      if (!this.moved) {
        const dx = Math.abs(tt.clientX - this.startClientX);
        const dy = Math.abs(tt.clientY - this.startClientY);
        if (dx < 5 && dy < 5) return;
        this.startDrag();
        this.moved = true;
      }
      this.processDrag(tt.clientX, tt.clientY);
    };
    const onEnd = () => {
      if (this.moved) this.endDrag();
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  /** Captura la posición actual del elemento y el offset del clic dentro del elemento. */
  private captureStartPos() {
    const boundsEl = this.resolveBoundsEl();
    this.bounds = boundsEl.getBoundingClientRect();
    const el = this.host.nativeElement;
    const elRect = el.getBoundingClientRect();
    // Centro del elemento en % respecto a bounds
    this.startElX = ((elRect.left + elRect.width / 2) - this.bounds.left) / this.bounds.width * 100;
    this.startElY = ((elRect.top + elRect.height / 2) - this.bounds.top) / this.bounds.height * 100;
    // Offset del clic respecto al centro del elemento (en % de bounds)
    // Así al mover, el punto del clic mantiene su posición relativa dentro del elemento
    this.clickOffsetX = ((this.startClientX - (elRect.left + elRect.width / 2)) / this.bounds.width) * 100;
    this.clickOffsetY = ((this.startClientY - (elRect.top + elRect.height / 2)) / this.bounds.height) * 100;
  }

  private clickOffsetX = 0;
  private clickOffsetY = 0;

  private startDrag() {
    this.dragging = true;
    this.adDragging.emit(true);
    // Bloquea selección de texto en todo el documento durante el drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }

  private processDrag(clientX: number, clientY: number) {
    if (!this.dragging || !this.bounds.width || !this.bounds.height) return;

    // Posición del cursor en % respecto a bounds, menos el offset del clic dentro del elemento.
    // Resultado: coordenada del CENTRO del elemento, tal que el punto clickeado sigue bajo el cursor.
    let x = ((clientX - this.bounds.left) / this.bounds.width) * 100 - this.clickOffsetX;
    let y = ((clientY - this.bounds.top) / this.bounds.height) * 100 - this.clickOffsetY;

    // Snap a guías
    const guides: { x?: number; y?: number } = {};
    for (const gx of this.SNAP_X) {
      if (Math.abs(x - gx) <= this.SNAP) { x = gx; guides.x = gx; break; }
    }
    for (const gy of this.SNAP_Y) {
      if (Math.abs(y - gy) <= this.SNAP) { y = gy; guides.y = gy; break; }
    }

    // Confinamiento
    x = Math.max(this.MIN, Math.min(this.MAX, x));
    y = Math.max(this.MIN, Math.min(this.MAX, y));

    // Aplica visualmente
    const el = this.host.nativeElement;
    el.style.position = 'absolute';
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.margin = '0';

    this.lastX = x;
    this.lastY = y;
    this.adGuides.emit(Object.keys(guides).length > 0 ? guides : null);
  }

  private endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    // Restaura selección de texto
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    this.adDragging.emit(false);
    this.adGuides.emit(null);
    this.adPositionChange.emit({
      x: Math.round(this.lastX * 10) / 10,
      y: Math.round(this.lastY * 10) / 10
    });
  }

  private resolveBoundsEl(): HTMLElement {
    let el: HTMLElement | null = this.host.nativeElement;
    while (el) {
      if (el.hasAttribute && el.hasAttribute('data-drag-bounds')) return el;
      el = el.parentElement;
    }
    return (this.host.nativeElement.offsetParent as HTMLElement) || this.host.nativeElement.parentElement!;
  }
}
