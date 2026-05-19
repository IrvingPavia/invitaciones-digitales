import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftsConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-gifts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="gifts" class="landing-section gifts-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">{{ config.title }}</h2>
          <div class="section-line"></div>
        </div>
        <div class="gifts-card reveal">
          <span class="material-icons gifts-icon">card_giftcard</span>
          @if (config.description) {
            <p class="gifts-desc">{{ config.description }}</p>
          }
          @if (config.link) {
            <a [href]="config.link" target="_blank" class="gifts-btn">
              <span class="material-icons">open_in_new</span>
              {{ config.buttonText || 'Ver Lista de Regalos' }}
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .gifts-section { padding: 80px 20px; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .gifts-card {
      background: rgba(0,0,0,0.4); border: 1px solid rgba(212,160,23,0.25);
      border-radius: 16px; padding: 40px;
    }
    .gifts-icon { font-size: 56px; color: var(--gold); opacity: 0.7; margin-bottom: 16px; display: block; }
    .gifts-desc { color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
    .gifts-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: #1a1a2e; font-weight: 700; font-size: 15px;
      padding: 14px 32px; border-radius: 30px; text-decoration: none;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(212,160,23,0.3);
      .material-icons { font-size: 18px; }
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,160,23,0.5); }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingGiftsComponent {
  @Input() config!: GiftsConfig;
}
