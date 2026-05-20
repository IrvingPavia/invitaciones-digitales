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
          <div class="carousel"
               (touchstart)="onTouchStart($event)"
               (touchend)="onTouchEnd($event)">
            <div class="carousel-track" [style.transform]="'translateX(' + offset() + 'px)'" [class.animating]="animating()">
              @for (photo of photos; track photo.id; let i = $index) {
                <div class="carousel-slide" [class.active]="i === current()">
                  <img [src]="photo.url" [alt]="'Foto ' + (i+1)" (click)="openLightbox(i)">
                </div>
              }
            </div>

            <!-- Dots -->
            <div class="carousel-dots">
              @for (photo of photos; track photo.id; let i = $index) {
                <button class="dot" [class.active]="i === current()" (click)="goTo(i)"></button>
              }
            </div>

            <!-- Arrows -->
            @if (photos.length > 1) {
              <button class="carousel-arrow arrow-left" (click)="prev()">
                <span class="material-icons">chevron_left</span>
              </button>
              <button class="carousel-arrow arrow-right" (click)="next()">
                <span class="material-icons">chevron_right</span>
              </button>
            }
          </div>

          <p class="carousel-counter">{{ current() + 1 }} / {{ photos.length }}</p>
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
          <button class="lightbox-close" (click)="closeLightbox()">
            <span class="material-icons">close</span>
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .gallery-section { padding: 80px 20px; }
    .section-container { max-width: 600px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .gallery-desc { text-align: center; color: rgba(255,255,255,0.6); margin-bottom: 32px; }

    .carousel {
      position: relative; overflow: hidden;
      border-radius: 16px;
      border: 1px solid rgba(212,160,23,0.2);
      background: rgba(0,0,0,0.3);
    }
    .carousel-track { display: flex; will-change: transform; }
    .carousel-track.animating { transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
    .carousel-slide {
      min-width: 100%; display: flex; align-items: center; justify-content: center;
      aspect-ratio: 3/4; overflow: hidden;
    }
    .carousel-slide img {
      width: 100%; height: 100%; object-fit: cover;
      cursor: pointer; transition: transform 0.3s;
    }
    .carousel-slide.active img:hover { transform: scale(1.03); }

    .carousel-dots {
      position: absolute; bottom: 16px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 8px;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(255,255,255,0.4); border: none;
      cursor: pointer; transition: all 0.3s; padding: 0;
    }
    .dot.active {
      background: var(--gold); transform: scale(1.3);
      box-shadow: 0 0 8px rgba(212,160,23,0.6);
    }

    .carousel-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.5); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 50%; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--gold); transition: all 0.3s;
      .material-icons { font-size: 24px; }
      &:hover { background: rgba(212,160,23,0.3); }
    }
    .arrow-left { left: 12px; }
    .arrow-right { right: 12px; }

    .carousel-counter {
      text-align: center; color: rgba(255,255,255,0.4);
      font-size: 13px; margin-top: 12px;
    }

    .lightbox {
      position: fixed; inset: 0; z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      background: rgba(0,0,0,0.2);
      backdrop-filter: blur(2px);
    }
    .lightbox-content {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; max-width: 92vw; max-height: 90vh;
    }
    .lightbox-img {
      max-width: 100%; max-height: 78vh;
      border-radius: 12px; object-fit: contain;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    }
    .lightbox-close {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 24px; padding: 8px 20px;
      color: rgba(255,255,255,0.7); font-size: 13px;
      cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(255,255,255,0.2); color: white; }
    }
  `]
})
export class LandingGalleryComponent implements OnInit, OnDestroy {
  @Input() config!: GalleryConfig;
  @Input() photos: Photo[] = [];
  @Input() styles?: GlobalTextStyles;

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

  current = signal(0);
  offset = signal(0);
  animating = signal(false);
  lightboxIndex = signal<number | null>(null);

  private touchStartX = 0;
  private autoTimer: any;

  @HostListener('window:scroll')
  onScroll() {
    if (this.lightboxIndex() !== null) this.closeLightbox();
  }

  ngOnInit() { this.startAuto(); }
  ngOnDestroy() { clearInterval(this.autoTimer); }

  private startAuto() {
    clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => this.next(), 4000);
  }

  goTo(index: number) {
    this.animating.set(true);
    this.current.set(index);
    this.updateOffset();
    this.startAuto();
  }

  next() {
    this.goTo((this.current() + 1) % this.photos.length);
  }

  prev() {
    this.goTo((this.current() - 1 + this.photos.length) % this.photos.length);
  }

  private updateOffset() {
    const el = document.querySelector('.carousel') as HTMLElement;
    if (el) this.offset.set(-this.current() * el.offsetWidth);
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.animating.set(false);
  }

  onTouchEnd(e: TouchEvent) {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }

  openLightbox(i: number) { this.lightboxIndex.set(i); }
  closeLightbox() { this.lightboxIndex.set(null); }
}
