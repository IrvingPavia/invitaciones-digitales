import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesConfig, GlobalTextStyles } from '../../../core/models/models';

@Component({
  selector: 'app-landing-venues',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="venues" class="landing-section venues-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >Lugares del Evento</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>

        <div class="venues-grid">
          @for (venue of config.items; track venue.id) {
            <div class="venue-card reveal" [class.no-bg]="getItemNoBg(venue)">
              @if (config.iconStyle !== 'none') {
                <div class="venue-icon" [class.icon-plain]="config.iconStyle === 'plain'">
                  @if (venue.icon) {
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
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .venues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .venue-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.45)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 32px 24px; text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(212,160,23,0.15); }
      &.no-bg { background: transparent; border-color: transparent; &:hover { box-shadow: none; } }
    }
    .venue-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--theme-card-bg, rgba(0,0,0,0.3)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .material-icons { font-size: 32px; color: var(--theme-text-primary, var(--gold)); }
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

  getItemNoBg(venue: any): boolean {
    // Per-item override takes priority, then section-level global
    if (venue.showCardBg !== undefined) return venue.showCardBg === false;
    return this.config.showCardBg === false;
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
}
