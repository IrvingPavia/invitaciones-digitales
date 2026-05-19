import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenuesConfig } from '../../../core/models/models';

@Component({
  selector: 'app-landing-venues',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="venues" class="landing-section venues-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">Lugares del Evento</h2>
          <div class="section-line"></div>
        </div>

        <div class="venues-grid">
          @for (venue of config.items; track venue.id) {
            <div class="venue-card reveal">
              <div class="venue-icon">
                @if (venue.icon) {
                  <img [src]="venue.icon" [alt]="venue.title">
                } @else {
                  <span class="material-icons">place</span>
                }
              </div>
              <h3 class="venue-title">{{ venue.title }}</h3>
              <p class="venue-name">{{ venue.name }}</p>
              @if (venue.address) {
                <p class="venue-address">{{ venue.address }}</p>
              }
              @if (venue.time) {
                <div class="venue-time">
                  <span class="material-icons">schedule</span>
                  <span>{{ formatTime(venue.time) }}</span>
                </div>
              }
              @if (venue.mapsUrl) {
                <a [href]="venue.mapsUrl" target="_blank" class="venue-maps-btn">
                  <span class="material-icons">map</span> Cómo llegar
                </a>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .venues-section { padding: 80px 20px; }
    .section-container { max-width: 900px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .venues-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .venue-card {
      background: rgba(0,0,0,0.45); border: 1px solid rgba(212,160,23,0.25);
      border-radius: 16px; padding: 32px 24px; text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(212,160,23,0.15); }
    }
    .venue-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(212,160,23,0.1); border: 1px solid rgba(212,160,23,0.3);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
      .material-icons { font-size: 32px; color: var(--gold); }
    }
    .venue-title {
      font-family: var(--font-serif); font-size: 18px;
      color: var(--gold); margin-bottom: 8px;
    }
    .venue-name { color: white; font-size: 15px; font-weight: 600; margin-bottom: 6px; }
    .venue-address { color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
    .venue-time {
      display: inline-flex; align-items: center; gap: 6px;
      color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 16px;
      .material-icons { font-size: 16px; color: var(--gold); }
    }
    .venue-maps-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: rgba(212,160,23,0.15); border: 1px solid rgba(212,160,23,0.4);
      border-radius: 24px; padding: 10px 20px; margin-top: 8px;
      color: var(--gold); font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.3s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(212,160,23,0.25); transform: translateY(-1px); }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingVenuesComponent {
  @Input() config!: VenuesConfig;

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
