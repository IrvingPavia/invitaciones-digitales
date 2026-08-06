import { Component, Input, OnInit, OnDestroy, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroConfig, Event } from '../../../core/models/models';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sticky Navbar -->
    <nav class="landing-nav" [class.scrolled]="scrolled">
      <div class="nav-inner">
        <span class="nav-title">{{ config.eventDescription }} {{ config.celebrantNames }}</span>
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
      <div class="hero-content">
        <p class="hero-event-type animate-in" style="animation-delay:0.2s"
           [style.font-family]="getFontFamily(config.eventDescriptionStyle?.fontFamily)"
           [style.font-size.px]="config.eventDescriptionStyle?.fontSize || 22"
           [style.font-weight]="config.eventDescriptionStyle?.fontWeight || 400"
           [style.background-image]="getEventDescGradient()"
           [style.-webkit-background-clip]="'text'"
           [style.background-clip]="'text'"
           [style.-webkit-text-fill-color]="'transparent'"
        >{{ config.eventDescription }}</p>
        @if (config.showCelebrantNames !== false && config.celebrantNames) {
        <h1 class="hero-names animate-in" style="animation-delay:0.5s"
            [style.font-family]="getFontFamily(config.celebrantNamesStyle?.fontFamily)"
            [style.font-size.px]="config.celebrantNamesStyle?.fontSize || 80"
            [style.font-weight]="config.celebrantNamesStyle?.fontWeight || 400"
            [style.background-image]="getGradient()"
            [style.-webkit-background-clip]="'text'"
            [style.background-clip]="'text'"
            [style.-webkit-text-fill-color]="'transparent'"
        >{{ config.celebrantNames }}</h1>
        }

        @if (config.showDescription && config.description) {
          <p class="hero-description animate-in" style="animation-delay:0.55s">{{ config.description }}</p>
        }

        @if (config.heroPhrase) {
          <p class="hero-phrase animate-in" style="animation-delay:0.65s"
             [style.font-family]="getFontFamily(config.heroPhraseStyle?.fontFamily)"
             [style.font-size.px]="config.heroPhraseStyle?.fontSize || 16"
             [style.color]="config.heroPhraseStyle?.color || '#ffffff'"
          >{{ config.heroPhrase }}</p>
        }

        @if (config.countdownDate) {
          <div class="countdown animate-in" style="animation-delay:0.8s">
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value">{{ countdown.days }}</span>
              <span class="countdown-label">Días</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value">{{ countdown.hours }}</span>
              <span class="countdown-label">Horas</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value">{{ countdown.minutes }}</span>
              <span class="countdown-label">Min</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-item" [class.no-bg]="config.countdownShowCardBg === false" [style.border-radius]="getCountdownBorderRadius()" [style.--card-bg-opacity]="(config.countdownCardBgOpacity ?? 100) / 100" [style.border-style]="getCountdownBorderStyle()" [style.border-width.px]="getCountdownBorderWidth()" [style.box-shadow]="getCountdownBoxShadow()" [style.--card-bg]="getCountdownBgColor()" [style.border-color]="getCountdownBorderColor()" [class.neon-border]="getIsCountdownNeon()">
              <span class="countdown-value">{{ countdown.seconds }}</span>
              <span class="countdown-label">Seg</span>
            </div>
          </div>
        }

        <div class="scroll-indicator animate-in" style="animation-delay:1.2s">
          <span class="material-icons scroll-arrow">expand_more</span>
          <span class="material-icons scroll-arrow" style="animation-delay:0.2s">expand_more</span>
        </div>
      </div>
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
    .nav-title {
      font-family: var(--theme-nav-font, var(--font-script)); font-size: 22px; color: var(--theme-nav-text, var(--gold));
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      min-width: 0; flex: 1;
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
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 80px 20px 40px;
      position: relative;
    }
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
    .countdown-value {
      font-size: clamp(20px, 5vw, 36px); font-weight: 700; color: var(--theme-nav-text, var(--gold));
      line-height: 1.2; font-family: var(--font-serif); text-align: center; width: 100%;
    }
    .countdown-label { font-size: clamp(8px, 2vw, 10px); color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; text-align: center; width: 100%; }
    .countdown-sep { font-size: clamp(16px, 3vw, 28px); color: var(--theme-nav-text, var(--gold)); font-weight: 700; opacity: 0.5; flex-shrink: 0; }
    .scroll-indicator { display: flex; flex-direction: column; align-items: center; gap: 0; }
    .scroll-arrow {
      font-size: 32px; color: var(--theme-text-primary, rgba(255,255,255,0.4));
      animation: scrollBounce 1.5s ease-in-out infinite;
      display: block; opacity: 0.6;
    }
    .animate-in { animation: fadeInUp 0.8s ease both; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(6px); opacity: 0.8; } }
  `]
})
export class LandingHeroComponent implements OnInit, OnDestroy {
  @Input() config!: HeroConfig;
  @Input() event!: Event;
  @Input() enabledSections: string[] = [];
  @ViewChild('audioEl') audioEl?: ElementRef<HTMLAudioElement>;

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
      'pinyon': 'var(--font-pinyon)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key || 'sans'] || 'var(--font-sans)';
  }

  getEventDescGradient(): string {
    const s = this.config.eventDescriptionStyle;
    const c1 = s?.color1 || '#ffffff';
    const c2 = s?.color2 || '';
    const validHex = /^#[0-9a-fA-F]{3,8}$/;
    const safe1 = validHex.test(c1) ? c1 : '#ffffff';
    if (!c2 || !validHex.test(c2)) return `linear-gradient(0deg, ${safe1}, ${safe1})`;
    const angle = s?.gradientAngle ?? 135;
    const intensity = s?.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${safe1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }

  getGradient(): string {
    const s = this.config.celebrantNamesStyle;
    const c1 = s?.color1 || '#d4a017';
    const c2 = s?.color2 || c1;
    const angle = s?.gradientAngle ?? 135;
    // Validate colors are proper hex
    const validHex = /^#[0-9a-fA-F]{6}$/;
    const safe1 = validHex.test(c1) ? c1 : '#d4a017';
    const safe2 = validHex.test(c2) ? c2 : safe1;
    return `linear-gradient(${angle}deg, ${safe1}, ${safe2})`;
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
