import { Component, Input, Output, EventEmitter, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DresscodeConfig, DresscodeCard, GlobalTextStyles, SectionStyle, CardStyle, ElementPosition, ElementPositions } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';
import { DragBoxComponent } from '../../../core/components/drag-box.component';
import { LightboxService } from '../../../core/services/lightbox.service';
import { resolveMedia, sectionStyleToMedia } from '../../../core/utils/media-background.util';

@Component({
  selector: 'app-landing-dresscode',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent, DragBoxComponent],
  template: `
    <!-- Cada ejemplo de vestimenta es una MINI-SECCIÓN independiente (como Detalles/Lugares), con su
         propio encabezado (opcional), fondo/estilo de sección y de card, y drag selectivo. La PRIMERA
         usa el título general de Vestimenta (config.title); las demás usan card.heading. -->
    @for (card of visibleCards(); track card.id) {
      <section class="dress-mini" [class.bg-banner]="isBannerBg(card)" [class.positioned]="hasAnyPosition(card)" [attr.id]="realIndex(card) === 0 ? 'dresscode' : null" [attr.data-dress-id]="'dresscode:' + card.id" [style]="miniBg(card)">
        <div class="dress-mini-inner" [class.canvas-desktop]="fgDesktop" [class.canvas-mobile]="fgMobile" data-drag-bounds>
          @if (headingText(card)) {
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(card,'heading')" [ngStyle]="pos(card,'heading')"
                          (positionChange)="onPosChange(card,'heading',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              @if (hasOrnament(card) && getOrnamentPosition(card) !== 'sides') {
                <div class="section-header-block">
                  @if (getOrnamentPosition(card) === 'above' || getOrnamentPosition(card) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(card)" [color]="getOrnamentColor(card)" [size]="getOrnamentSize(card)" />
                  }
                  <h2 class="section-heading" [style.font-family]="headingFont(card)" [style.font-size]="headingSize(card)" [style.color]="headingColor(card)">{{ headingText(card) }}</h2>
                  @if (getOrnamentPosition(card) === 'below' || getOrnamentPosition(card) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(card)" [color]="getOrnamentColor(card)" [size]="getOrnamentSize(card)" />
                  }
                </div>
              } @else {
                <div class="section-header">
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                  <h2 class="section-heading" [style.font-family]="headingFont(card)" [style.font-size]="headingSize(card)" [style.color]="headingColor(card)">{{ headingText(card) }}</h2>
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                </div>
              }
            </app-drag-box>
          }

          <div class="dress-grid">
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(card,'card')" [ngStyle]="pos(card,'card')"
                          (positionChange)="onPosChange(card,'card',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              <div class="example-card reveal"
                   [class.positioned]="hasAnyPosition(card)"
                   [class.no-bg]="getShowCardBg(card) === false"
                   [style.border-radius]="getCardBorderRadius(card)"
                   [style.--card-bg-opacity]="1"
                   [style.border-style]="getCardBorderStyle(card)"
                   [style.border-width.px]="getCardBorderWidth(card)"
                   [style.box-shadow]="getCardBoxShadow(card)"
                   [style.--card-bg]="getCardBgColor(card)"
                   [style.border-color]="getCardBorderColor(card)"
                   [class.neon-border]="getIsNeon(card)">
                <!-- Imágenes de ejemplo: cuadrícula 2 columnas (2 arriba, 2 abajo). 1 = centrada;
                     3 = 2 arriba + 1 abajo centrada. Tamaño por card (small/medium/large). PNG con
                     transparencia (object-fit:contain, sin fondo). Clic abre el visor (lightbox). -->
                @if (card.images && card.images.length > 0) {
                  <div class="example-images" [attr.data-count]="card.images.length" [style.--dress-img-scale]="imageScale(card)">
                    @for (img of card.images; track img; let j = $index) {
                      <div class="example-img-wrapper" (click)="openImageViewer(card.images, j)">
                        <img [src]="img" [alt]="card.title" loading="lazy">
                      </div>
                    }
                  </div>
                }
                @if (card.title) {
                  <h3 class="example-title"
                      [style.font-family]="titleFont(card)" [style.font-size]="titleSize(card)" [style.font-weight]="titleWeight(card)"
                      [style.background-image]="useTitleGradient(card) ? getTitleGradient(card) : null"
                      [class.gradient-text]="useTitleGradient(card)"
                      [style.color]="!useTitleGradient(card) ? titleColor(card) : null"
                  >{{ card.title }}</h3>
                }
                <!-- Descripción = editor enriquecido (bypassSecurityTrustHtml para preservar estilos). -->
                @if (hasDescription(card)) {
                  <div class="example-desc"
                       [style.--dc-font]="contentFont(card)" [style.--dc-size]="contentSize(card)" [style.--dc-color]="contentColor(card)"
                       [innerHTML]="safeDesc(card)"></div>
                }
              </div>
            </app-drag-box>
          </div>
        </div>

        @if (editable && dragging && guides) {
          @if (guides.x !== undefined) { <div class="ad-guide ad-guide-v" [style.left.%]="guides.x"></div> }
          @if (guides.y !== undefined) { <div class="ad-guide ad-guide-h" [style.top.%]="guides.y"></div> }
        }
      </section>
    }
  `,
  styles: [`
    .dress-mini {
      position: relative; padding: 48px 20px;
      min-height: var(--canvas-vh, 100svh);
      display: flex; flex-direction: column; justify-content: center;
    }
    /* BANNER: imagen de fondo en columna centrada --sec-banner-w (igual que .section-block normal). */
    .dress-mini.bg-banner::before {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background-image: var(--sec-bg-image);
      background-size: auto 100%; background-position: center center; background-repeat: no-repeat;
      z-index: 0; pointer-events: none;
    }
    .dress-mini.bg-banner::after {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background: rgba(0,0,0,var(--sec-ov, 0)); z-index: 0; pointer-events: none;
    }
    .dress-mini-inner { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; width: 100%; }
    /* Fade-in SOLO del contenido (opacidad; sin transform). El fondo banner no se anima. */
    .dress-mini-inner.reveal-fade { opacity: 0; transition: opacity 0.8s ease; }
    .dress-mini-inner.reveal-fade.reveal-in { opacity: 1; }
    /* Modo posicionado (drag): el inner cubre toda la mini-sección, acotado por dispositivo. */
    .dress-mini.positioned .dress-mini-inner { position: absolute; top: 0; bottom: 0; max-width: none; margin: 0; }
    .dress-mini.positioned .dress-mini-inner.canvas-desktop { left: 50%; right: auto; width: var(--canvas-desktop-w, 600px); transform: translateX(-50%); }
    .dress-mini.positioned .dress-mini-inner.canvas-mobile { left: 50%; right: auto; width: var(--canvas-mobile-w, 360px); transform: translateX(-50%); }
    .dress-mini.positioned .dress-grid { display: block; max-width: none; margin: 0; }
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }
    .dress-grid { display: flex; flex-direction: column; max-width: 600px; margin: 0 auto; }
    .example-card {
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 24px; text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &:hover { transform: translateY(-3px); }
      &.no-bg { border-color: transparent; border-style: none !important; &::before { opacity: 0; } &:hover { box-shadow: none; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    @keyframes neonPulse { from { filter: brightness(1); } to { filter: brightness(1.3); } }
    /* ===== CUADRÍCULA de imágenes de ejemplo (2 columnas: 2 arriba, 2 abajo) =====
       El tamaño base de cada celda escala con --dress-img-scale (small/medium/large). Con 1 imagen
       se centra; con 3, la 3ª (impar) ocupa ambas columnas centrada. PNG transparente: contain. */
    .example-images {
      display: grid; grid-template-columns: repeat(2, auto); gap: 14px;
      justify-content: center; align-items: start; margin-bottom: 16px;
    }
    /* 1 imagen: una sola columna centrada. */
    .example-images[data-count="1"] { grid-template-columns: auto; }
    /* 3 imágenes: la tercera cruza las 2 columnas y se centra abajo. */
    .example-images[data-count="3"] .example-img-wrapper:nth-child(3) { grid-column: 1 / -1; justify-self: center; }
    .example-img-wrapper {
      width: calc(130px * var(--dress-img-scale, 1));
      height: calc(170px * var(--dress-img-scale, 1));
      border-radius: 12px; overflow: hidden; cursor: pointer;
      img {
        width: 100%; height: 100%;
        /* contain = respeta PNG con transparencia (no recorta ni rellena con color). */
        object-fit: contain; transition: transform 0.3s;
      }
      &:hover img { transform: scale(1.05); }
    }
    /* Si el ancho de la card no da para 2 columnas, apila en vertical (1 columna). */
    @media (max-width: 420px) {
      .example-images { grid-template-columns: auto; }
      .example-images[data-count="3"] .example-img-wrapper:nth-child(3) { grid-column: auto; }
    }
    .example-title { font-family: var(--font-serif); margin-bottom: 8px; line-height: 1.4; padding: 0.1em 0; }
    .example-title.gradient-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }
    /* Descripción enriquecida: base heredable del tema vía variables (los spans del editor mandan). */
    .example-desc {
      line-height: 1.7; white-space: normal;
      font-family: var(--dc-font, inherit); font-size: var(--dc-size, inherit); color: var(--dc-color, inherit);
    }
    .example-desc p { margin: 0 0 8px; }
    .example-desc p:last-child { margin-bottom: 0; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDresscodeComponent implements AfterViewInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef);
  private lightbox = inject(LightboxService);
  private revealObserver?: IntersectionObserver;

  @Input() config!: DresscodeConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  @Input() scrollAnim: string = 'fade-up';
  /** Si se define, renderiza SOLO la card de ese índice (una mini-sección). Lo usa el canvas. */
  @Input() onlyIndex?: number;
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  @Input() editable = false;
  @Output() positionsChange = new EventEmitter<{ cardId: string; positions: ElementPositions }>();

  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  ngAfterViewInit() {
    if (this.scrollAnim === 'none') return;
    if (typeof window !== 'undefined' && window.self !== window.top && !window.location.search.includes('preview=1')) return;
    const inners: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.dress-mini-inner');
    if (!inners.length) return;
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('reveal-in'); this.revealObserver!.unobserve(e.target); }
      }
    }, { threshold: 0.12 });
    inners.forEach((el) => { el.classList.add('reveal-fade'); this.revealObserver!.observe(el); });
  }
  ngOnDestroy() { this.revealObserver?.disconnect(); }

  openImageViewer(images: string[], index: number) { this.lightbox.open(images, index); }

  // ===== SafeHtml (descripción enriquecida) =====
  private _safeCache = new Map<string, SafeHtml>();
  hasDescription(card: DresscodeCard): boolean {
    return !!((card.descriptionHtml && card.descriptionHtml.trim()) || (card.description && card.description.trim()));
  }
  safeDesc(card: DresscodeCard): SafeHtml {
    const h = (card.descriptionHtml && card.descriptionHtml.trim()) ? card.descriptionHtml : (card.description || '');
    if (!this._safeCache.has(h)) this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    return this._safeCache.get(h)!;
  }

  // ===== Estructura (mini-secciones) =====
  visibleCards(): DresscodeCard[] {
    const cards = this.config?.cards || [];
    if (this.onlyIndex == null) return cards;
    const c = cards[this.onlyIndex];
    return c ? [c] : [];
  }
  realIndex(card: DresscodeCard): number {
    return (this.config?.cards || []).findIndex(c => c.id === card.id);
  }
  private ss(card: DresscodeCard): SectionStyle | undefined { return card.sectionStyle; }
  private cs(card: DresscodeCard): CardStyle { return card.cardStyle || {}; }

  headingText(card: DresscodeCard): string {
    if (this.realIndex(card) === 0) return (this.config.title ?? 'Código de Vestimenta').trim();
    return (card.heading || '').trim();
  }

  /** Escala de las imágenes de ejemplo: small=1, medium=1.15 (+15%), large=1.30 (+30%). */
  imageScale(card: DresscodeCard): number {
    switch (card.imageSize) { case 'medium': return 1.15; case 'large': return 1.30; default: return 1; }
  }

  // ===== Adorno =====
  hasOrnament(card: DresscodeCard): boolean { const o = this.ss(card)?.headingOrnament; return !!o && o.type !== 'none'; }
  getOrnamentType(card: DresscodeCard): string { return this.ss(card)?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(card: DresscodeCard): string { return this.ss(card)?.headingOrnament?.position || 'below'; }
  getOrnamentColor(card: DresscodeCard): string { return this.ss(card)?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(card: DresscodeCard): number { return this.ss(card)?.headingOrnament?.size || 1; }

  getFontFamily(key?: string): string {
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'cormorant': 'var(--font-cormorant)', 'spumoni': 'var(--font-spumoni)', 'dancing': 'var(--font-dancing)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'sacramento': 'var(--font-sacramento)', 'tangerine': 'var(--font-tangerine)', 'alexbrush': 'var(--font-alexbrush)',
      'pinyon': 'var(--font-pinyon)', 'aura': 'var(--font-aura)', 'allura': 'var(--font-allura)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key || 'sans'] || 'var(--font-sans)';
  }

  // ===== Texto por card =====
  headingColor(card: DresscodeCard): string { return this.ss(card)?.sectionHeadingColor || this.styles?.sectionHeadingStyle?.color || '#d4a017'; }
  headingFont(card: DresscodeCard): string { return this.getFontFamily(this.ss(card)?.sectionHeadingFont || this.styles?.sectionHeadingStyle?.fontFamily); }
  headingSize(card: DresscodeCard): string { return `${this.ss(card)?.sectionHeadingSize || this.styles?.sectionHeadingStyle?.fontSize || 36}px`; }
  titleColor(card: DresscodeCard): string { return this.ss(card)?.headingColor || this.styles?.titleStyle?.color || '#d4a017'; }
  titleFont(card: DresscodeCard): string { return this.getFontFamily(this.ss(card)?.headingFont || this.styles?.titleStyle?.fontFamily); }
  titleSize(card: DresscodeCard): string { return `${this.ss(card)?.headingFontSize || this.styles?.titleStyle?.fontSize || 18}px`; }
  titleWeight(card: DresscodeCard): string { return `${this.ss(card)?.headingFontWeight || this.styles?.titleStyle?.fontWeight || 400}`; }
  useTitleGradient(card: DresscodeCard): boolean {
    const ss = this.ss(card);
    if (ss?.headingColor2) return true;
    if (ss?.headingColor) return false;
    return !!this.styles?.titleStyle?.color2;
  }
  getTitleGradient(card?: DresscodeCard): string {
    const ss = card ? this.ss(card) : undefined;
    const g = this.styles?.titleStyle;
    const c1 = ss?.headingColor ?? g?.color ?? '#d4a017';
    const c2 = ss?.headingColor2 ?? g?.color2;
    if (!c2) return 'none';
    const angle = ss?.headingGradientAngle ?? g?.gradientAngle ?? 135;
    const v = Math.max(0, Math.min(100, ss?.headingGradientIntensity ?? g?.gradientIntensity ?? 50));
    const mid = 100 - v; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }
  contentColor(card: DresscodeCard): string { return this.ss(card)?.contentColor || this.styles?.contentStyle?.color || 'rgba(255,255,255,0.8)'; }
  contentFont(card: DresscodeCard): string { return this.getFontFamily(this.ss(card)?.contentFont || this.styles?.contentStyle?.fontFamily); }
  contentSize(card: DresscodeCard): string { return `${this.ss(card)?.contentFontSize || this.styles?.contentStyle?.fontSize || 14}px`; }

  // ===== Fondo de la mini-sección (igual que Detalles; banner solo desktop = R3) =====
  miniBg(card: DresscodeCard): string {
    const ss = this.ss(card) as any;
    if (!ss || ss.bgType === 'inherit' || !ss.bgType) return 'background: transparent';
    if (ss.bgType === 'solid') return `background: ${ss.bgColor1 || 'transparent'}`;
    if (ss.bgType === 'linear') {
      const a = ss.bgAngle ?? 180; const c1 = ss.bgColor1 || '#1a1a2e'; const c2 = ss.bgColor2 || '#0d1117';
      return `background: linear-gradient(${a}deg, ${c1}, ${c2})`;
    }
    if (ss.bgType === 'image') {
      const m = resolveMedia(sectionStyleToMedia(ss), this.isDesktopBg);
      if (!m.hasMedia || m.isVideo) return 'background: transparent';
      const ov = Math.max(0, Math.min(100, m.overlay)) / 100;
      if (m.fit === 'banner' && this.isDesktopBg) {
        return `--sec-bg-image: url(${m.url}); --sec-banner-w: ${m.bannerWidth}%; --sec-ov: ${ov}`;
      }
      const dark = ov > 0 ? `linear-gradient(rgba(0,0,0,${ov}), rgba(0,0,0,${ov})), ` : '';
      return `background: ${dark}url(${m.url}) center / auto 100% no-repeat`;
    }
    return 'background: transparent';
  }
  isBannerBg(card: DresscodeCard): boolean {
    const ss = this.ss(card) as any;
    if (!ss || ss.bgType !== 'image') return false;
    const m = resolveMedia(sectionStyleToMedia(ss), this.isDesktopBg);
    return m.hasMedia && !m.isVideo && m.fit === 'banner' && this.isDesktopBg;
  }

  getSeparatorBg(): string {
    const c = this.styles?.separatorStyle?.color || '#d4a017';
    const t = this.styles?.separatorStyle?.type || 'elegant';
    switch (t) {
      case 'formal': return c;
      case 'executive': return `linear-gradient(180deg, ${c}, transparent 40%, transparent 60%, ${c})`;
      case 'festive': return `repeating-linear-gradient(90deg, ${c} 0px, ${c} 4px, transparent 4px, transparent 10px)`;
      case 'animated': return `linear-gradient(90deg, transparent, ${c}, transparent)`;
      case 'minimal': return `${c}40`;
      case 'ornamental': return `linear-gradient(90deg, transparent, ${c}60, ${c}, ${c}60, transparent)`;
      default: return `linear-gradient(90deg, transparent, ${c}80, transparent)`;
    }
  }
  getSeparatorHeight(): string {
    const t = this.styles?.separatorStyle?.type || 'elegant';
    switch (t) { case 'executive': return '4px'; case 'festive': return '3px'; case 'ornamental': return '2px'; default: return '1px'; }
  }

  // ===== Estilo de card por card =====
  getShowCardBg(card: DresscodeCard): boolean { return this.cs(card).showCardBg !== false; }
  getCardBgColor(card: DresscodeCard): string { return this.cs(card).cardBgColor || ''; }
  getCardBorderColor(card: DresscodeCard): string { return this.cs(card).cardBorderColor || ''; }
  getCardBorderStyle(card: DresscodeCard): string { const s = this.cs(card).cardBorderStyle || 'none'; return (s === 'glow' || s === 'neon') ? 'solid' : s; }
  getIsNeon(card: DresscodeCard): boolean { return this.cs(card).cardBorderStyle === 'neon'; }
  getCardBorderWidth(card: DresscodeCard): number { const cs = this.cs(card); if (cs.cardBorderStyle === 'none' || !cs.cardBorderStyle) return 0; return cs.cardBorderWidth ?? 1; }
  getCardBoxShadow(card: DresscodeCard): string {
    const cs = this.cs(card); const color = cs.cardGlowColor || '#d4a017'; const w = cs.cardBorderWidth ?? 1;
    if (cs.cardBorderStyle === 'glow') return `0 0 ${w * 4}px ${w * 2}px ${color}, inset 0 0 ${w * 2}px ${color}`;
    if (cs.cardBorderStyle === 'neon') return `0 0 ${w * 5}px ${color}, 0 0 ${w * 10}px ${color}, 0 0 ${w * 20}px ${color}`;
    return 'none';
  }
  getCardBorderRadius(card: DresscodeCard): string {
    const cs = this.cs(card); const shape = cs.cardShape || 'standard'; const base = cs.cardBorderRadius ?? 16;
    switch (shape) { case 'rounded': return '50px'; case 'ticket': return `${base}px`; case 'cut': return `${base}px 0 ${base}px 0`; default: return `${base}px`; }
  }

  // ===== Dispositivo / drag =====
  private get isDesktopBg(): boolean {
    if (this.previewDevice) return this.previewDevice === 'desktop';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }
  private get isMobilePos(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  get fgDesktop(): boolean { return !this.isMobilePos; }
  get fgMobile(): boolean { return this.isMobilePos; }

  private readonly POS_KEYS = ['heading', 'card'];
  private readonly DEFAULT_POS: Record<string, ElementPosition> = {
    heading: { x: 50, y: 22 },
    card: { x: 50, y: 60, w: 80 },
  };
  hasAnyPosition(card: DresscodeCard): boolean {
    const p = card.positions;
    if (!p) return false;
    return (!!p.desktop && Object.keys(p.desktop).length > 0) || (!!p.mobile && Object.keys(p.mobile).length > 0);
  }
  private resolvePos(card: DresscodeCard, key: string): ElementPosition {
    const p = card.positions;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return p?.[dev]?.[key] ?? p?.[other]?.[key] ?? this.DEFAULT_POS[key] ?? { x: 50, y: 50 };
  }
  pos(card: DresscodeCard, key: string): Record<string, string> {
    if (!this.hasAnyPosition(card)) return {};
    const r = this.resolvePos(card, key);
    const style: Record<string, string> = {
      position: 'absolute', left: r.x + '%', top: r.y + '%',
      right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', margin: '0',
    };
    if (r.w != null) style['width'] = r.w + '%';
    else if (key === 'card') style['width'] = '80%';
    else style['width'] = 'max-content';
    if (r.h != null) style['height'] = r.h + '%';
    return style;
  }
  posData(card: DresscodeCard, key: string): ElementPosition | null {
    if (!this.hasAnyPosition(card)) return null;
    return this.resolvePos(card, key);
  }
  onPosChange(card: DresscodeCard, key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = {
      desktop: { ...(card.positions?.desktop || {}) },
      mobile: { ...(card.positions?.mobile || {}) },
    };
    if (!this.hasAnyPosition(card)) {
      for (const k of this.POS_KEYS) {
        if (k === 'heading' && !this.headingText(card)) continue;
        positions[dev]![k] = { ...this.resolvePos(card, k) };
      }
    }
    positions[dev]![key] = pos;
    card.positions = positions;
    this.positionsChange.emit({ cardId: card.id, positions });
  }
}
