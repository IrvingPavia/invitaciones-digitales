import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type !== 'none' && strokeWidth > 0) {
      <svg class="section-divider-stroke"
           [attr.viewBox]="'0 0 1200 ' + height"
           [style.height.px]="height"
           [style.transform]="flip ? 'scaleX(-1)' : ''"
           preserveAspectRatio="none"
           xmlns="http://www.w3.org/2000/svg">
        <path [attr.d]="getStrokePath()" [attr.stroke]="strokeColor" [attr.stroke-width]="strokeWidth" fill="none" [attr.opacity]="strokeOpacity" />
      </svg>
    }
  `,
  styles: [`
    :host { display: block; position: absolute; top: 0; left: 0; right: 0; pointer-events: none; line-height: 0; z-index: 2; }
    .section-divider-stroke { width: 100%; display: block; }
  `]
})
export class SectionDividerComponent {
  @Input() type: string = 'none';
  @Input() color: string = '#0d1117';
  @Input() height: number = 50;
  @Input() flip: boolean = false;
  @Input() strokeColor: string = '';
  @Input() strokeWidth: number = 0;
  @Input() strokeOpacity: number = 1;

  getStrokePath(): string {
    const h = this.height;
    switch (this.type) {
      case 'wave':
        return `M0,${h * 0.4} C200,${h} 400,0 600,${h * 0.5} C800,${h} 1000,0 1200,${h * 0.4}`;
      case 'curve':
        return `M0,${h} C300,0 900,0 1200,${h}`;
      case 'slant':
        return `M0,${h} L1200,0`;
      case 'zigzag':
        return `M0,${h} L100,${h * 0.2} L200,${h} L300,${h * 0.2} L400,${h} L500,${h * 0.2} L600,${h} L700,${h * 0.2} L800,${h} L900,${h * 0.2} L1000,${h} L1100,${h * 0.2} L1200,${h}`;
      case 'mountains':
        return `M0,${h} L150,${h * 0.3} L300,${h * 0.7} L500,${h * 0.1} L700,${h * 0.6} L900,${h * 0.2} L1050,${h * 0.5} L1200,${h * 0.15}`;
      case 'drops':
        return `M0,${h} Q100,${h * 0.2} 200,${h} Q300,${h * 0.2} 400,${h} Q500,${h * 0.2} 600,${h} Q700,${h * 0.2} 800,${h} Q900,${h * 0.2} 1000,${h} Q1100,${h * 0.2} 1200,${h}`;
      case 'arrow':
        return `M0,${h} L600,0 L1200,${h}`;
      default:
        return '';
    }
  }
}
