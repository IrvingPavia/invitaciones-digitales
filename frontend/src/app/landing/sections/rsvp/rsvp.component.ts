import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RsvpConfig, Guest, GlobalTextStyles, SectionIconConfig } from '../../../core/models/models';
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
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >{{ config.title || 'Confirmar Asistencia' }}</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>

        <div class="rsvp-card reveal" [class.no-bg]="config.showCardBg === false">
          @if (confirmed()) {
            <div class="rsvp-success">
              @if (getIcon(); as icon) {
                @if (icon.type === 'material') {
                  <span class="material-icons rsvp-success-icon">{{ icon.value }}</span>
                } @else if (icon.type === 'emoji') {
                  <span class="rsvp-success-icon emoji">{{ icon.value }}</span>
                } @else {
                  <img [src]="icon.value" class="rsvp-success-icon-img" alt="">
                }
              }
              <h3>¡Asistencia Confirmada!</h3>
              <p>{{ successMsg() }}</p>
              <p class="rsvp-count">Total confirmados: <strong>{{ guest.confirmed_count || confirmedCount() }}</strong></p>
            </div>
          } @else if (guest.confirmed) {
            <div class="rsvp-success">
              @if (getIcon(); as icon) {
                @if (icon.type === 'material') {
                  <span class="material-icons rsvp-success-icon">{{ icon.value }}</span>
                } @else if (icon.type === 'emoji') {
                  <span class="rsvp-success-icon emoji">{{ icon.value }}</span>
                } @else {
                  <img [src]="icon.value" class="rsvp-success-icon-img" alt="">
                }
              }
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
                <label style="font-size:14px;color:var(--theme-text-secondary, rgba(255,255,255,0.7));display:block;margin-bottom:12px">
                  ¿Cuántos asistirán? (tú + acompañantes)
                </label>
                <div class="companion-selector">
                  @for (n of companionOptions(); track n) {
                    <button class="companion-btn" [class.active]="selectedCount() === n" (click)="selectedCount.set(n)">{{ n }}</button>
                  }
                </div>

                @if (selectedCount() > 1) {
                  <div style="margin-top:16px">
                    <label style="font-size:13px;color:var(--theme-text-secondary, rgba(255,255,255,0.5));display:block;margin-bottom:8px">
                      Nombres de acompañantes (opcional)
                    </label>
                    @for (i of companionInputs(); track i) {
                      <input type="text" [(ngModel)]="companionNames[i]" [placeholder]="'Acompañante ' + (i+1)"
                             class="rsvp-input">
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
      background: var(--theme-card-bg, rgba(0,0,0,0.5)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 40px;
      &.no-bg { background: transparent; border-color: transparent; }
    }
    .rsvp-for { font-size: 13px; color: var(--theme-text-secondary, rgba(255,255,255,0.5)); letter-spacing: 1px; margin-bottom: 8px; }
    .rsvp-name { font-family: var(--font-serif); font-size: clamp(22px, 4vw, 30px); color: var(--theme-text-primary, white); margin-bottom: 16px; }
    .rsvp-seats {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--theme-card-bg, rgba(212,160,23,0.1)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 6px 16px; color: var(--theme-nav-text, var(--gold)); font-size: 14px; margin-bottom: 24px;
      .material-icons { font-size: 16px; }
    }
    .rsvp-family-names { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .rsvp-name-chip {
      display: flex; align-items: center; gap: 8px;
      background: var(--theme-card-bg, rgba(255,255,255,0.05)); border: 1px solid var(--theme-card-border, rgba(255,255,255,0.1));
      border-radius: 8px; padding: 10px 16px; font-size: 14px; color: var(--theme-text-primary, rgba(255,255,255,0.8));
    }
    .rsvp-companions { margin-bottom: 24px; }
    .companion-selector { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 8px; }
    .companion-btn {
      width: 44px; height: 44px; border-radius: 50%;
      background: var(--theme-card-bg, rgba(255,255,255,0.05)); border: 1px solid var(--theme-card-border, rgba(255,255,255,0.2));
      color: var(--theme-text-primary, white); font-size: 16px; cursor: pointer; transition: all 0.2s;
      &.active { background: var(--theme-btn-bg, var(--gold)); border-color: var(--theme-btn-bg, var(--gold)); color: var(--theme-btn-text, #1a1a2e); font-weight: 700; }
      &:hover:not(.active) { border-color: var(--theme-card-border, var(--gold)); color: var(--theme-nav-text, var(--gold)); }
    }
    .rsvp-input {
      width: 100%; margin-bottom: 8px;
      background: var(--theme-card-bg, rgba(255,255,255,0.05));
      border: 1px solid var(--theme-card-border, rgba(255,255,255,0.15));
      border-radius: 8px; padding: 10px 14px;
      color: var(--theme-text-primary, white); font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      &::placeholder { color: var(--theme-text-secondary, rgba(255,255,255,0.5)); }
      &:focus { outline: none; border-color: var(--theme-text-primary, white); box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-text-primary, white) 15%, transparent); background: var(--theme-card-bg, rgba(255,255,255,0.05)); }
    }
    .rsvp-confirm-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--theme-btn-bg, linear-gradient(135deg, var(--gold), var(--gold-light)));
      color: var(--theme-btn-text, #1a1a2e); font-weight: 700; font-size: 16px;
      padding: 16px 40px; border-radius: 30px; border: none; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      .material-icons { font-size: 20px; }
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .rsvp-success { padding: 20px 0; }
    .rsvp-success-icon { font-size: 64px; color: #5cb85c; display: block; margin-bottom: 16px; }
    .rsvp-success-icon.emoji { font-size: 64px; font-style: normal; }
    .rsvp-success-icon-img { width: 72px; height: 72px; object-fit: contain; margin: 0 auto 16px; display: block; }
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
  @Input() styles?: GlobalTextStyles;
  private api = inject(ApiService);

  getFontFamily(key?: string): string {
    const m: Record<string,string> = {'sans':'var(--font-sans)','serif':'var(--font-serif)','script':'var(--font-script)','cormorant':'var(--font-cormorant)','spumoni':'var(--font-spumoni)','dancing':'var(--font-dancing)','montserrat':'var(--font-montserrat)','raleway':'var(--font-raleway)','cinzel':'var(--font-cinzel)','sacramento':'var(--font-sacramento)','tangerine':'var(--font-tangerine)','alexbrush':'var(--font-alexbrush)','pinyon':'var(--font-pinyon)','josefin':'var(--font-josefin)','baskerville':'var(--font-baskerville)'};
    return m[key||'sans']||'var(--font-sans)';
  }
  getSeparatorBg(): string {
    const c=this.styles?.separatorStyle?.color||'#d4a017',t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'formal':return c;case 'executive':return `linear-gradient(180deg,${c},transparent 40%,transparent 60%,${c})`;case 'festive':return `repeating-linear-gradient(90deg,${c} 0px,${c} 4px,transparent 4px,transparent 10px)`;case 'animated':return `linear-gradient(90deg,transparent,${c},transparent)`;case 'minimal':return `${c}40`;case 'ornamental':return `linear-gradient(90deg,transparent,${c}60,${c},${c}60,transparent)`;default:return `linear-gradient(90deg,transparent,${c}80,transparent)`;}
  }
  getSeparatorHeight(): string {
    const t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'executive':return '4px';case 'festive':return '3px';case 'ornamental':return '2px';default:return '1px';}
  }

  confirmed = signal(false);
  loading = signal(false);
  error = signal('');
  successMsg = signal('');
  selectedCount = signal(1);
  confirmedCount = signal(0);
  companionNames: string[] = [];

  getIcon(): { type: string; value: string } | null {
    const si = this.config.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'check_circle' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'check_circle' };
  }

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
