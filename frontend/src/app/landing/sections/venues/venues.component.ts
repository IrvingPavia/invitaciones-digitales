import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesConfig, GlobalTextStyles, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-venues',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  template: `
    <section id="venues" class="landing-section venues-section">
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
            >Lugares del Evento</h2>
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
            >Lugares del Evento</h2>
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          </div>
        }

        <div class="venues-grid">
          @for (venue of config.items; track venue.id) {
            <div class="venue-card reveal" [class.no-bg]="getItemNoBg(venue)" [style.border-radius.px]="config.cardBorderRadius ?? 16" [style.--card-bg-opacity]="getCardBgOpacity()" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.clip-path]="getCardClipPath()" [style.filter]="getCardFilter()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
              @if (config.iconStyle !== 'none') {
                <div class="venue-icon" [class.icon-plain]="config.iconStyle === 'plain'">
                  @if (venue.iconType === 'emoji' && venue.iconEmoji) {
                    <span class="emoji-icon">{{ venue.iconEmoji }}</span>
                  } @else if (venue.icon) {
                    <img [src]="venue.icon" [alt]="venue.title">
                  } @else {
                    <span class="material-icons">place</span>
                  }
                </div>
              }
              <h3 class="venue-title"
                  [style.font-family]="getFontFamily(styles?.titleStyle?.fontFamily)"
                  [style.font-size.px]="styles?.titleStyle?.fontSize || 18"
                  [style.font-weight]="styles?.titleStyle?.fontWeight || 400"
                  [style.background-image]="getTitleGradient()"
                  [class.gradient-text]="!!styles?.titleStyle?.color2"
                  [style.color]="!styles?.titleStyle?.color2 ? (styles?.titleStyle?.color || '#d4a017') : null"
              >{{ venue.title }}</h3>
              <p class="venue-name"
                 [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                 [style.color]="styles?.contentStyle?.color || 'white'"
              >{{ venue.name }}</p>
              @if (venue.address) {
                <p class="venue-address">{{ venue.address }}</p>
              }
              @if (venue.time) {
                <div class="venue-time">
                  <span class="material-icons">schedule</span>
                  <span>{{ formatTime(venue.time) }}</span>
                </div>
              }
              @if (venue.mapsUrl) {
                <a [href]="venue.mapsUrl" target="_blank" class="venue-maps-btn">
                  <span class="material-icons">map</span> Cómo llegar
                </a>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .venues-section { padding: 80px 20px; }
    .section-container { max-width: 900px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 48px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .venues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
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
    @keyframes neonPulse {
      from { filter: brightness(1); }
      to { filter: brightness(1.3); }
    }
    .venue-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--theme-card-bg, rgba(0,0,0,0.3)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .material-icons { font-size: 32px; color: var(--theme-text-primary, var(--gold)); }
      .emoji-icon { font-size: 32px; }
    }
    .venue-icon.icon-plain {
      background: none; border: none; border-radius: 12px;
      width: 80px; height: 80px;
      img { border-radius: 12px; }
    }
    .venue-title {
      font-family: var(--font-serif); font-size: 18px;
      color: var(--gold); margin-bottom: 8px; line-height: 1.4; padding: 0.1em 0;
    }
    .venue-title.gradient-text {
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; display: inline-block;
    }
    .venue-name { color: white; font-size: 15px; font-weight: 600; margin-bottom: 6px; }
    .venue-address { color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
    .venue-time {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 16px;
      .material-icons { font-size: 16px; color: var(--theme-text-primary, var(--gold)); }
    }
    .venue-maps-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--theme-btn-bg, rgba(212,160,23,0.15)); 
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.4));
      border-radius: 24px; padding: 10px 20px; margin-top: 8px;
      color: var(--theme-btn-text, var(--gold)); font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.3s;
      .material-icons { font-size: 16px; }
      &:hover { transform: translateY(-1px); opacity: 0.9; }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingVenuesComponent {
  @Input() config!: VenuesConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;

  hasOrnament(): boolean {
    return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none';
  }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  getItemNoBg(venue: any): boolean {
    // Section-level control
    if ((this.config as any).showCardBg === false) return true;
    return false;
  }

  getCardBgOpacity(): number {
    return (this.config.cardBgOpacity ?? 100) / 100;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
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

  getTitleGradient(): string {
    const s = this.styles?.titleStyle;
    if (!s?.color2) return 'none';
    const c1 = s.color || '#d4a017', c2 = s.color2;
    const angle = s.gradientAngle ?? 135, intensity = s.gradientIntensity ?? 50;
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
