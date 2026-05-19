import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DresscodeConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-dresscode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="dresscode" class="landing-section dresscode-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">{{ config.title }}</h2>
          <div class="section-line"></div>
        </div>
        <div class="dresscode-card reveal">
          <span class="material-icons dresscode-icon">checkroom</span>
          <p class="dresscode-desc">{{ config.description }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dresscode-section { padding: 80px 20px; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .dresscode-card {
      background: rgba(0,0,0,0.4); border: 1px solid rgba(212,160,23,0.25);
      border-radius: 16px; padding: 40px;
    }
    .dresscode-icon { font-size: 56px; color: var(--gold); opacity: 0.7; margin-bottom: 16px; display: block; }
    .dresscode-desc { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.8; white-space: pre-line; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingDresscodeComponent {
  @Input() config!: DresscodeConfig;
}
