import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftsConfig, GlobalTextStyles, SectionIconConfig, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-gifts',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  template: `
    <section id="gifts" class="landing-section gifts-section">
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
        <div class="gifts-card reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius.px]="config.cardBorderRadius ?? 16">
          @if (getGiftsIcon(); as icon) {
            @if (icon.type === 'material') {
              <span class="material-icons gifts-icon">{{ icon.value }}</span>
            } @else if (icon.type === 'emoji') {
              <span class="gifts-icon emoji">{{ icon.value }}</span>
            } @else {
              <img [src]="icon.value" class="gifts-icon-img" alt="">
            }
          }
          @if (config.description) {
            <p class="gifts-desc"
               [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
               [style.font-size.px]="styles?.contentStyle?.fontSize || 15"
               [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.7)'"
            >{{ config.description }}</p>
          }
          @if (config.link) {
            <a [href]="config.link" target="_blank" class="gifts-btn">
              <span class="material-icons">open_in_new</span>
              {{ config.buttonText || 'Ver Lista de Regalos' }}
            </a>
          }
        </div>

        @if (config.transfer?.enabled) {
          <div class="transfer-card reveal" [class.no-bg]="config.transfer.showCardBg === false" [style.border-radius.px]="config.transfer.cardBorderRadius ?? 16" style="animation-delay:0.2s">
            <!-- Animation overlay -->
            @if (config.transfer.animation !== 'none') {
              <div class="transfer-particles">
                @for (i of particles; track i) {
                  <span class="particle" [class.coin]="config.transfer.animation === 'coins'" [class.bill]="config.transfer.animation === 'bills'" [style.left.%]="particleLeft(i)" [style.animation-delay.s]="particleDelay(i)" [style.animation-duration.s]="particleDuration(i)">
                    {{ config.transfer.animation === 'coins' ? '&#x1FA99;' : '&#x1F4B5;' }}
                  </span>
                }
              </div>
            }

            <div class="transfer-content">
              @if (getTransferIcon(); as icon) {
                @if (icon.type === 'material') {
                  <span class="material-icons transfer-icon">{{ icon.value }}</span>
                } @else if (icon.type === 'emoji') {
                  <span class="transfer-icon emoji">{{ icon.value }}</span>
                } @else {
                  <img [src]="icon.value" class="transfer-icon-img" alt="">
                }
              }
              <h3 class="transfer-title">{{ config.transfer.title }}</h3>
              @if (config.transfer.description) {
                <p class="transfer-desc">{{ config.transfer.description }}</p>
              }

              <div class="transfer-data">
                <!-- Titular -->
                <div class="transfer-row">
                  <div class="transfer-label">Titular</div>
                  <div class="transfer-value-row">
                    <span class="transfer-value">{{ config.transfer.accountName }}</span>
                    <button class="copy-btn" (click)="copyToClipboard(config.transfer.accountName)" [title]="'Copiar nombre'">
                      <span class="material-icons">{{ copied() === 'name' ? 'check' : 'content_copy' }}</span>
                    </button>
                  </div>
                </div>

                <!-- Banco -->
                <div class="transfer-row">
                  <div class="transfer-label">Banco</div>
                  <div class="transfer-value">{{ config.transfer.bank }}</div>
                </div>

                <!-- Tipo -->
                <div class="transfer-row">
                  <div class="transfer-label">{{ accountTypeLabel }}</div>
                  <div class="transfer-value-row">
                    <span class="transfer-value transfer-number">{{ config.transfer.accountNumber }}</span>
                    <button class="copy-btn" (click)="copyToClipboard(config.transfer.accountNumber, 'number')" [title]="'Copiar número'">
                      <span class="material-icons">{{ copied() === 'number' ? 'check' : 'content_copy' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .gifts-section { padding: 80px 20px; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .gifts-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.4)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 40px; margin-bottom: 20px;
      &.no-bg { background: transparent; border-color: transparent; }
    }
    .gifts-icon { font-size: 56px; color: var(--theme-text-primary, var(--gold)); opacity: 0.7; margin-bottom: 16px; display: block; }
    .gifts-icon.emoji { font-size: 56px; opacity: 1; font-style: normal; }
    .gifts-icon-img { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 16px; display: block; }
    .gifts-desc { color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
    .gifts-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--theme-btn-bg, linear-gradient(135deg, var(--gold), var(--gold-light)));
      color: var(--theme-btn-text, #1a1a2e); font-weight: 700; font-size: 15px;
      padding: 14px 32px; border-radius: 30px; text-decoration: none;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      .material-icons { font-size: 18px; }
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
    }

    .transfer-card {
      position: relative; overflow: hidden;
      background: var(--theme-card-bg, rgba(0,0,0,0.5)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 16px; padding: 40px;
      &.no-bg { background: transparent; border-color: transparent; }
    }
    .transfer-particles {
      position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    }
    .particle {
      position: absolute; top: -40px; font-size: 20px;
      animation: particleFall linear infinite; opacity: 0;
    }
    .particle.coin { font-size: 18px; }
    .particle.bill { font-size: 22px; }
    @keyframes particleFall {
      0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
      5% { opacity: 0.6; }
      50% { opacity: 0.4; transform: translateY(50vh) rotate(180deg) scale(1); }
      95% { opacity: 0.2; }
      100% { transform: translateY(100vh) rotate(360deg) scale(0.8); opacity: 0; }
    }

    .transfer-content { position: relative; z-index: 1; }
    .transfer-icon { font-size: 48px; color: var(--theme-text-primary, var(--gold)); opacity: 0.8; margin-bottom: 12px; display: block; }
    .transfer-icon.emoji { font-size: 48px; opacity: 1; font-style: normal; }
    .transfer-icon-img { width: 60px; height: 60px; object-fit: contain; margin: 0 auto 12px; display: block; }
    .transfer-title { font-family: var(--font-serif); font-size: 22px; color: var(--theme-nav-text, var(--gold)); margin-bottom: 8px; }
    .transfer-desc { color: var(--theme-text-secondary, rgba(255,255,255,0.6)); font-size: 14px; margin-bottom: 24px; line-height: 1.6; }

    .transfer-data {
      background: var(--theme-card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      border-radius: 12px; padding: 20px; text-align: left;
    }
    .transfer-row {
      padding: 12px 0;
      border-bottom: 1px solid var(--theme-card-border, rgba(255,255,255,0.06));
      &:last-child { border-bottom: none; }
    }
    .transfer-label { font-size: 11px; color: var(--theme-text-secondary, rgba(255,255,255,0.4)); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .transfer-value { font-size: 15px; color: var(--theme-text-primary, rgba(255,255,255,0.9)); }
    .transfer-value-row { display: flex; align-items: center; gap: 8px; }
    .transfer-value { font-size: 15px; color: var(--theme-text-primary, rgba(255,255,255,0.9)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .transfer-number { font-family: 'Courier New', monospace; font-size: 15px; letter-spacing: 0.5px; color: var(--theme-text-primary, var(--gold)); font-weight: 600; word-break: break-all; white-space: normal; overflow-wrap: break-word; }
    .copy-btn {
      background: var(--theme-card-bg, rgba(212,160,23,0.15)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 8px; padding: 8px 12px; cursor: pointer; flex-shrink: 0;
      color: var(--theme-text-primary, var(--gold)); transition: all 0.2s; display: flex; align-items: center;
      .material-icons { font-size: 18px; }
      &:hover { background: var(--theme-card-border, rgba(212,160,23,0.3)); }
      &:active { transform: scale(0.95); }
    }

    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingGiftsComponent {
  @Input() config!: GiftsConfig;
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

  copied = signal<string | null>(null);
  particles = Array.from({ length: 15 }, (_, i) => i);

  get accountTypeLabel(): string {
    switch (this.config.transfer?.accountType) {
      case 'tarjeta': return 'No. Tarjeta';
      case 'cuenta': return 'No. Cuenta';
      case 'clabe': return 'CLABE';
      default: return 'Número';
    }
  }

  particleLeft(i: number): number { return 5 + (i * 6.2) % 90; }
  particleDelay(i: number): number { return (i * 1.3) % 8; }
  particleDuration(i: number): number { return 8 + (i % 5) * 2; }

  getGiftsIcon(): { type: string; value: string } | null {
    const si = this.config.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'card_giftcard' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'card_giftcard' };
  }

  getTransferIcon(): { type: string; value: string } | null {
    const si = this.config.transfer?.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'account_balance' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'account_balance' };
  }

  copyToClipboard(text: string, key = 'name') {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }
}
