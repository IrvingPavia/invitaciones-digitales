import { Component, Input, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryConfig, Photo, GlobalTextStyles } from '../../../core/models/models';

@Component({
  selector: 'app-landing-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="gallery" class="landing-section gallery-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >{{ config.title || 'Galería' }}</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>
        @if (config.description) {
          <p class="gallery-desc"
             [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
             [style.font-size.px]="styles?.subtitleStyle?.fontSize || 16"
             [style.color]="styles?.subtitleStyle?.color || 'rgba(255,255,255,0.6)'"
          >{{ config.description }}</p>
        }

        @if (photos.length > 0) {
          <!-- CAROUSEL 3D / VERTICAL / COVERFLOW -->
          @if (displayStyle === 'carousel-3d' || displayStyle === 'carousel-vertical' || displayStyle === 'coverflow') {
            <div class="gallery-3d" [class.vertical]="displayStyle === 'carousel-vertical'" [class.coverflow]="displayStyle === 'coverflow'"
                 (mousedown)="onDragStart($event)" (touchstart)="onTouchDragStart($event)">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="gallery-3d-card"
                     [style.transform]="getCardTransform(i)"
                     [style.opacity]="getCardOpacity(i)"
                     [style.z-index]="getCardZIndex(i)"
                     [style.transition]="isDragging ? 'none' : ''"
                     (click)="onPhotoClick(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)">
                </div>
              }
            </div>
          }

          <!-- STACK -->
          @if (displayStyle === 'stack') {
            <div class="gallery-stack" (mousedown)="onDragStart($event)" (touchstart)="onTouchDragStart($event)">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="stack-card"
                     [style.transform]="getStackTransform(i)"
                     [style.opacity]="getStackOpacity(i)"
                     [style.z-index]="photos.length - getStackDistance(i)"
                     [style.transition]="isDragging ? 'none' : ''"
                     (click)="onPhotoClick(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)">
                </div>
              }
            </div>
          }

          <!-- FLIP -->
          @if (displayStyle === 'flip') {
            <div class="gallery-flip" (click)="next()">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="flip-card" [class.active]="i === current()" [class.prev]="i === prevIndex()">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)">
                </div>
              }
              <div class="flip-hint">Toca para pasar →</div>
            </div>
          }

          <!-- POLAROID -->
          @if (displayStyle === 'polaroid') {
            <div class="gallery-polaroid">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="polaroid-card" [style.transform]="getPolaroidTransform(i)" (click)="openLightbox(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)">
                </div>
              }
            </div>
          }

          <!-- GRID -->
          @if (displayStyle === 'grid') {
            <div class="gallery-grid">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="gallery-grid-item" (click)="openLightbox(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)">
                </div>
              }
            </div>
          }

          <!-- SLIDESHOW -->
          @if (displayStyle === 'slideshow') {
            <div class="gallery-slideshow">
              @for (photo of photos; track photo.id; let i = $index) {
                <img class="slideshow-img" [class.active]="i === current()" [src]="photo.url" (click)="openLightbox(current())">
              }
              @if (photos.length > 1) {
                <button class="slideshow-arrow arrow-left" (click)="prev(); $event.stopPropagation()"><span class="material-icons">chevron_left</span></button>
                <button class="slideshow-arrow arrow-right" (click)="next(); $event.stopPropagation()"><span class="material-icons">chevron_right</span></button>
              }
            </div>
          }

          <!-- Dots (for carousel/stack/flip/slideshow) -->
          @if (displayStyle !== 'grid' && displayStyle !== 'polaroid') {
            <div class="carousel-dots">
              @for (photo of photos; track photo.id; let i = $index) {
                <button class="dot" [class.active]="i === current()" (click)="goTo(i)"></button>
              }
            </div>
            <p class="carousel-counter">{{ current() + 1 }} / {{ photos.length }}</p>
          }
        } @else {
          <p style="text-align:center;color:rgba(255,255,255,0.3);padding:40px">Próximamente...</p>
        }
      </div>
    </section>

    <!-- Lightbox -->
    @if (lightboxIndex() !== null) {
      <div class="lightbox" (click)="closeLightbox()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="photos[lightboxIndex()!].url" class="lightbox-img">
          <button class="lightbox-close" (click)="closeLightbox()"><span class="material-icons">close</span> Cerrar</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .gallery-section { padding: 80px 20px; }
    .section-container { max-width: 600px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .section-line { flex: 1; height: 1px; }
    .section-heading { white-space: nowrap; }
    .gallery-desc { text-align: center; margin-bottom: 32px; }

    /* === 3D CAROUSEL === */
    .gallery-3d {
      position: relative; height: 340px; width: 100%;
      display: flex; align-items: center; justify-content: center;
      perspective: 1000px; user-select: none; cursor: grab;
    }
    .gallery-3d:active { cursor: grabbing; }
    .gallery-3d-card {
      position: absolute; width: 240px; height: 300px;
      border-radius: 14px; overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      transition: transform 0.4s ease, opacity 0.4s ease;
      will-change: transform;
      -webkit-box-reflect: below 6px linear-gradient(to bottom, transparent 70%, rgba(255,255,255,0.12) 100%);
    }
    .gallery-3d-card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
    .gallery-3d.vertical { height: 360px; }
    .gallery-3d.vertical .gallery-3d-card { width: 260px; height: 200px; -webkit-box-reflect: none; }
    .gallery-3d.coverflow .gallery-3d-card { width: 220px; height: 280px; }

    /* === STACK === */
    .gallery-stack {
      position: relative; height: 360px; width: 100%;
      display: flex; align-items: center; justify-content: center;
      user-select: none; cursor: grab;
    }
    .gallery-stack:active { cursor: grabbing; }
    .stack-card {
      position: absolute; width: 260px; height: 320px;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
    }
    .stack-card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }

    /* === FLIP === */
    .gallery-flip {
      position: relative; width: 100%; aspect-ratio: 3/4;
      border-radius: 16px; overflow: hidden; cursor: pointer;
      perspective: 1200px;
    }
    .flip-card {
      position: absolute; inset: 0; backface-visibility: hidden;
      transition: transform 0.6s ease, opacity 0.4s ease;
      transform: rotateY(90deg); opacity: 0;
    }
    .flip-card.active { transform: rotateY(0deg); opacity: 1; }
    .flip-card.prev { transform: rotateY(-90deg); opacity: 0; }
    .flip-card img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
    .flip-hint {
      position: absolute; bottom: 16px; right: 16px;
      background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.7);
      padding: 6px 12px; border-radius: 20px; font-size: 12px;
      backdrop-filter: blur(4px);
    }

    /* === POLAROID === */
    .gallery-polaroid {
      display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;
      padding: 20px;
    }
    .polaroid-card {
      width: 140px; padding: 8px 8px 32px; background: white;
      border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;
    }
    .polaroid-card:hover { transform: scale(1.05) rotate(0deg) !important; box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 10; }
    .polaroid-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; border-radius: 2px; }

    /* === GRID === */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
    .gallery-grid-item { border-radius: 10px; overflow: hidden; cursor: pointer; aspect-ratio: 1; transition: transform 0.2s; }
    .gallery-grid-item:hover { transform: scale(1.03); }
    .gallery-grid-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* === SLIDESHOW === */
    .gallery-slideshow {
      position: relative; width: 100%; aspect-ratio: 3/4;
      border-radius: 16px; overflow: hidden; cursor: pointer;
    }
    .slideshow-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease; }
    .slideshow-img.active { opacity: 1; }
    .slideshow-arrow {
      position: absolute; top: 50%; transform: translateY(-50%); z-index: 5;
      background: none; border: none; color: var(--theme-text-primary, var(--gold));
      cursor: pointer; padding: 12px; transition: all 0.2s;
      opacity: 0.6;
      .material-icons { font-size: 36px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
      &:hover { opacity: 1; transform: translateY(-50%) scale(1.1); }
    }
    .slideshow-arrow.arrow-left { left: 8px; }
    .slideshow-arrow.arrow-right { right: 8px; }

    /* === SHARED === */
    .carousel-dots { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; border: none; padding: 0; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s; }
    .dot.active { background: var(--theme-text-primary, var(--gold)); transform: scale(1.3); }
    .carousel-counter { text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; margin-top: 8px; }

    .lightbox { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.95); padding: 16px; }
    .lightbox-content { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; max-height: 100%; justify-content: center; }
    .lightbox-img { max-width: 95vw; max-height: 75vh; object-fit: contain; border-radius: 8px; touch-action: pinch-zoom; }
    .lightbox-close { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 24px; padding: 10px 24px; color: white; font-size: 14px; font-weight: 500; cursor: pointer; user-select: none; -webkit-user-select: none; .material-icons { font-size: 18px; } &:hover { background: rgba(255,255,255,0.25); } }

    @media (max-width: 520px) {
      .gallery-3d-card { width: 200px; height: 260px; }
      .gallery-3d { height: 300px; }
      .gallery-3d.vertical .gallery-3d-card { width: 220px; height: 160px; }
      .stack-card { width: 220px; height: 280px; }
      .polaroid-card { width: 120px; padding: 6px 6px 24px; }
    }
  `]
})
export class LandingGalleryComponent implements OnInit, OnDestroy {
  @Input() config!: GalleryConfig;
  @Input() photos: Photo[] = [];
  @Input() styles?: GlobalTextStyles;

  current = signal(0);
  lightboxIndex = signal<number | null>(null);
  isDragging = false;
  private dragOffset = 0;
  private dragStartPos = 0;
  private dragStartTime = 0;
  private autoTimer: any;
  private readonly CARD_SPACING = 200;
  private polaroidRotations: number[] = [];

  get displayStyle(): string { return this.config.displayStyle || 'carousel-3d'; }

  ngOnInit() {
    if (this.displayStyle === 'slideshow') this.startAuto();
    this.polaroidRotations = this.photos.map(() => (Math.random() - 0.5) * 12);
  }
  ngOnDestroy() { clearInterval(this.autoTimer); }

  private startAuto() { clearInterval(this.autoTimer); this.autoTimer = setInterval(() => this.next(), 4000); }
  goTo(i: number) { this.current.set(i); if (this.displayStyle === 'slideshow') this.startAuto(); }
  next() { this.goTo((this.current() + 1) % this.photos.length); }
  prev() { this.goTo((this.current() - 1 + this.photos.length) % this.photos.length); }
  prevIndex(): number { return (this.current() - 1 + this.photos.length) % this.photos.length; }

  // === 3D / Coverflow positioning ===
  private getOffset(index: number): number {
    return (index - this.current()) * this.CARD_SPACING + (this.isDragging ? this.dragOffset : 0);
  }
  getCardTransform(i: number): string {
    const offset = this.getOffset(i);
    const norm = offset / this.CARD_SPACING;
    const scale = Math.max(0.65, 1.05 - Math.abs(norm) * 0.15);
    if (this.displayStyle === 'carousel-vertical') {
      return `translateY(${offset * 0.6}px) scale(${scale}) rotateX(${norm * 8}deg)`;
    }
    if (this.displayStyle === 'coverflow') {
      const tx = offset * 0.7;
      return `translateX(${tx}px) scale(${scale}) rotateY(${norm * -35}deg)`;
    }
    return `translateX(${offset}px) scale(${scale}) rotateY(${norm * -8}deg)`;
  }
  getCardOpacity(i: number): number {
    const norm = Math.abs(this.getOffset(i)) / this.CARD_SPACING;
    return norm > 2.5 ? 0 : Math.max(0, 1 - norm * 0.3);
  }
  getCardZIndex(i: number): number { return 100 - Math.round(Math.abs(this.getOffset(i)) / 10); }

  // === Stack positioning ===
  getStackDistance(i: number): number { return Math.abs(i - this.current()); }
  getStackTransform(i: number): string {
    const diff = i - this.current();
    const dist = Math.abs(diff);
    if (dist > 3) return 'scale(0.7) translateY(40px)';
    const y = dist * 12;
    const scale = 1 - dist * 0.06;
    const rotate = diff * 3;
    const dragX = i === this.current() && this.isDragging ? this.dragOffset : 0;
    return `translateX(${dragX}px) translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`;
  }
  getStackOpacity(i: number): number { return Math.abs(i - this.current()) > 3 ? 0 : 1 - Math.abs(i - this.current()) * 0.15; }

  // === Polaroid ===
  getPolaroidTransform(i: number): string { return `rotate(${this.polaroidRotations[i] || 0}deg)`; }

  // === Drag ===
  onDragStart(e: MouseEvent) {
    e.preventDefault();
    this.isDragging = true;
    const isVert = this.displayStyle === 'carousel-vertical';
    this.dragStartPos = isVert ? e.clientY : e.clientX;
    this.dragStartTime = Date.now(); this.dragOffset = 0;
    const onMove = (ev: MouseEvent) => { ev.preventDefault(); this.dragOffset = (isVert ? ev.clientY : ev.clientX) - this.dragStartPos; };
    const onUp = (ev: MouseEvent) => { this.finishDrag((isVert ? ev.clientY : ev.clientX)); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onTouchDragStart(e: TouchEvent) {
    this.isDragging = true;
    const isVert = this.displayStyle === 'carousel-vertical';
    this.dragStartPos = isVert ? e.touches[0].clientY : e.touches[0].clientX;
    this.dragStartTime = Date.now(); this.dragOffset = 0;
    const startX = e.touches[0].clientX, startY = e.touches[0].clientY;
    let locked = false, isSwipe = false;

    const onMove = (ev: TouchEvent) => {
      const cx = ev.touches[0].clientX, cy = ev.touches[0].clientY;
      if (!locked) { const dx = Math.abs(cx - startX), dy = Math.abs(cy - startY); if (dx > 8 || dy > 8) { locked = true; isSwipe = isVert ? (dy > dx) : (dx > dy); } }
      if (locked && isSwipe) { ev.preventDefault(); this.dragOffset = (isVert ? cy : cx) - this.dragStartPos; }
    };
    const onEnd = (ev: TouchEvent) => {
      if (ev.changedTouches.length && isSwipe) { this.finishDrag(isVert ? ev.changedTouches[0].clientY : ev.changedTouches[0].clientX); }
      else { this.isDragging = false; this.dragOffset = 0; }
      document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  private finishDrag(endPos: number) {
    const dist = endPos - this.dragStartPos;
    const velocity = dist / Math.max(Date.now() - this.dragStartTime, 1);
    let moved = Math.round(-dist / this.CARD_SPACING);
    if (Math.abs(velocity) > 0.5) moved += velocity < 0 ? 1 : -1;
    this.isDragging = false; this.dragOffset = 0;
    this.current.set(Math.max(0, Math.min(this.photos.length - 1, this.current() + moved)));
  }

  onPhotoClick(i: number) { if (!this.isDragging && Math.abs(this.dragOffset) < 5) { if (i === this.current()) this.openLightbox(i); else this.goTo(i); } }
  openLightbox(i: number) { this.lightboxIndex.set(i); }
  closeLightbox() { this.lightboxIndex.set(null); }
  @HostListener('window:scroll') onScroll() { if (this.lightboxIndex() !== null) this.closeLightbox(); }

  getFontFamily(key?: string): string {
    const m: Record<string,string> = {'sans':'var(--font-sans)','serif':'var(--font-serif)','script':'var(--font-script)','cormorant':'var(--font-cormorant)','spumoni':'var(--font-spumoni)','dancing':'var(--font-dancing)','montserrat':'var(--font-montserrat)','raleway':'var(--font-raleway)','cinzel':'var(--font-cinzel)','sacramento':'var(--font-sacramento)','tangerine':'var(--font-tangerine)','alexbrush':'var(--font-alexbrush)','pinyon':'var(--font-pinyon)','josefin':'var(--font-josefin)','baskerville':'var(--font-baskerville)'};
    return m[key||'sans']||'var(--font-sans)';
  }
  getSeparatorBg(): string {
    const c=this.styles?.separatorStyle?.color||'#d4a017',t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'formal':return c;case 'executive':return `linear-gradient(180deg,${c},transparent 40%,transparent 60%,${c})`;case 'festive':return `repeating-linear-gradient(90deg,${c} 0px,${c} 4px,transparent 4px,transparent 10px)`;case 'animated':return `linear-gradient(90deg,transparent,${c},transparent)`;case 'minimal':return `${c}40`;case 'ornamental':return `linear-gradient(90deg,transparent,${c}60,${c},${c}60,transparent)`;default:return `linear-gradient(90deg,transparent,${c}80,transparent)`;}
  }
  getSeparatorHeight(): string {
    const t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'executive':return '4px';case 'festive':return '3px';case 'ornamental':return '2px';default:return '1px';}
  }
}
