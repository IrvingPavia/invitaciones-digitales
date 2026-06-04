import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Event } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .event-cards { display: none; }
    .event-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .event-card:hover { border-color: rgba(124,92,191,0.4); }
    .event-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 8px;
    }
    .event-card-name {
      font-size: 15px; font-weight: 600; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .event-card-body {
      display: grid; grid-template-columns: auto 1fr; gap: 6px 12px;
      font-size: 13px; margin-bottom: 12px;
    }
    .event-card-label { color: rgba(255,255,255,0.4); white-space: nowrap; }
    .event-card-value { color: rgba(255,255,255,0.85); overflow: hidden; text-overflow: ellipsis; }
    .event-card-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .desktop-table { display: block; }
    @media (max-width: 768px) {
      .desktop-table { display: none; }
      .event-cards { display: block; }
    }
    .time-picker-field {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 6px 12px; min-width: 52px;
      button { background: none; border: none; cursor: pointer; color: var(--gold); padding: 0; display: flex; align-items: center; }
      button .material-icons { font-size: 18px; }
      button:hover { color: var(--gold-light); }
      small { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
    }
    .time-picker-val { font-size: 20px; font-weight: 700; color: white; font-family: var(--font-serif); min-width: 28px; text-align: center; }
    .time-picker-ampm {
      display: flex; flex-direction: column; gap: 4px;
      button {
        padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
        border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s;
        &.active { background: var(--gold); border-color: var(--gold); color: #1a1a2e; }
        &:hover:not(.active) { border-color: var(--gold); color: var(--gold); }
      }
    }
    .template-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px;
    }
    .template-card {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      cursor: pointer; padding: 8px; border-radius: 10px;
      border: 2px solid transparent; transition: all 0.2s;
    }
    .template-card:hover { border-color: rgba(124,92,191,0.4); }
    .template-card.active { border-color: var(--gold); background: rgba(124,92,191,0.08); }
    .template-preview {
      width: 100%; aspect-ratio: 9/14; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700;
    }
    .template-name { font-size: 11px; color: rgba(255,255,255,0.7); text-align: center; }
  `],
  template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <h2 class="section-title">Eventos</h2>
          <p class="section-subtitle">Gestiona tus eventos de invitaciones</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons">add</span> Nuevo Evento
        </button>
      </div>

      <div class="card desktop-table" style="overflow:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Invitados</th><th>Confirmados</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (e of events(); track e.id) {
              <tr>
                <td><strong>{{ e.name }}</strong><br><small class="text-muted">{{ environment.baseUrl }}/invitacion/{{ e.slug }}</small></td>
                <td><span class="badge badge-info">{{ e.event_type }}</span></td>
                <td>{{ e.event_date | date:'dd/MM/yyyy' }}</td>
                <td>{{ e.total_guests || 0 }}</td>
                <td>{{ e.confirmed_guests || 0 }}</td>
                <td><span class="badge" [class.badge-success]="e.active" [class.badge-danger]="!e.active">{{ e.active ? 'Activo' : 'Inactivo' }}</span></td>
                <td>
                  <div class="flex gap-8">
                    @if (e.event_mode === 'open') {
                      <a [routerLink]="['/dashboard/registrations', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Registrados"><span class="material-icons" style="font-size:16px">how_to_reg</span></a>
                    } @else {
                      <a [routerLink]="['/dashboard/guests', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Invitados"><span class="material-icons" style="font-size:16px">people</span></a>
                    }
                    <a [routerLink]="['/dashboard/config', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Configurar"><span class="material-icons" style="font-size:16px">settings</span></a>
                    <a [routerLink]="['/dashboard/cards', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Tarjetas"><span class="material-icons" style="font-size:16px">style</span></a>
                    <a [href]="environment.baseUrl + '/invitacion/' + e.slug" target="_blank" class="btn btn-primary btn-sm btn-icon" title="Ver Landing"><span class="material-icons" style="font-size:16px">open_in_new</span></a>
                    <button class="btn btn-secondary btn-sm btn-icon" (click)="editEvent(e)" title="Editar"><span class="material-icons" style="font-size:16px">edit</span></button>
                    <button class="btn btn-secondary btn-sm btn-icon" (click)="duplicateEvent(e)" title="Duplicar"><span class="material-icons" style="font-size:16px">content_copy</span></button>
                    <button class="btn btn-danger btn-sm btn-icon" (click)="deleteEvent(e)" title="Eliminar"><span class="material-icons" style="font-size:16px">delete</span></button>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="7" class="text-center text-muted" style="padding:40px">No hay eventos. Crea el primero.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="event-cards">
        @for (e of events(); track e.id) {
          <div class="event-card">
            <div class="event-card-header">
              <span class="event-card-name">{{ e.name }}</span>
              <span class="badge" [class.badge-success]="e.active" [class.badge-danger]="!e.active">{{ e.active ? 'Activo' : 'Inactivo' }}</span>
            </div>
            <div class="event-card-body">
              <span class="event-card-label">Tipo</span>
              <span class="event-card-value"><span class="badge badge-info">{{ e.event_type }}</span></span>
              <span class="event-card-label">Fecha</span>
              <span class="event-card-value">{{ e.event_date | date:'dd/MM/yyyy' }}</span>
              <span class="event-card-label">Invitados</span>
              <span class="event-card-value">{{ e.total_guests || 0 }} total · {{ e.confirmed_guests || 0 }} confirmados</span>
              <span class="event-card-label">URL</span>
              <span class="event-card-value" style="font-size:11px;color:var(--gold);">/invitacion/{{ e.slug }}</span>
            </div>
            <div class="event-card-actions">
              @if (e.event_mode === 'open') {
                <a [routerLink]="['/dashboard/registrations', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Registrados"><span class="material-icons" style="font-size:16px">how_to_reg</span></a>
              } @else {
                <a [routerLink]="['/dashboard/guests', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Invitados"><span class="material-icons" style="font-size:16px">people</span></a>
              }
              <a [routerLink]="['/dashboard/config', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Configurar"><span class="material-icons" style="font-size:16px">settings</span></a>
              <a [routerLink]="['/dashboard/cards', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Tarjetas"><span class="material-icons" style="font-size:16px">style</span></a>
              <a [href]="environment.baseUrl + '/invitacion/' + e.slug" target="_blank" class="btn btn-primary btn-sm btn-icon" title="Ver Landing"><span class="material-icons" style="font-size:16px">open_in_new</span></a>
              <button class="btn btn-secondary btn-sm btn-icon" (click)="editEvent(e)" title="Editar"><span class="material-icons" style="font-size:16px">edit</span></button>
              <button class="btn btn-secondary btn-sm btn-icon" (click)="duplicateEvent(e)" title="Duplicar"><span class="material-icons" style="font-size:16px">content_copy</span></button>
              <button class="btn btn-danger btn-sm btn-icon" (click)="deleteEvent(e)" title="Eliminar"><span class="material-icons" style="font-size:16px">delete</span></button>
            </div>
          </div>
        }
        @empty {
          <div class="card" style="padding:40px;text-align:center">
            <p class="text-muted">No hay eventos. Crea el primero.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Evento' : 'Nuevo Evento' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="closeModal()"><span class="material-icons">close</span></button>
          </div>
          <div class="form-group">
            <label>Nombre del Evento *</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Boda de Ana & Carlos">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Tipo de Evento *</label>
              <select [(ngModel)]="form.event_type">
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
              <label>Fecha del Evento *</label>
              <input type="date" [(ngModel)]="formDate" (ngModelChange)="updateEventDate()">
            </div>
          </div>
          <div class="form-group">
            <label>Hora del Evento</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="time-picker-field">
                <button type="button" (click)="adjustEventTime('h',1)"><span class="material-icons">expand_less</span></button>
                <span class="time-picker-val">{{ formHour % 12 || 12 }}</span>
                <button type="button" (click)="adjustEventTime('h',-1)"><span class="material-icons">expand_more</span></button>
                <small>HR</small>
              </div>
              <span style="font-size:20px;font-weight:700;color:var(--gold);">:</span>
              <div class="time-picker-field">
                <button type="button" (click)="adjustEventTime('m',1)"><span class="material-icons">expand_less</span></button>
                <span class="time-picker-val">{{ formMin | number:'2.0-0' }}</span>
                <button type="button" (click)="adjustEventTime('m',-1)"><span class="material-icons">expand_more</span></button>
                <small>MIN</small>
              </div>
              <div class="time-picker-ampm">
                <button type="button" [class.active]="formHour < 12" (click)="setEventAmPm('AM')">AM</button>
                <button type="button" [class.active]="formHour >= 12" (click)="setEventAmPm('PM')">PM</button>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Slug (URL única) *</label>
            <input type="text" [(ngModel)]="form.slug" placeholder="boda-ana-carlos-2026" [disabled]="editing">
            <small class="text-muted">Solo letras, números y guiones. Ej: boda-ana-carlos-2026</small>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Modo del evento</label>
              <select [(ngModel)]="form.event_mode">
                <option value="private">Privado (con lista de invitados)</option>
                <option value="open">Abierto (registro público con cupo)</option>
              </select>
            </div>
            @if (form.event_mode === 'open') {
              <div class="form-group">
                <label>Cupo máximo</label>
                <input type="number" [(ngModel)]="form.max_capacity" placeholder="100" min="1">
                <small class="text-muted">Dejar vacío = sin límite</small>
              </div>
            }
          </div>
          @if (!editing) {
            <div class="form-group">
              <label>Estilo de landing</label>
              <div class="template-grid">
                @for (tpl of landingTemplates; track tpl.key) {
                  <div class="template-card" [class.active]="form.landing_template === tpl.key" (click)="form.landing_template = tpl.key">
                    <div class="template-preview" [style.background]="tpl.bg">
                      <span class="template-accent" [style.color]="tpl.accent">Aa</span>
                    </div>
                    <span class="template-name">{{ tpl.name }}</span>
                  </div>
                }
              </div>
            </div>
            <small class="text-muted" style="display:block;margin-bottom:16px">La URL de la invitación será: {{ environment.baseUrl }}/invitacion/{{ form.slug }}</small>
          }
          @if (editing) {
            <div class="form-group">
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="form.active">
                <span class="toggle"></span>
                <span>Evento activo</span>
              </label>
            </div>
          }
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class EventsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  events = signal<Event[]>([]);
  showModal = signal(false);
  saving = signal(false);
  editing = false;
  editId = 0;
  environment = environment;
  form: any = { name: '', event_type: 'Boda', event_date: '', slug: '', active: 1, event_mode: 'private', max_capacity: null, landing_template: 'elegante' };
  formDate = '';
  formHour = 19;
  formMin = 0;

  landingTemplates = [
    { key: 'elegante', name: 'Elegante', bg: 'linear-gradient(135deg, #1a1a2e, #0d1117)', accent: '#d4a017' },
    { key: 'moderno', name: 'Moderno', bg: 'linear-gradient(135deg, #1e1e32, #2d2d44)', accent: '#a78bfa' },
    { key: 'romantico', name: 'Romántico', bg: 'linear-gradient(135deg, #2d1525, #1a0a14)', accent: '#f4a7c1' },
    { key: 'festivo', name: 'Festivo', bg: 'linear-gradient(135deg, #1a1a2e, #2d2200)', accent: '#fbbf24' },
    { key: 'corporativo', name: 'Corporativo', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', accent: '#60a5fa' },
  ];

  ngOnInit() { this.load(); }
  load() { this.api.getEvents().subscribe(e => this.events.set(e)); }

  openModal() {
    this.editing = false;
    this.form = { name: '', event_type: 'Boda', event_date: '', slug: '', active: 1, event_mode: 'private', max_capacity: null, landing_template: 'elegante' };
    this.formDate = '';
    this.formHour = 19;
    this.formMin = 0;
    this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }

  editEvent(e: Event) {
    this.editing = true; this.editId = e.id;
    this.form = { name: e.name, event_type: e.event_type, event_date: e.event_date?.slice(0, 16), slug: e.slug, active: e.active, event_mode: e.event_mode || 'private', max_capacity: e.max_capacity || null };
    // Parse date and time
    if (e.event_date) {
      this.formDate = e.event_date.slice(0, 10);
      const timePart = e.event_date.slice(11, 16);
      if (timePart) {
        const [h, m] = timePart.split(':').map(Number);
        this.formHour = h;
        this.formMin = m;
      }
    }
    this.showModal.set(true);
  }

  updateEventDate() {
    if (this.formDate) {
      this.form.event_date = `${this.formDate}T${String(this.formHour).padStart(2, '0')}:${String(this.formMin).padStart(2, '0')}:00`;
    }
  }

  adjustEventTime(unit: 'h' | 'm', delta: number) {
    if (unit === 'h') {
      this.formHour = (this.formHour + delta + 24) % 24;
    } else {
      this.formMin = (this.formMin + delta * 5 + 60) % 60;
    }
    this.updateEventDate();
  }

  setEventAmPm(ampm: string) {
    if (ampm === 'AM' && this.formHour >= 12) this.formHour -= 12;
    if (ampm === 'PM' && this.formHour < 12) this.formHour += 12;
    this.updateEventDate();
  }

  save() {
    if (!this.form.name || !this.form.event_type || !this.formDate || !this.form.slug) return;
    this.updateEventDate();
    // Limpiar slug: quitar protocolo y dominio si el usuario pegó una URL completa
    this.form.slug = this.form.slug
      .replace(/^https?:\/\/[^/]+\/invitacion\//, '')
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    this.saving.set(true);
    const obs = this.editing ? this.api.updateEvent(this.editId, this.form) : this.api.createEvent(this.form);
    obs.subscribe({ next: () => { this.load(); this.closeModal(); this.saving.set(false); }, error: (e) => { this.dialog.alert('Error', e.error?.error || 'Error al guardar'); this.saving.set(false); } });
  }

  async deleteEvent(e: Event) {
    const ok = await this.dialog.confirm('Eliminar evento', `¿Eliminar "${e.name}"? Se eliminarán todos los invitados.`);
    if (!ok) return;
    this.api.deleteEvent(e.id).subscribe(() => this.load());
  }

  async duplicateEvent(e: Event) {
    const ok = await this.dialog.confirm('Duplicar evento', `¿Duplicar "${e.name}"? Se copiará la configuración, tarjetas, itinerario y fotos.`, 'Duplicar');
    if (!ok) return;
    this.api.duplicateEvent(e.id).subscribe({
      next: () => this.load(),
      error: (err: any) => this.dialog.alert('Error', err.error?.error || 'No se pudo duplicar el evento')
    });
  }
}
