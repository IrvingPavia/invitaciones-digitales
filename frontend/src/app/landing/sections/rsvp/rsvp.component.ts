import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RsvpConfig, Guest } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-landing-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="rsvp" class="landing-section rsvp-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line"></div>
          <h2 class="section-heading">{{ config.title || 'Confirmar Asistencia' }}</h2>
          <div class="section-line"></div>
        </div>

        <div class="rsvp-card reveal">
          @if (confirmed()) {
            <div class="rsvp-success">
              <span class="material-icons rsvp-success-icon">check_circle</span>
              <h3>¡Asistencia Confirmada!</h3>
              <p>{{ successMsg() }}</p>
              <p class="rsvp-count">Total confirmados: <strong>{{ guest.confirmed_count || confirmedCount() }}</strong></p>
            </div>
          } @else if (guest.confirmed) {
            <div class="rsvp-success">
              <span class="material-icons rsvp-success-icon">check_circle</span>
              <h3>Ya confirmaste tu asistencia</h3>
              <p>Total confirmados: <strong>{{ guest.confirmed_count }}</strong></p>
            </div>
          } @else {
            <div class="rsvp-header">
              <p class="rsvp-for">Confirmación de asistencia para</p>
              <h3 class="rsvp-name">{{ guest.family_name || guest.guest_names }}</h3>
              <div class="rsvp-seats">
                <span class="material-icons">people</span>
                <span>{{ totalSeats() }} {{ totalSeats() === 1 ? 'lugar' : 'lugares' }} reservados</span>
              </div>
            </div>

            <!-- Family: show names, no selection -->
            @if (guest.guest_type === 'family') {
              <div class="rsvp-family-names">
                @for (name of guestNames(); track name) {
                  <div class="rsvp-name-chip">
                    <span class="material-icons" style="font-size:16px;color:var(--gold)">person</span>
                    {{ name.trim() }}
                  </div>
                }
              </div>
            }

            <!-- Individual: companion selection -->
            @if (guest.guest_type === 'individual' && guest.max_companions > 0) {
              <div class="rsvp-companions">
                <label style="font-size:14px;color:rgba(255,255,255,0.7);display:block;margin-bottom:12px">
                  ¿Cuántos asistirán? (tú + acompañantes)
                </label>
                <div class="companion-selector">
                  @for (n of companionOptions(); track n) {
                    <button class="companion-btn" [class.active]="selectedCount() === n" (click)="selectedCount.set(n)">{{ n }}</button>
                  }
                </div>

                @if (selectedCount() > 1) {
                  <div style="margin-top:16px">
                    <label style="font-size:13px;color:rgba(255,255,255,0.5);display:block;margin-bottom:8px">
                      Nombres de acompañantes (opcional)
                    </label>
                    @for (i of companionInputs(); track i) {
                      <input type="text" [(ngModel)]="companionNames[i]" [placeholder]="'Acompañante ' + (i+1)"
                             style="width:100%;margin-bottom:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:10px 14px;color:white;font-size:14px">
                    }
                  </div>
                }
              </div>
            }

            @if (error()) {
              <p style="color:#ff6b7a;font-size:13px;text-align:center;margin-bottom:12px">{{ error() }}</p>
            }

            <button class="rsvp-confirm-btn" (click)="confirm()" [disabled]="loading()">
              <span class="material-icons">{{ loading() ? 'hourglass_empty' : 'check_circle' }}</span>
              {{ loading() ? 'Confirmando...' : 'Confirmar Asistencia' }}
            </button>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .rsvp-section { padding: 80px 20px; }
    .section-container { max-width: 600px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .rsvp-card {
      background: rgba(0,0,0,0.5); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 20px; padding: 40px;
    }
    .rsvp-for { font-size: 13px; color: rgba(255,255,255,0.5); letter-spacing: 1px; margin-bottom: 8px; }
    .rsvp-name { font-family: var(--font-serif); font-size: clamp(22px, 4vw, 30px); color: white; margin-bottom: 16px; }
    .rsvp-seats {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(212,160,23,0.1); border: 1px solid rgba(212,160,23,0.3);
      border-radius: 20px; padding: 6px 16px; color: var(--gold); font-size: 14px; margin-bottom: 24px;
      .material-icons { font-size: 16px; }
    }
    .rsvp-family-names { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .rsvp-name-chip {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 10px 16px; font-size: 14px; color: rgba(255,255,255,0.8);
    }
    .rsvp-companions { margin-bottom: 24px; }
    .companion-selector { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 8px; }
    .companion-btn {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2);
      color: white; font-size: 16px; cursor: pointer; transition: all 0.2s;
      &.active { background: var(--gold); border-color: var(--gold); color: #1a1a2e; font-weight: 700; }
      &:hover:not(.active) { border-color: var(--gold); color: var(--gold); }
    }
    .rsvp-confirm-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: #1a1a2e; font-weight: 700; font-size: 16px;
      padding: 16px 40px; border-radius: 30px; border: none; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(212,160,23,0.3);
      .material-icons { font-size: 20px; }
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,160,23,0.5); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .rsvp-success { padding: 20px 0; }
    .rsvp-success-icon { font-size: 64px; color: #5cb85c; display: block; margin-bottom: 16px; }
    .rsvp-success h3 { font-family: var(--font-serif); font-size: 24px; color: white; margin-bottom: 8px; }
    .rsvp-success p { color: rgba(255,255,255,0.6); font-size: 15px; }
    .rsvp-count { margin-top: 12px; color: var(--gold) !important; font-size: 16px !important; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingRsvpComponent {
  @Input() config!: RsvpConfig;
  @Input() guest!: Guest;
  @Input() slug = '';
  private api = inject(ApiService);

  confirmed = signal(false);
  loading = signal(false);
  error = signal('');
  successMsg = signal('');
  selectedCount = signal(1);
  confirmedCount = signal(0);
  companionNames: string[] = [];

  guestNames() { return this.guest.guest_names.split(','); }

  totalSeats() {
    return this.guest.guest_type === 'family'
      ? this.guest.guest_names.split(',').length
      : this.guest.max_companions + 1;
  }

  companionOptions() {
    return Array.from({ length: this.guest.max_companions + 1 }, (_, i) => i + 1);
  }

  companionInputs() {
    return Array.from({ length: this.selectedCount() - 1 }, (_, i) => i);
  }

  confirm() {
    this.loading.set(true); this.error.set('');
    const names = this.guest.guest_type === 'family'
      ? this.guest.guest_names
      : [this.guest.guest_names, ...this.companionNames.filter(n => n.trim())].join(', ');

    this.api.confirmRsvp(this.guest.unique_code, {
      confirmed_names: names,
      confirmed_count: this.guest.guest_type === 'family' ? this.totalSeats() : this.selectedCount()
    }).subscribe({
      next: (r) => {
        this.confirmed.set(true);
        this.confirmedCount.set(r.confirmed_count);
        this.successMsg.set(r.message);
        this.loading.set(false);
      },
      error: (e) => { this.error.set(e.error?.error || 'Error al confirmar'); this.loading.set(false); }
    });
  }
}
