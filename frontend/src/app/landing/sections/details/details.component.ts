import { Component, Input, Output, EventEmitter, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DetailsConfig, DetailCard, GlobalTextStyles, SectionStyle, CardStyle, ElementPosition, ElementPositions } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';
import { DragBoxComponent } from '../../../core/components/drag-box.component';
import { resolveMedia, sectionStyleToMedia } from '../../../core/utils/media-background.util';

@Component({
  selector: 'app-landing-details',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent, DragBoxComponent],
  template: `
    <!-- Cada card es una MINI-SECCIÓN independiente, con su propio encabezado (opcional), su propio
         fondo/estilo de sección y de card, y alto FLEXIBLE (crece con su contenido). La PRIMERA usa
         el título general de Detalles (config.title) como encabezado; las demás usan card.heading
         (si está vacío, el encabezado no se muestra). Retrocompatible: si una card no define
         sectionStyle/cardStyle, hereda el de la sección (this.sectionStyle / this.config). -->
    @for (card of visibleCards(); track card.id) {
      <section class="details-mini" [class.has-image-bg]="hasImageBg(card)" [class.bg-banner]="isBannerBg(card)" [class.positioned]="hasAnyPosition(card)" [attr.id]="realIndex(card) === 0 ? 'details' : null" [attr.data-detail-id]="'details:' + card.id" [style]="miniBg(card)">
        <div class="details-mini-inner" [class.canvas-desktop]="fgDesktop" [class.canvas-mobile]="fgMobile" data-drag-bounds>
          @if (headingText(card)) {
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(card,'heading')" [ngStyle]="pos(card,'heading')"
                          (positionChange)="onPosChange(card,'heading',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              @if (hasOrnament(card) && getOrnamentPosition(card) !== 'sides') {
                <div class="section-header-block">
                  @if (getOrnamentPosition(card) === 'above' || getOrnamentPosition(card) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(card)" [color]="getOrnamentColor(card)" [size]="getOrnamentSize(card)" />
                  }
                  <h2 class="section-heading"
                      [style.font-family]="headingFont(card)"
                      [style.font-size]="headingSize(card)"
                      [style.color]="headingColor(card)"
                  >{{ headingText(card) }}</h2>
                  @if (getOrnamentPosition(card) === 'below' || getOrnamentPosition(card) === 'both') {
                    <app-heading-ornament [type]="getOrnamentType(card)" [color]="getOrnamentColor(card)" [size]="getOrnamentSize(card)" />
                  }
                </div>
              } @else {
                <div class="section-header">
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                  <h2 class="section-heading"
                      [style.font-family]="headingFont(card)"
                      [style.font-size]="headingSize(card)"
                      [style.color]="headingColor(card)"
                  >{{ headingText(card) }}</h2>
                  <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
                </div>
              }
            </app-drag-box>
          }

          <div class="details-grid">
            <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData(card,'card')" [ngStyle]="pos(card,'card')"
                          (positionChange)="onPosChange(card,'card',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
              <div class="detail-card reveal"
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
                @if (card.iconType !== 'none') {
                  @if (card.iconType === 'emoji' && card.icon) {
                    <div class="detail-icon emoji-icon"><span>{{ card.icon }}</span></div>
                  } @else if (card.iconUrl) {
                    <div class="detail-icon"><img [src]="card.iconUrl" [alt]="card.title"></div>
                  }
                }
                @if (card.title) {
                  <h3 [style.font-family]="titleFont(card)"
                      [style.font-size]="titleSize(card)"
                      [style.font-weight]="titleWeight(card)"
                      [style.background-image]="useTitleGradient(card) ? getTitleGradient(card) : null"
                      [class.gradient-text]="useTitleGradient(card)"
                      [style.color]="!useTitleGradient(card) ? titleColor(card) : null"
                  >{{ card.title }}</h3>
                }
                <!-- Contenido: HTML del editor enriquecido con bypassSecurityTrustHtml para preservar
                     los estilos inline de los spans (color/fuente/tamaño/alineación/interlineado). El
                     tema global es la BASE HEREDABLE (vía variables CSS en .detail-content) para el
                     texto que el editor deja sin estilizar; los spans del editor mandan. La alineación
                     y demás formato vienen del propio editor. -->
                <div class="detail-content"
                     [style.--dc-font]="contentFont(card)"
                     [style.--dc-size]="contentSize(card)"
                     [style.--dc-color]="contentColor(card)"
                     [innerHTML]="safeContent(card.content)"
                ></div>
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
    /* Mini-sección de card: alto FLEXIBLE (no 100vh). El fondo se adapta a su alto; si la imagen no
       cuadra, se ve el fondo global fijo detrás. */
    /* Alto MÍNIMO = alto de la ventana (pantalla del dispositivo/desktop) para TODAS las
       mini-secciones: arrancan ocupando la pantalla y, si el contenido (card con texto largo) crece,
       la sección se ALARGA más allá del mínimo (min-height es piso, no techo). El contenido se
       centra verticalmente. Con imagen de fondo esto además dimensiona la imagen (auto 100%) a
       pantalla en vez de quedar aplastada al alto corto del contenido. */
    .details-mini {
      position: relative; padding: 48px 20px;
      /* En el canvas, --canvas-vh = alto del dispositivo simulado; en la landing real la variable no
         existe → cae a 100svh (alto de la ventana). Así arranca con el alto de pantalla en ambos. */
      min-height: var(--canvas-vh, 100svh);
      display: flex; flex-direction: column; justify-content: center;
    }
    /* BANNER: la imagen de fondo se pinta en una COLUMNA CENTRADA de ancho --sec-banner-w (igual que
       el .section-block de las secciones normales), para que el slider "Ancho del banner" controle
       el ancho de la franja y deje franjas laterales con el fondo global. El ::before va DETRÁS del
       contenido (z-index 0). El ::after es el velo de oscurecimiento (overlay) opcional. */
    .details-mini.bg-banner::before {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background-image: var(--sec-bg-image);
      background-size: auto 100%; background-position: center center; background-repeat: no-repeat;
      z-index: 0; pointer-events: none;
    }
    .details-mini.bg-banner::after {
      content: ''; position: absolute; top: 0; bottom: 0; left: 50%;
      width: var(--sec-banner-w, 70%); transform: translateX(-50%);
      background: rgba(0,0,0,var(--sec-ov, 0)); z-index: 0; pointer-events: none;
    }
    .details-mini-inner { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; width: 100%; }
    /* Fade-in SOLO del contenido (opacidad; sin transform para no chocar con el posicionamiento/drag).
       El fondo banner NO se anima (vive en la <section>, fuera de este inner). */
    .details-mini-inner.reveal-fade { opacity: 0; transition: opacity 0.8s ease; }
    .details-mini-inner.reveal-fade.reveal-in { opacity: 1; }
    /* En modo posicionado (drag): el contenedor interno (data-drag-bounds) cubre TODA la mini-sección
       para que los objetos (encabezado/card) absolutos se posicionen en % respecto a él (igual que
       .inv-fg). Se acota a un ancho FIJO por dispositivo (REGLA R1/R4) centrado, para que el drag
       coincida y no se reescale al cambiar de dispositivo. */
    .details-mini.positioned .details-mini-inner {
      position: absolute; top: 0; bottom: 0; max-width: none; margin: 0;
    }
    .details-mini.positioned .details-mini-inner.canvas-desktop {
      left: 50%; right: auto; width: var(--canvas-desktop-w, 600px); transform: translateX(-50%);
    }
    .details-mini.positioned .details-mini-inner.canvas-mobile {
      left: 50%; right: auto; width: var(--canvas-mobile-w, 360px); transform: translateX(-50%);
    }
    .details-mini.positioned .details-grid { display: block; max-width: none; margin: 0; }
    /* Guías de alineación del drag asistido */
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }
    .details-grid { display: flex; flex-direction: column; gap: 24px; max-width: 600px; margin: 0 auto; }
    .detail-card {
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
    @keyframes neonPulse {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }
    .detail-icon {
      width: 72px; height: 72px;
      overflow: hidden; margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
      img { width: 100%; height: 100%; object-fit: contain; }
    }
    .detail-icon.emoji-icon {
      display: flex; align-items: center; justify-content: center;
      span { font-size: 48px; }
    }
    h3 { margin-bottom: 12px; line-height: 1.4; padding: 0.1em 0; }
    h3.gradient-text {
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
    }
    p { line-height: 1.7; white-space: pre-line; }
    /* Base del contenido = tema global (vía variables --dc-*). Se aplica como regla CSS (no inline),
       así los estilos inline de los <span> del editor enriquecido GANAN y el canvas refleja lo
       editado. El texto que el editor deja sin envolver hereda esta base. */
    .detail-content {
      line-height: 1.7;
      font-family: var(--dc-font, inherit);
      font-size: var(--dc-size, inherit);
      color: var(--dc-color, inherit);
    }
    .detail-content p { margin: 0 0 8px; }
    .detail-content p:last-child { margin-bottom: 0; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDetailsComponent implements AfterViewInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef);
  private revealObserver?: IntersectionObserver;

  ngAfterViewInit() {
    // Fade-in del CONTENIDO (.details-mini-inner) al entrar en viewport. Solo opacidad → no rompe el
    // posicionamiento (drag) ni afecta el fondo banner (que vive en la <section>, fuera del inner).
    // Se omite en el builder (iframe sin preview) y si la animación es 'none'.
    if (this.scrollAnim === 'none') return;
    if (typeof window !== 'undefined' && window.self !== window.top && !window.location.search.includes('preview=1')) return;
    const inners: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.details-mini-inner');
    if (!inners.length) return;
    this.revealObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('reveal-in'); this.revealObserver!.unobserve(e.target); }
      }
    }, { threshold: 0.12 });
    inners.forEach((el) => { el.classList.add('reveal-fade'); this.revealObserver!.observe(el); });
  }

  ngOnDestroy() { this.revealObserver?.disconnect(); }

  /** Cache de SafeHtml por valor: el contenido de la card es HTML del editor enriquecido (spans con
      estilos inline). Angular SANEA el [innerHTML] crudo y ELIMINA esos style → el canvas no reflejaba
      lo editado. Con bypassSecurityTrustHtml se preservan (el contenido ya se sanea en el backend,
      igual que hero/envelope/intro). */
  private _safeCache = new Map<string, SafeHtml>();
  safeContent(html: string | undefined | null): SafeHtml {
    const h = html || '';
    if (!this._safeCache.has(h)) this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    return this._safeCache.get(h)!;
  }

  @Input() config!: DetailsConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  /** Animación de scroll del CONTENIDO (fade-in de los objetos de la mini-sección). Viene del tema
      global; 'none' la desactiva. El fade se aplica SOLO al contenido (.details-mini-inner), nunca al
      fondo banner, que está en la <section> y queda fijo al scrollear. */
  @Input() scrollAnim: string = 'fade-up';
  /** Si se define, renderiza SOLO la card de ese índice (una mini-sección). Lo usa el canvas del
      builder para pintar cada "Detalle N" en su propio bloque seleccionable. En la landing real se
      deja sin definir → renderiza TODAS las cards como mini-secciones. */
  @Input() onlyIndex?: number;
  /** Dispositivo activo (canvas/preview). En landing es null → se decide por el ancho de ventana.
      Determina si el banner se pinta como columna (desktop) o a todo el ancho (mobile). */
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  /** Modo edición (canvas builder): activa el arrastre de objetos. */
  @Input() editable = false;
  /** Emite el nuevo mapa de posiciones de UNA card (drag). El builder lo persiste en esa card. */
  @Output() positionsChange = new EventEmitter<{ cardId: string; positions: ElementPositions }>();

  /** Estado de arrastre para dibujar guías. */
  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  /** True si debemos tratar el fondo como DESKTOP (banner = columna centrada). */
  private get isDesktopBg(): boolean {
    if (this.previewDevice) return this.previewDevice === 'desktop';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  // ===== Drag & drop por card (objetos: 'heading' y 'card') =====
  private get isMobilePos(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  /** El lienzo de drag se acota a un ancho FIJO por dispositivo (REGLA R1/R4), para que las
      posiciones en % no se reescalen al cambiar de dispositivo/ventana. */
  get fgDesktop(): boolean { return !this.isMobilePos; }
  get fgMobile(): boolean { return this.isMobilePos; }
  private readonly DETAIL_POS_KEYS = ['heading', 'card'];
  /** Posiciones por defecto (centro, %) cuando la mini-sección entra en modo posicionado. */
  private readonly DETAIL_DEFAULT_POS: Record<string, ElementPosition> = {
    heading: { x: 50, y: 22 },
    card: { x: 50, y: 60, w: 80 },
  };

  /** True si ESTA card tiene al menos una posición personalizada (en cualquier dispositivo). */
  hasAnyPosition(card: DetailCard): boolean {
    const p = card.positions;
    if (!p) return false;
    return (!!p.desktop && Object.keys(p.desktop).length > 0) || (!!p.mobile && Object.keys(p.mobile).length > 0);
  }

  private resolvePos(card: DetailCard, key: string): ElementPosition {
    const p = card.positions;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return p?.[dev]?.[key] ?? p?.[other]?.[key] ?? this.DETAIL_DEFAULT_POS[key] ?? { x: 50, y: 50 };
  }

  /** Estilo de posicionamiento de un objeto de la card. Si la card no está posicionada, {} (flujo). */
  pos(card: DetailCard, key: string): Record<string, string> {
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

  posData(card: DetailCard, key: string): ElementPosition | null {
    if (!this.hasAnyPosition(card)) return null;
    return this.resolvePos(card, key);
  }

  /** Persiste la nueva posición de un objeto de la card y emite el cambio (con cardId). Al primer
      movimiento siembra todos los objetos con su posición efectiva (evita el desacomodo). */
  onPosChange(card: DetailCard, key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = {
      desktop: { ...(card.positions?.desktop || {}) },
      mobile: { ...(card.positions?.mobile || {}) },
    };
    if (!this.hasAnyPosition(card)) {
      for (const k of this.DETAIL_POS_KEYS) {
        // Solo sembrar heading si existe (si no hay encabezado, no tiene objeto).
        if (k === 'heading' && !this.headingText(card)) continue;
        positions[dev]![k] = { ...this.resolvePos(card, k) };
      }
    }
    positions[dev]![key] = pos;
    card.positions = positions;
    this.positionsChange.emit({ cardId: card.id, positions });
  }

  /** Cards a renderizar: todas, o solo la de onlyIndex (modo canvas por-card). */
  visibleCards(): DetailCard[] {
    const cards = this.config?.cards || [];
    if (this.onlyIndex == null) return cards;
    const c = cards[this.onlyIndex];
    return c ? [c] : [];
  }

  /** Índice REAL de la card dentro del array (robusto aunque se renderice un subset). */
  realIndex(card: DetailCard): number {
    return (this.config?.cards || []).findIndex(c => c.id === card.id);
  }



  /** Estilo de sección de una card: SOLO el propio de la card (modelo mini-secciones). NO hereda el
      sectionStyle de la sección global —eso causaba que el fondo apareciera en todas las cards cuando
      el toggle estaba apagado—. La migración (migration.service) ya copió el estilo global a cada card
      la primera vez. Si la card no tiene sectionStyle, los helpers de texto caen al tema global. */
  private ss(card: DetailCard): SectionStyle | undefined {
    return card.sectionStyle;
  }
  /** Estilo de card: SOLO el propio de la card (card.cardStyle). La migración ya trasladó el estilo
      global legacy a cada card. Si no hay cardStyle, se usan los defaults del getter correspondiente. */
  private cs(card: DetailCard): CardStyle {
    return card.cardStyle || {};
  }

  /** Texto del encabezado de la mini-sección: la 1ª (índice real 0) usa el título general de
      Detalles; las demás usan card.heading. Vacío => no se muestra el encabezado.
      Si el usuario borra el título (string vacío) se respeta y NO se muestra; solo se usa el
      default cuando el campo nunca se definió (config legacy = undefined/null). */
  headingText(card: DetailCard): string {
    if (this.realIndex(card) === 0) return (this.config.title ?? 'Detalles del Evento').trim();
    return (card.heading || '').trim();
  }

  // ===== Adorno (por card: card.sectionStyle > sección) =====
  hasOrnament(card: DetailCard): boolean {
    const o = this.ss(card)?.headingOrnament;
    return !!o && o.type !== 'none';
  }
  getOrnamentType(card: DetailCard): string { return this.ss(card)?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(card: DetailCard): string { return this.ss(card)?.headingOrnament?.position || 'below'; }
  getOrnamentColor(card: DetailCard): string { return this.ss(card)?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(card: DetailCard): number { return this.ss(card)?.headingOrnament?.size || 1; }

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

  /* ===== Estilos de texto, resueltos POR CARD: card.sectionStyle > tema global > default ===== */
  // Encabezado de sección (h2)
  headingColor(card: DetailCard): string { return this.ss(card)?.sectionHeadingColor || this.styles?.sectionHeadingStyle?.color || '#d4a017'; }
  headingFont(card: DetailCard): string { return this.getFontFamily(this.ss(card)?.sectionHeadingFont || this.styles?.sectionHeadingStyle?.fontFamily); }
  headingSize(card: DetailCard): string { return `${this.ss(card)?.sectionHeadingSize || this.styles?.sectionHeadingStyle?.fontSize || 36}px`; }

  // Títulos internos (h3)
  titleColor(card: DetailCard): string { return this.ss(card)?.headingColor || this.styles?.titleStyle?.color || '#d4a017'; }
  titleFont(card: DetailCard): string { return this.getFontFamily(this.ss(card)?.headingFont || this.styles?.titleStyle?.fontFamily); }
  titleSize(card: DetailCard): string { return `${this.ss(card)?.headingFontSize || this.styles?.titleStyle?.fontSize || 18}px`; }
  titleWeight(card: DetailCard): string { return `${this.ss(card)?.headingFontWeight || this.styles?.titleStyle?.fontWeight || 400}`; }
  /** Usa degradado si la card define color 2 (headingColor2) o, si la card no define color propio,
      cae al degradado del tema global (titleStyle.color2). Antes se desactivaba justo cuando la card
      tenía color propio → el degradado por-card nunca aplicaba. */
  useTitleGradient(card: DetailCard): boolean {
    const ss = this.ss(card);
    if (ss?.headingColor2) return true;                     // degradado propio de la card
    if (ss?.headingColor) return false;                     // color plano propio de la card
    return !!this.styles?.titleStyle?.color2;               // sin color propio → degradado global si existe
  }
  /** Degradado del título resuelto POR CARD (headingColor/headingColor2/angle/intensity del
      sectionStyle de la card), con fallback al tema global (titleStyle). */
  getTitleGradient(card?: DetailCard): string {
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

  // Contenido (.detail-content)
  contentColor(card: DetailCard): string { return this.ss(card)?.contentColor || this.styles?.contentStyle?.color || 'rgba(255,255,255,0.7)'; }
  contentFont(card: DetailCard): string { return this.getFontFamily(this.ss(card)?.contentFont || this.styles?.contentStyle?.fontFamily); }
  contentSize(card: DetailCard): string { return `${this.ss(card)?.contentFontSize || this.styles?.contentStyle?.fontSize || 14}px`; }

  /** Fondo de la mini-sección (color/gradiente/imagen del sectionStyle de la card). Para imagen usa
      `resolveMedia` (honra media/legacy, override desktop) y aplica el mismo criterio que las demás
      secciones: `cover` = llena; `banner` = en desktop columna centrada de bannerWidth (REGLA R3,
      `auto 100%`), en mobile a todo el ancho con `auto 100%`. Incluye overlay oscuro si overlay>0.
      Si no hay fondo propio → transparente (se ve el fondo global). */
  /** Estilo de fondo de la mini-sección. Para IMAGEN en modo BANNER NO pinta un background directo
      sino que inyecta las variables --sec-bg-image / --sec-banner-w / --sec-ov que consume la regla
      `.details-mini.bg-banner::before` (columna centrada del ancho configurado, con franjas
      laterales), igual que el .section-block de las secciones normales. Así el slider "Ancho del
      banner" SÍ surte efecto. Para solid/linear/cover devuelve un `background` directo. */
  miniBg(card: DetailCard): string {
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
      // BANNER solo en DESKTOP: columna CENTRADA de ancho --sec-banner-w pintada en ::before
      // (respeta el slider). En MOBILE el banner NO aplica → cae a la regla R3 de abajo.
      if (m.fit === 'banner' && this.isDesktopBg) {
        return `--sec-bg-image: url(${m.url}); --sec-banner-w: ${m.bannerWidth}%; --sec-ov: ${ov}`;
      }
      // REGLA R3 (mobile y modo no-banner): alto = sección, ancho PROPORCIONAL (auto 100%) CENTRADO,
      // SIN deformar. Verticales llenan el alto; si sobra ancho se ve el fondo global a los lados.
      const dark = ov > 0 ? `linear-gradient(rgba(0,0,0,${ov}), rgba(0,0,0,${ov})), ` : '';
      return `background: ${dark}url(${m.url}) center / auto 100% no-repeat`;
    }
    return 'background: transparent';
  }

  /** True SOLO si el banner-columna aplica: imagen con fit=banner Y estamos en DESKTOP. En mobile el
      banner no aplica (R3: imagen a auto 100% a todo el ancho), por eso no activa la clase bg-banner. */
  isBannerBg(card: DetailCard): boolean {
    const ss = this.ss(card) as any;
    if (!ss || ss.bgType !== 'image') return false;
    const m = resolveMedia(sectionStyleToMedia(ss), this.isDesktopBg);
    return m.hasMedia && !m.isVideo && m.fit === 'banner' && this.isDesktopBg;
  }

  /** True si la mini-sección tiene fondo de imagen propio (para darle alto mínimo de pantalla y que
      la imagen se dimensione bien, en vez de quedar aplastada al alto corto del contenido). */
  hasImageBg(card: DetailCard): boolean {
    const ss = this.ss(card) as any;
    if (!ss || ss.bgType !== 'image') return false;
    const m = resolveMedia(sectionStyleToMedia(ss), this.isDesktopBg);
    return m.hasMedia && !m.isVideo;
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

  /* ===== Estilo de card, resuelto POR CARD: card.cardStyle > campos de sección (fallback) ===== */
  getShowCardBg(card: DetailCard): boolean { return this.cs(card).showCardBg !== false; }
  getCardBgOpacity(card: DetailCard): number { return this.cs(card).cardBgOpacity ?? 100; }
  getCardBgColor(card: DetailCard): string { return this.cs(card).cardBgColor || ''; }
  getCardBorderColor(card: DetailCard): string { return this.cs(card).cardBorderColor || ''; }
  getCardBorderStyle(card: DetailCard): string {
    const s = this.cs(card).cardBorderStyle || 'none';
    return (s === 'glow' || s === 'neon') ? 'solid' : s;
  }
  getIsNeon(card: DetailCard): boolean { return this.cs(card).cardBorderStyle === 'neon'; }
  getCardBorderWidth(card: DetailCard): number {
    const cs = this.cs(card);
    if (cs.cardBorderStyle === 'none' || !cs.cardBorderStyle) return 0;
    return cs.cardBorderWidth ?? 1;
  }
  getCardBoxShadow(card: DetailCard): string {
    const cs = this.cs(card);
    const color = cs.cardGlowColor || '#d4a017';
    const width = cs.cardBorderWidth ?? 1;
    if (cs.cardBorderStyle === 'glow') return `0 0 ${width * 4}px ${width * 2}px ${color}, inset 0 0 ${width * 2}px ${color}`;
    if (cs.cardBorderStyle === 'neon') return `0 0 ${width * 5}px ${color}, 0 0 ${width * 10}px ${color}, 0 0 ${width * 20}px ${color}`;
    return 'none';
  }
  getCardBorderRadius(card: DetailCard): string {
    const cs = this.cs(card);
    const shape = cs.cardShape || 'standard';
    const base = cs.cardBorderRadius ?? 16;
    switch (shape) {
      case 'rounded': return '50px';
      case 'ticket': return `${base}px`;
      case 'cut': return `${base}px 0 ${base}px 0`;
      default: return `${base}px`;
    }
  }
}
