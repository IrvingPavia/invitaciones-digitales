import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationConfig, Guest, GlobalTextStyles, SectionStyle, ElementPosition, ElementPositions } from '../../../core/models/models';
import { DragBoxComponent } from '../../../core/components/drag-box.component';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-invitation',
  standalone: true,
  imports: [CommonModule, DragBoxComponent, HeadingOrnamentComponent],
  template: `
    <section id="invitation" class="landing-section" [class.positioned]="hasAnyPosition">
      <!-- Lienzo de posicionamiento (data-drag-bounds): ocupa toda la sección y confina
           los objetos arrastrables. Si no hay posiciones guardadas, los objetos conservan
           el flujo centrado normal (posStyle devuelve {}). -->
      <div class="inv-fg" data-drag-bounds [class.positioned]="hasAnyPosition" [class.canvas-desktop]="fgDesktop" [class.canvas-mobile]="fgMobile">
      <div class="section-container">
        @if (ornamentType() !== 'none') {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [centerContent]="true" [position]="posData('ornamentTop')" [ngStyle]="pos('ornamentTop')" (positionChange)="onPosChange('ornamentTop', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <app-heading-ornament [type]="ornamentType()" [color]="ornamentColor()" [size]="ornamentSize()" />
          </app-drag-box>
        }
        <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData('title')" [ngStyle]="pos('title')" (positionChange)="onPosChange('title', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          <h2 class="invitation-title reveal"
              [style.font-family]="getFontFamily(styles?.titleStyle?.fontFamily)"
              [style.font-size.px]="styles?.titleStyle?.fontSize || 42"
              [style.font-weight]="styles?.titleStyle?.fontWeight || 400"
              [style.background-image]="getTitleGradient()"
              [class.gradient-text]="!!styles?.titleStyle?.color2"
              [style.color]="!styles?.titleStyle?.color2 ? (styles?.titleStyle?.color || '#d4a017') : null"
          >{{ config.title }}</h2>
        </app-drag-box>
        @if (config.subtitle) {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData('subtitle')" [ngStyle]="pos('subtitle')" (positionChange)="onPosChange('subtitle', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <p class="invitation-subtitle reveal"
               [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
               [style.font-size.px]="styles?.subtitleStyle?.fontSize || 16"
               [style.color]="styles?.subtitleStyle?.color || 'rgba(255,255,255,0.7)'"
            >{{ config.subtitle }}</p>
          </app-drag-box>
        }

        <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [position]="posData('card')" [ngStyle]="pos('card')" (positionChange)="onPosChange('card', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
        @if (guest) {
          <div class="invitation-card reveal" [class.positioned]="hasAnyPosition" [class.no-bg]="config.showCardBg === false" [style.border-radius]="getCardBorderRadius()" [style.--card-bg-opacity]="(config.cardBgOpacity ?? 100) / 100" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño invitamos a</p>
              <h3 class="invitation-name"
                  [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                  [style.font-size.px]="styles?.contentStyle?.fontSize ? styles!.contentStyle.fontSize + 10 : 30"
                  [style.color]="styles?.contentStyle?.color || '#ffffff'"
              >{{ guest.family_name || guest.guest_names }}</h3>
              @if (guest.guest_type === 'family' && hasGuestNames()) {
                <div class="invitation-names-list">
                  @for (name of guestNames(); track name) {
                    <span class="guest-name-chip"
                          [style.background]="config.guestChipBg || null"
                          [style.color]="config.guestChipText || null"
                          [style.border-color]="config.guestChipBorder || null">{{ name.trim() }}</span>
                  }
                </div>
              }
              <div class="invitation-count"
                   [style.background]="config.countBg || null"
                   [style.color]="config.countText || null"
                   [style.border-color]="config.countBorder || null">
                <span class="material-icons">people</span>
                <span>{{ guestCount() }} {{ guestCount() === 1 ? 'asistente' : 'asistentes' }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="invitation-card reveal" [class.positioned]="hasAnyPosition" [class.no-bg]="config.showCardBg === false" [style.border-radius]="getCardBorderRadius()" [style.--card-bg-opacity]="(config.cardBgOpacity ?? 100) / 100" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño los invitamos a celebrar</p>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px">Escanea el código QR de tu invitación para ver tu nombre</p>
            </div>
          </div>
        }
        </app-drag-box>

        @if (ornamentType() !== 'none') {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [centerContent]="true" [position]="posData('ornamentBottom')" [ngStyle]="pos('ornamentBottom')" (positionChange)="onPosChange('ornamentBottom', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <app-heading-ornament [type]="ornamentType()" [color]="ornamentColor()" [size]="ornamentSize()" />
          </app-drag-box>
        }
      </div>

      <!-- Guías de alineación (solo durante el arrastre en modo edición) -->
      @if (editable && dragging && guides) {
        @if (guides.x !== undefined) { <div class="ad-guide ad-guide-v" [style.left.%]="guides.x"></div> }
        @if (guides.y !== undefined) { <div class="ad-guide ad-guide-h" [style.top.%]="guides.y"></div> }
      }
      </div><!-- /.inv-fg -->
    </section>
  `,
  styles: [`
    .landing-section {
      padding: 80px 20px; position: relative;
    }
    .section-container { max-width: 800px; margin: 0 auto; text-align: center; }
    /* padding-left compensa el letter-spacing que se aplica también tras la última ✦ (hueco a
       la derecha). Así el contenido queda centrado dentro de la caja del drag-box y el handle
       central cae sobre la estrella del medio. */
    .invitation-ornament { color: var(--theme-text-primary, var(--gold)); font-size: 24px; letter-spacing: 12px; padding-left: 12px; opacity: 0.6; margin: 16px 0; }
    .invitation-title {
      font-family: var(--font-script); font-size: clamp(32px, 7vw, 56px);
      color: var(--gold); margin: 16px 0;
      text-shadow: 0 0 30px rgba(212,160,23,0.3);
      line-height: 1.4; padding: 0.1em 0;
    }
    .invitation-title.gradient-text {
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: none;
    }
    .invitation-subtitle { color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 40px; }
    .invitation-card {
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 16px; padding: 40px; margin: 32px auto;
      max-width: 500px;
      /* Posicionada (drag): la card llena el ancho del drag-box para que el resize funcione. */
      &.positioned { width: 100%; max-width: none; margin: 0; }
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &.no-bg { border-color: transparent; border-style: none !important; box-shadow: none; &::before { opacity: 0; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    @keyframes neonPulse {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }
    .invitation-for { color: var(--theme-text-secondary, rgba(255,255,255,0.8)); font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
    .invitation-name {
      font-family: var(--font-serif); font-size: clamp(24px, 5vw, 36px);
      color: var(--theme-text-primary, white); margin-bottom: 16px;
    }
    .invitation-names-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
    .guest-name-chip {
      background: var(--theme-card-bg, rgba(212,160,23,0.15)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 4px 14px; font-size: 13px; color: var(--theme-text-primary, rgba(255,255,255,0.8));
    }
    .invitation-count {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--theme-card-bg, rgba(212,160,23,0.1)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 8px 20px;
      color: var(--theme-nav-text, var(--gold)); font-size: 15px; font-weight: 600;
      .material-icons { font-size: 18px; }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    /* Lienzo de posicionamiento de los objetos arrastrables (data-drag-bounds).
       En flujo normal (sin posiciones) no altera nada; da un min-height para que la sección
       conserve alto cuando algunos objetos pasan a position:absolute al moverse. */
    .inv-fg { position: relative; min-height: 680px; }
    /* En modo posicionado el lienzo cubre EXACTAMENTE toda la sección (inset:0), igual que
       .hero-fg en la carátula. Así el bounds coincide con el ancho del canvas: el centro queda
       centrado y los objetos pueden llegar de borde a borde. La sección toma min-height para
       que la capa absoluta tenga alto. El .section-container interno deja de limitar el ancho. */
    .landing-section.positioned { min-height: 680px; padding-left: 0; padding-right: 0; }
    .inv-fg.positioned {
      position: absolute; inset: 0;
      min-height: 0;
    }
    .inv-fg.positioned .section-container { max-width: none; width: 100%; height: 100%; }
    /* ===== PARIDAD canvas↔preview↔landing (modo DESKTOP del builder) =====
       En el builder (canvas y preview-iframe) el ancho del contenedor varía (viewport ~900px,
       iframe ~900px), así que la columna de la landing (clamp(520px,50vw,680px)) se evaluaba a
       un ancho distinto en cada contexto → los % de posición/ancho daban medidas físicas
       distintas y el texto (font-size px fijo) hacía otro wrapping. Fijamos el LIENZO de drag
       a 680px CENTRADO cuando previewDevice='desktop' (clase canvas-desktop), que es el ancho
       de la columna de la landing en un monitor completo. Así los 3 contextos del builder
       coinciden. La landing REAL (previewDevice=null) NO lleva esta clase → conserva su columna
       responsiva. MOBILE del builder tampoco (solo aplica con canvas-desktop). */
    .inv-fg.canvas-desktop { max-width: var(--canvas-desktop-w, 600px); margin-left: auto; margin-right: auto; }
    .inv-fg.canvas-desktop.positioned {
      left: 50%; right: auto; width: var(--canvas-desktop-w, 600px); max-width: var(--canvas-desktop-w, 600px); transform: translateX(-50%);
    }
    /* ===== PARIDAD en MOBILE =====
       En modo posicionado, .landing-section.positioned quita el padding lateral, así que el
       .inv-fg cubre TODO el ancho del dispositivo (variable: 360/390/414/440px...). Fijamos el
       lienzo al ancho de referencia mobile (--canvas-mobile-w = 360px, mínimo seguro del mercado)
       CENTRADO en los 3 contextos (canvas/preview/landing) para que el drag coincida. En móviles
       más anchos quedan franjas laterales (precio de la fidelidad exacta, igual que 680px en
       desktop). canvas-mobile se activa en canvas/preview mobile y en la landing real angosta. */
    .inv-fg.canvas-mobile { max-width: var(--canvas-mobile-w, 360px); margin-left: auto; margin-right: auto; }
    .inv-fg.canvas-mobile.positioned {
      left: 50%; right: auto; width: var(--canvas-mobile-w, 360px); max-width: var(--canvas-mobile-w, 360px); transform: translateX(-50%);
    }
    /* Guías de alineación del drag asistido */
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
  `]
})
export class LandingInvitationComponent {
  @Input() config!: InvitationConfig;
  @Input() guest: Guest | null = null;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  /** Dispositivo activo para elegir el mapa de posiciones. En landing es null (auto por ancho). */
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  /** Modo edición (canvas builder): activa el arrastre de objetos. */
  @Input() editable = false;
  /** Emite el nuevo mapa de posiciones para que el builder lo persista. */
  @Output() positionsChange = new EventEmitter<ElementPositions>();

  /** Estado de arrastre para dibujar guías. */
  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  get isMobilePos(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  /** True cuando el lienzo debe acotarse al ancho fijo DESKTOP (680px): canvas/preview con
      previewDevice='desktop'. (La landing desktop real ya hereda 680px por .section-block.) */
  get fgDesktop(): boolean { return this.previewDevice === 'desktop'; }
  /** True cuando el lienzo debe acotarse al ancho fijo MOBILE (--canvas-mobile-w = 360px):
      canvas/preview con previewDevice='mobile' O landing real en pantalla angosta
      (previewDevice=null, ≤768px). Necesario porque en modo posicionado la sección quita su padding
      lateral y el .inv-fg cubre TODO el ancho del dispositivo (variable), rompiendo la paridad. */
  get fgMobile(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  /** Posiciones por defecto (centro, en %) de cada objeto cuando la sección entra en modo
      "posicionado". Están apiladas verticalmente y centradas en x=50, reproduciendo el orden
      del flujo normal (ornamento, título, subtítulo, card, ornamento inferior). */
  private readonly DEFAULT_POS: Record<string, ElementPosition> = {
    ornamentTop: { x: 50, y: 10, w: 40 },
    title: { x: 50, y: 25 },
    subtitle: { x: 50, y: 38 },
    card: { x: 50, y: 62, w: 70 },
    ornamentBottom: { x: 50, y: 90, w: 40 },
  };

  private readonly POS_KEYS = ['ornamentTop', 'title', 'subtitle', 'card', 'ornamentBottom'];

  /** True si la sección tiene al menos una posición personalizada (en cualquier dispositivo). */
  get hasAnyPosition(): boolean {
    const p = this.config.positions;
    if (!p) return false;
    return (!!p.desktop && Object.keys(p.desktop).length > 0) || (!!p.mobile && Object.keys(p.mobile).length > 0);
  }

  /** Estilo de posicionamiento para un objeto.
      - Si NO hay ninguna posición personalizada en la sección: {} (flujo normal, retrocompatible).
      - Si hay ALGUNA: TODOS los objetos pasan a position:absolute (con su posición guardada o un
        default), para que mover uno no desacomode a los demás (evita el colapso del flujo). */
  pos(key: string): Record<string, string> {
    if (!this.hasAnyPosition) return {};
    const resolved = this.resolvePos(key);
    const style: Record<string, string> = {
      position: 'absolute',
      left: resolved.x + '%',
      top: resolved.y + '%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      margin: '0',
    };
    if (resolved.w != null) {
      style['width'] = resolved.w + '%';
    } else if (key === 'card') {
      // La card debe tener un ancho con el que se pueda redimensionar (no max-content, que
      // colapsaría al mínimo). Default 70% del lienzo.
      style['width'] = '70%';
    } else {
      // Ornamentos/títulos: la caja se ajusta EXACTAMENTE al contenido (max-content, sin
      // max-width que la infle), para que el centro de la caja coincida con el del contenido
      // y translate(-50%) lo centre. El drag-box además centra el contenido (centerContent).
      style['width'] = 'max-content';
    }
    if (resolved.h != null) style['height'] = resolved.h + '%';
    return style;
  }

  /** Resuelve la posición efectiva de un objeto: guardada (dispositivo actual o el otro) o default. */
  private resolvePos(key: string): ElementPosition {
    const positions = this.config.positions;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return positions?.[dev]?.[key] ?? positions?.[other]?.[key] ?? this.DEFAULT_POS[key] ?? { x: 50, y: 50 };
  }

  /** Posición cruda guardada de un objeto (para preservar w/h al mover). Devuelve el default
      cuando la sección ya está posicionada pero este objeto aún no tiene posición propia. */
  posData(key: string): ElementPosition | null {
    if (!this.hasAnyPosition) return null;
    return this.resolvePos(key);
  }

  /** Persiste la nueva posición de un objeto y emite el cambio.
      Al activar el modo posicionado (primer movimiento), siembra TODOS los objetos con su
      posición efectiva actual para que ninguno quede en flujo (evita el desacomodo). */
  onPosChange(key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = {
      desktop: { ...(this.config.positions?.desktop || {}) },
      mobile: { ...(this.config.positions?.mobile || {}) },
    };
    // Si es el primer posicionamiento, sembrar los demás objetos con su posición efectiva.
    if (!this.hasAnyPosition) {
      for (const k of this.POS_KEYS) {
        positions[dev]![k] = { ...this.resolvePos(k) };
      }
    }
    positions[dev]![key] = pos;
    this.config.positions = positions;
    this.positionsChange.emit(positions);
  }

  /* ===== Decoradores (adorno superior e inferior) =====
     Configurables vía sectionStyle.headingOrnament (type/color/size). Default 'stars' (✦ ✦ ✦)
     para conservar el look previo. 'none' los oculta. Aplican a ambos adornos. */
  ornamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'stars'; }
  ornamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.titleStyle?.color || '#d4a017'; }
  ornamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  /** Nombres individuales de los invitados (familia). Filtra vacíos para soportar familias
      SIN lista de nombres (solo nombre de familia + cantidad), donde guest_names llega vacío. */
  guestNames() {
    return (this.guest?.guest_names || '')
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);
  }
  /** True si la familia NO tiene nombres individuales (solo se muestra nombre + total). */
  hasGuestNames(): boolean { return this.guestNames().length > 0; }
  guestCount() {
    if (!this.guest) return 0;
    if (this.guest.guest_type === 'family') {
      // Con nombres: contar nombres. Sin nombres (familia solo con total): usar max_companions
      // como total de asistentes (ahí se almacena el total cuando no hay lista de nombres).
      const names = this.guestNames();
      return names.length > 0 ? names.length : (this.guest.max_companions || 0);
    }
    return this.guest.max_companions + 1;
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

  getTitleGradient(): string {
    const s = this.styles?.titleStyle;
    if (!s?.color2) return 'none';
    const c1 = s.color || '#d4a017';
    const c2 = s.color2;
    const angle = s.gradientAngle ?? 135;
    const v = Math.max(0, Math.min(100, s.gradientIntensity ?? 50));
    const mid = 100 - v; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
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
