import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvelopeConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-envelope',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="envelope-overlay" [class.opened]="opened"
         [style.--env-color]="config.envelopeColor || '#1a1a2e'"
         [style.--seal-color]="config.sealColor || '#8b0000'"
         [style.--bg-color]="config.bgColor || '#0a0a14'"
         [style.--bg-color2]="config.bgColor2 || '#1a1a2e'"
         [style.--text-color]="config.textColor || 'rgba(255,255,255,0.5)'"
         [style.--accent-color]="config.ticketAccentColor || config.sealColor || '#d4a017'"
         [attr.data-style]="config.style"
         [attr.data-template]="getTemplate()">

      <!-- ============ TEMPLATE: ENVELOPE (classic) ============ -->
      @if (getTemplate() === 'envelope') {
        @if (config.style === 'classic' || config.style === 'elegant' || config.style === 'wax') {
          <div class="env-top"></div>
          <div class="env-bottom"></div>
          <div class="env-flap-top" [class.flap-elegant]="config.style === 'elegant'"></div>
          <div class="env-flap-bottom"></div>
        }
        @if (config.style === 'vertical') {
          <div class="env-door-left"></div>
          <div class="env-door-right"></div>
        }
        @if (config.style !== 'minimal') {
          <div class="seal" (click)="open()">
            <div class="seal-body" [attr.data-seal]="config.sealStyle">
              @if (config.sealImage) {
                <img [src]="config.sealImage" class="seal-img" alt="">
              } @else {
                <span class="seal-txt">{{ config.sealText || '♡' }}</span>
              }
            </div>
          </div>
        }
        @if (config.style === 'minimal') {
          <div class="seal seal-lg" (click)="open()">
            <div class="seal-body" [attr.data-seal]="config.sealStyle">
              @if (config.sealImage) {
                <img [src]="config.sealImage" class="seal-img seal-img-lg" alt="">
              } @else {
                <span class="seal-txt seal-txt-lg">{{ config.sealText || '♡' }}</span>
              }
            </div>
          </div>
        }
      }

      <!-- ============ TEMPLATE: TICKET ============ -->
      @if (getTemplate() === 'ticket') {
        <div class="ticket-container" (click)="open()">
          <div class="ticket">
            <div class="ticket-notch ticket-notch-left"></div>
            <div class="ticket-notch ticket-notch-right"></div>
            <div class="ticket-header" [style.background]="config.ticketAccentColor || '#d4a017'">
              <span class="ticket-badge">ADMIT ONE</span>
            </div>
            <div class="ticket-body" [style.background]="config.ticketBodyColor || '#ffffff'">
              @if (config.sealImage) {
                <img [src]="config.sealImage" class="ticket-logo" alt="">
              }
              <h2 class="ticket-title" [style.color]="config.ticketTextColor || '#1a1a2e'">{{ config.ticketTitle || 'Evento' }}</h2>
              @if (config.ticketSubtitle) {
                <p class="ticket-subtitle" [style.color]="(config.ticketTextColor || '#1a1a2e') + 'aa'">{{ config.ticketSubtitle }}</p>
              }
              @if (config.ticketDate) {
                <div class="ticket-date" [style.color]="config.ticketTextColor || '#444'">
                  <span class="material-icons" [style.color]="config.ticketAccentColor || '#d4a017'">event</span>
                  <span>{{ config.ticketDate }}</span>
                </div>
              }
            </div>
            <div class="ticket-footer" [style.background]="config.ticketBodyColor || '#ffffff'">
              <span class="ticket-tap-text" [style.color]="(config.ticketTextColor || '#1a1a2e') + '80'">Toca para entrar</span>
            </div>
          </div>
        </div>
      }

      <!-- ============ TEMPLATE: MINIMAL SPLASH ============ -->
      @if (getTemplate() === 'minimal-splash') {
        <div class="splash-container" (click)="open()">
          @if (config.splashImage) {
            <img [src]="config.splashImage" class="splash-logo" alt="">
          }
          <h1 class="splash-title" [style.color]="config.textColor || 'white'">{{ config.splashTitle || 'Bienvenido' }}</h1>
          @if (config.splashSubtitle) {
            <p class="splash-subtitle" [style.color]="config.textColor || 'rgba(255,255,255,0.6)'">{{ config.splashSubtitle }}</p>
          }
          <button class="splash-btn" [style.background]="config.ticketAccentColor || '#d4a017'" [style.color]="config.bgColor || '#1a1a2e'">
            <span class="material-icons">arrow_forward</span>
            {{ config.splashButtonText || 'Entrar' }}
          </button>
        </div>
      }

      <!-- ============ TEMPLATE: PLAIN ============ -->
      @if (getTemplate() === 'plain') {
        <div class="plain-container" (click)="open()">
          @if (config.plainTitle) {
            <h1 class="plain-title" [style.font-family]="getFontFamily(globalStyles?.titleStyle?.fontFamily)" [style.font-size.px]="globalStyles?.titleStyle?.fontSize || 32" [style.font-weight]="globalStyles?.titleStyle?.fontWeight || 400" [style.color]="config.textColor || globalStyles?.titleStyle?.color || 'white'">{{ config.plainTitle }}</h1>
          }
          @if (config.plainSubtitle) {
            <p class="plain-subtitle" [style.font-family]="getFontFamily(globalStyles?.subtitleStyle?.fontFamily)" [style.font-size.px]="globalStyles?.subtitleStyle?.fontSize || 16" [style.color]="config.textColor || globalStyles?.subtitleStyle?.color || 'rgba(255,255,255,0.7)'">{{ config.plainSubtitle }}</p>
          }
          @if (config.plainContent) {
            <p class="plain-content" [style.font-family]="getFontFamily(globalStyles?.contentStyle?.fontFamily)" [style.font-size.px]="globalStyles?.contentStyle?.fontSize || 14" [style.color]="config.textColor || globalStyles?.contentStyle?.color || 'rgba(255,255,255,0.6)'">{{ config.plainContent }}</p>
          }
        </div>
      }

      <!-- Instruction (all templates) -->
      @if (!opened && getTemplate() === 'envelope') {
        <p class="instruction">{{ config.instructionText || 'Toca para abrir' }}</p>
      }
      @if (!opened && getTemplate() === 'ticket') {
        <p class="instruction">{{ config.instructionText || 'Toca el boleto para entrar' }}</p>
      }
      @if (!opened && getTemplate() === 'plain') {
        <p class="instruction">{{ config.instructionText || 'Toca para continuar' }}</p>
      }
    </div>
  `,
  styles: [`
    .envelope-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: radial-gradient(ellipse at center, var(--bg-color2, #1a1a2e) 0%, var(--bg-color, #0a0a14) 100%);
      overflow: hidden;
      transition: opacity 0.6s ease;
      transition-delay: 1.4s;
    }
    .envelope-overlay.opened { opacity: 0; pointer-events: none; }

    /* === ENVELOPE TEMPLATE — Classic/Elegant/Wax === */
    .env-top, .env-bottom, .env-flap-top, .env-flap-bottom {
      position: absolute; left: 0; right: 0;
      background: var(--env-color, #1a1a2e);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .env-top { top: 0; height: 50%; background: linear-gradient(to bottom, var(--env-color), color-mix(in srgb, var(--env-color) 90%, black)); }
    .env-bottom { bottom: 0; height: 50%; background: linear-gradient(to top, var(--env-color), color-mix(in srgb, var(--env-color) 90%, black)); }
    .env-flap-top {
      top: 0; height: 50%;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      background: linear-gradient(to bottom, color-mix(in srgb, var(--env-color) 80%, white), var(--env-color));
      z-index: 2; transform-origin: top center;
    }
    .env-flap-top.flap-elegant { clip-path: ellipse(55% 100% at 50% 0%); }
    .env-flap-bottom {
      bottom: 0; height: 50%;
      clip-path: polygon(0 100%, 100% 100%, 50% 0);
      background: linear-gradient(to top, color-mix(in srgb, var(--env-color) 85%, white), var(--env-color));
      z-index: 1; transform-origin: bottom center;
    }
    .opened .env-flap-top { transform: rotateX(180deg); }
    .opened .env-flap-bottom { transform: rotateX(-180deg); }
    .opened .env-top { transform: translateY(-100%); }
    .opened .env-bottom { transform: translateY(100%); }

    /* Vertical doors */
    .env-door-left, .env-door-right {
      position: absolute; top: 0; bottom: 0; width: 50%;
      background: var(--env-color, #1a1a2e);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .env-door-left { left: 0; background: linear-gradient(to right, var(--env-color), color-mix(in srgb, var(--env-color) 92%, white)); transform-origin: left center; }
    .env-door-right { right: 0; background: linear-gradient(to left, var(--env-color), color-mix(in srgb, var(--env-color) 92%, white)); transform-origin: right center; }
    .opened .env-door-left { transform: rotateY(-105deg); }
    .opened .env-door-right { transform: rotateY(105deg); }

    /* Seal */
    .seal {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); z-index: 10;
      cursor: pointer; transition: transform 0.3s ease;
    }
    .seal:hover { transform: translate(-50%, -50%) scale(1.08); }
    .seal:active { transform: translate(-50%, -50%) scale(0.95); }
    .seal-body {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--seal-color, #8b0000);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3);
      position: relative; overflow: hidden;
    }
    .seal-body::before { content: ''; position: absolute; inset: 4px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); }
    .seal-txt { color: rgba(255,255,255,0.9); font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.3); user-select: none; }
    .seal-img { width: 54px; height: 54px; object-fit: contain; border-radius: 50%; }
    .seal-lg .seal-body { width: 130px; height: 130px; }
    .seal-txt-lg { font-size: 48px; }
    .seal-img-lg { width: 90px; height: 90px; }
    [data-seal="ribbon"] { border-radius: 50%; width: 80px; height: 80px; position: relative; }
    [data-seal="ribbon"]::after { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 14px solid transparent; border-right: 14px solid transparent; border-top: 14px solid var(--seal-color, #8b0000); }
    [data-seal="ribbon"]::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 60px; height: 12px; background: var(--seal-color, #8b0000); border-radius: 6px 6px 0 0; box-shadow: inset 0 2px 3px rgba(255,255,255,0.15); }
    [data-seal="stamp"] { border-radius: 6px; border: 3px dashed rgba(255,255,255,0.3); }
    [data-seal="monogram"] .seal-txt { font-family: var(--font-serif, serif); font-size: 24px; font-weight: 700; letter-spacing: 2px; }
    .opened .seal { animation: sealFade 0.6s ease forwards; }
    @keyframes sealFade { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2) rotate(8deg); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(15deg); } }
    [data-style="minimal"] .opened .seal { animation: sealZoom 1s ease forwards; }
    @keyframes sealZoom { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(3); } }

    /* === TICKET TEMPLATE === */
    .ticket-container {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      padding: 20px; cursor: pointer;
    }
    .ticket {
      width: 100%; max-width: 320px;
      background: #fff; border-radius: 16px;
      position: relative; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: ticketIn 0.8s ease both;
    }
    .ticket-notch {
      position: absolute; top: 50%; width: 24px; height: 24px;
      background: var(--bg-color, #0a0a14); border-radius: 50%;
      transform: translateY(-50%);
    }
    .ticket-notch-left { left: -12px; }
    .ticket-notch-right { right: -12px; }
    .ticket-header {
      background: var(--accent-color, #d4a017);
      padding: 12px 20px; text-align: center;
    }
    .ticket-badge {
      font-size: 10px; font-weight: 700; letter-spacing: 3px;
      color: rgba(0,0,0,0.7); text-transform: uppercase;
    }
    .ticket-body {
      padding: 32px 24px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .ticket-logo { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; }
    .ticket-title {
      font-size: 24px; font-weight: 700; color: #1a1a2e;
      font-family: var(--font-serif, serif);
    }
    .ticket-subtitle { font-size: 14px; color: #666; }
    .ticket-date {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #444; margin-top: 4px;
      .material-icons { font-size: 16px; color: var(--accent-color, #d4a017); }
    }
    .ticket-footer {
      padding: 16px 24px; border-top: 2px dashed #eee;
      display: flex; justify-content: center;
    }
    .ticket-tap-text {
      font-size: 12px; color: #999; letter-spacing: 1px; text-transform: uppercase;
      animation: pulse 2s ease-in-out infinite;
    }
    .opened .ticket { animation: ticketOut 0.8s ease forwards; }
    @keyframes ticketIn { from { opacity: 0; transform: scale(0.8) rotate(-3deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
    @keyframes ticketOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.5) translateY(-100px) rotate(5deg); } }

    /* === MINIMAL SPLASH TEMPLATE === */
    .splash-container {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 20px; padding: 40px; cursor: pointer;
    }
    .splash-logo {
      width: 120px; height: 120px; object-fit: contain;
      border-radius: 20px;
      animation: splashLogoIn 1s ease both;
    }
    .splash-title {
      font-family: var(--font-serif, serif);
      font-size: clamp(28px, 6vw, 42px); color: white;
      text-align: center; text-shadow: 0 2px 20px rgba(0,0,0,0.5);
      animation: splashTextIn 1s ease 0.3s both;
    }
    .splash-subtitle {
      font-size: 16px; color: var(--text-color, rgba(255,255,255,0.6));
      text-align: center;
      animation: splashTextIn 1s ease 0.5s both;
    }
    .splash-btn {
      display: flex; align-items: center; gap: 8px;
      background: var(--accent-color, #d4a017); color: #1a1a2e;
      border: none; border-radius: 30px; padding: 14px 32px;
      font-size: 16px; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 20px rgba(212,160,23,0.4);
      animation: splashTextIn 1s ease 0.7s both;
      transition: transform 0.2s, box-shadow 0.2s;
      .material-icons { font-size: 20px; }
    }
    .splash-btn:hover { transform: scale(1.05); box-shadow: 0 6px 30px rgba(212,160,23,0.6); }
    .opened .splash-container { animation: splashOut 0.8s ease forwards; }
    @keyframes splashLogoIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    @keyframes splashTextIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes splashOut { 0% { opacity: 1; } 100% { opacity: 0; transform: scale(1.1); } }

    /* === INSTRUCTION === */
    .instruction {
      position: absolute; bottom: 60px; left: 0; right: 0;
      text-align: center; z-index: 20;
      color: var(--text-color, rgba(255,255,255,0.5));
      font-size: 14px; letter-spacing: 2px; text-transform: uppercase;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

    /* === PLAIN TEMPLATE === */
    .plain-container {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; padding: 40px; cursor: pointer; text-align: center;
    }
    .plain-title {
      animation: splashTextIn 1s ease 0.2s both;
    }
    .plain-subtitle {
      animation: splashTextIn 1s ease 0.4s both;
    }
    .plain-content {
      max-width: 320px; line-height: 1.6;
      animation: splashTextIn 1s ease 0.6s both;
    }
    .opened .plain-container { animation: splashOut 0.8s ease forwards; }
  `]
})
export class LandingEnvelopeComponent {
  @Input() config!: EnvelopeConfig;
  @Input() globalStyles?: any;
  @Output() done = new EventEmitter<void>();
  opened = false;
  Math = Math;

  // Generate random barcode bars for ticket template
  barcodeBars = Array.from({ length: 30 }, () => 1 + Math.floor(Math.random() * 3));

  getTemplate(): string {
    return this.config.template || 'envelope';
  }

  getFontFamily(key?: string): string {
    const map: Record<string, string> = {
      'sans': 'Lato, sans-serif', 'serif': 'Playfair Display, serif', 'script': 'Great Vibes, cursive',
      'montserrat': 'Montserrat, sans-serif', 'raleway': 'Raleway, sans-serif', 'cinzel': 'Cinzel, serif',
      'cormorant': 'Cormorant Garamond, serif', 'dancing': 'Dancing Script, cursive',
      'sacramento': 'Sacramento, cursive', 'tangerine': 'Tangerine, cursive',
      'alexbrush': 'Alex Brush, cursive', 'pinyon': 'Pinyon Script, cursive',
      'josefin': 'Josefin Sans, sans-serif', 'baskerville': 'Libre Baskerville, serif'
    };
    return map[key || 'sans'] || 'Lato, sans-serif';
  }

  open() {
    this.opened = true;
    setTimeout(() => this.done.emit(), 2200);
  }
}
