import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, DoCheck, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryConfig, ItineraryItem, GlobalTextStyles, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-itinerary',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  template: `
    <section id="itinerary" class="landing-section itinerary-section">
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
            >{{ config.title || 'Itinerario' }}</h2>
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
            >{{ config.title || 'Itinerario' }}</h2>
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          </div>
        }

        <div class="timeline" [attr.data-align]="config.timelineAlign || 'center'" [attr.data-line]="config.lineStyle || 'solid'" [style.--line-color]="getLineColor()" [style.--timeline-dot-bg]="getDotBg()" [style.--timeline-dot-border]="getDotBorder()">
          <!-- Trazo SVG estilizado (pincel: fino-grueso-fino). Se dibuja dinamicamente
               entre los iconos con huecos en cada circulo. -->
          <svg class="timeline-svg" [attr.width]="svgWidth()" [attr.height]="svgHeight()" [attr.viewBox]="'0 0 ' + svgWidth() + ' ' + svgHeight()" aria-hidden="true">
            <defs>
              <linearGradient [attr.id]="gradId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" [attr.stop-color]="getLineColor()" stop-opacity="0.85"/>
                <stop offset="50%" [attr.stop-color]="getLineColor()" stop-opacity="1"/>
                <stop offset="100%" [attr.stop-color]="getLineColor()" stop-opacity="0.85"/>
              </linearGradient>
              @if (isGlow()) {
                <filter [attr.id]="glowId" x="-80%" y="-10%" width="260%" height="120%">
                  <feGaussianBlur stdDeviation="3" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              }
            </defs>
            @for (seg of segments(); track $index) {
              <path [attr.d]="seg" [attr.fill]="'url(#' + gradId + ')'" [attr.filter]="isGlow() ? 'url(#' + glowId + ')' : null"></path>
            }
          </svg>
          @for (item of items; track item.id; let i = $index) {
            <div class="timeline-item" [class.right]="config.timelineAlign === 'center' && i % 2 !== 0" [style.transition-delay.ms]="i * 100">
              <div class="timeline-content reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius]="getCardBorderRadius()" [style.text-align]="config.textAlign || 'left'" [style.--card-bg-opacity]="(config.cardBgOpacity ?? 100) / 100" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
                <div class="timeline-body">
                  @if (formatTime(item.time)) {
                    <span class="timeline-time" [style.font-size.px]="config.timeFontSize || 12">{{ formatTime(item.time) }}</span>
                  }
                  <h4 class="timeline-title"
                      [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
                      [style.font-size.px]="config.titleFontSize || styles?.subtitleStyle?.fontSize || 16"
                      [style.font-weight]="styles?.subtitleStyle?.fontWeight || 500"
                      [style.color]="styles?.subtitleStyle?.color || 'white'"
                  >{{ item.title }}</h4>
                  @if (item.description) {
                    <p class="timeline-desc"
                       [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                       [style.font-size.px]="config.descFontSize || styles?.contentStyle?.fontSize || 13"
                       [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.6)'"
                    >{{ item.description }}</p>
                  }
                </div>
              </div>
              <!-- Icon on the line -->
              @if (item.iconType !== 'none' && config.showIcons !== false) {
                <div class="timeline-dot timeline-dot-icon">
                  @if (item.iconType === 'custom' && item.iconUrl) {
                    <img [src]="item.iconUrl" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
                  } @else if (item.iconType === 'emoji' && item.icon) {
                    <span class="emoji-icon">{{ item.icon }}</span>
                  } @else {
                    <span class="material-icons">{{ item.icon || 'event' }}</span>
                  }
                </div>
              } @else {
                <div class="timeline-dot">&#x2666;</div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .itinerary-section { padding: 80px 20px; }
    .section-container { max-width: 900px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 48px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }

    /* --axis define el eje vertical donde se centran la linea y los circulos.
       La linea es CONTINUA (una sola, sin cortes intermedios entre actividades) y se le
       aplica una MASCARA generada dinamicamente (--line-mask) que crea huecos transparentes
       exactamente donde esta cada circulo. Asi la linea nunca pasa por detras del icono
       (hueco real) y el relleno del circulo puede ser transparente. */
    /* Padding solo vertical para que la linea y los items compartan EXACTAMENTE el mismo
       origen horizontal (sin padding lateral que desfase el absolute de la linea vs el dot).
       El margen lateral se maneja con el --axis y el padding del contenido de cada item. */
    .timeline {
      position: relative; padding: 20px 0;
      --axis: 50%;
      --line-color: var(--theme-card-border, rgba(212,160,23,0.6));
      --line-w: 3px;
    }
    .timeline[data-align="left"] { --axis: 40px; }
    .timeline[data-align="right"] { --axis: calc(100% - 40px); }

    /* El trazo del timeline lo dibuja un SVG (ancho variable tipo pincel, ondas, zigzag).
       Se posiciona absoluto sobre el eje y queda detras de los circulos. */
    .timeline-svg {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none; z-index: 0; overflow: visible;
    }

    .timeline-item {
      display: flex; justify-content: flex-end;
      padding-right: calc(50% + 30px); margin-bottom: 32px; position: relative;
      opacity: 0; transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .timeline-item.visible { opacity: 1; transform: translateY(0); }
    .timeline-item.right { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 30px); }
    /* Left aligned: contenido a la derecha del eje */
    .timeline[data-align="left"] .timeline-item { padding-right: 0; padding-left: 70px; justify-content: flex-start; }
    .timeline[data-align="left"] .timeline-item.right { padding-left: 70px; }
    /* Right aligned: contenido a la izquierda del eje */
    .timeline[data-align="right"] .timeline-item { padding-left: 0; padding-right: 70px; justify-content: flex-end; }
    .timeline[data-align="right"] .timeline-item.right { padding-right: 70px; justify-content: flex-end; }
    /* El circulo se centra SIEMPRE sobre el mismo eje que la linea */
    .timeline-dot {
      position: absolute; left: var(--axis); top: 50%;
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: var(--theme-text-primary, var(--gold));
      transform: translate(-50%, -50%);
      /* Relleno del circulo CONFIGURABLE (admite transparencia). Como la linea tiene un
         gap real alrededor del circulo, puede ser transparente sin que se vea la linea
         por detras. Por defecto transparente. */
      background: var(--timeline-dot-bg, transparent);
      border: 2px solid var(--timeline-dot-border, var(--theme-card-border, rgba(212,160,23,0.5)));
      opacity: 0;
      animation: none;
      z-index: 2;
    }
    .timeline-dot-icon { width: 40px; height: 40px; }
    .timeline-dot-icon .emoji-icon { font-size: 18px; }
    .timeline-dot-icon .material-icons { font-size: 18px; }
    .timeline-dot-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .timeline-item.visible .timeline-dot {
      animation: diamondAppear 0.6s ease forwards;
    }
    .timeline-content {
      display: flex; gap: 12px; align-items: flex-start;
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      padding: 14px 16px; border-radius: 12px; width: fit-content; max-width: 100%;
      word-break: break-word;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &.no-bg { border-color: transparent; border-style: none !important; &::before { opacity: 0; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    @keyframes neonPulse {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }
    .timeline-body { flex: 1; min-width: 0; }
    .timeline-time { font-size: 12px; color: var(--theme-text-primary, var(--gold)); font-weight: 600; letter-spacing: 0.5px; }
    .timeline-title { font-family: var(--font-serif); font-size: 16px; color: white; margin: 4px 0; }
    .timeline-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes diamondAppear {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
      60% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); text-shadow: 0 0 16px currentColor; }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); text-shadow: 0 0 8px currentColor; }
    }

    @media (max-width: 640px) {
      /* En mobile el timeline siempre va con el eje a la izquierda; linea y circulo
         comparten el mismo eje para quedar centrados entre si. */
      .timeline, .timeline[data-align="left"], .timeline[data-align="center"], .timeline[data-align="right"] { --axis: 32px; }
      .timeline-item, .timeline-item.right { padding: 0 0 0 64px; justify-content: flex-start; }
    }
  `]
})
export class LandingItineraryComponent implements AfterViewInit, OnChanges, DoCheck, OnDestroy {
  @Input() config!: ItineraryConfig;
  @Input() items: ItineraryItem[] = [];
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  private el = inject(ElementRef);
  private observer!: IntersectionObserver;
  private lastSig = '';
  private viewReady = false;

  ngOnChanges(_c: SimpleChanges) {
    setTimeout(() => this.updateSvgPaths(), 0);
  }

  /** Detecta cambios en la config que el builder MUTA sin cambiar la referencia del @Input
      (lineStyle, alineacion, color, etc.) comparando una firma. Si cambio, regenera el SVG. */
  ngDoCheck() {
    if (!this.viewReady) return;
    const sig = [
      this.config?.lineStyle, this.config?.timelineAlign,
      (this.config as any)?.lineColor, (this.config as any)?.dotBgColor,
      (this.config as any)?.dotBorderColor, this.config?.showIcons,
      this.items?.length
    ].join('|');
    if (sig !== this.lastSig) {
      this.lastSig = sig;
      setTimeout(() => this.updateSvgPaths(), 0);
    }
  }

  /** Relleno del circulo (admite transparencia). Configurable por la seccion; por defecto
      transparente (la linea tiene gap, asi que no se ve por detras). */
  getDotBg(): string {
    return (this.config as any).dotBgColor || 'transparent';
  }

  /** Color del borde del circulo del icono. */
  getDotBorder(): string {
    return (this.config as any).dotBorderColor || (this.config as any).lineColor || 'var(--theme-card-border, rgba(212,160,23,0.5))';
  }

  /** Color propio de la linea decorativa del timeline (independiente del borde de card). */
  getLineColor(): string {
    return (this.config as any).lineColor || 'var(--theme-card-border, rgba(212,160,23,0.6))';
  }

  hasOrnament(): boolean {
    return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none';
  }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    const items = this.el.nativeElement.querySelectorAll('.timeline-item');
    items.forEach((item: Element) => this.observer.observe(item));

    // Genera los trazos SVG y recalcula al redimensionar.
    this.updateSvgPaths();
    const timeline = this.el.nativeElement.querySelector('.timeline') as HTMLElement | null;
    if (timeline && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateSvgPaths());
      this.resizeObserver.observe(timeline);
    }
    // Reintentos por si las fuentes/imagenes cambian las alturas tras el primer render.
    setTimeout(() => this.updateSvgPaths(), 150);
    setTimeout(() => this.updateSvgPaths(), 600);
    this.viewReady = true;
  }

  /** Construye los paths SVG del trazo del timeline. Cada tramo entre dos iconos es una
      figura rellena con ancho VARIABLE (fino en los extremos, grueso al centro) = efecto
      pincel. Soporta formas: recta (aguja/haz), ondeada y zigzag. Los huecos quedan
      naturalmente al dejar un gap desde el centro de cada circulo. */
  private updateSvgPaths() {
    const timeline = this.el.nativeElement.querySelector('.timeline') as HTMLElement | null;
    if (!timeline) return;
    const dots = Array.from(timeline.querySelectorAll('.timeline-dot')) as HTMLElement[];
    if (dots.length === 0) { this.segments.set([]); return; }

    const style = this.config.lineStyle || 'solid';
    // "Sin linea": no dibujar nada.
    if (style === 'none') { this.segments.set([]); return; }

    const tlRect = timeline.getBoundingClientRect();
    const axisX = this.resolveAxisX(timeline, tlRect);
    const GAP = 24;    // radio del hueco alrededor del circulo
    const TAIL = 18;   // longitud del trazo que sobresale antes del 1er y despues del ultimo

    const centers = dots.map(d => {
      const r = d.getBoundingClientRect();
      return r.top - tlRect.top + r.height / 2;
    });

    this.svgWidth.set(Math.round(tlRect.width));
    this.svgHeight.set(Math.round(tlRect.height));

    // Rango global del trazo (de tail a tail): el perfil de grosor pincel se calcula
    // sobre este rango, para que el afinado sea global y continuo en todo el timeline.
    const gTop = centers[0] - GAP - TAIL;
    const gBottom = centers[centers.length - 1] + GAP + TAIL;

    const segs: string[] = [];
    segs.push(this.buildSegment(axisX, centers[0] - GAP - TAIL, centers[0] - GAP, style, gTop, gBottom));
    for (let i = 0; i < centers.length - 1; i++) {
      segs.push(this.buildSegment(axisX, centers[i] + GAP, centers[i + 1] - GAP, style, gTop, gBottom));
    }
    const lastC = centers[centers.length - 1];
    segs.push(this.buildSegment(axisX, lastC + GAP, lastC + GAP + TAIL, style, gTop, gBottom));

    this.segments.set(segs.filter(s => !!s));
  }

  /** Resuelve la X (px) del eje de la linea segun la alineacion, relativa al SVG. */
  private resolveAxisX(timeline: HTMLElement, tlRect: DOMRect): number {
    const align = this.config.timelineAlign || 'center';
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
    if (isMobile) return 32;
    if (align === 'left') return 40;
    if (align === 'right') return tlRect.width - 40;
    return tlRect.width / 2;
  }

  /** Construye un path relleno con forma de pincel (fino-grueso-fino) entre y0 y y1.
      El grosor se calcula sobre el rango GLOBAL (gTop..gBottom) para un afinado continuo
      en todo el timeline. wave/zigzag desplazan segun la Y absoluta (continuos). */
  private buildSegment(x: number, y0: number, y1: number, style: string, gTop: number, gBottom: number): string {
    const len = y1 - y0;
    if (len <= 1) return '';
    const maxW = style === 'beam' ? 1.8 : 2.2;   // mitad del grosor maximo (centro) — mas fino
    const minW = 0.5;                            // mitad del grosor minimo (puntas)
    const steps = Math.max(6, Math.round(len / 4));
    const gLen = Math.max(1, gBottom - gTop);
    const amp = style === 'wave' ? 12 : style === 'zigzag' ? 10 : 0; // amplitud horizontal
    const wavePeriod = 70;   // px por onda completa
    const zigPeriod = 44;    // px por diente

    // Perfil de ancho GLOBAL: fino en los extremos del timeline, grueso al centro.
    const widthAtY = (y: number) => {
      const tg = (y - gTop) / gLen;              // 0..1 a lo largo de todo el trazo
      const bell = Math.sin(Math.PI * Math.max(0, Math.min(1, tg)));
      return minW + (maxW - minW) * Math.pow(bell, 0.5);
    };
    // Desplazamiento horizontal segun la Y absoluta (continuo entre tramos)
    const offsetAtY = (y: number) => {
      if (style === 'wave') return Math.sin((y / wavePeriod) * Math.PI * 2) * amp;
      if (style === 'zigzag') {
        const phase = ((y % zigPeriod) / zigPeriod);       // 0..1
        return (Math.abs(phase - 0.5) * 4 - 1) * amp;      // triangular -amp..amp
      }
      return 0;
    };

    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const y = y0 + len * (i / steps);
      const cx = x + offsetAtY(y);
      const w = widthAtY(y);
      left.push(`${(cx - w).toFixed(2)},${y.toFixed(2)}`);
      right.push(`${(cx + w).toFixed(2)},${y.toFixed(2)}`);
    }
    right.reverse();
    return `M ${left.join(' L ')} L ${right.join(' L ')} Z`;
  }

  // Signals para el SVG
  svgWidth = signal(0);
  svgHeight = signal(0);
  segments = signal<string[]>([]);
  readonly gradId = 'tl-grad-' + Math.random().toString(36).slice(2, 8);
  readonly glowId = 'tl-glow-' + Math.random().toString(36).slice(2, 8);
  isGlow(): boolean { return (this.config?.lineStyle || 'solid') === 'beam'; }

  ngOnDestroy() { this.observer?.disconnect(); this.resizeObserver?.disconnect(); }

  formatTime(time: string): string {
    if (!time || time.includes('AM') || time.includes('PM')) return time;
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr) || 0;
    const m = parseInt(mStr) || 0;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }

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

  getCardBgColor(): string {
    return (this.config as any).cardBgColor || '';
  }

  getCardBorderColor(): string {
    return (this.config as any).cardBorderColor || '';
  }

  getCardBorderStyle(): string {
    const s = (this.config as any).cardBorderStyle || 'none';
    if (s === 'glow' || s === 'neon') return 'solid';
    return s;
  }

  getIsNeon(): boolean {
    return (this.config as any).cardBorderStyle === 'neon';
  }

  getCardBorderWidth(): number {
    if ((this.config as any).cardBorderStyle === 'none') return 0;
    return (this.config as any).cardBorderWidth ?? 1;
  }

  getCardBoxShadow(): string {
    const style = (this.config as any).cardBorderStyle;
    const color = (this.config as any).cardGlowColor || '#d4a017';
    const width = (this.config as any).cardBorderWidth ?? 1;
    if (style === 'glow') return `0 0 ${width * 4}px ${width * 2}px ${color}, inset 0 0 ${width * 2}px ${color}`;
    if (style === 'neon') return `0 0 ${width * 5}px ${color}, 0 0 ${width * 10}px ${color}, 0 0 ${width * 20}px ${color}`;
    return 'none';
  }

  getCardFilter(): string {
    return 'none';
  }

  getCardClipPath(): string {
    return 'none';
  }

  getCardBorderRadius(): string {
    const shape = (this.config as any).cardShape || 'standard';
    const base = (this.config as any).cardBorderRadius ?? 16;
    switch (shape) {
      case 'rounded': return '50px';
      case 'ticket': return `${base}px`;
      case 'cut': return `${base}px 0 ${base}px 0`;
      default: return `${base}px`;
    }
  }
}
