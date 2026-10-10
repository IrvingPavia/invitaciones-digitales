import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, HostListener, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeroConfig, Event, ElementPosition, ElementPositions } from '../../../core/models/models';
import { posStyle } from '../../../core/utils/element-position.util';
import { resolveMedia, ResolvedMedia } from '../../../core/utils/media-background.util';
import { DragBoxComponent } from '../../../core/components/drag-box.component';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule, DragBoxComponent],
  template: `
    <!-- Sticky Navbar -->
    <nav class="landing-nav" [class.scrolled]="scrolled">
      <div class="nav-inner">
        <span class="nav-title">
          @if (config.eventDescription) {
            <span class="nav-title-type">{{ config.eventDescription }}</span>
          }
          @if (config.showCelebrantNames !== false && config.celebrantNames) {
            <span class="nav-title-names">{{ config.celebrantNames }}</span>
          }
        </span>
        <div class="nav-actions">
          @if (config.audioUrl) {
            <button class="nav-btn" (click)="toggleAudio()" [title]="playing ? 'Pausar música' : 'Reproducir música'">
              <span class="material-icons">{{ playing ? 'pause_circle' : 'play_circle' }}</span>
            </button>
          }
          <button class="nav-btn" (click)="menuOpen = !menuOpen">
            <span class="material-icons">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>
      @if (menuOpen) {
        <div class="nav-menu">
          @for (item of navItems; track item.id) {
            <a (click)="scrollTo(item.id); menuOpen = false" class="nav-menu-item">{{ item.label }}</a>
          }
        </div>
      }
    </nav>

    <!-- Audio element -->
    @if (config.audioUrl) {
      <audio #audioEl [src]="config.audioUrl" loop></audio>
    }

    <!-- Hero Section -->
    <section id="hero" class="hero-section">
      <!-- Fondo propio de la carátula (scrollea con la sección). Capa en z-index 0; el contenido
           va en .hero-fg (z-index 1). El navbar (hermano, fixed/relative con z-index alto) queda
           siempre por encima del fondo. Si no hay media propia, deja ver el fondo global. -->
      @if (heroBg().hasMedia) {
        @if (heroBg().isVideo) {
          <video class="hero-bg-media" [class.bg-banner]="heroBg().fit === 'banner'" [style.--banner-w]="heroBg().bannerWidth + '%'" [style.object-position]="heroBg().position" [src]="heroBg().url" autoplay loop muted playsinline></video>
        } @else {
          <div class="hero-bg-media" [class.bg-banner]="heroBg().fit === 'banner'" [style.--banner-w]="heroBg().bannerWidth + '%'" [style.background-image]="'url(' + heroBg().url + ')'" [style.background-position]="heroBg().position"></div>
        }
        @if (heroBg().overlay > 0) {
          <div class="hero-bg-overlay" [style.opacity]="heroBg().overlay / 100"></div>
        }
      }
      <!-- Capa de primer plano (contenido). Es el contenedor de posicionamiento de los drag-box
           (data-drag-bounds), ocupa toda la sección, y va sobre el fondo (z-index 1). -->
      <div class="hero-fg" data-drag-bounds>
      <div class="hero-content">
        @if (config.eventDescription) {
        <app-drag-box [editable]="editable" [position]="heroPosData('eventType')" [ngStyle]="heroPos('eventType')" (positionChange)="onPosChange('eventType', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          <p class="hero-event-type animate-in" style="animation-delay:0.2s"
             [style.font-family]="getFontFamily(config.eventDescriptionStyle?.fontFamily)"
             [style.font-size.px]="config.eventDescriptionStyle?.fontSize || 22"
             [style.font-weight]="config.eventDescriptionStyle?.fontWeight || 400"
             [style.background-image]="getEventDescGradient()"
             [style.-webkit-background-clip]="'text'"
             [style.background-clip]="'text'"
             [style.-webkit-text-fill-color]="'transparent'"
          >{{ config.eventDescription }}</p>
        </app-drag-box>
        }
        @if (config.showCelebrantNames !== false && config.celebrantNames) {
        <app-drag-box [editable]="editable" [position]="heroPosData('names')" [ngStyle]="heroPos('names')" (positionChange)="onPosChange('names', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          <h1 class="hero-names animate-in" style="animation-delay:0.5s"
              [style.font-family]="getFontFamily(config.celebrantNamesStyle?.fontFamily)"
              [style.font-size.px]="config.celebrantNamesStyle?.fontSize || 80"
              [style.font-weight]="config.celebrantNamesStyle?.fontWeight || 400"
              [style.background-image]="getGradient()"
              [style.-webkit-background-clip]="'text'"
              [style.background-clip]="'text'"
              [style.-webkit-text-fill-color]="'transparent'"
          >{{ config.celebrantNames }}</h1>
        </app-drag-box>
        }

        @if (config.showDescription && config.description) {
          <app-drag-box [editable]="editable" [position]="heroPosData('description')" [ngStyle]="heroPos('description')" (positionChange)="onPosChange('description', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <div class="hero-description animate-in" style="animation-delay:0.55s" [innerHTML]="safeHtml(config.description)"></div>
          </app-drag-box>
        }

        @if (config.heroPhrase) {
          <app-drag-box [editable]="editable" [position]="heroPosData('phrase')" [ngStyle]="heroPos('phrase')" (positionChange)="onPosChange('phrase', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <div class="hero-phrase animate-in" style="animation-delay:0.65s" [innerHTML]="safeHtml(config.heroPhrase)"></div>
          </app-drag-box>
        }

        @if (config.countdownDate && config.showCountdown !== false) {
          <app-drag-box [editable]="editable" [position]="heroPosData('countdown')" [ngStyle]="heroPos('countdown')" (positionChange)="onPosChange('countdown', $event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          <div class="countdown animate-in" style="animation-delay:0.8s">
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value" [style.color]="config.countdownValueColor || null">{{ countdown.days }}</span>
              <span class="countdown-label" [style.color]="config.countdownLabelColor || null">Días</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value" [style.color]="config.countdownValueColor || null">{{ countdown.hours }}</span>
              <span class="countdown-label" [style.color]="config.countdownLabelColor || null">Horas</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value" [style.color]="config.countdownValueColor || null">{{ countdown.minutes }}</span>
              <span class="countdown-label" [style.color]="config.countdownLabelColor || null">Min</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value" [style.color]="config.countdownValueColor || null">{{ countdown.seconds }}</span>
              <span class="countdown-label" [style.color]="config.countdownLabelColor || null">Seg</span>
            </div>
          </div>
          </app-drag-box>
        }

        <!-- Guías de alineación (solo durante el arrastre en modo edición) -->
        @if (editable && dragging && guides) {
          @if (guides.x !== undefined) { <div class="ad-guide ad-guide-v" [style.left.%]="guides.x"></div> }
          @if (guides.y !== undefined) { <div class="ad-guide ad-guide-h" [style.top.%]="guides.y"></div> }
        }

        <div class="scroll-indicator animate-in" style="animation-delay:1.2s">
          <span class="material-icons scroll-arrow">expand_more</span>
          <span class="material-icons scroll-arrow" style="animation-delay:0.2s">expand_more</span>
        </div>
      </div>
      </div><!-- /.hero-fg -->
    </section>
  `,
  styles: [`
    .landing-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 500;
      transition: all 0.3s ease;
      padding: 0 20px;
      -webkit-transform: translateZ(0); transform: translateZ(0);
      backface-visibility: hidden; -webkit-backface-visibility: hidden;
    }
    .landing-nav.scrolled {
      background: var(--theme-nav-bar-bg, rgba(13,17,23,0.85));
      backdrop-filter: blur(var(--theme-nav-bar-blur, 12px));
      -webkit-backdrop-filter: blur(var(--theme-nav-bar-blur, 12px));
      border-bottom: 1px solid var(--theme-nav-bar-border, rgba(212,160,23,0.2));
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 72px; width: 100%;
    }
    /* Título del navbar en dos líneas: tipo de evento (pequeño) arriba y nombres
       (un poco más grande) abajo. Cada línea se trunca con ellipsis para no desbordar
       la altura fija del navbar. */
    .nav-title {
      display: flex; flex-direction: column; justify-content: center;
      font-family: var(--theme-nav-font, var(--font-script)); color: var(--theme-nav-text, var(--gold));
      min-width: 0; flex: 1; line-height: 1.15; gap: 1px;
    }
    .nav-title-type {
      font-size: 11px; letter-spacing: 1px; text-transform: uppercase; opacity: 0.85;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .nav-title-names {
      font-size: 17px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .nav-actions { display: flex; gap: 12px; align-items: center; }
    .nav-btn {
      background: var(--theme-nav-btn-bg, rgba(255,255,255,0.1)); border: 1px solid var(--theme-nav-btn-border, rgba(255,255,255,0.2));
      border-radius: 50%; width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--theme-nav-btn-icon, white); transition: all 0.3s;
      outline: none; -webkit-tap-highlight-color: transparent;
      .material-icons { font-size: 26px; }
      &:hover { background: var(--theme-nav-btn-bg, rgba(255,255,255,0.15)); border-color: var(--theme-nav-btn-border, rgba(255,255,255,0.3)); }
      &:focus, &:active { outline: none; box-shadow: none; border-color: var(--theme-nav-btn-border, rgba(255,255,255,0.3)); }
    }
    .nav-menu {
      position: absolute; top: 100%; left: 0; right: 0;
      background: var(--theme-nav-menu-bg, rgba(13,17,23,0.95));
      backdrop-filter: blur(var(--theme-nav-menu-blur, 12px));
      -webkit-backdrop-filter: blur(var(--theme-nav-menu-blur, 12px));
      border-top: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      padding: 8px 0;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border-radius: 0 0 16px 16px;
    }
    .nav-menu-item {
      display: block; padding: 14px 28px;
      color: var(--theme-nav-menu-text, rgba(255,255,255,0.8)); text-decoration: none;
      font-family: var(--theme-text-primary-font, inherit);
      font-size: 17px; transition: all 0.2s;
      &:hover { color: var(--theme-nav-text, var(--gold)); background: rgba(212,160,23,0.05); padding-left: 36px; }
    }
    .hero-section {
      /* svh: altura con la barra del navegador visible, estable al scrollear en móvil
         (evita el salto/descuadre que produce 100vh cuando la barra aparece/desaparece). */
      min-height: 100vh;
      min-height: 100svh;
      display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 80px 20px 40px;
      position: relative;
      overflow: hidden; /* confina el fondo propio de la carátula */
    }
    /* Fondo propio de la carátula: capa dentro de la sección (scrollea con ella), en z-index 0.
       El contenido va en .hero-fg (z-index 1), que es el nuevo data-drag-bounds. */
    .hero-bg-media {
      position: absolute; inset: 0; z-index: 0;
      width: 100%; height: 100%;
      background-size: cover; background-position: center center; background-repeat: no-repeat;
      object-fit: cover;
      pointer-events: none;
    }
    /* Capa de primer plano: cubre toda la sección, centra el contenido y es el contenedor de
       posicionamiento de los drag-box (reemplaza a .hero-section como data-drag-bounds). */
    .hero-fg {
      position: absolute; inset: 0; z-index: 1;
      display: flex; align-items: center; justify-content: center;
    }
    @media (min-width: 768px) {
      /* Modo banner (desktop): columna centrada del ancho configurado. */
      .hero-bg-media.bg-banner {
        left: 50%; right: auto; transform: translateX(-50%);
        width: var(--banner-w, 70%);
        background-size: cover;
      }
    }
    .hero-bg-overlay {
      position: absolute; inset: 0; z-index: 0;
      background: #000; pointer-events: none;
    }
    /* .hero-content SIN position/z-index: así los drag-box absolutos referencian a .hero-fg
       (el contenedor posicionado que ocupa toda la sección), no a este contenedor centrado. */
    .hero-content { max-width: 800px; }
    .hero-event-type {
      letter-spacing: 6px; text-transform: uppercase;
      margin-bottom: 32px;
      text-shadow: none;
    }
    .hero-names {
      line-height: 1.1; margin-bottom: 40px;
      text-shadow: none;
    }
    .hero-phrase {
      color: rgba(255,255,255,0.75); margin-bottom: 48px;
      line-height: 1.5; letter-spacing: 0.5px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .hero-description {
      color: var(--theme-text-secondary, rgba(255,255,255,0.7));
      font-size: 16px; line-height: 1.6; margin-bottom: 24px;
      max-width: 400px; margin-left: auto; margin-right: auto;
      text-shadow: 0 1px 8px rgba(0,0,0,0.4);
    }
    .countdown {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-bottom: 50px; flex-wrap: nowrap;
      width: 100%; padding: 0 10px; box-sizing: border-box;
    }
    .countdown-item {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 12px; padding: 14px 0; flex: 1; min-width: 55px;
      text-align: center; box-sizing: border-box;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &.no-bg { border-color: transparent; border-style: none !important; &::before { opacity: 0; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    @keyframes neonPulse {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }
    /* Tamaño FIJO (no vw) para que el countdown se vea IGUAL en el canvas y en la landing/
       preview. Antes usaba clamp(...vw...) dependiente del ancho del viewport, lo que hacía
       que en el canvas (viewport ancho) se viera grande y en mobile real (viewport angosto)
       se viera chico. Con px fijo, ambos coinciden. */
    .countdown-value {
      font-size: 32px; font-weight: 700; color: var(--theme-nav-text, var(--gold));
      line-height: 1.2; font-family: var(--font-serif); text-align: center; width: 100%;
    }
    .countdown-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; text-align: center; width: 100%; }
    .countdown-sep { font-size: 26px; color: var(--theme-nav-text, var(--gold)); font-weight: 700; opacity: 0.5; flex-shrink: 0; }
    /* El indicador de scroll se ancla SIEMPRE al fondo de la carátula, independiente del
       flujo. Así no se reacomoda cuando otros elementos pasan a position:absolute por el
       posicionamiento asistido. */
    .scroll-indicator {
      position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 0; z-index: 3;
    }
    .scroll-arrow {
      font-size: 32px; color: var(--theme-text-primary, rgba(255,255,255,0.4));
      animation: scrollBounce 1.5s ease-in-out infinite;
      display: block; opacity: 0.6;
    }
    .animate-in { animation: fadeInUp 0.8s ease both; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    /* Guías de alineación del drag asistido */
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
    @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(6px); opacity: 0.8; } }
  `]
})
export class LandingHeroComponent implements OnInit, OnDestroy {
  @Input() config!: HeroConfig;
  @Input() event!: Event;
  @Input() enabledSections: string[] = [];
  /** Dispositivo activo para elegir el mapa de posiciones. En landing es null (auto por ancho). */
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  /** Modo edición (canvas builder): activa el arrastre de elementos. */
  @Input() editable = false;
  /** Emite el nuevo mapa de posiciones de la carátula para que el builder lo persista. */
  @Output() positionsChange = new EventEmitter<ElementPositions>();
  @ViewChild('audioEl') audioEl?: ElementRef<HTMLAudioElement>;

  private sanitizer = inject(DomSanitizer);
  /** Estado de arrastre para dibujar guías. */
  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  // Cache de SafeHtml por valor para no regenerar en cada ciclo de detección.
  private _safeCache = new Map<string, SafeHtml>();
  /** Marca un HTML como confiable preservando estilos inline (ya se sanitiza en backend). */
  safeHtml(html: string | undefined | null): SafeHtml {
    const h = html || '';
    if (!this._safeCache.has(h)) {
      this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    }
    return this._safeCache.get(h)!;
  }

  get isMobilePos(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  /** True si el ancho actual (o previewDevice) es escritorio, para elegir override de media. */
  private get isDesktopMedia(): boolean {
    if (this.previewDevice) return this.previewDevice === 'desktop';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  /** Fondo propio de la carátula resuelto para el dispositivo activo (override desktop incluido). */
  heroBg(): ResolvedMedia {
    return resolveMedia(this.config?.heroBackground, this.isDesktopMedia);
  }

  /** Estilo de posicionamiento para un elemento de la caratula. */
  heroPos(key: string): Record<string, string> {
    return posStyle(key, this.config.positions, this.isMobilePos);
  }

  /** Posición cruda guardada de un elemento (para pasar al DragBox y preservar w/h). */
  heroPosData(key: string): ElementPosition | null {
    const positions = this.config.positions;
    if (!positions) return null;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return positions[dev]?.[key] ?? positions[other]?.[key] ?? null;
  }

  /** Persiste la nueva posición de un elemento de la carátula y emite el cambio. */
  onPosChange(key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = { ...(this.config.positions || {}) };
    positions[dev] = { ...(positions[dev] || {}), [key]: pos };
    this.config.positions = positions;
    this.positionsChange.emit(positions);
  }

  scrolled = false;
  menuOpen = false;
  playing = false;
  countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };
  private timer: any;

  allNavItems = [
    { id: 'invitation', label: 'Invitación' },
    { id: 'details', label: 'Detalles' },
    { id: 'venues', label: 'Lugares' },
    { id: 'itinerary', label: 'Itinerario' },
    { id: 'gallery', label: 'Galería' },
    { id: 'dresscode', label: 'Vestimenta' },
    { id: 'gifts', label: 'Regalos' },
    { id: 'rsvp', label: 'Confirmaciones' }
  ];

  get navItems() {
    if (!this.enabledSections.length) return this.allNavItems;
    return this.allNavItems.filter(item => this.enabledSections.includes(item.id));
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 50; }

  ngOnInit() {
    if (this.config.countdownDate) {
      this.updateCountdown();
      this.timer = setInterval(() => this.updateCountdown(), 1000);
    }
    // If envelope already started audio, reflect playing state
    if ((window as any).__landingAudio) {
      this.playing = true;
    }
  }

  ngOnDestroy() { clearInterval(this.timer); }

  updateCountdown() {
    const diff = new Date(this.config.countdownDate).getTime() - Date.now();
    if (diff <= 0) { this.countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' }; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdown = {
      days: String(d).padStart(2, '0'),
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0')
    };
  }

  toggleAudio() {
    // Check if audio was started by envelope
    const envelopeAudio = (window as any).__landingAudio as HTMLAudioElement | undefined;
    if (envelopeAudio) {
      if (this.playing) { envelopeAudio.pause(); this.playing = false; }
      else { envelopeAudio.play(); this.playing = true; }
      return;
    }
    const audio = this.audioEl?.nativeElement;
    if (!audio) return;
    if (this.playing) { audio.pause(); this.playing = false; }
    else { audio.play(); this.playing = true; }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  getEventDescGradient(): string {
    const s = this.config.eventDescriptionStyle;
    const c1 = s?.color1 || '#ffffff';
    const c2 = s?.color2 || '';
    const validColor = /^(#[0-9a-fA-F]{3,8}|rgba?\(.+\))$/;
    const safe1 = validColor.test(c1) ? c1 : '#ffffff';
    if (!c2 || !validColor.test(c2)) return `linear-gradient(0deg, ${safe1}, ${safe1})`;
    const angle = s?.gradientAngle ?? 135;
    const intensity = s?.gradientIntensity ?? 50;
    return this.buildTextGradient(angle, safe1, c2, intensity);
  }

  getGradient(): string {
    const s = this.config.celebrantNamesStyle;
    const c1 = s?.color1 || '#d4a017';
    const c2 = s?.color2 || c1;
    const angle = s?.gradientAngle ?? 135;
    const intensity = s?.gradientIntensity ?? 50;
    // Validate colors (hex or rgba)
    const validColor = /^(#[0-9a-fA-F]{6}|rgba?\(.+\))$/;
    const safe1 = validColor.test(c1) ? c1 : '#d4a017';
    const safe2 = validColor.test(c2) ? c2 : safe1;
    return this.buildTextGradient(angle, safe1, safe2, intensity);
  }

  /** Degradado de texto con intensidad 0-100 (predominancia): 0 = color1, 100 = color2,
      50 = mitad. Desplaza el punto medio del degradado. */
  private buildTextGradient(angle: number, c1: string, c2: string, intensity: number): string {
    const v = Math.max(0, Math.min(100, intensity ?? 50));
    const mid = 100 - v; // v=0 -> 100% (todo c1); v=100 -> 0% (todo c2)
    const a = Math.max(0, mid - 25);
    const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }

  getCountdownBorderStyle(): string {
    const s = (this.config as any).countdownCardBorderStyle || 'none';
    if (s === 'glow' || s === 'neon') return 'solid';
    return s;
  }

  getIsCountdownNeon(): boolean {
    return (this.config as any).countdownCardBorderStyle === 'neon';
  }

  getCountdownBorderWidth(): number {
    if ((this.config as any).countdownCardBorderStyle === 'none') return 0;
    return (this.config as any).countdownCardBorderWidth ?? 1;
  }

  getCountdownBoxShadow(): string {
    const style = (this.config as any).countdownCardBorderStyle;
    const color = (this.config as any).countdownCardGlowColor || '#d4a017';
    const width = (this.config as any).countdownCardBorderWidth ?? 1;
    if (style === 'glow') return `0 0 ${width * 4}px ${width * 2}px ${color}, inset 0 0 ${width * 2}px ${color}`;
    if (style === 'neon') return `0 0 ${width * 5}px ${color}, 0 0 ${width * 10}px ${color}, 0 0 ${width * 20}px ${color}`;
    return 'none';
  }

  getCountdownBgColor(): string {
    return (this.config as any).countdownCardBgColor || '';
  }

  getCountdownBorderColor(): string {
    return (this.config as any).countdownCardBorderColor || '';
  }

  getCountdownBorderRadius(): string {
    const shape = (this.config as any).countdownCardShape || 'standard';
    const base = (this.config as any).countdownCardBorderRadius ?? 12;
    switch (shape) {
      case 'rounded': return '50px';
      case 'ticket': return `${base}px`;
      case 'cut': return `${base}px 0 ${base}px 0`;
      default: return `${base}px`;
    }
  }
}
