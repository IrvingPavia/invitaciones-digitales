import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../core/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .user-cards { display: none; }
    .user-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px; padding: 16px; margin-bottom: 12px;
    }
    .user-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
    .user-card-name { font-size: 15px; font-weight: 600; color: white; flex: 1; min-width: 0; }
    .user-card-body { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 13px; margin-bottom: 12px; }
    .user-card-label { color: rgba(255,255,255,0.4); }
    .user-card-value { color: rgba(255,255,255,0.85); }
    .user-card-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
    .desktop-table { display: block; }
    .event-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .event-chip { background: rgba(124,92,191,0.15); border: 1px solid rgba(124,92,191,0.3); border-radius: 12px; padding: 2px 8px; font-size: 11px; color: var(--gold-light); }
    .event-select-list { max-height: 150px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; }
    .event-select-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 13px; color: rgba(255,255,255,0.7); transition: background 0.2s; }
    .event-select-item:hover { background: rgba(124,92,191,0.1); }
    .password-display {
      background: rgba(124,92,191,0.1); border: 1px solid rgba(124,92,191,0.3);
      border-radius: 8px; padding: 12px 16px; margin-top: 12px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .password-display code { color: var(--gold-light); font-size: 16px; font-weight: 600; letter-spacing: 1px; }
    .password-display .btn { flex-shrink: 0; }
    .toggle-pill-inline {
      display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: rgba(255,255,255,0.7); user-select: none; margin-top: 24px;
    }
    .toggle-pill-dot-sm {
      width: 36px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.15); position: relative; transition: all 0.3s;
    }
    .toggle-pill-dot-sm::after {
      content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.4); top: 2px; left: 2px; transition: all 0.3s;
    }
    .toggle-pill-dot-sm.active { background: var(--gold); }
    .toggle-pill-dot-sm.active::after { left: 18px; background: white; }
    @media (max-width: 768px) { .desktop-table { display: none; } .user-cards { display: block; } }
  `],
  template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <h2 class="section-title">Usuarios</h2>
          <p class="section-subtitle">Gestiona los usuarios del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons">person_add</span> Nuevo Usuario
        </button>
      </div>

      <!-- Generated password display -->
      @if (generatedPassword()) {
        <div class="password-display mb-16">
          <div>
            <small style="color:rgba(255,255,255,0.5);display:block;margin-bottom:4px;">Contraseña generada para {{ generatedForUser() }}</small>
            <code>{{ generatedPassword() }}</code>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="copyPassword()"><span class="material-icons" style="font-size:16px">content_copy</span></button>
        </div>
      }

      <!-- Desktop table -->
      <div class="card desktop-table" style="overflow:auto">
        <table class="data-table">
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Gestión</th><th>Eventos</th><th>Creado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td><strong>{{ u.username }}</strong></td>
                <td><span class="badge" [class.badge-danger]="u.role==='root'" [class.badge-info]="u.role==='admin'" [class.badge-warning]="u.role==='client'">{{ u.role }}</span></td>
                <td>{{ u.can_manage_users ? 'Sí' : '—' }}</td>
                <td>
                  <div class="event-chips">
                    @for (ev of u.events; track ev.id) { <span class="event-chip">{{ ev.name }}</span> }
                    @if (!u.events?.length && u.role !== 'client') { <span class="text-muted">Todos</span> }
                    @if (!u.events?.length && u.role === 'client') { <span class="text-muted">—</span> }
                  </div>
                </td>
                <td>{{ u.created_at | date:'dd/MM/yy' }}</td>
                <td>
                  <div class="flex gap-8">
                    @if (u.role !== 'root' || currentUser?.role === 'root') {
                      <button class="btn btn-secondary btn-sm btn-icon" (click)="editUser(u)" title="Editar"><span class="material-icons" style="font-size:16px">edit</span></button>
                      <button class="btn btn-secondary btn-sm btn-icon" (click)="resetPassword(u)" title="Resetear contraseña"><span class="material-icons" style="font-size:16px">lock_reset</span></button>
                    }
                    @if (u.role !== 'root' && u.id !== currentUser?.id) {
                      <button class="btn btn-danger btn-sm btn-icon" (click)="deleteUser(u)" title="Eliminar"><span class="material-icons" style="font-size:16px">delete</span></button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="user-cards">
        @for (u of users(); track u.id) {
          <div class="user-card">
            <div class="user-card-header">
              <span class="user-card-name">{{ u.username }}</span>
              <span class="badge" [class.badge-danger]="u.role==='root'" [class.badge-info]="u.role==='admin'" [class.badge-warning]="u.role==='client'">{{ u.role }}</span>
            </div>
            <div class="user-card-body">
              <span class="user-card-label">Gestión</span>
              <span class="user-card-value">{{ u.can_manage_users ? 'Sí' : '—' }}</span>
              <span class="user-card-label">Eventos</span>
              <span class="user-card-value">
                @if (u.events?.length) { {{ u.events.length }} asignado(s) }
                @else if (u.role !== 'client') { Todos }
                @else { — }
              </span>
            </div>
            <div class="user-card-actions">
              @if (u.role !== 'root' || currentUser?.role === 'root') {
                <button class="btn btn-secondary btn-sm btn-icon" (click)="editUser(u)"><span class="material-icons" style="font-size:16px">edit</span></button>
                <button class="btn btn-secondary btn-sm btn-icon" (click)="resetPassword(u)"><span class="material-icons" style="font-size:16px">lock_reset</span></button>
              }
              @if (u.role !== 'root' && u.id !== currentUser?.id) {
                <button class="btn btn-danger btn-sm btn-icon" (click)="deleteUser(u)"><span class="material-icons" style="font-size:16px">delete</span></button>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="closeModal()"><span class="material-icons">close</span></button>
          </div>
          <div class="form-group">
            <label>Nombre de usuario *</label>
            <input type="text" [(ngModel)]="form.username" placeholder="usuario123" [disabled]="editing && form.role === 'root'">
          </div>
          @if (editing) {
            <div class="form-group">
              <label>Nueva contraseña (dejar vacío para no cambiar)</label>
              <input type="text" [(ngModel)]="form.password" placeholder="Dejar vacío...">
            </div>
          } @else {
            <div class="form-group">
              <label>Contraseña (se genera automáticamente si se deja vacío)</label>
              <input type="text" [(ngModel)]="form.password" placeholder="Auto-generada si vacío">
            </div>
          }
          <div class="grid-2">
            <div class="form-group">
              <label>Rol *</label>
              <select [(ngModel)]="form.role" [disabled]="editing && form.role === 'root' && currentUser?.role !== 'root'">
                @if (currentUser?.role === 'root') { <option value="root">Root</option> }
                <option value="admin">Admin</option>
                <option value="client">Cliente</option>
              </select>
            </div>
            <div class="form-group">
              <label class="toggle-pill-inline" (click)="form.can_manage_users = !form.can_manage_users">
                <span class="toggle-pill-dot-sm" [class.active]="form.can_manage_users"></span>
                <span>Gestionar usuarios</span>
              </label>
            </div>
          </div>
          @if (form.role === 'client') {
            <div class="form-group">
              <label>Eventos asignados</label>
              <div class="event-select-list">
                @for (ev of allEvents(); track ev.id) {
                  <label class="event-select-item">
                    <input type="checkbox" [checked]="isEventSelected(ev.id)" (change)="toggleEvent(ev.id)">
                    <span>{{ ev.name }}</span>
                  </label>
                }
                @if (!allEvents().length) { <p class="text-muted" style="padding:8px;font-size:12px;">No hay eventos creados</p> }
              </div>
            </div>
          }
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    }
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  users = signal<any[]>([]);
  allEvents = signal<Event[]>([]);
  showModal = signal(false);
  saving = signal(false);
  generatedPassword = signal<string>('');
  generatedForUser = signal<string>('');
  editing = false;
  editId = 0;
  currentUser: any;
  form: any = { username: '', password: '', role: 'admin', can_manage_users: false, event_ids: [] };

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.load();
    this.api.getEvents().subscribe(e => this.allEvents.set(e));
  }

  load() { this.api.getUsers().subscribe(u => this.users.set(u)); }

  openModal() {
    this.editing = false;
    this.form = { username: '', password: '', role: 'client', can_manage_users: false, event_ids: [] };
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  editUser(u: any) {
    this.editing = true;
    this.editId = u.id;
    this.form = {
      username: u.username, password: '', role: u.role,
      can_manage_users: !!u.can_manage_users,
      event_ids: (u.events || []).map((e: any) => e.id)
    };
    this.showModal.set(true);
  }

  isEventSelected(eventId: number): boolean { return this.form.event_ids.includes(eventId); }

  toggleEvent(eventId: number) {
    const idx = this.form.event_ids.indexOf(eventId);
    if (idx >= 0) this.form.event_ids.splice(idx, 1);
    else this.form.event_ids.push(eventId);
  }

  save() {
    if (!this.form.username) return;
    this.saving.set(true);
    const data = { ...this.form };
    if (this.editing && !data.password) delete data.password;

    const obs = this.editing
      ? this.api.updateUser(this.editId, data)
      : this.api.createUser(data);

    obs.subscribe({
      next: (res) => {
        // Show generated password if returned
        if (res.generatedPassword) {
          this.generatedPassword.set(res.generatedPassword);
          this.generatedForUser.set(this.form.username);
        }
        this.load(); this.closeModal(); this.saving.set(false);
      },
      error: (e) => { alert(e.error?.error || 'Error'); this.saving.set(false); }
    });
  }

  resetPassword(u: any) {
    if (!confirm(`¿Resetear contraseña de "${u.username}"? Se generará una nueva.`)) return;
    this.api.resetUserPassword(u.id).subscribe({
      next: (res) => {
        this.generatedPassword.set(res.password);
        this.generatedForUser.set(u.username);
      },
      error: (e) => alert(e.error?.error || 'Error')
    });
  }

  copyPassword() {
    navigator.clipboard.writeText(this.generatedPassword());
    // Brief visual feedback could be added here
  }

  deleteUser(u: any) {
    if (!confirm(`¿Eliminar usuario "${u.username}"?`)) return;
    this.api.deleteUser(u.id).subscribe({
      next: () => this.load(),
      error: (e) => alert(e.error?.error || 'Error')
    });
  }
}
