import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryConfig, ItineraryItem } from '../../../core/models/models';

@Component({
  selector: 'app-landing-itinerary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="itinerary" class="landing-section itinerary-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">{{ config.title || 'Itinerario' }}</h2>
          <div class="section-line"></div>
        </div>

        <div class="timeline">
          @for (item of items; track item.id; let i = $index) {
            <div class="timeline-item" [class.right]="i % 2 !== 0">
              <div class="timeline-content reveal">
                <div class="timeline-icon">
                  <span class="material-icons">{{ item.icon || 'event' }}</span>
                </div>
                <div class="timeline-body">
                  <span class="timeline-time">{{ item.time }}</span>
                  <h4 class="timeline-title">{{ item.title }}</h4>
                  @if (item.description) {
                    <p class="timeline-desc">{{ item.description }}</p>
                  }
                </div>
              </div>
              <div class="timeline-dot"></div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .itinerary-section { padding: 80px 20px; }
    .section-container { max-width: 900px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }

    .timeline { position: relative; padding: 0 20px; }
    .timeline::before {
      content: ''; position: absolute; left: 50%; top: 0; bottom: 0;
      width: 2px; background: linear-gradient(to bottom, transparent, rgba(212,160,23,0.5), transparent);
      transform: translateX(-50%);
    }
    .timeline-item {
      display: flex; justify-content: flex-end;
      padding-right: calc(50% + 30px); margin-bottom: 32px; position: relative;
    }
    .timeline-item.right { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 30px); }
    .timeline-dot {
      position: absolute; left: 50%; top: 20px;
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--gold); border: 3px solid rgba(13,17,23,0.8);
      transform: translateX(-50%);
      box-shadow: 0 0 12px rgba(212,160,23,0.5);
    }
    .timeline-content {
      display: flex; gap: 16px; align-items: flex-start;
      background: rgba(0,0,0,0.45); border: 1px solid rgba(212,160,23,0.2);
      border-radius: 12px; padding: 20px; max-width: 340px;
      transition: transform 0.3s;
      &:hover { transform: translateY(-2px); }
    }
    .timeline-icon {
      width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
      background: rgba(212,160,23,0.1); border: 1px solid rgba(212,160,23,0.3);
      display: flex; align-items: center; justify-content: center;
      .material-icons { font-size: 20px; color: var(--gold); }
    }
    .timeline-time { font-size: 12px; color: var(--gold); font-weight: 600; letter-spacing: 1px; }
    .timeline-title { font-family: var(--font-serif); font-size: 16px; color: white; margin: 4px 0; }
    .timeline-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) {
      .timeline::before { left: 20px; }
      .timeline-item, .timeline-item.right { padding: 0 0 0 52px; justify-content: flex-start; }
      .timeline-dot { left: 20px; }
    }
  `]
})
export class LandingItineraryComponent {
  @Input() config!: ItineraryConfig;
  @Input() items: ItineraryItem[] = [];
}
