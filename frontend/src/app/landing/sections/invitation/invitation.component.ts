import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationConfig, Guest } from '../../../core/models/models';

@Component({
  selector: 'app-landing-invitation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="invitation" class="landing-section">
      <div class="section-container">
        <div class="invitation-ornament">✦ ✦ ✦</div>
        <h2 class="invitation-title reveal">{{ config.title }}</h2>
        @if (config.subtitle) {
          <p class="invitation-subtitle reveal">{{ config.subtitle }}</p>
        }

        @if (guest) {
          <div class="invitation-card reveal">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño invitamos a</p>
              <h3 class="invitation-name">{{ guest.family_name || guest.guest_names }}</h3>
              @if (guest.guest_type === 'family') {
                <div class="invitation-names-list">
                  @for (name of guestNames(); track name) {
                    <span class="guest-name-chip">{{ name.trim() }}</span>
                  }
                </div>
              }
              <div class="invitation-count">
                <span class="material-icons">people</span>
                <span>{{ guestCount() }} {{ guestCount() === 1 ? 'asistente' : 'asistentes' }}</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="invitation-card reveal">
            <div class="invitation-card-inner">
              <p class="invitation-for">Con mucho cariño los invitamos a celebrar</p>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:8px">Escanea el código QR de tu invitación para ver tu nombre</p>
            </div>
          </div>
        }

        <div class="invitation-ornament" style="transform:rotate(180deg)">✦ ✦ ✦</div>
      </div>
    </section>
  `,
  styles: [`
    .landing-section {
      padding: 80px 20px; position: relative;
    }
    .section-container { max-width: 800px; margin: 0 auto; text-align: center; }
    .invitation-ornament { color: var(--gold); font-size: 18px; letter-spacing: 8px; opacity: 0.6; margin: 16px 0; }
    .invitation-title {
      font-family: var(--font-script); font-size: clamp(32px, 7vw, 56px);
      color: var(--gold); margin: 16px 0;
      text-shadow: 0 0 30px rgba(212,160,23,0.3);
    }
    .invitation-subtitle { color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 40px; }
    .invitation-card {
      background: rgba(0,0,0,0.4); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 16px; padding: 40px; margin: 32px auto;
      max-width: 500px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,160,23,0.1);
    }
    .invitation-for { color: rgba(255,255,255,0.6); font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
    .invitation-name {
      font-family: var(--font-serif); font-size: clamp(24px, 5vw, 36px);
      color: white; margin-bottom: 16px;
    }
    .invitation-names-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 20px; }
    .guest-name-chip {
      background: rgba(212,160,23,0.15); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 20px; padding: 4px 14px; font-size: 13px; color: rgba(255,255,255,0.8);
    }
    .invitation-count {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(212,160,23,0.1); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 20px; padding: 8px 20px;
      color: var(--gold); font-size: 15px; font-weight: 600;
      .material-icons { font-size: 18px; }
    }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingInvitationComponent {
  @Input() config!: InvitationConfig;
  @Input() guest: Guest | null = null;

  guestNames() { return this.guest?.guest_names.split(',') || []; }
  guestCount() {
    if (!this.guest) return 0;
    return this.guest.guest_type === 'family'
      ? this.guest.guest_names.split(',').length
      : this.guest.max_companions + 1;
  }
}
