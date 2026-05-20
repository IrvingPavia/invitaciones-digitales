import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Event } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

      <div class="card" style="overflow:auto">
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
                    <a [routerLink]="['/dashboard/guests', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Invitados"><span class="material-icons" style="font-size:16px">people</span></a>
                    <a [routerLink]="['/dashboard/config', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Configurar"><span class="material-icons" style="font-size:16px">settings</span></a>
                    <a [routerLink]="['/dashboard/cards', e.id]" class="btn btn-secondary btn-sm btn-icon" title="Tarjetas"><span class="material-icons" style="font-size:16px">style</span></a>
                    <a [href]="environment.baseUrl + '/invitacion/' + e.slug" target="_blank" class="btn btn-primary btn-sm btn-icon" title="Ver Landing"><span class="material-icons" style="font-size:16px">open_in_new</span></a>
                    <button class="btn btn-secondary btn-sm btn-icon" (click)="editEvent(e)" title="Editar"><span class="material-icons" style="font-size:16px">edit</span></button>
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
            <input type="text" [(ngModel)]="form.name" placeholder="XV Años de Valeria">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Tipo de Evento *</label>
              <select [(ngModel)]="form.event_type">
                <option value="XV Años">XV Años</option>
                <option value="Boda">Boda</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Graduación">Graduación</option>
                <option value="Empresarial">Empresarial</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha del Evento *</label>
              <input type="datetime-local" [(ngModel)]="form.event_date">
            </div>
          </div>
          <div class="form-group">
            <label>Slug (URL única) *</label>
            <input type="text" [(ngModel)]="form.slug" placeholder="xv-valeria-2025" [disabled]="editing">
            <small class="text-muted">Solo letras, números y guiones. Ej: xv-valeria-2025</small>
          </div>
          @if (!editing) {
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
  events = signal<Event[]>([]);
  showModal = signal(false);
  saving = signal(false);
  editing = false;
  editId = 0;
  environment = environment;
  form: any = { name: '', event_type: 'XV Años', event_date: '', slug: '', active: 1 };

  ngOnInit() { this.load(); }
  load() { this.api.getEvents().subscribe(e => this.events.set(e)); }

  openModal() { this.editing = false; this.form = { name: '', event_type: 'XV Años', event_date: '', slug: '', active: 1 }; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  editEvent(e: Event) {
    this.editing = true; this.editId = e.id;
    this.form = { name: e.name, event_type: e.event_type, event_date: e.event_date?.slice(0, 16), slug: e.slug, active: e.active };
    this.showModal.set(true);
  }

  save() {
    if (!this.form.name || !this.form.event_type || !this.form.event_date || !this.form.slug) return;
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
    obs.subscribe({ next: () => { this.load(); this.closeModal(); this.saving.set(false); }, error: (e) => { alert(e.error?.error || 'Error'); this.saving.set(false); } });
  }

  deleteEvent(e: Event) {
    if (!confirm(`¿Eliminar "${e.name}"? Se eliminarán todos los invitados.`)) return;
    this.api.deleteEvent(e.id).subscribe(() => this.load());
  }
}
