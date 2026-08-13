import { Component, Input, signal, OnInit, OnDestroy, HostListener, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryConfig, Photo, GlobalTextStyles, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-gallery',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section id="gallery" class="landing-section gallery-section">
      <div class="section-container">
        @if (hasOrnament() && getOrnamentPosition() !== 'sides') {
          <div class="section-header-block">
            @if (getOrnamentPosition() === 'above' || getOrnamentPosition() === 'both') {
              <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
            }
            <h2 class="section-heading"
                [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
                [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
                [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
            >{{ config.title || 'Galería' }}</h2>
            @if (getOrnamentPosition() === 'below' || getOrnamentPosition() === 'both') {
              <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
            }
          </div>
        } @else {
          <div class="section-header">
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
            <h2 class="section-heading"
                [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
                [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
                [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
            >{{ config.title || 'Galería' }}</h2>
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          </div>
        }
        @if (config.description) {
          <p class="gallery-desc"
             [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
             [style.font-size.px]="styles?.subtitleStyle?.fontSize || 16"
             [style.color]="styles?.subtitleStyle?.color || 'rgba(255,255,255,0.6)'"
          >{{ config.description }}</p>
        }

        @if (photos.length > 0) {
          <!-- SWIPER CAROUSEL (3D / Coverflow / Stack / Flip / Slideshow) -->
          @if (displayStyle !== 'polaroid' && displayStyle !== 'grid') {
            <div class="swiper-gallery-wrapper">
              <swiper-container #swiperEl
                [attr.effect]="getSwiperEffect()"
                [attr.slides-per-view]="getSwiperSlidesPerView()"
                [attr.centered-slides]="true"
                [attr.grab-cursor]="!staticMode"
                [attr.pagination]="'true'"
                [attr.pagination-clickable]="'true'"
                [attr.space-between]="getSwiperSpaceBetween()"
                [attr.autoplay-delay]="displayStyle === 'slideshow' && !staticMode ? '4000' : undefined"
                [attr.loop]="photos.length > 2 ? 'true' : 'false'"
                [attr.coverflow-effect-rotate]="getSwiperCoverflowRotate()"
                [attr.coverflow-effect-stretch]="0"
                [attr.coverflow-effect-depth]="getSwiperCoverflowDepth()"
                [attr.coverflow-effect-modifier]="1"
                [attr.coverflow-effect-slide-shadows]="'false'"
                [attr.cards-effect-slide-shadows]="'false'"
                [attr.flip-effect-slide-shadows]="'false'"
                [attr.fade-effect-cross-fade]="'true'"
                class="gallery-swiper"
                [class.static-mode]="staticMode"
              >
                @for (photo of photos; track photo.id; let i = $index) {
                  <swiper-slide (click)="onSlideClick(i)">
                    <img [src]="photo.url" [alt]="'Foto ' + (i+1)" loading="eager">
                  </swiper-slide>
                }
              </swiper-container>
            </div>
          }

          <!-- POLAROID (static layout, no carousel) -->
          @if (displayStyle === 'polaroid') {
            <div class="gallery-polaroid">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="polaroid-card" [style.transform]="getPolaroidTransform(i)" (click)="openLightbox(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)" loading="eager">
                </div>
              }
            </div>
          }

          <!-- GRID / MOSAICO (static layout, no carousel) -->
          @if (displayStyle === 'grid') {
            <div class="gallery-grid">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="gallery-grid-item" (click)="openLightbox(i)">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)" loading="eager">
                </div>
              }
            </div>
          }
        } @else {
          <p style="text-align:center;color:rgba(255,255,255,0.3);padding:40px">Sin fotos</p>
        }
      </div>
    </section>

    <!-- Lightbox -->
    @if (lightboxIndex() !== null) {
      <div class="lightbox" (click)="closeLightbox()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <div class="lightbox-img-container"
               (touchstart)="onLightboxTouchStart($event)"
               (touchmove)="onLightboxTouchMove($event)"
               (touchend)="onLightboxTouchEnd()"
               (dblclick)="toggleLightboxZoom()">
            <img [src]="photos[lightboxIndex()!].url" class="lightbox-img"
                 [style.transform]="'scale(' + lightboxZoom() + ') translate(' + lightboxPanX() + 'px, ' + lightboxPanY() + 'px)'"
                 [class.zoomed]="lightboxZoom() > 1">
          </div>
          <button class="lightbox-close" (click)="closeLightbox()"><span class="material-icons">close</span> Cerrar</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .gallery-section { padding: 80px 20px; }
    .section-container { max-width: 600px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 24px; text-align: center; }
    .section-line { flex: 1; height: 1px; }
    .section-heading { text-align: center; }
    .gallery-desc { text-align: center; margin-bottom: 32px; }

    /* === SWIPER GALLERY === */
    .swiper-gallery-wrapper { width: 100%; overflow: hidden; }
    .gallery-swiper { width: 100%; padding-bottom: 40px; }
    .gallery-swiper swiper-slide {
      display: flex; align-items: center; justify-content: center;
      border-radius: 14px; overflow: hidden;
    }
    .gallery-swiper swiper-slide img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      border-radius: 14px; pointer-events: none;
    }
    .gallery-swiper.static-mode { pointer-events: none; }

    /* === POLAROID === */
    .gallery-polaroid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; padding: 20px; }
    .polaroid-card {
      width: 140px; padding: 8px 8px 32px; background: white;
      border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); cursor: pointer;
    }
    .polaroid-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; border-radius: 2px; }

    /* === GRID === */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
    .gallery-grid-item { border-radius: 10px; overflow: hidden; cursor: pointer; aspect-ratio: 1; }
    .gallery-grid-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* === LIGHTBOX === */
    .lightbox { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.92); }
    .lightbox-content { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; max-height: 100%; justify-content: center; }
    .lightbox-img-container { display: flex; align-items: center; justify-content: center; max-width: 95vw; max-height: 75vh; overflow: hidden; border-radius: 8px; touch-action: none; user-select: none; -webkit-user-select: none; }
    .lightbox-img { max-width: 95vw; max-height: 75vh; object-fit: contain; border-radius: 8px; transition: transform 0.2s ease; transform-origin: center center; }
    .lightbox-img.zoomed { transition: none; cursor: grab; }
    .lightbox-close { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 24px; padding: 10px 24px; color: white; font-size: 14px; font-weight: 500; cursor: pointer; user-select: none; -webkit-user-select: none; .material-icons { font-size: 18px; } &:hover { background: rgba(255,255,255,0.2); } }

    @media (max-width: 520px) {
      .polaroid-card { width: 120px; padding: 6px 6px 24px; }
    }
  `]
})
export class LandingGalleryComponent implements OnInit, OnDestroy {
  @Input() config!: GalleryConfig;
  @Input() photos: Photo[] = [];
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  @Input() staticMode = false;

  hasOrnament(): boolean {
    return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none';
  }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  lightboxIndex = signal<number | null>(null);
  lightboxZoom = signal(1);
  lightboxPanX = signal(0);
  lightboxPanY = signal(0);
  private lightboxLastDist = 0;
  private lightboxLastX = 0;
  private lightboxLastY = 0;
  private polaroidRotations: number[] = [];

  get displayStyle(): string { return this.config.displayStyle || 'carousel-3d'; }

  ngOnInit() {
    this.polaroidRotations = this.photos.map(() => (Math.random() - 0.5) * 12);
    this.preloadImages();
  }

  ngOnDestroy() {}

  private preloadImages() {
    for (const photo of this.photos) {
      const img = new Image();
      img.src = photo.url;
    }
  }

  // === Swiper config helpers ===
  getSwiperEffect(): string {
    switch (this.displayStyle) {
      case 'carousel-3d': case 'coverflow': return 'coverflow';
      case 'carousel-vertical': return 'coverflow';
      case 'stack': return 'cards';
      case 'flip': return 'flip';
      case 'slideshow': return 'fade';
      default: return 'coverflow';
    }
  }

  getSwiperSlidesPerView(): string {
    switch (this.displayStyle) {
      case 'carousel-3d': case 'coverflow': case 'carousel-vertical': return 'auto';
      default: return '1';
    }
  }

  getSwiperSpaceBetween(): string {
    switch (this.displayStyle) {
      case 'carousel-3d': case 'coverflow': case 'carousel-vertical': return '20';
      default: return '0';
    }
  }

  getSwiperCoverflowRotate(): string {
    if (this.displayStyle === 'carousel-vertical') return '8';
    return '30';
  }

  getSwiperCoverflowDepth(): string {
    if (this.displayStyle === 'carousel-vertical') return '150';
    return '200';
  }

  // === Slide click ===
  onSlideClick(i: number) {
    if (!this.staticMode) {
      this.openLightbox(i);
    }
  }

  // === Polaroid ===
  getPolaroidTransform(i: number): string { return `rotate(${this.polaroidRotations[i] || 0}deg)`; }

  // === Lightbox ===
  openLightbox(i: number) {
    this.lightboxIndex.set(i);
    this.lightboxZoom.set(1);
    this.lightboxPanX.set(0);
    this.lightboxPanY.set(0);
  }
  closeLightbox() {
    this.lightboxIndex.set(null);
    this.lightboxZoom.set(1);
    this.lightboxPanX.set(0);
    this.lightboxPanY.set(0);
  }
  @HostListener('window:scroll') onScroll() { if (this.lightboxIndex() !== null) this.closeLightbox(); }

  toggleLightboxZoom() {
    if (this.lightboxZoom() > 1) {
      this.lightboxZoom.set(1);
      this.lightboxPanX.set(0);
      this.lightboxPanY.set(0);
    } else {
      this.lightboxZoom.set(2.5);
    }
  }

  onLightboxTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.lightboxLastDist = this.getTouchDist(e);
    } else if (e.touches.length === 1 && this.lightboxZoom() > 1) {
      this.lightboxLastX = e.touches[0].clientX;
      this.lightboxLastY = e.touches[0].clientY;
    }
  }

  onLightboxTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = this.getTouchDist(e);
      const scale = dist / this.lightboxLastDist;
      const newZoom = Math.max(1, Math.min(5, this.lightboxZoom() * scale));
      this.lightboxZoom.set(newZoom);
      this.lightboxLastDist = dist;
      if (newZoom <= 1) { this.lightboxPanX.set(0); this.lightboxPanY.set(0); }
    } else if (e.touches.length === 1 && this.lightboxZoom() > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - this.lightboxLastX;
      const dy = e.touches[0].clientY - this.lightboxLastY;
      this.lightboxPanX.update(v => v + dx / this.lightboxZoom());
      this.lightboxPanY.update(v => v + dy / this.lightboxZoom());
      this.lightboxLastX = e.touches[0].clientX;
      this.lightboxLastY = e.touches[0].clientY;
    }
  }

  onLightboxTouchEnd() {
    if (this.lightboxZoom() <= 1) {
      this.lightboxPanX.set(0);
      this.lightboxPanY.set(0);
    }
  }

  private getTouchDist(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

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
