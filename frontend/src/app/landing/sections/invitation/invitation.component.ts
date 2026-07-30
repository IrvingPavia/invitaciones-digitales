import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationConfig, Guest, GlobalTextStyles } from '../../../core/models/models';

@Component({
  selector: 'app-landing-invitation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="invitation" class="landing-section">
      <div class="section-container">
        <div class="invitation-ornament">✦ ✦ ✦</div>
        <h2 class="invitation-title reveal"
            [style.font-family]="getFontFamily(styles?.titleStyle?.fontFamily)"
            [style.font-size.px]="styles?.titleStyle?.fontSize || 42"
            [style.font-weight]="styles?.titleStyle?.fontWeight || 400"
            [style.background-image]="getTitleGradient()"
            [class.gradient-text]="!!styles?.titleStyle?.color2"
            [style.color]="!styles?.titleStyle?.color2 ? (styles?.titleStyle?.color || '#d4a017') : null"
        >{{ config.title }}</h2>
        @if (config.subtitle) {
          <p class="invitation-subtitle reveal"
             [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
             [style.font-size.px]="styles?.subtitleStyle?.fontSize || 16"
             [style.color]="styles?.subtitleStyle?.color || 'rgba(255,255,255,0.7)'"
          >{{ config.subtitle }}</p>
        }

        @if (guest) {
          <div class="invitation-card reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius.px]="config.cardBorderRadius ?? 16" [style.--card-bg-opacity]="(config.cardBgOpacity ?? 100) / 100" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.clip-path]="getCardClipPath()" [style.filter]="getCardFilter()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño invitamos a</p>
              <h3 class="invitation-name"
                  [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                  [style.font-size.px]="styles?.contentStyle?.fontSize ? styles!.contentStyle.fontSize + 10 : 30"
                  [style.color]="styles?.contentStyle?.color || '#ffffff'"
              >{{ guest.family_name || guest.guest_names }}</h3>
              @if (guest.guest_type === 'family') {
                <div class="invitation-names-list">
                  @for (name of guestNames(); track name) {
                    <span class="guest-name-chip">{{ name.trim() }}</span>
                  }
                </div>
              }
              <div class="invitation-count">
                <span class="material-icons">people</span>
                <span>{{ guestCount() }} {{ guestCount() === 1 ? 'asistente' : 'asistentes' }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="invitation-card reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius.px]="config.cardBorderRadius ?? 16" [style.--card-bg-opacity]="(config.cardBgOpacity ?? 100) / 100" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.clip-path]="getCardClipPath()" [style.filter]="getCardFilter()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño los invitamos a celebrar</p>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px">Escanea el código QR de tu invitación para ver tu nombre</p>
            </div>
          </div>
        }

        <div class="invitation-ornament" style="transform:rotate(180deg)">✦ ✦ ✦</div>
      </div>
    </section>
  `,
  styles: [`
    .landing-section {
      padding: 80px 20px; position: relative;
    }
    .section-container { max-width: 800px; margin: 0 auto; text-align: center; }
    .invitation-ornament { color: var(--theme-text-primary, var(--gold)); font-size: 24px; letter-spacing: 12px; opacity: 0.6; margin: 16px 0; }
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
  `]
})
export class LandingInvitationComponent {
  @Input() config!: InvitationConfig;
  @Input() guest: Guest | null = null;
  @Input() styles?: GlobalTextStyles;

  guestNames() { return this.guest?.guest_names.split(',') || []; }
  guestCount() {
    if (!this.guest) return 0;
    return this.guest.guest_type === 'family'
      ? this.guest.guest_names.split(',').length
      : this.guest.max_companions + 1;
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

  getTitleGradient(): string {
    const s = this.styles?.titleStyle;
    if (!s?.color2) return 'none';
    const c1 = s.color || '#d4a017';
    const c2 = s.color2;
    const angle = s.gradientAngle ?? 135;
    const intensity = s.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }

  getCardBgColor(): string {
    return (this.config as any).cardBgColor || '';
  }

  getCardBorderColor(): string {
    return (this.config as any).cardBorderColor || '';
  }

  getCardBorderStyle(): string {
    const s = (this.config as any).cardBorderStyle || 'none';
    const shape = (this.config as any).cardShape || 'standard';
    if (shape !== 'standard') return 'none';
    if (s === 'glow' || s === 'neon') return 'solid';
    return s;
  }

  getIsNeon(): boolean {
    return (this.config as any).cardBorderStyle === 'neon';
  }

  getCardBorderWidth(): number {
    const shape = (this.config as any).cardShape || 'standard';
    if (shape !== 'standard') return 0;
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
    const shape = (this.config as any).cardShape || 'standard';
    if (shape === 'standard') return 'none';
    const style = (this.config as any).cardBorderStyle || 'none';
    if (style === 'none') return 'none';
    const color = (this.config as any).cardBorderColor || (this.config as any).cardGlowColor || 'rgba(212,160,23,0.5)';
    const width = (this.config as any).cardBorderWidth ?? 1;
    if (style === 'neon') return `drop-shadow(0 0 ${width * 3}px ${color}) drop-shadow(0 0 ${width * 6}px ${color})`;
    if (style === 'glow') return `drop-shadow(0 0 ${width * 2}px ${color}) drop-shadow(0 0 ${width * 4}px ${color})`;
    return `drop-shadow(0 0 ${width}px ${color})`;
  }

  getCardClipPath(): string {
    const shape = (this.config as any).cardShape || 'standard';
    switch (shape) {
      case 'ticket': return 'polygon(0% 10%, 5% 10%, 5% 0%, 95% 0%, 95% 10%, 100% 10%, 100% 90%, 95% 90%, 95% 100%, 5% 100%, 5% 90%, 0% 90%)';
      case 'wave': return 'polygon(0% 5%, 10% 0%, 20% 5%, 30% 0%, 40% 5%, 50% 0%, 60% 5%, 70% 0%, 80% 5%, 90% 0%, 100% 5%, 100% 95%, 90% 100%, 80% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 20% 95%, 10% 100%, 0% 95%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'cloud': return 'polygon(10% 20%, 5% 10%, 15% 2%, 25% 0%, 35% 2%, 45% 0%, 55% 2%, 65% 0%, 75% 2%, 85% 0%, 95% 10%, 100% 20%, 100% 80%, 95% 90%, 85% 98%, 75% 100%, 65% 98%, 55% 100%, 45% 98%, 35% 100%, 25% 98%, 15% 100%, 5% 90%, 0% 80%)';
      case 'scroll': return 'polygon(3% 0%, 97% 0%, 100% 3%, 100% 97%, 97% 100%, 3% 100%, 0% 97%, 0% 3%)';
      default: return 'none';
    }
  }
}
