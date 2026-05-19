import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="details" class="details-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">{{ config.title || 'Detalles del Evento' }}</h2>
          <div class="section-line"></div>
        </div>
        <div class="details-grid">
          @for (card of config.cards; track card.id) {
            <div class="detail-card reveal">
              @if (card.iconUrl) {
                <div class="detail-icon">
                  <img [src]="card.iconUrl" [alt]="card.title">
                </div>
              }
              @if (card.title) {
                <h3 [style.font-family]="getFontFamily(config.titleStyle?.fontFamily)"
                    [style.font-size.px]="config.titleStyle?.fontSize || 18"
                    [style.color]="config.titleStyle?.color || '#d4a017'"
                >{{ card.title }}</h3>
              }
              <p [style.text-align]="card.textAlign"
                 [style.font-family]="getFontFamily(config.contentStyle?.fontFamily)"
                 [style.font-size.px]="config.contentStyle?.fontSize || 14"
                 [style.color]="config.contentStyle?.color || 'rgba(255,255,255,0.7)'"
              >{{ card.content }}</p>
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
      background: rgba(0,0,0,0.45); border: 1px solid rgba(212,160,23,0.25);
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
    h3 { margin-bottom: 12px; }
    p { line-height: 1.7; white-space: pre-line; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDetailsComponent {
  @Input() config!: DetailsConfig;

  getFontFamily(key?: string): string {
    switch (key) {
      case 'serif': return 'var(--font-serif)';
      case 'script': return 'var(--font-script)';
      default: return 'var(--font-sans)';
    }
  }
}
