import { Component, Input, Output, EventEmitter, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { VenuesConfig, VenueItem, GlobalTextStyles, SectionStyle, CardStyle, ElementPosition, ElementPositions } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';
import { DragBoxComponent } from '../../../core/components/drag-box.component';
import { resolveMedia, sectionStyleToMedia } from '../../../core/utils/media-background.util';

@Component({
  selector: 'app-landing-venues',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent, DragBoxComponent],
  template: `
    <!-- Cada lugar es una MINI-SECCIÓN independiente (como en Detalles): encabezado propio (opcional,
         la 1ª usa el título general de Lugares), card con título/nombre/horario/botón, estilo y fondo
         propios, alto = pantalla. Retrocompatible: si el venue no define sectionStyle/cardStyle, usa
         defaults (la migración ya copia el estilo global por venue). -->
    @for (venue of visibleItems(); track venue.id) {
      <section class="venues-mini" [class.bg-banner]="isBannerBg(venue)" [class.positioned]="hasAnyPosition(venue)" [attr.id]="realIndex(venue) === 0 ? 'venues' : null" [attr.data-venue-id]="'venues:' + venue.id" [style]="miniBg(venue)">
        <div class="venues-mini-inner" [class.canvas-desktop]="fgDesktop" [class.canvas-mobile]="fgMobile" data-drag-bounds>

          @if (headingText(venue)) {
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(venue,'heading')" [ngStyle]="pos(venue,'heading')"
                          (positionChange)="onPosChange(venue,'heading',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              @if (hasOrnament(venue) && getOrnamentPosition(venue) !== 'sides') {
                <div class="section-header-block">
                  @if (getOrnamentPosition(venue) === 'above' || getOrnamentPosition(venue) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(venue)" [color]="getOrnamentColor(venue)" [size]="getOrnamentSize(venue)" />
                  }
                  <h2 class="section-heading"
                      [style.font-family]="headingFont(venue)" [style.font-size]="headingSize(venue)" [style.color]="headingColor(venue)"
                  >{{ headingText(venue) }}</h2>
                  @if (getOrnamentPosition(venue) === 'below' || getOrnamentPosition(venue) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(venue)" [color]="getOrnamentColor(venue)" [size]="getOrnamentSize(venue)" />
                  }
                </div>
              } @else {
                <div class="section-header">
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                  <h2 class="section-heading"
                      [style.font-family]="headingFont(venue)" [style.font-size]="headingSize(venue)" [style.color]="headingColor(venue)"
                  >{{ headingText(venue) }}</h2>
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                </div>
              }
            </app-drag-box>
          }

          <div class="venues-grid">
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(venue,'card')" [ngStyle]="pos(venue,'card')"
                          (positionChange)="onPosChange(venue,'card',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              <div class="venue-card reveal"
                   [class.positioned]="hasAnyPosition(venue)"
                   [class.no-bg]="getShowCardBg(venue) === false"
                   [style.border-radius]="getCardBorderRadius(venue)"
                   [style.--card-bg-opacity]="1"
                   [style.border-style]="getCardBorderStyle(venue)"
                   [style.border-width.px]="getCardBorderWidth(venue)"
                   [style.box-shadow]="getCardBoxShadow(venue)"
                   [style.--card-bg]="getCardBgColor(venue)"
                   [style.border-color]="getCardBorderColor(venue)"
                   [class.neon-border]="getIsNeon(venue)">
                @if (config.iconStyle !== 'none' && (venue.iconType !== 'none')) {
                  <div class="venue-icon" [class.icon-plain]="config.iconStyle === 'plain'" [style.--venue-icon-scale]="iconScale(venue)">
                    @if (venue.iconType === 'emoji' && venue.iconEmoji) {
                      <span class="emoji-icon">{{ venue.iconEmoji }}</span>
                    } @else if (venue.icon) {
                      <img [src]="venue.icon" [alt]="venue.title">
                    } @else {
                      <span class="material-icons">place</span>
                    }
                  </div>
                }
                @if (venue.title) {
                  <h3 class="venue-title"
                      [style.font-family]="titleFont(venue)" [style.font-size]="titleSize(venue)" [style.font-weight]="titleWeight(venue)"
                      [style.background-image]="useTitleGradient(venue) ? getTitleGradient(venue) : null"
                      [class.gradient-text]="useTitleGradient(venue)"
                      [style.color]="!useTitleGradient(venue) ? titleColor(venue) : null"
                  >{{ venue.title }}</h3>
                }
                <!-- Nombre del lugar = contenido (editor enriquecido). Fallback al texto plano. -->
                <div class="venue-name"
                     [style.--dc-font]="contentFont(venue)" [style.--dc-color]="contentColor(venue)"
                     [innerHTML]="safeName(venue)"></div>
                <!-- Horario ANTES de la dirección (orden pedido por el usuario). -->
                @if (venue.time) {
                  <div class="venue-time"
                       [style.font-family]="timeFont(venue)" [style.font-size]="timeSize(venue)" [style.color]="timeColor(venue)">
                    @if (timeIcon(venue) !== 'none') {
                      <span class="material-icons">{{ timeIcon(venue) }}</span>
                    }
                    <span>{{ formatTime(venue.time) }}</span>
                  </div>
                }
                @if (hasAddress(venue)) {
                  <div class="venue-address" [innerHTML]="safeAddress(venue)"></div>
                }
                @if (venue.mapsUrl) {
                  <a [href]="venue.mapsUrl" target="_blank" class="venue-maps-btn"
                     [style.background]="btnBg(venue)" [style.color]="btnText(venue)" [style.border-color]="btnBorder(venue)"
                     [style.border-radius.px]="btnRadius(venue)" [style.font-family]="btnFont(venue)" [style.font-size.px]="btnSize(venue)">
                    @if (btnIcon(venue) !== 'none') {
                      <span class="material-icons">{{ btnIcon(venue) }}</span>
                    }
                    {{ btnLabel(venue) }}
                  </a>
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
    /* Alto mínimo = pantalla (dispositivo/desktop); crece con el contenido. En canvas usa --canvas-vh. */
    .venues-mini {
      position: relative; padding: 48px 20px;
      min-height: var(--canvas-vh, 100svh);
      /* 'safe center': centra si cabe; si el contenido es más alto, alinea al inicio y deja CRECER. */
      display: flex; flex-direction: column; justify-content: safe center;
    }
    /* BANNER: imagen de fondo en COLUMNA CENTRADA de ancho --sec-banner-w (igual que el .section-block
       normal), para que el slider "Ancho del banner" controle el ancho de la franja. ::before = imagen
       (detrás del contenido z-index 0); ::after = velo de oscurecimiento (overlay) opcional. */
    .venues-mini.bg-banner::before {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background-image: var(--sec-bg-image);
      background-size: auto 100%; background-position: center center; background-repeat: no-repeat;
      z-index: 0; pointer-events: none;
    }
    .venues-mini.bg-banner::after {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background: rgba(0,0,0,var(--sec-ov, 0)); z-index: 0; pointer-events: none;
    }
    .venues-mini-inner { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; width: 100%; }
    /* Fade-in SOLO del contenido (opacidad; sin transform). El fondo banner no se anima. */
    .venues-mini-inner.reveal-fade { opacity: 0; transition: opacity 0.8s ease; }
    .venues-mini-inner.reveal-fade.reveal-in { opacity: 1; }
    /* Modo posicionado (drag): el contenedor interno (data-drag-bounds) cubre toda la mini-sección y
       se acota a ancho FIJO por dispositivo (REGLA R1/R4) centrado. */
    .venues-mini.positioned .venues-mini-inner { position: absolute; top: 0; bottom: 0; max-width: none; margin: 0; }
    .venues-mini.positioned .venues-mini-inner.canvas-desktop { left: 50%; right: auto; width: var(--canvas-desktop-w, 600px); transform: translateX(-50%); }
    .venues-mini.positioned .venues-mini-inner.canvas-mobile { left: 50%; right: auto; width: var(--canvas-mobile-w, 360px); transform: translateX(-50%); }
    .venues-mini.positioned .venues-grid { display: block; max-width: none; margin: 0; }
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }
    .venues-grid { display: flex; flex-direction: column; max-width: 600px; margin: 0 auto; }
    .venue-card {
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 32px 24px; text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &:hover { transform: translateY(-4px); }
      &.no-bg { border-color: transparent; border-style: none !important; &::before { opacity: 0; } &:hover { box-shadow: none; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    @keyframes neonPulse { from { filter: brightness(1); } to { filter: brightness(1.3); } }
    .venue-icon {
      /* Tamaño base (pequeño) escalado por --venue-icon-scale (1 / 1.1 / 1.2). */
      width: calc(72px * var(--venue-icon-scale, 1)); height: calc(72px * var(--venue-icon-scale, 1)); border-radius: 50%;
      background: var(--theme-card-bg, rgba(0,0,0,0.3)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .material-icons { font-size: calc(32px * var(--venue-icon-scale, 1)); color: var(--theme-text-primary, var(--gold)); }
      .emoji-icon { font-size: calc(32px * var(--venue-icon-scale, 1)); }
    }
    .venue-icon.icon-plain { background: none; border: none; border-radius: 12px; width: calc(80px * var(--venue-icon-scale, 1)); height: calc(80px * var(--venue-icon-scale, 1)); img { border-radius: 12px; } }
    .venue-title { font-family: var(--font-serif); font-size: 18px; color: var(--gold); margin-bottom: 8px; line-height: 1.4; padding: 0.1em 0; }
    .venue-title.gradient-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }
    .venue-name { color: var(--dc-color, white); font-family: var(--dc-font, inherit); font-size: 15px; font-weight: 600; margin-bottom: 6px; line-height: 1.6; }
    .venue-name p { margin: 0 0 6px; }
    .venue-address { color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
    .venue-address p { margin: 0 0 4px; }
    .venue-address p:last-child { margin-bottom: 0; }
    /* Red de seguridad: neutralizar fondos/bordes que puedan venir en el HTML enriquecido
       pegado desde fuentes externas (p.ej. recuadro negro al copiar desde una web oscura). */
    .venue-name, .venue-name *, .venue-address, .venue-address * {
      background: transparent !important; box-shadow: none !important;
    }
    /* Horario: su propia fila, centrado. */
    .venue-time {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 16px;
      .material-icons { font-size: 1.1em; color: inherit; }
    }
    /* Botón: su propia fila, centrado (no en línea con el horario). width:fit-content + margin auto
       lo centra como bloque; el ancho se ajusta al contenido. */
    .venue-maps-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: fit-content; margin: 8px auto 0;
      background: var(--theme-btn-bg, rgba(212,160,23,0.15));
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.4));
      border-radius: 24px; padding: 10px 20px;
      color: var(--theme-btn-text, var(--gold)); font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.3s;
      .material-icons { font-size: 1.2em; }
      &:hover { transform: translateY(-1px); opacity: 0.9; }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingVenuesComponent implements AfterViewInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef);
  private revealObserver?: IntersectionObserver;

  ngAfterViewInit() {
    // Fade-in del CONTENIDO (.venues-mini-inner) al entrar en viewport (solo opacidad; no toca el
    // fondo banner ni rompe el drag). Omitido en builder y si scrollAnim='none'.
    if (this.scrollAnim === 'none') return;
    if (typeof window !== 'undefined' && window.self !== window.top && !window.location.search.includes('preview=1')) return;
    const inners: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.venues-mini-inner');
    if (!inners.length) return;
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('reveal-in'); this.revealObserver!.unobserve(e.target); }
      }
    }, { threshold: 0.12 });
    inners.forEach((el) => { el.classList.add('reveal-fade'); this.revealObserver!.observe(el); });
  }

  ngOnDestroy() { this.revealObserver?.disconnect(); }
  private _safeCache = new Map<string, SafeHtml>();
  safeName(venue: VenueItem): SafeHtml {
    const h = (venue.nameHtml && venue.nameHtml.trim()) ? venue.nameHtml : (venue.name || '');
    if (!this._safeCache.has(h)) this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    return this._safeCache.get(h)!;
  }
  hasAddress(venue: VenueItem): boolean {
    return !!((venue.addressHtml && venue.addressHtml.trim()) || (venue.address && venue.address.trim()));
  }
  safeAddress(venue: VenueItem): SafeHtml {
    const h = (venue.addressHtml && venue.addressHtml.trim()) ? venue.addressHtml : (venue.address || '');
    if (!this._safeCache.has(h)) this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    return this._safeCache.get(h)!;
  }

  @Input() config!: VenuesConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  /** Animación de scroll del CONTENIDO (fade-in de los objetos). Del tema global; 'none' la desactiva.
      Solo afecta al contenido (.venues-mini-inner), nunca al fondo banner. */
  @Input() scrollAnim: string = 'fade-up';
  /** Renderiza SOLO el venue de ese índice (una mini-sección) en el canvas. */
  @Input() onlyIndex?: number;
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  @Input() editable = false;
  @Output() positionsChange = new EventEmitter<{ venueId: string; positions: ElementPositions }>();

  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  visibleItems(): VenueItem[] {
    const items = this.config?.items || [];
    if (this.onlyIndex == null) return items;
    const v = items[this.onlyIndex];
    return v ? [v] : [];
  }
  realIndex(venue: VenueItem): number { return (this.config?.items || []).findIndex(v => v.id === venue.id); }

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

  /** Estilo de sección/card SOLO del venue (sin fallback a la sección global; la migración ya copió). */
  private ss(venue: VenueItem): SectionStyle | undefined { return venue.sectionStyle; }
  private cs(venue: VenueItem): CardStyle { return venue.cardStyle || {}; }

  /** Encabezado de la mini-sección: la 1ª (índice real 0) usa el título general de Lugares;
      las demás usan venue.heading. Si el usuario borra el título (string vacío) se respeta y
      NO se muestra; solo se usa el default cuando el campo nunca se definió (legacy). */
  headingText(venue: VenueItem): string {
    if (this.realIndex(venue) === 0) return ((this.config as any).title ?? 'Lugares del Evento').trim();
    return (venue.heading || '').trim();
  }

  // ===== Drag por venue (objetos: 'heading' y 'card') =====
  private readonly POS_KEYS = ['heading', 'card'];
  private readonly DEFAULT_POS: Record<string, ElementPosition> = {
    heading: { x: 50, y: 22 },
    card: { x: 50, y: 60, w: 80 },
  };
  hasAnyPosition(venue: VenueItem): boolean {
    const p = venue.positions;
    if (!p) return false;
    return (!!p.desktop && Object.keys(p.desktop).length > 0) || (!!p.mobile && Object.keys(p.mobile).length > 0);
  }
  private resolvePos(venue: VenueItem, key: string): ElementPosition {
    const p = venue.positions;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return p?.[dev]?.[key] ?? p?.[other]?.[key] ?? this.DEFAULT_POS[key] ?? { x: 50, y: 50 };
  }
  pos(venue: VenueItem, key: string): Record<string, string> {
    if (!this.hasAnyPosition(venue)) return {};
    const r = this.resolvePos(venue, key);
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
  posData(venue: VenueItem, key: string): ElementPosition | null {
    if (!this.hasAnyPosition(venue)) return null;
    return this.resolvePos(venue, key);
  }
  onPosChange(venue: VenueItem, key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = {
      desktop: { ...(venue.positions?.desktop || {}) },
      mobile: { ...(venue.positions?.mobile || {}) },
    };
    if (!this.hasAnyPosition(venue)) {
      for (const k of this.POS_KEYS) {
        if (k === 'heading' && !this.headingText(venue)) continue;
        positions[dev]![k] = { ...this.resolvePos(venue, k) };
      }
    }
    positions[dev]![key] = pos;
    venue.positions = positions;
    this.positionsChange.emit({ venueId: venue.id, positions });
  }

  // ===== Adorno (por venue) =====
  hasOrnament(venue: VenueItem): boolean { const o = this.ss(venue)?.headingOrnament; return !!o && o.type !== 'none'; }
  getOrnamentType(venue: VenueItem): string { return this.ss(venue)?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(venue: VenueItem): string { return this.ss(venue)?.headingOrnament?.position || 'below'; }
  getOrnamentColor(venue: VenueItem): string { return this.ss(venue)?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(venue: VenueItem): number { return this.ss(venue)?.headingOrnament?.size || 1; }

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

  // Encabezado (h2)
  headingColor(v: VenueItem): string { return this.ss(v)?.sectionHeadingColor || this.styles?.sectionHeadingStyle?.color || '#d4a017'; }
  headingFont(v: VenueItem): string { return this.getFontFamily(this.ss(v)?.sectionHeadingFont || this.styles?.sectionHeadingStyle?.fontFamily); }
  headingSize(v: VenueItem): string { return `${this.ss(v)?.sectionHeadingSize || this.styles?.sectionHeadingStyle?.fontSize || 36}px`; }

  // Título (h3) con gradiente por venue
  titleColor(v: VenueItem): string { return this.ss(v)?.headingColor || this.styles?.titleStyle?.color || '#d4a017'; }
  titleFont(v: VenueItem): string { return this.getFontFamily(this.ss(v)?.headingFont || this.styles?.titleStyle?.fontFamily); }
  titleSize(v: VenueItem): string { return `${this.ss(v)?.headingFontSize || this.styles?.titleStyle?.fontSize || 18}px`; }
  titleWeight(v: VenueItem): string { return `${this.ss(v)?.headingFontWeight || this.styles?.titleStyle?.fontWeight || 400}`; }
  useTitleGradient(v: VenueItem): boolean {
    const ss = this.ss(v);
    if (ss?.headingColor2) return true;
    if (ss?.headingColor) return false;
    return !!this.styles?.titleStyle?.color2;
  }
  getTitleGradient(v?: VenueItem): string {
    const ss = v ? this.ss(v) : undefined;
    const g = this.styles?.titleStyle;
    const c1 = ss?.headingColor ?? g?.color ?? '#d4a017';
    const c2 = ss?.headingColor2 ?? g?.color2;
    if (!c2) return 'none';
    const angle = ss?.headingGradientAngle ?? g?.gradientAngle ?? 135;
    const vv = Math.max(0, Math.min(100, ss?.headingGradientIntensity ?? g?.gradientIntensity ?? 50));
    const mid = 100 - vv; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }

  // Nombre = contenido
  contentColor(v: VenueItem): string { return this.ss(v)?.contentColor || this.styles?.contentStyle?.color || 'white'; }
  contentFont(v: VenueItem): string { return this.getFontFamily(this.ss(v)?.contentFont || this.styles?.contentStyle?.fontFamily); }

  // Horario (icono + texto, color compartido)
  timeIcon(v: VenueItem): string { return v.timeStyle?.icon || 'schedule'; }
  timeColor(v: VenueItem): string { return v.timeStyle?.color || this.styles?.contentStyle?.color || 'rgba(255,255,255,0.7)'; }
  timeFont(v: VenueItem): string { return this.getFontFamily(v.timeStyle?.font || this.styles?.contentStyle?.fontFamily); }
  timeSize(v: VenueItem): string { return `${v.timeStyle?.fontSize || 14}px`; }

  // Botón
  btnIcon(v: VenueItem): string { return v.buttonStyle?.icon || 'map'; }
  btnLabel(v: VenueItem): string { return v.buttonStyle?.text || 'Cómo llegar'; }
  btnBg(v: VenueItem): string | null { return v.buttonStyle?.bgColor || null; }
  btnText(v: VenueItem): string | null { return v.buttonStyle?.textColor || null; }
  btnBorder(v: VenueItem): string | null { return v.buttonStyle?.borderColor || null; }
  btnRadius(v: VenueItem): number | null { return v.buttonStyle?.borderRadius ?? null; }
  btnFont(v: VenueItem): string | null { return v.buttonStyle?.font ? this.getFontFamily(v.buttonStyle.font) : null; }
  btnSize(v: VenueItem): number | null { return v.buttonStyle?.fontSize ?? null; }

  // Fondo de la mini-sección
  /** Estilo de fondo de la mini-sección (lugar). En modo BANNER inyecta variables --sec-bg-image /
      --sec-banner-w / --sec-ov que consume `.venues-mini.bg-banner::before` (columna centrada del
      ancho configurado, con franjas laterales), igual que el .section-block normal, para que el
      slider "Ancho del banner" surta efecto. Para solid/linear/cover devuelve `background` directo. */
  miniBg(venue: VenueItem): string {
    const ss = this.ss(venue) as any;
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
      // BANNER solo en DESKTOP (columna --sec-banner-w via ::before). En MOBILE cae a R3.
      if (m.fit === 'banner' && this.isDesktopBg) {
        return `--sec-bg-image: url(${m.url}); --sec-banner-w: ${m.bannerWidth}%; --sec-ov: ${ov}`;
      }
      // REGLA R3 (mobile y no-banner): alto = sección, ancho PROPORCIONAL (auto 100%) centrado.
      const dark = ov > 0 ? `linear-gradient(rgba(0,0,0,${ov}), rgba(0,0,0,${ov})), ` : '';
      return `background: ${dark}url(${m.url}) center / auto 100% no-repeat`;
    }
    return 'background: transparent';
  }

  /** True SOLO si el banner-columna aplica (fit=banner Y desktop). En mobile el banner no aplica (R3). */
  isBannerBg(venue: VenueItem): boolean {
    const ss = this.ss(venue) as any;
    if (!ss || ss.bgType !== 'image') return false;
    const m = resolveMedia(sectionStyleToMedia(ss), this.isDesktopBg);
    return m.hasMedia && !m.isVideo && m.fit === 'banner' && this.isDesktopBg;
  }

  formatTime(time: string): string {
    if (!time) return '';
    if (/AM|PM/i.test(time)) return time;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
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

  // Estilo de card por venue
  getShowCardBg(v: VenueItem): boolean { return this.cs(v).showCardBg !== false; }
  /** La opacidad del fondo de card se controla ÚNICAMENTE con el alpha del color picker
      (igual que en el resto de secciones, donde el slider de opacidad se quitó). Devolvemos
      100 (neutro) para no multiplicar una segunda opacidad y así respetar exactamente el
      alpha elegido en el color. Ignora cualquier cardBgOpacity heredado de la migración. */
  getCardBgOpacity(_v: VenueItem): number { return 100; }
  /** Factor de escala del icono/imagen del lugar según iconSize: small=1 (base), medium=1.15
      (+15%), large=1.30 (+30%, 15% por nivel sobre el pequeño). Ausente → 1 (pequeño). */
  iconScale(v: VenueItem): number {
    switch (v.iconSize) { case 'medium': return 1.15; case 'large': return 1.30; default: return 1; }
  }
  getCardBgColor(v: VenueItem): string { return this.cs(v).cardBgColor || ''; }
  getCardBorderColor(v: VenueItem): string { return this.cs(v).cardBorderColor || ''; }
  getCardBorderStyle(v: VenueItem): string { const s = this.cs(v).cardBorderStyle || 'none'; return (s === 'glow' || s === 'neon') ? 'solid' : s; }
  getIsNeon(v: VenueItem): boolean { return this.cs(v).cardBorderStyle === 'neon'; }
  getCardBorderWidth(v: VenueItem): number { const cs = this.cs(v); if (cs.cardBorderStyle === 'none' || !cs.cardBorderStyle) return 0; return cs.cardBorderWidth ?? 1; }
  getCardBoxShadow(v: VenueItem): string {
    const cs = this.cs(v); const color = cs.cardGlowColor || '#d4a017'; const w = cs.cardBorderWidth ?? 1;
    if (cs.cardBorderStyle === 'glow') return `0 0 ${w * 4}px ${w * 2}px ${color}, inset 0 0 ${w * 2}px ${color}`;
    if (cs.cardBorderStyle === 'neon') return `0 0 ${w * 5}px ${color}, 0 0 ${w * 10}px ${color}, 0 0 ${w * 20}px ${color}`;
    return 'none';
  }
  getCardBorderRadius(v: VenueItem): string {
    const cs = this.cs(v); const shape = cs.cardShape || 'standard'; const base = cs.cardBorderRadius ?? 16;
    switch (shape) { case 'rounded': return '50px'; case 'ticket': return `${base}px`; case 'cut': return `${base}px 0 ${base}px 0`; default: return `${base}px`; }
  }
}
