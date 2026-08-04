import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, DoCheck, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroConfig, IntroParticlesConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-intro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="intro-overlay" [class.fade-out]="fading" [attr.data-transition]="config.transition || 'fade'" (click)="onTap()">
      @if (config.background) {
        @if (isVideo(config.background)) {
          <video #introVideo class="intro-bg-video" [attr.loop]="previewLoop ? null : true" muted playsinline [src]="config.background"></video>
          <div class="intro-bg-overlay"></div>
          @if (showPlayHint) {
            <div class="play-hint"><span class="material-icons">touch_app</span><span>Toca para iniciar</span></div>
          }
        } @else {
          <div class="intro-bg" [style.backgroundImage]="'url(' + config.background + ')'"></div>
          <div class="intro-bg-overlay"></div>
        }
      } @else {
        <div class="intro-bg" [style.background]="defaultBg"></div>
      }
      @if (themeTexture && themeTexture !== 'none') {
        <div class="intro-texture" [attr.data-texture]="themeTexture" [style.opacity]="(themeTextureOpacity || 5) / 100"></div>
      }
      @if (particlesConfig.enabled) {
        <div class="intro-particles" [attr.data-type]="particlesConfig.type" [attr.data-dir]="particlesConfig.direction">
          @for (p of particles; track $index) {
            <div class="particle" [style]="p"></div>
          }
        </div>
      }
      <div class="intro-content">
        <p class="intro-phrase"
           [style.font-family]="getFontFamily(config.phraseStyle?.fontFamily)"
           [style.font-size.px]="config.phraseStyle?.fontSize || 42"
           [style.color]="config.phraseStyle?.color || '#d4a017'"
           [style.font-weight]="config.phraseStyle?.fontWeight || 400"
        >{{ config.phrase }}</p>
        <div class="intro-progress">
          @if (!fading || !previewLoop) {
            <div class="intro-progress-bar" [style.background]="themeColor" [style.animation-duration]="effectiveDuration + 's'"></div>
          }
        </div>
      </div>
      @if (config.showSkip !== false) {
        <button class="intro-skip" (click)="skip(); $event.stopPropagation()">Saltar</button>
      }
    </div>
  `,
  styles: [`
    .intro-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: flex-end; justify-content: center;
      padding-bottom: 80px;
      animation: introFadeIn 0.8s ease both;
      -webkit-transform: translateZ(0); transform: translateZ(0);
      backface-visibility: hidden; -webkit-backface-visibility: hidden;
    }
    .intro-overlay.fade-out { pointer-events: none; transition: opacity 1.2s ease, transform 1.2s ease, filter 1.2s ease; }
    /* Transition variants - only apply on fade-out */
    .intro-overlay[data-transition="fade"].fade-out { opacity: 0; }
    .intro-overlay[data-transition="slide-up"].fade-out { opacity: 0; transform: translateY(-100%); }
    .intro-overlay[data-transition="slide-down"].fade-out { opacity: 0; transform: translateY(100%); }
    .intro-overlay[data-transition="zoom-in"].fade-out { opacity: 0; transform: scale(1.5); }
    .intro-overlay[data-transition="zoom-out"].fade-out { opacity: 0; transform: scale(0.3); }
    .intro-overlay[data-transition="blur"].fade-out { opacity: 0; filter: blur(20px); transform: scale(1.1); }
    .intro-overlay[data-transition="none"].fade-out { opacity: 0; transition: opacity 0.05s; }
    @keyframes introFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .intro-bg {
      position: absolute; inset: 0;
      background-size: cover; background-position: center;
      animation: introBgZoom 5s ease forwards;
    }
    .intro-bg-video {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      animation: introBgZoom 5s ease forwards;
    }
    .play-hint {
      position: absolute; inset: 0; z-index: 5;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
      color: rgba(255,255,255,0.7); font-size: 14px;
      animation: phraseIn 1s ease 0.3s both;
      .material-icons { font-size: 48px; opacity: 0.6; }
    }
    .intro-bg-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
    }
    .intro-texture {
      position: absolute; inset: 0; z-index: 1; pointer-events: none;
    }
    .intro-texture[data-texture="noise"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .intro-texture[data-texture="grain"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E"); }
    .intro-texture[data-texture="dots"] { background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 8px 8px; }
    .intro-texture[data-texture="lines"] { background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px); }
    .intro-texture[data-texture="cross"] { background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px); }
    .intro-texture[data-texture="paper"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E"); }
    .intro-texture[data-texture="linen"] { background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px); }
    .intro-texture[data-texture="stars"] { background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; }
    .intro-content { position: relative; z-index: 2; text-align: center; width: 100%; padding: 0 20px; }
    .intro-phrase {
      font-family: var(--font-script);
      font-size: clamp(28px, 6vw, 52px);
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
      animation: progressFill linear forwards;
    }
    .intro-skip {
      position: absolute; top: 16px; right: 16px; z-index: 5;
      padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3);
      background: rgba(0,0,0,0.4); backdrop-filter: blur(8px);
      color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.5); }
    }
    .intro-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0;
    }
    /* Sparkles */
    [data-type="sparkles"] .particle { animation: particleUp linear infinite; }
    /* Snow */
    [data-type="snow"] .particle { animation: particleDown linear infinite; }
    /* Fireflies */
    [data-type="fireflies"] .particle { animation: particleFirefly ease-in-out infinite; }
    /* Bubbles */
    [data-type="bubbles"] .particle { animation: particleBubble ease-in-out infinite; }
    /* Stars */
    [data-type="stars"] .particle { animation: particleStar ease-in-out infinite; }
    /* Confetti */
    [data-type="confetti"] .particle { border-radius: 2px; animation: particleConfetti linear infinite; }

    @keyframes introBgZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
    @keyframes phraseIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes progressFill { from { width: 0; } to { width: 100%; } }

    @keyframes particleUp {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
      5% { opacity: var(--particle-opacity, 0.8); }
      80% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
      100% { opacity: 0; transform: translateY(-100vh) translateX(var(--drift, 0px)) scale(1); }
    }
    @keyframes particleDown {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
      5% { opacity: var(--particle-opacity, 0.8); }
      80% { opacity: calc(var(--particle-opacity, 0.8) * 0.5); }
      100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift, 20px)) scale(1); }
    }
    @keyframes particleFirefly {
      0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
      10% { opacity: var(--particle-opacity, 0.8); }
      25% { transform: translate(var(--drift, 30px), -15vh) scale(1); }
      50% { opacity: calc(var(--particle-opacity, 0.8) * 0.4); transform: translate(calc(var(--drift, 30px) * -1), -30vh) scale(0.7); }
      75% { opacity: var(--particle-opacity, 0.8); transform: translate(var(--drift, 30px), -45vh) scale(1); }
      100% { opacity: 0; transform: translate(0, -60vh) scale(0.5); }
    }
    @keyframes particleBubble {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.4); }
      10% { opacity: var(--particle-opacity, 0.8); transform: translateY(-8vh) translateX(var(--drift, 10px)) scale(0.8); }
      40% { opacity: var(--particle-opacity, 0.8); transform: translateY(-35vh) translateX(calc(var(--drift, 10px) * -0.5)) scale(1); }
      70% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); transform: translateY(-60vh) translateX(var(--drift, 10px)) scale(0.9); }
      100% { opacity: 0; transform: translateY(-90vh) translateX(calc(var(--drift, 10px) * -1)) scale(0.6); }
    }
    @keyframes particleStar {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: var(--particle-opacity, 0.8); transform: scale(1.2); }
    }
    @keyframes particleConfetti {
      0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(1); }
      10% { opacity: var(--particle-opacity, 0.8); }
      90% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
      100% { opacity: 0; transform: translateY(100vh) rotate(var(--rotation, 720deg)) scale(0.5); }
    }

    /* Direction overrides for left/right */
    [data-dir="left"] [data-type="sparkles"] .particle,
    [data-dir="left"][data-type="sparkles"] .particle { animation-name: particleLeft; }
    [data-dir="right"] [data-type="sparkles"] .particle,
    [data-dir="right"][data-type="sparkles"] .particle { animation-name: particleRight; }
    [data-dir="left"][data-type="snow"] .particle { animation-name: particleLeft; }
    [data-dir="right"][data-type="snow"] .particle { animation-name: particleRight; }
    [data-dir="left"][data-type="bubbles"] .particle { animation-name: particleLeft; }
    [data-dir="right"][data-type="bubbles"] .particle { animation-name: particleRight; }
    [data-dir="left"][data-type="confetti"] .particle { animation-name: particleConfettiLeft; }
    [data-dir="right"][data-type="confetti"] .particle { animation-name: particleConfettiRight; }
    [data-dir="down"][data-type="sparkles"] .particle { animation-name: particleDown; }

    @keyframes particleLeft {
      0% { opacity: 0; transform: translateX(0) translateY(0) scale(0); }
      15% { opacity: 1; }
      85% { opacity: 0.5; }
      100% { opacity: 0; transform: translateX(-100vw) translateY(var(--drift, 0px)) scale(1); }
    }
    @keyframes particleRight {
      0% { opacity: 0; transform: translateX(0) translateY(0) scale(0); }
      15% { opacity: 1; }
      85% { opacity: 0.5; }
      100% { opacity: 0; transform: translateX(100vw) translateY(var(--drift, 0px)) scale(1); }
    }
    @keyframes particleConfettiLeft {
      0% { opacity: 0; transform: translateX(0) rotate(0deg) scale(1); }
      10% { opacity: 1; }
      90% { opacity: 0.6; }
      100% { opacity: 0; transform: translateX(-100vw) rotate(var(--rotation, 720deg)) scale(0.5); }
    }
    @keyframes particleConfettiRight {
      0% { opacity: 0; transform: translateX(0) rotate(0deg) scale(1); }
      10% { opacity: 1; }
      90% { opacity: 0.6; }
      100% { opacity: 0; transform: translateX(100vw) rotate(var(--rotation, 720deg)) scale(0.5); }
    }
  `]
})
export class LandingIntroComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {
  @Input() config!: IntroConfig;
  @Input() themeColor: string = '#d4a017';
  @Input() themeBg: string = '';
  @Input() themeBorder: string = '';
  @Input() themeBgType: string = 'radial';
  @Input() themeTexture: string = 'none';
  @Input() themeTextureOpacity: number = 5;
  @Input() previewLoop = false;
  @Output() done = new EventEmitter<void>();
  @ViewChild('introVideo') introVideo?: ElementRef<HTMLVideoElement>;
  fading = false;
  particles: string[] = [];
  showPlayHint = false;
  loopKey = 0;
  private timer: any;
  private timerStarted = false;
  private lastParticlesKey = '';

  isVideo(url: string): boolean {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  ngAfterViewInit() {
    if (this.introVideo?.nativeElement) {
      const video = this.introVideo.nativeElement;
      // Set start time if trimmed
      if (this.config.videoStart) {
        video.currentTime = this.config.videoStart;
      }
      // Try autoplay — if blocked, show tap hint (only in non-loop mode)
      video.play().then(() => {
        this.startVideoMonitor();
        this.startTimer();
      }).catch(() => {
        if (this.previewLoop) {
          // In builder preview, start timer anyway even if video can't play
          this.startTimer();
        } else {
          this.showPlayHint = true;
        }
      });
    }
  }

  onTap() {
    if (this.introVideo?.nativeElement && this.showPlayHint) {
      const video = this.introVideo.nativeElement;
      if (this.config.videoStart) {
        video.currentTime = this.config.videoStart;
      }
      video.play().then(() => {
        this.showPlayHint = false;
        this.startVideoMonitor();
        this.startTimer();
      }).catch(() => {});
    }
  }

  private startVideoMonitor() {
    // Stop video at videoEnd and loop back to videoStart
    if (!this.config.videoEnd || !this.introVideo?.nativeElement) return;
    const video = this.introVideo.nativeElement;
    const checkEnd = () => {
      if (video.currentTime >= (this.config.videoEnd || video.duration)) {
        video.currentTime = this.config.videoStart || 0;
      }
    };
    video.addEventListener('timeupdate', checkEnd);
  }

  private startTimer() {
    if (this.timerStarted) return;
    this.timerStarted = true;
    const dur = this.effectiveDuration * 1000;
    // Start transition slightly before the end so it overlaps with media still playing
    const transitionDuration = 1000; // 1s animation
    const triggerTime = Math.max(0, dur - transitionDuration);
    this.timer = setTimeout(() => {
      if (this.previewLoop) {
        // Builder loop: transition out, show landing bg briefly, restart
        this.fading = true;
        // Wait for animation to complete (1s keyframe)
        setTimeout(() => {
          this.done.emit();
          // Reset video while faded out
          if (this.introVideo?.nativeElement) {
            const video = this.introVideo.nativeElement;
            video.currentTime = this.config.videoStart || 0;
            video.play().catch(() => {});
          }
          // Hold on landing background for 1s, then restart
          setTimeout(() => {
            this.loopKey++;
            this.fading = false;
            this.timerStarted = false;
            this.startTimer();
          }, 1000);
        }, 1100);
      } else {
        // Normal landing: fade out and emit done
        this.fading = true;
        setTimeout(() => this.done.emit(), 1200);
      }
    }, triggerTime);
  }

  get effectiveDuration(): number {
    // If "use video duration" is on and we have the duration
    if (this.config.useVideoDuration && this.config.videoDuration) {
      return this.config.videoDuration;
    }
    // If video is trimmed, use the trim segment duration
    if (this.config.videoStart != null && this.config.videoEnd != null) {
      return Math.min(this.config.videoEnd - this.config.videoStart, this.config.duration || 5);
    }
    return this.config.duration || 5;
  }

  get defaultBg(): string {
    const c1 = this.themeBg || '#0d1117';
    const c2 = this.themeBorder || '#1a1a2e';
    const type = this.themeBgType || 'radial';
    switch (type) {
      case 'solid': return c1;
      case 'linear': return `linear-gradient(135deg, ${c1}, ${c2})`;
      case 'radial': return `radial-gradient(ellipse at center, ${c2} 0%, ${c1} 70%)`;
      case 'mesh': return `radial-gradient(ellipse at 30% 30%, ${c2} 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, ${c1} 0%, transparent 50%), ${c1}`;
      default: return `radial-gradient(ellipse at center, ${c2} 0%, ${c1} 70%)`;
    }
  }

  get particlesConfig(): IntroParticlesConfig {
    return this.config.particles || {
      enabled: true,
      type: 'sparkles',
      color1: '#d4a017',
      color2: '#ffffff',
      direction: 'up',
      quantity: 20,
      speed: 5,
      size: 4,
      opacity: 0.8
    };
  }

  getFontFamily(key?: string): string {
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'cormorant': 'var(--font-cormorant)', 'spumoni': 'var(--font-spumoni)', 'dancing': 'var(--font-dancing)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'sacramento': 'var(--font-sacramento)', 'tangerine': 'var(--font-tangerine)', 'alexbrush': 'var(--font-alexbrush)',
      'pinyon': 'var(--font-pinyon)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key || 'script'] || 'var(--font-script)';
  }

  ngOnInit() {
    const pc = this.particlesConfig;
    if (pc.enabled) {
      this.particles = this.generateParticles(pc);
    }

    // For images/GIF, start timer immediately. For video, timer starts after play succeeds.
    if (!this.config.background || !this.isVideo(this.config.background)) {
      this.startTimer();
    }
  }

  ngOnDestroy() { clearTimeout(this.timer); }

  skip() {
    if (this.fading) return;
    this.fading = true;
    clearTimeout(this.timer);
    setTimeout(() => this.done.emit(), 800);
  }

  ngDoCheck() {
    // Regenerate particles when config changes (for builder real-time updates)
    const pc = this.particlesConfig;
    const key = `${pc.enabled}-${pc.type}-${pc.direction}-${pc.color1}-${pc.color2}-${pc.quantity}-${pc.speed}-${pc.size}-${pc.opacity}`;
    if (key !== this.lastParticlesKey) {
      this.lastParticlesKey = key;
      if (pc.enabled) {
        this.particles = this.generateParticles(pc);
      } else {
        this.particles = [];
      }
    }
  }

  private generateParticles(pc: IntroParticlesConfig): string[] {
    const count = pc.quantity || 20;
    const baseSpeed = pc.speed || 5;
    const type = pc.type || 'sparkles';
    const dir = pc.direction || 'up';
    const baseSize = pc.size || 4;
    const baseOpacity = pc.opacity ?? 0.8;
    const c1 = pc.color1 || '#d4a017';
    const c2 = pc.color2 || '#ffffff';

    return Array.from({ length: count }, () => {
      const color = Math.random() > 0.5 ? c1 : c2;
      const delay = Math.random() * 1.5;
      const dur = (4 - baseSpeed * 0.3) + Math.random() * 2;
      const sizeVariation = baseSize * (0.6 + Math.random() * 0.8);
      const drift = (Math.random() - 0.5) * 60;
      const rotation = 360 + Math.random() * 720;

      let position = '';
      if (type === 'stars' || type === 'fireflies') {
        position = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;`;
      } else {
        switch (dir) {
          case 'up': position = `left:${Math.random() * 100}%;bottom:-5%;`; break;
          case 'down': position = `left:${Math.random() * 100}%;top:-5%;`; break;
          case 'left': position = `top:${Math.random() * 100}%;right:-5%;`; break;
          case 'right': position = `top:${Math.random() * 100}%;left:-5%;`; break;
        }
      }

      let width = sizeVariation;
      let height = sizeVariation;
      let extra = '';

      if (type === 'confetti') {
        width = sizeVariation * 0.5;
        height = sizeVariation;
      } else if (type === 'bubbles') {
        // Burbujas: más grandes, transparentes con borde
        const bubbleSize = sizeVariation * 2.5;
        width = bubbleSize;
        height = bubbleSize;
        extra = `;background:transparent;border:1px solid ${color};box-shadow:inset 0 0 ${bubbleSize * 0.3}px ${color}40, 0 0 ${bubbleSize * 0.5}px ${color}20`;
      } else if (type === 'sparkles' || type === 'stars') {
        // Efecto astigmatismo: puntas de luz con box-shadow
        const glowSize = sizeVariation * 1.5;
        extra = `;box-shadow:0 0 ${glowSize}px ${glowSize * 0.3}px ${color}, ${glowSize * 0.8}px 0 ${glowSize * 0.5}px 0 ${color}80, -${glowSize * 0.8}px 0 ${glowSize * 0.5}px 0 ${color}80, 0 ${glowSize * 0.8}px ${glowSize * 0.5}px 0 ${color}80, 0 -${glowSize * 0.8}px ${glowSize * 0.5}px 0 ${color}80`;
        width = sizeVariation * 0.4;
        height = sizeVariation * 0.4;
      } else if (type === 'fireflies') {
        extra = `;box-shadow:0 0 ${sizeVariation * 2}px ${color}`;
      }

      return `${position}width:${width}px;height:${height}px;background:${type === 'bubbles' ? 'transparent' : color};animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;--rotation:${rotation}deg;--particle-opacity:${baseOpacity}${extra}`;
    });
  }
}
