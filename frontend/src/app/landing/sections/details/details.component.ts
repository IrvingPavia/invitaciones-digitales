import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsConfig, GlobalTextStyles } from '../../../core/models/models';

@Component({
  selector: 'app-landing-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="details" class="details-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >{{ config.title || 'Detalles del Evento' }}</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>
        <div class="details-grid">
          @for (card of config.cards; track card.id) {
            <div class="detail-card reveal">
              @if (card.iconType === 'emoji' && card.icon) {
                <div class="detail-icon emoji-icon">
                  <span>{{ card.icon }}</span>
                </div>
              } @else if (card.iconUrl) {
                <div class="detail-icon">
                  <img [src]="card.iconUrl" [alt]="card.title">
                </div>
              }
              @if (card.title) {
                <h3 [style.font-family]="getFontFamily(styles?.titleStyle?.fontFamily)"
                    [style.font-size.px]="styles?.titleStyle?.fontSize || 18"
                    [style.font-weight]="styles?.titleStyle?.fontWeight || 400"
                    [style.background-image]="getTitleGradient()"
                    [class.gradient-text]="!!styles?.titleStyle?.color2"
                    [style.color]="!styles?.titleStyle?.color2 ? (styles?.titleStyle?.color || '#d4a017') : null"
                >{{ card.title }}</h3>
              }
              <div [style.text-align]="card.textAlign"
                 class="detail-content"
                 [innerHTML]="card.content"
              ></div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .details-section { padding: 80px 20px; }
    .section-container { max-width: 800px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .details-grid { display: flex; flex-direction: column; gap: 24px; max-width: 600px; margin: 0 auto; }
    .detail-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.45)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 32px 24px; text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(212,160,23,0.15); }
    }
    .detail-icon {
      width: 72px; height: 72px; border-radius: 50%;
      overflow: hidden; margin: 0 auto 16px;
      border: 1px solid rgba(212,160,23,0.3);
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .detail-icon.emoji-icon {
      display: flex; align-items: center; justify-content: center;
      background: var(--theme-card-bg, rgba(0,0,0,0.3));
      span { font-size: 36px; }
    }
    h3 { margin-bottom: 12px; line-height: 1.4; padding: 0.1em 0; }
    h3.gradient-text {
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
    }
    p { line-height: 1.7; white-space: pre-line; }
    .detail-content { line-height: 1.7; color: var(--theme-text-secondary, rgba(255,255,255,0.7)); }
    .detail-content p { margin: 0 0 8px; }
    .detail-content p:last-child { margin-bottom: 0; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDetailsComponent {
  @Input() config!: DetailsConfig;
  @Input() styles?: GlobalTextStyles;

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
    const c1 = s.color || '#d4a017';
    const c2 = s.color2;
    const angle = s.gradientAngle ?? 135;
    const intensity = s.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }
}
