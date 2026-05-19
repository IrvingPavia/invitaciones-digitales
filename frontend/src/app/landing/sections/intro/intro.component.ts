import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-intro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="intro-overlay" [class.fade-out]="fading">
      @if (config.background) {
        <div class="intro-bg" [style.backgroundImage]="'url(' + config.background + ')'"></div>
        <div class="intro-bg-overlay"></div>
      } @else {
        <div class="intro-bg intro-bg-default"></div>
      }
      <div class="intro-content">
        <div class="intro-particles">
          @for (p of particles; track p) {
            <div class="particle" [style]="p"></div>
          }
        </div>
        <p class="intro-phrase">{{ config.phrase }}</p>
        <div class="intro-progress">
          <div class="intro-progress-bar" [style.animation-duration]="config.duration + 's'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .intro-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: flex-end; justify-content: center;
      padding-bottom: 80px;
      transition: opacity 0.8s ease;
    }
    .intro-overlay.fade-out { opacity: 0; pointer-events: none; }
    .intro-bg {
      position: absolute; inset: 0;
      background-size: cover; background-position: center;
      animation: introBgZoom 5s ease forwards;
    }
    .intro-bg-default {
      background: radial-gradient(ellipse at center, #1a1a2e 0%, #0d1117 100%);
    }
    .intro-bg-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
    }
    .intro-content { position: relative; z-index: 1; text-align: center; width: 100%; padding: 0 20px; }
    .intro-phrase {
      font-family: var(--font-script);
      font-size: clamp(28px, 6vw, 52px);
      color: var(--gold);
      text-shadow: 0 0 30px rgba(212,160,23,0.5);
      animation: phraseIn 1s ease 0.5s both;
      margin-bottom: 24px;
    }
    .intro-progress {
      width: 200px; height: 2px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px; margin: 0 auto;
      overflow: hidden;
    }
    .intro-progress-bar {
      height: 100%; width: 0;
      background: var(--gold);
      animation: progressFill linear forwards;
    }
    .intro-particles { position: absolute; inset: 0; pointer-events: none; }
    .particle {
      position: absolute;
      width: 4px; height: 4px;
      background: var(--gold);
      border-radius: 50%;
      animation: particleFloat linear infinite;
      opacity: 0;
    }
    @keyframes introBgZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
    @keyframes phraseIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes progressFill { from { width: 0; } to { width: 100%; } }
    @keyframes particleFloat {
      0% { opacity: 0; transform: translateY(0) scale(0); }
      20% { opacity: 1; }
      80% { opacity: 0.5; }
      100% { opacity: 0; transform: translateY(-100vh) scale(1); }
    }
  `]
})
export class LandingIntroComponent implements OnInit, OnDestroy {
  @Input() config!: IntroConfig;
  @Output() done = new EventEmitter<void>();
  fading = false;
  particles: string[] = [];
  private timer: any;

  ngOnInit() {
    this.particles = Array.from({ length: 20 }, () => {
      const left = Math.random() * 100;
      const delay = Math.random() * 3;
      const dur = 3 + Math.random() * 4;
      const size = 2 + Math.random() * 4;
      return `left:${left}%;bottom:0;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s`;
    });

    const dur = Math.min(this.config.duration || 4, 5) * 1000;
    this.timer = setTimeout(() => {
      this.fading = true;
      setTimeout(() => this.done.emit(), 800);
    }, dur - 800);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}
