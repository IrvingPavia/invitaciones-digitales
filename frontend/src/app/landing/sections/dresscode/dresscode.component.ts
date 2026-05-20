import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DresscodeConfig, GlobalTextStyles } from '../../../core/models/models';

@Component({
  selector: 'app-landing-dresscode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="dresscode" class="landing-section dresscode-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >{{ config.title }}</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>
        <div class="dresscode-card reveal">
          <span class="material-icons dresscode-icon">checkroom</span>
          <p class="dresscode-desc"
             [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
             [style.font-size.px]="styles?.contentStyle?.fontSize || 16"
             [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.8)'"
          >{{ config.description }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dresscode-section { padding: 80px 20px; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .dresscode-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.4)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 40px;
    }
    .dresscode-icon { font-size: 56px; color: var(--gold); opacity: 0.7; margin-bottom: 16px; display: block; }
    .dresscode-desc { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.8; white-space: pre-line; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDresscodeComponent {
  @Input() config!: DresscodeConfig;
  @Input() styles?: GlobalTextStyles;

  getFontFamily(key?: string): string {
    const m: Record<string,string> = {'sans':'var(--font-sans)','serif':'var(--font-serif)','script':'var(--font-script)','cormorant':'var(--font-cormorant)','spumoni':'var(--font-spumoni)','dancing':'var(--font-dancing)','montserrat':'var(--font-montserrat)','raleway':'var(--font-raleway)','cinzel':'var(--font-cinzel)','sacramento':'var(--font-sacramento)','tangerine':'var(--font-tangerine)','alexbrush':'var(--font-alexbrush)','pinyon':'var(--font-pinyon)','josefin':'var(--font-josefin)','baskerville':'var(--font-baskerville)'};
    return m[key||'sans']||'var(--font-sans)';
  }
  getSeparatorBg(): string {
    const c=this.styles?.separatorStyle?.color||'#d4a017',t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'formal':return c;case 'executive':return `linear-gradient(180deg,${c},transparent 40%,transparent 60%,${c})`;case 'festive':return `repeating-linear-gradient(90deg,${c} 0px,${c} 4px,transparent 4px,transparent 10px)`;case 'animated':return `linear-gradient(90deg,transparent,${c},transparent)`;case 'minimal':return `${c}40`;case 'ornamental':return `linear-gradient(90deg,transparent,${c}60,${c},${c}60,transparent)`;default:return `linear-gradient(90deg,transparent,${c}80,transparent)`;}
  }
  getSeparatorHeight(): string {
    const t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'executive':return '4px';case 'festive':return '3px';case 'ornamental':return '2px';default:return '1px';}
  }
}
