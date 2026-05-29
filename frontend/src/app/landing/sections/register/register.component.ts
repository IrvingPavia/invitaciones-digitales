import { Component, Input, signal, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalTextStyles, RsvpConfig, RegistrationFieldConfig } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';

interface CountryCode {
  code: string;
  iso: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-landing-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="rsvp" class="landing-section register-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          <h2 class="section-heading"
              [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
              [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
              [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
          >{{ config?.title || 'Registro' }}</h2>
          <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
        </div>

        <div class="register-card reveal">
          @if (registered()) {
            <div class="register-success">
              <span class="material-icons success-icon">check_circle</span>
              <h3>¡Registro exitoso!</h3>
              <p>Tu lugar ha sido reservado.</p>
              @if (capacity()) {
                <p class="register-count">Registrados: <strong>{{ registeredCount() }}</strong> / {{ capacity() }}</p>
              }
            </div>
          } @else if (isFull()) {
            <div class="register-full">
              <span class="material-icons full-icon">event_busy</span>
              <h3>Cupo lleno</h3>
              <p>Lo sentimos, el evento ha alcanzado su capacidad máxima.</p>
              @if (capacity()) {
                <p class="register-count">Capacidad: <strong>{{ capacity() }}</strong> personas</p>
              }
            </div>
          } @else {
            <div class="register-form">
              @if (capacity()) {
                <div class="capacity-badge">
                  <span class="material-icons">people</span>
                  <span>{{ registeredCount() }} / {{ capacity() }} lugares ocupados</span>
                </div>
              }

              @for (field of fields(); track field.key) {
                @if (field.enabled) {
                  <div class="form-field">
                    <label>{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                    @if (field.type === 'phone') {
                      <div class="phone-row">
                        <div class="phone-code-dropdown" (click)="toggleDropdown($event)">
                          <span class="phone-code-flag">{{ selectedCountry.flag }}</span>
                          <span class="phone-code-text">{{ selectedCountry.code }}</span>
                          <span class="material-icons phone-code-arrow">expand_more</span>
                        </div>
                        @if (dropdownOpen()) {
                          <div class="phone-dropdown-list">
                            @for (country of countries; track country.iso) {
                              <div class="phone-dropdown-item" [class.active]="country.iso === selectedCountry.iso" (click)="selectCountry(country)">
                                <span class="phone-dropdown-flag">{{ country.flag }}</span>
                                <span class="phone-dropdown-name">{{ country.name }}</span>
                                <span class="phone-dropdown-code">{{ country.code }}</span>
                              </div>
                            }
                          </div>
                        }
                        <input type="tel" [(ngModel)]="formData[field.key]" placeholder="123 456 7890" class="register-input phone-number">
                      </div>
                    } @else {
                      <input [type]="field.type" [(ngModel)]="formData[field.key]" [placeholder]="getPlaceholder(field)" class="register-input">
                    }
                  </div>
                }
              }

              @if (error()) {
                <p class="error-msg">{{ error() }}</p>
              }

              <button class="register-btn" (click)="submit()" [disabled]="loading()">
                <span class="material-icons">{{ loading() ? 'hourglass_empty' : 'how_to_reg' }}</span>
                {{ loading() ? 'Registrando...' : 'Registrarme' }}
              </button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .register-section { padding: 80px 20px; }
    .section-container { max-width: 600px; margin: 0 auto; text-align: center; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); white-space: nowrap; }
    .register-card {
      background: var(--theme-card-bg, rgba(0,0,0,0.5));
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 40px;
    }
    .capacity-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--theme-card-bg, rgba(212,160,23,0.1));
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 20px; padding: 6px 16px;
      color: var(--theme-nav-text, var(--gold)); font-size: 14px; margin-bottom: 24px;
    }
    .capacity-badge .material-icons { font-size: 16px; }
    .form-field { margin-bottom: 16px; text-align: left; }
    .form-field label {
      display: block; font-size: 13px; margin-bottom: 6px;
      color: var(--theme-text-secondary, rgba(255,255,255,0.6));
    }
    .register-input {
      width: 100%; background: var(--theme-card-bg, rgba(255,255,255,0.05));
      border: 1px solid var(--theme-card-border, rgba(255,255,255,0.15));
      border-radius: 10px; padding: 12px 16px;
      color: var(--theme-text-primary, white); font-size: 15px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .register-input::placeholder { color: var(--theme-text-secondary, rgba(255,255,255,0.4)); }
    .register-input:focus {
      outline: none; border-color: var(--theme-btn-bg, var(--gold));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-btn-bg, var(--gold)) 15%, transparent);
    }
    .error-msg { color: #ff6b7a; font-size: 13px; text-align: center; margin-bottom: 12px; }
    .phone-row { display: flex; gap: 8px; position: relative; }
    .phone-code-dropdown {
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      background: var(--theme-card-bg, rgba(255,255,255,0.05));
      border: 1px solid var(--theme-card-border, rgba(255,255,255,0.15));
      border-radius: 10px; padding: 10px 12px; min-width: 105px;
      transition: border-color 0.2s;
    }
    .phone-code-dropdown:hover { border-color: var(--theme-btn-bg, var(--gold)); }
    .phone-code-flag { font-size: 20px; line-height: 1; }
    .phone-code-text { font-size: 14px; color: var(--theme-text-primary, white); font-weight: 600; }
    .phone-code-arrow { font-size: 18px; color: var(--theme-text-secondary, rgba(255,255,255,0.5)); margin-left: auto; }
    .phone-dropdown-list {
      position: absolute; top: 100%; left: 0; z-index: 100;
      background: #1a1a2e; border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 12px; margin-top: 4px; padding: 6px;
      max-height: 240px; overflow-y: auto; min-width: 240px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    .phone-dropdown-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px; cursor: pointer;
      transition: background 0.15s;
    }
    .phone-dropdown-item:hover { background: rgba(124,92,191,0.15); }
    .phone-dropdown-item.active { background: rgba(124,92,191,0.2); }
    .phone-dropdown-flag { font-size: 20px; line-height: 1; }
    .phone-dropdown-name { flex: 1; font-size: 13px; color: var(--theme-text-primary, white); }
    .phone-dropdown-code { font-size: 13px; color: var(--theme-text-secondary, rgba(255,255,255,0.5)); font-weight: 600; }
    .phone-number { flex: 1; }
    .register-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--theme-btn-bg, linear-gradient(135deg, var(--gold), var(--gold-light)));
      color: var(--theme-btn-text, #1a1a2e); font-weight: 700; font-size: 16px;
      padding: 16px 40px; border-radius: 30px; border: none; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); margin-top: 8px;
    }
    .register-btn .material-icons { font-size: 20px; }
    .register-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
    .register-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .register-success, .register-full { padding: 20px 0; }
    .success-icon { font-size: 64px; color: #5cb85c; display: block; margin-bottom: 16px; }
    .full-icon { font-size: 64px; color: #f0ad4e; display: block; margin-bottom: 16px; }
    .register-success h3, .register-full h3 { font-family: var(--font-serif); font-size: 24px; color: white; margin-bottom: 8px; }
    .register-success p, .register-full p { color: rgba(255,255,255,0.6); font-size: 15px; }
    .register-count { margin-top: 12px; color: var(--theme-nav-text, var(--gold)) !important; font-size: 16px !important; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingRegisterComponent implements OnInit {
  @Input() config!: RsvpConfig;
  @Input() slug = '';
  @Input() styles?: GlobalTextStyles;
  private api = inject(ApiService);
  private elRef = inject(ElementRef);

  formData: Record<string, string> = {};
  registered = signal(false);
  isFull = signal(false);
  loading = signal(false);
  error = signal('');
  registeredCount = signal(0);
  capacity = signal<number | null>(null);
  fields = signal<RegistrationFieldConfig[]>([]);
  dropdownOpen = signal(false);

  countries: CountryCode[] = [
    { code: '+52', iso: 'MX', name: 'México', flag: '🇲🇽' },
    { code: '+1', iso: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+57', iso: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: '+54', iso: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: '+56', iso: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: '+51', iso: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: '+593', iso: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+58', iso: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+502', iso: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+503', iso: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+504', iso: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: '+506', iso: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', iso: 'PA', name: 'Panamá', flag: '🇵🇦' },
    { code: '+505', iso: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+591', iso: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+595', iso: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+598', iso: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+55', iso: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: '+34', iso: 'ES', name: 'España', flag: '🇪🇸' },
    { code: '+44', iso: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
    { code: '+33', iso: 'FR', name: 'Francia', flag: '🇫🇷' },
    { code: '+49', iso: 'DE', name: 'Alemania', flag: '🇩🇪' },
  ];

  selectedCountry: CountryCode = this.countries[0];

  private defaultFields: RegistrationFieldConfig[] = [
    { key: 'name', label: 'Nombre completo', type: 'text', enabled: true, required: true },
    { key: 'email', label: 'Email', type: 'email', enabled: true, required: false },
    { key: 'phone', label: 'Teléfono', type: 'phone', enabled: true, required: false },
  ];

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.dropdownOpen() && !this.elRef.nativeElement.querySelector('.phone-row')?.contains(e.target)) {
      this.dropdownOpen.set(false);
    }
  }

  ngOnInit() {
    const configured = this.config?.registrationFields;
    this.fields.set(configured && configured.length > 0 ? configured : this.defaultFields);

    this.api.getRegistrationStatus(this.slug).subscribe({
      next: (status) => {
        if (status.mode === 'open') {
          this.registeredCount.set(status.registered || 0);
          this.capacity.set(status.capacity || null);
          this.isFull.set(status.full || false);
        }
      }
    });
  }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectCountry(country: CountryCode) {
    this.selectedCountry = country;
    this.dropdownOpen.set(false);
  }

  getPlaceholder(field: RegistrationFieldConfig): string {
    switch (field.type) {
      case 'email': return 'correo@ejemplo.com';
      case 'phone': return '123 456 7890';
      default: return field.label;
    }
  }

  submit() {
    for (const field of this.fields()) {
      if (field.enabled && field.required && !this.formData[field.key]?.trim()) {
        this.error.set(`${field.label} es requerido`);
        return;
      }
    }

    const data: any = { name: this.formData['name']?.trim() || '' };
    if (this.formData['email']) data.email = this.formData['email'].trim();
    if (this.formData['phone']) data.phone = `${this.selectedCountry.code} ${this.formData['phone'].trim()}`;
    if (this.formData['company']) data.company = this.formData['company'].trim();
    if (this.formData['position']) data.position = this.formData['position'].trim();

    this.loading.set(true); this.error.set('');
    this.api.publicRegister(this.slug, data).subscribe({
      next: (r) => {
        this.registered.set(true);
        this.registeredCount.set(r.registered);
        this.capacity.set(r.capacity);
        this.loading.set(false);
      },
      error: (e) => {
        if (e.error?.full) { this.isFull.set(true); }
        this.error.set(e.error?.error || 'Error al registrar');
        this.loading.set(false);
      }
    });
  }

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
}
