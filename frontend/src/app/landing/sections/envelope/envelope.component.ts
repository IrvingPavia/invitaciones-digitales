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
         [attr.data-style]="config.style">

      <!-- Classic / Elegant / Wax: top flap + bottom flap open -->
      @if (config.style === 'classic' || config.style === 'elegant' || config.style === 'wax') {
        <div class="env-top"></div>
        <div class="env-bottom"></div>
        <div class="env-flap-top" [class.flap-elegant]="config.style === 'elegant'"></div>
        <div class="env-flap-bottom"></div>
      }

      <!-- Vertical: left/right doors -->
      @if (config.style === 'vertical') {
        <div class="env-door-left"></div>
        <div class="env-door-right"></div>
      }

      <!-- Seal (all styles except minimal use centered absolute) -->
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

      <!-- Minimal: just the seal, bigger -->
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

      <!-- Instruction -->
      @if (!opened) {
        <p class="instruction">{{ config.instructionText || 'Toca para abrir' }}</p>
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

    /* === CLASSIC / ELEGANT / WAX — 4 panels that open outward === */
    .env-top, .env-bottom, .env-flap-top, .env-flap-bottom {
      position: absolute; left: 0; right: 0;
      background: var(--env-color, #1a1a2e);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .env-top {
      top: 0; height: 50%;
      background: linear-gradient(to bottom, var(--env-color), color-mix(in srgb, var(--env-color) 90%, black));
    }
    .env-bottom {
      bottom: 0; height: 50%;
      background: linear-gradient(to top, var(--env-color), color-mix(in srgb, var(--env-color) 90%, black));
    }
    .env-flap-top {
      top: 0; height: 50%;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      background: linear-gradient(to bottom, color-mix(in srgb, var(--env-color) 80%, white), var(--env-color));
      z-index: 2;
      transform-origin: top center;
    }
    .env-flap-top.flap-elegant {
      clip-path: ellipse(55% 100% at 50% 0%);
    }
    .env-flap-bottom {
      bottom: 0; height: 50%;
      clip-path: polygon(0 100%, 100% 100%, 50% 0);
      background: linear-gradient(to top, color-mix(in srgb, var(--env-color) 85%, white), var(--env-color));
      z-index: 1;
      transform-origin: bottom center;
    }
    .opened .env-flap-top { transform: rotateX(180deg); }
    .opened .env-flap-bottom { transform: rotateX(-180deg); }
    .opened .env-top { transform: translateY(-100%); }
    .opened .env-bottom { transform: translateY(100%); }

    /* === VERTICAL — left/right doors === */
    .env-door-left, .env-door-right {
      position: absolute; top: 0; bottom: 0; width: 50%;
      background: var(--env-color, #1a1a2e);
      transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .env-door-left {
      left: 0;
      background: linear-gradient(to right, var(--env-color), color-mix(in srgb, var(--env-color) 92%, white));
      transform-origin: left center;
    }
    .env-door-right {
      right: 0;
      background: linear-gradient(to left, var(--env-color), color-mix(in srgb, var(--env-color) 92%, white));
      transform-origin: right center;
    }
    .opened .env-door-left { transform: rotateY(-105deg); }
    .opened .env-door-right { transform: rotateY(105deg); }

    /* === SEAL === */
    .seal {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .seal:hover { transform: translate(-50%, -50%) scale(1.08); }
    .seal:active { transform: translate(-50%, -50%) scale(0.95); }
    .seal-body {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: var(--seal-color, #8b0000);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3);
      position: relative; overflow: hidden;
    }
    .seal-body::before {
      content: ''; position: absolute; inset: 4px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .seal-txt {
      color: rgba(255,255,255,0.9); font-size: 28px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3); user-select: none;
    }
    .seal-img { width: 54px; height: 54px; object-fit: contain; border-radius: 50%; }

    /* Large seal for minimal */
    .seal-lg .seal-body { width: 130px; height: 130px; }
    .seal-txt-lg { font-size: 48px; }
    .seal-img-lg { width: 90px; height: 90px; }

    /* Seal styles */
    [data-seal="ribbon"] {
      border-radius: 50%;
      width: 80px; height: 80px;
      position: relative;
    }
    [data-seal="ribbon"]::after {
      content: '';
      position: absolute;
      bottom: -12px; left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 14px solid transparent;
      border-right: 14px solid transparent;
      border-top: 14px solid var(--seal-color, #8b0000);
    }
    [data-seal="ribbon"]::before {
      content: '';
      position: absolute;
      top: -6px; left: 50%;
      transform: translateX(-50%);
      width: 60px; height: 12px;
      background: var(--seal-color, #8b0000);
      border-radius: 6px 6px 0 0;
      box-shadow: inset 0 2px 3px rgba(255,255,255,0.15);
    }
    [data-seal="stamp"] { border-radius: 6px; border: 3px dashed rgba(255,255,255,0.3); }
    [data-seal="monogram"] .seal-txt { font-family: var(--font-serif, serif); font-size: 24px; font-weight: 700; letter-spacing: 2px; }

    /* Seal disappear on open */
    .opened .seal {
      animation: sealFade 0.6s ease forwards;
    }
    @keyframes sealFade {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.2) rotate(8deg); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(15deg); }
    }
    [data-style="minimal"] .opened .seal {
      animation: sealZoom 1s ease forwards;
    }
    @keyframes sealZoom {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
    }

    /* === INSTRUCTION === */
    .instruction {
      position: absolute; bottom: 60px; left: 0; right: 0;
      text-align: center; z-index: 20;
      color: var(--text-color, rgba(255,255,255,0.5));
      font-size: 14px; letter-spacing: 2px; text-transform: uppercase;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  `]
})
export class LandingEnvelopeComponent {
  @Input() config!: EnvelopeConfig;
  @Output() done = new EventEmitter<void>();
  opened = false;

  open() {
    this.opened = true;
    // Total visible time: 1.2s animation + 1.4s delay + 0.6s fade = ~3.2s
    // Emit done after overlay starts fading so intro is ready underneath
    setTimeout(() => this.done.emit(), 2200);
  }
}
