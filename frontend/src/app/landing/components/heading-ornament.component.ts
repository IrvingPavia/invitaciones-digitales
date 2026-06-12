import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heading-ornament',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('line') {
        <div class="ornament ornament-line" [style.transform]="'scale(' + scale + ')'">
          <svg [attr.width]="120 * scale" height="6" viewBox="0 0 120 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 3 C20 0, 40 6, 60 3 C80 0, 100 6, 120 3" [attr.stroke]="color" stroke-width="1.5" fill="none" opacity="0.8"/>
            <circle cx="60" cy="3" r="2.5" [attr.fill]="color" opacity="0.6"/>
          </svg>
        </div>
      }
      @case ('dots') {
        <div class="ornament ornament-dots" [style.transform]="'scale(' + scale + ')'" [style.gap.px]="8 * scale">
          <span class="dot dot-sm" [style.background]="color"></span>
          <span class="dot dot-md" [style.background]="color"></span>
          <span class="dot dot-lg" [style.background]="color"></span>
          <span class="dot dot-md" [style.background]="color"></span>
          <span class="dot dot-sm" [style.background]="color"></span>
        </div>
      }
      @case ('sparkles') {
        <div class="ornament ornament-sparkles" [style.transform]="'scale(' + scale + ')'">
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10 L22 6 L24 10 L22 14 Z" [attr.fill]="color" opacity="0.5"/>
            <path d="M40 10 L43 4 L46 10 L43 16 Z" [attr.fill]="color" opacity="0.7"/>
            <path d="M50 10 L54 2 L58 10 L54 18 Z" [attr.fill]="color"/>
            <path d="M60 10 L63 4 L66 10 L63 16 Z" [attr.fill]="color" opacity="0.7"/>
            <path d="M80 10 L82 6 L84 10 L82 14 Z" [attr.fill]="color" opacity="0.5"/>
          </svg>
        </div>
      }
      @case ('flourish') {
        <div class="ornament ornament-flourish" [style.transform]="'scale(' + scale + ')'">
          <svg width="160" height="24" viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 12 C70 4, 50 4, 30 12 C20 16, 10 14, 5 10" [attr.stroke]="color" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <path d="M80 12 C90 4, 110 4, 130 12 C140 16, 150 14, 155 10" [attr.stroke]="color" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <circle cx="80" cy="12" r="3" [attr.fill]="color" opacity="0.8"/>
            <path d="M5 10 C3 8, 2 12, 4 13" [attr.stroke]="color" stroke-width="1" fill="none" stroke-linecap="round"/>
            <path d="M155 10 C157 8, 158 12, 156 13" [attr.stroke]="color" stroke-width="1" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
      }
      @case ('dash') {
        <div class="ornament ornament-dash" [style.transform]="'scale(' + scale + ')'">
          <span class="dash-line" [style.background]="color"></span>
          <span class="dash-dot" [style.background]="color"></span>
          <span class="dash-line" [style.background]="color"></span>
        </div>
      }
      @case ('arrows') {
        <div class="ornament ornament-arrows" [style.transform]="'scale(' + scale + ')'">
          <svg width="80" height="16" viewBox="0 0 80 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 8 L25 3 L25 13 Z" [attr.fill]="color" opacity="0.5"/>
            <path d="M30 8 L38 4 L38 12 Z" [attr.fill]="color" opacity="0.7"/>
            <circle cx="43" cy="8" r="2.5" [attr.fill]="color"/>
            <path d="M50 8 L42 4 L42 12 Z" [attr.fill]="color" opacity="0.7"/>
            <path d="M65 8 L55 3 L55 13 Z" [attr.fill]="color" opacity="0.5"/>
          </svg>
        </div>
      }
      @case ('wave') {
        <div class="ornament ornament-wave" [style.transform]="'scale(' + scale + ')'">
          <svg width="120" height="12" viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6 C10 2, 20 10, 30 6 C40 2, 50 10, 60 6 C70 2, 80 10, 90 6 C100 2, 110 10, 120 6" [attr.stroke]="color" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .ornament {
      display: flex; align-items: center; justify-content: center;
      padding: 6px 0;
      transition: transform 0.3s ease;
    }
    .ornament-dots {
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .dot { border-radius: 50%; display: block; }
    .dot-sm { width: 4px; height: 4px; opacity: 0.5; }
    .dot-md { width: 6px; height: 6px; opacity: 0.7; }
    .dot-lg { width: 8px; height: 8px; }
    .ornament-dash {
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .dash-line { width: 32px; height: 2px; border-radius: 1px; opacity: 0.7; }
    .dash-dot { width: 6px; height: 6px; border-radius: 50%; }
    svg { display: block; }
  `]
})
export class HeadingOrnamentComponent {
  @Input() type: string = 'none';
  @Input() color: string = '#d4a017';
  @Input() size: number = 1;

  get scale(): number {
    return this.size || 1;
  }
}
