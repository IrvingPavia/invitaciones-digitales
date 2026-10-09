import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyEventsService, MyEvent, PostponementCheck } from '../../../core/services/my-events.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow-y: auto; }

    .section-header {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 24px; font-weight: 700; color: white; margin: 0 0 4px;
    }
    .section-subtitle {
      font-size: 14px; color: rgba(255,255,255,0.5); margin: 0;
    }

    .status-group {
      margin-bottom: 32px;
    }
    .status-group-title {
      font-size: 16px; font-weight: 600; color: #c084fc;
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    .status-group-title .badge-count {
      background: rgba(192,132,252,0.15); color: #c084fc;
      border-radius: 12px; padding: 2px 10px; font-size: 12px; font-weight: 700;
    }

    .event-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .event-card:hover { border-color: rgba(124,92,191,0.4); }
    .event-card.completed {
      opacity: 0.5;
      filter: grayscale(0.4);
      pointer-events: none;
    }

    .event-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 12px;
    }
    .event-card-name {
      font-size: 16px; font-weight: 700; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
    }
    .event-card-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 11px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-available { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .badge-active { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-completed { background: rgba(156,163,175,0.15); color: #9ca3af; }

    .event-info {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px; margin-bottom: 16px;
    }
    .info-item {
      display: flex; flex-direction: column; gap: 2px;
    }
    .info-label {
      font-size: 11px; color: rgba(255,255,255,0.4);
      text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;
    }
    .info-value {
      font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;
    }

    /* Activate form */
    .activate-form {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      padding: 16px; background: rgba(255,255,255,0.02);
      border: 1px solid rgba(124,92,191,0.15); border-radius: 10px;
    }
    .activate-form .form-group {
      display: flex; flex-direction: column; gap: 4px;
    }
    .activate-form .form-group.full-width {
      grid-column: 1 / -1;
    }
    .activate-form label {
      font-size: 12px; color: rgba(255,255,255,0.5);
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .activate-form input,
    .activate-form select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 10px 12px;
      color: white; font-size: 14px;
      outline: none; transition: border-color 0.2s;
    }
    .activate-form input:focus,
    .activate-form select:focus {
      border-color: #c084fc;
    }
    .activate-form input.ng-invalid.ng-touched,
    .activate-form select.ng-invalid.ng-touched {
      border-color: #f87171;
    }
    .activate-form select option {
      background: #1a1a2e; color: white;
    }
    .activate-form .btn-activate {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #7c5cbf, #9f7aea);
      border: none; border-radius: 8px; padding: 12px 24px;
      color: white; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      margin-top: 4px;
    }
    .activate-form .btn-activate:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(124,92,191,0.3);
    }
    .activate-form .btn-activate:disabled {
      opacity: 0.5; cursor: not-allowed;
    }

    /* Active event actions */
    .event-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .btn-postpone {
      background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.3);
      border-radius: 8px; padding: 8px 16px;
      color: #fbbf24; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-postpone:hover { background: rgba(251,191,36,0.2); }

    /* Postpone section */
    .postpone-section {
      margin-top: 16px; padding: 16px;
      background: rgba(251,191,36,0.05);
      border: 1px solid rgba(251,191,36,0.2);
      border-radius: 10px;
    }
    .postpone-title {
      font-size: 14px; font-weight: 600; color: #fbbf24; margin-bottom: 12px;
    }
    .postpone-info {
      font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;
      line-height: 1.6;
    }
    .postpone-info ul {
      margin: 6px 0; padding-left: 20px;
    }
    .postpone-info li { margin-bottom: 4px; }
    .postpone-fee {
      font-weight: 700; color: #fbbf24;
    }
    .postpone-error {
      color: #f87171; font-size: 13px; margin-bottom: 12px;
      display: flex; align-items: center; gap: 6px;
    }
    .postpone-form {
      display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px;
    }
    .postpone-form .form-group {
      display: flex; flex-direction: column; gap: 4px;
    }
    .postpone-form label {
      font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 500;
    }
    .postpone-form input,
    .postpone-form select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 10px 12px;
      color: white; font-size: 14px; outline: none;
    }
    .postpone-form input:focus,
    .postpone-form select:focus { border-color: #fbbf24; }
    .postpone-form select option { background: #1a1a2e; color: white; }
    .btn-pay-postpone {
      background: linear-gradient(135deg, #d97706, #f59e0b);
      border: none; border-radius: 8px; padding: 10px 20px;
      color: #1a1a2e; font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-pay-postpone:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }
    .btn-pay-postpone:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel-postpone {
      background: none; border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px; padding: 10px 16px;
      color: rgba(255,255,255,0.6); font-size: 13px;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel-postpone:hover { border-color: rgba(255,255,255,0.4); color: white; }

    /* Loading & empty states */
    .loading-state, .empty-state {
      text-align: center; padding: 60px 20px;
      color: rgba(255,255,255,0.5); font-size: 14px;
    }
    .empty-state .material-icons {
      font-size: 48px; margin-bottom: 12px; opacity: 0.3;
    }

    @media (max-width: 768px) {
      .activate-form { grid-template-columns: 1fr; }
      .event-info { grid-template-columns: 1fr 1fr; }
      .postpone-form { flex-direction: column; align-items: stretch; }
    }
  `],
  template: `
    <div class="section-header">
      <h2 class="section-title">Mis Eventos</h2>
      <p class="section-subtitle">Gestiona tus eventos comprados</p>
    </div>

    @if (loading()) {
      <div class="loading-state">Cargando eventos...</div>
    } @else if (allEvents().length === 0) {
      <div class="empty-state">
        <span class="material-icons">event_busy</span>
        <p>No tienes eventos. Compra un paquete para comenzar.</p>
      </div>
    } @else {
      <!-- Disponibles -->
      @if (availableEvents().length > 0) {
        <div class="status-group">
          <div class="status-group-title">
            <span>Disponibles</span>
            <span class="badge-count">{{ availableEvents().length }}</span>
          </div>
          @for (event of availableEvents(); track event.id) {
            <div class="event-card">
              <div class="event-card-header">
                <span class="event-card-name">Evento disponible #{{ event.id }}</span>
                <span class="event-card-badge badge-available">Disponible</span>
              </div>
              <div class="event-info">
                <div class="info-item">
                  <span class="info-label">Paquete</span>
                  <span class="info-value">{{ event.plan_type }}</span>
                </div>
              </div>
              <form class="activate-form" [formGroup]="getActivateForm(event.id)" (ngSubmit)="activateEvent(event.id)">
                <div class="form-group">
                  <label>Fecha del evento</label>
                  <input type="date" formControlName="event_date">
                </div>
                <div class="form-group">
                  <label>Nombre del evento</label>
                  <input type="text" formControlName="name" placeholder="Mi Boda 2025">
                </div>
                <div class="form-group">
                  <label>Tipo de evento</label>
                  <select formControlName="event_type">
                    <option value="">Seleccionar...</option>
                    <option value="Boda">Boda</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="XV Años">XV Años</option>
                    <option value="Bautizo">Bautizo</option>
                    <option value="Graduación">Graduación</option>
                    <option value="Empresarial">Empresarial</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Slug (URL)</label>
                  <input type="text" formControlName="slug" placeholder="mi-boda-2025">
                </div>
                <button type="submit" class="btn-activate" [disabled]="!getActivateForm(event.id).valid || activating()">
                  {{ activating() ? 'Activando...' : 'Activar' }}
                </button>
              </form>
            </div>
          }
        </div>
      }

      <!-- Activos -->
      @if (activeEvents().length > 0) {
        <div class="status-group">
          <div class="status-group-title">
            <span>Activos</span>
            <span class="badge-count">{{ activeEvents().length }}</span>
          </div>
          @for (event of activeEvents(); track event.id) {
            <div class="event-card">
              <div class="event-card-header">
                <span class="event-card-name">{{ event.name }}</span>
                <span class="event-card-badge badge-active">Activo</span>
              </div>
              <div class="event-info">
                <div class="info-item">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ event.event_date | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Días restantes</span>
                  <span class="info-value">{{ getDaysRemaining(event) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Paquete</span>
                  <span class="info-value">{{ event.plan_type }}</span>
                </div>
              </div>
              <div class="event-actions">
                <button class="btn-postpone" (click)="openPostpone(event.id)">
                  Postergar
                </button>
              </div>

              @if (postponeEventId() === event.id) {
                <div class="postpone-section">
                  <div class="postpone-title">Postergar evento</div>
                  @if (checkingPostpone()) {
                    <div class="postpone-info">Verificando elegibilidad...</div>
                  } @else if (postponeCheck() && !postponeCheck()!.can_postpone) {
                    <div class="postpone-error">
                      <span class="material-icons" style="font-size:16px">error</span>
                      {{ postponeCheck()!.reason }}
                    </div>
                    <button class="btn-cancel-postpone" (click)="closePostpone()">Cerrar</button>
                  } @else if (postponeCheck() && postponeCheck()!.can_postpone) {
                    <div class="postpone-info">
                      <ul>
                        <li>Tarifa de postergación: <span class="postpone-fee">\${{ postponeCheck()!.fee }} MXN</span></li>
                        <li>Solo se permite 1 postergación por evento</li>
                        <li>Debe solicitarse con más de 7 días de anticipación</li>
                      </ul>
                    </div>
                    <div class="postpone-form">
                      <div class="form-group">
                        <label>Nueva fecha</label>
                        <input type="date" [value]="postponeNewDate()" (input)="onPostponeDateChange($event)">
                      </div>
                      <div class="form-group">
                        <label>Pasarela de pago</label>
                        <select [value]="postponeGateway()" (change)="onPostponeGatewayChange($event)">
                          <option value="stripe">Stripe</option>
                          <option value="mercadopago">MercadoPago</option>
                        </select>
                      </div>
                      <button class="btn-pay-postpone" (click)="payPostponement(event.id)" [disabled]="!postponeNewDate() || payingPostpone()">
                        {{ payingPostpone() ? 'Procesando...' : 'Pagar y postergar' }}
                      </button>
                      <button class="btn-cancel-postpone" (click)="closePostpone()">Cancelar</button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Completados -->
      @if (completedEvents().length > 0) {
        <div class="status-group">
          <div class="status-group-title">
            <span>Completados</span>
            <span class="badge-count">{{ completedEvents().length }}</span>
          </div>
          @for (event of completedEvents(); track event.id) {
            <div class="event-card completed">
              <div class="event-card-header">
                <span class="event-card-name">{{ event.name }}</span>
                <span class="event-card-badge badge-completed">Completado</span>
              </div>
              <div class="event-info">
                <div class="info-item">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ event.event_date | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Paquete</span>
                  <span class="info-value">{{ event.plan_type }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tipo</span>
                  <span class="info-value">{{ event.event_type }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    }
  `
})
export class MyEventsComponent implements OnInit {
  private myEventsService = inject(MyEventsService);
  private fb = inject(FormBuilder);

  // State
  loading = signal(true);
  allEvents = signal<MyEvent[]>([]);
  activating = signal(false);

  // Postpone state
  postponeEventId = signal<number | null>(null);
  checkingPostpone = signal(false);
  postponeCheck = signal<PostponementCheck | null>(null);
  postponeNewDate = signal('');
  postponeGateway = signal('stripe');
  payingPostpone = signal(false);

  // Computed groups
  availableEvents = computed(() =>
    this.allEvents().filter(e => e.lifecycle_status === 'available')
  );
  activeEvents = computed(() =>
    this.allEvents().filter(e => e.lifecycle_status === 'active')
  );
  completedEvents = computed(() =>
    this.allEvents().filter(e => e.lifecycle_status === 'completed')
  );

  // Forms map for activate (one per available event)
  private activateForms = new Map<number, FormGroup>();

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading.set(true);
    this.myEventsService.getMyEvents().subscribe({
      next: (response: any) => {
        const events = response.events ?? response;
        this.allEvents.set(events);
        this.loading.set(false);
      },
      error: () => {
        this.allEvents.set([]);
        this.loading.set(false);
      }
    });
  }

  getActivateForm(eventId: number): FormGroup {
    if (!this.activateForms.has(eventId)) {
      this.activateForms.set(eventId, this.fb.group({
        event_date: ['', Validators.required],
        name: ['', Validators.required],
        event_type: ['', Validators.required],
        slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
      }));
    }
    return this.activateForms.get(eventId)!;
  }

  activateEvent(eventId: number) {
    const form = this.getActivateForm(eventId);
    if (!form.valid) return;

    this.activating.set(true);
    const data = form.value;
    this.myEventsService.activateEvent(eventId, {
      event_date: data.event_date,
      name: data.name,
      event_type: data.event_type,
      slug: data.slug
    }).subscribe({
      next: () => {
        this.activating.set(false);
        this.activateForms.delete(eventId);
        this.loadEvents();
      },
      error: () => {
        this.activating.set(false);
      }
    });
  }

  getDaysRemaining(event: MyEvent): string {
    if (!event.event_date) return '—';
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const diffMs = eventDate.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Pasado';
    if (days === 0) return 'Hoy';
    return `${days} día${days > 1 ? 's' : ''}`;
  }

  openPostpone(eventId: number) {
    this.postponeEventId.set(eventId);
    this.checkingPostpone.set(true);
    this.postponeCheck.set(null);
    this.postponeNewDate.set('');
    this.postponeGateway.set('stripe');

    this.myEventsService.checkPostponement(eventId).subscribe({
      next: (result) => {
        this.postponeCheck.set(result);
        this.checkingPostpone.set(false);
      },
      error: () => {
        this.postponeCheck.set({ can_postpone: false, reason: 'Error al verificar elegibilidad', fee: 0 });
        this.checkingPostpone.set(false);
      }
    });
  }

  closePostpone() {
    this.postponeEventId.set(null);
    this.postponeCheck.set(null);
  }

  onPostponeDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.postponeNewDate.set(input.value);
  }

  onPostponeGatewayChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.postponeGateway.set(select.value);
  }

  payPostponement(eventId: number) {
    if (!this.postponeNewDate() || this.payingPostpone()) return;

    this.payingPostpone.set(true);
    this.myEventsService.payPostponement(eventId, {
      gateway: this.postponeGateway(),
      new_date: this.postponeNewDate()
    }).subscribe({
      next: (result) => {
        this.payingPostpone.set(false);
        if (result.session_url) {
          window.location.href = result.session_url;
        }
      },
      error: () => {
        this.payingPostpone.set(false);
      }
    });
  }
}
