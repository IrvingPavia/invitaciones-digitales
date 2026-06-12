import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DresscodeConfig, DresscodeCard, GlobalTextStyles, SectionIconConfig, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-dresscode',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  template: `
    <section id="dresscode" class="landing-section dresscode-section">
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
            >{{ config.title }}</h2>
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
            >{{ config.title }}</h2>
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          </div>
        }

        <!-- Legacy: main dresscode card with icon + description (shown only if no example cards exist) -->
        @if ((!config.cards || config.cards.length === 0) && (config.description || getIcon())) {
          <div class="dresscode-card reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius.px]="config.cardBorderRadius ?? 16">
            @if (getIcon(); as icon) {
              @if (icon.type === 'material') {
                <span class="material-icons dresscode-icon">{{ icon.value }}</span>
              } @else if (icon.type === 'emoji') {
                <span class="dresscode-icon emoji">{{ icon.value }}</span>
              } @else {
                <img [src]="icon.value" class="dresscode-icon-img" alt="">
              }
            }
            @if (config.description) {
              <p class="dresscode-desc"
                 [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                 [style.font-size.px]="styles?.contentStyle?.fontSize || 16"
                 [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.8)'"
              >{{ config.description }}</p>
            }
          </div>
        }

        <!-- Example cards with images -->
        @if (config.cards && config.cards.length > 0) {
          <div class="dresscode-examples">
            @for (card of config.cards; track card.id) {
              <div class="example-card reveal" [class.no-bg]="card.showCardBg === false" [style.border-radius.px]="card.cardBorderRadius ?? 16">
                @if (card.images && card.images.length > 0) {
                  <div class="example-images" [class.single]="card.images.length === 1">
                    @for (img of card.images; track img) {
                      <div class="example-img-wrapper">
                        <img [src]="img" [alt]="card.title">
                      </div>
                    }
                  </div>
                }
                @if (card.title) {
                  <h3 class="example-title"
                      [style.font-family]="getFontFamily(styles?.titleStyle?.fontFamily)"
                      [style.font-size.px]="(styles?.titleStyle?.fontSize || 18)"
                      [style.font-weight]="styles?.titleStyle?.fontWeight || 400"
                      [style.background-image]="getTitleGradient()"
                      [class.gradient-text]="!!styles?.titleStyle?.color2"
                      [style.color]="!styles?.titleStyle?.color2 ? (styles?.titleStyle?.color || '#d4a017') : null"
                  >{{ card.title }}</h3>
                }
                @if (card.description) {
                  <p class="example-desc"
                     [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                     [style.font-size.px]="styles?.contentStyle?.fontSize || 14"
                     [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.8)'"
                  >{{ card.description }}</p>
                }
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .dresscode-section { padding: 80px 20px; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }
    .dresscode-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.4)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 40px;
      &.no-bg { background: transparent; border-color: transparent; }
    }
    .dresscode-icon { font-size: 56px; color: var(--theme-text-primary, var(--gold)); opacity: 0.7; margin-bottom: 16px; display: block; }
    .dresscode-icon.emoji { font-size: 56px; opacity: 1; font-style: normal; }
    .dresscode-icon-img { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 16px; display: block; }
    .dresscode-desc { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.8; white-space: pre-line; }

    /* Example cards */
    .dresscode-examples {
      display: flex; flex-direction: column; gap: 20px; margin-top: 24px;
    }
    .example-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.4)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 24px;
      transition: transform 0.3s, box-shadow 0.3s;
      &:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(212,160,23,0.1); }
      &.no-bg { background: transparent; border-color: transparent; &:hover { box-shadow: none; } }
    }
    .example-images {
      display: flex; justify-content: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
    }
    .example-images.single {
      .example-img-wrapper { max-width: 180px; }
    }
    .example-img-wrapper {
      width: 120px; height: 160px; border-radius: 12px; overflow: hidden;
      flex-shrink: 0;
      img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.3s;
      }
      &:hover img { transform: scale(1.05); }
    }
    .example-title {
      font-family: var(--font-serif); font-size: 18px;
      color: var(--gold); margin-bottom: 8px; line-height: 1.4; padding: 0.1em 0;
    }
    .example-title.gradient-text {
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; display: inline-block;
    }
    .example-desc {
      color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.7; white-space: pre-line;
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDresscodeComponent {
  @Input() config!: DresscodeConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;

  hasOrnament(): boolean {
    return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none';
  }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

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

  getTitleGradient(): string {
    const s = this.styles?.titleStyle;
    if (!s?.color2) return '';
    const angle = s.gradientAngle || 135;
    const intensity = s.gradientIntensity || 50;
    return `linear-gradient(${angle}deg, ${s.color || '#d4a017'} ${50 - intensity / 2}%, ${s.color2} ${50 + intensity / 2}%)`;
  }

  getIcon(): { type: string; value: string } | null {
    const si = this.config.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'checkroom' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'checkroom' };
  }
}
