import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Registration } from '../../../core/models/models';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .stats-bar {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;
    }
    .stat-item {
      background: rgba(124,92,191,0.08);
      border: 1px solid rgba(124,92,191,0.25);
      border-radius: 12px; padding: 12px 20px;
      display: flex; align-items: center; gap: 10px;
    }
    .stat-item .material-icons { color: rgba(124,92,191,0.7); font-size: 22px; }
    .stat-value { font-size: 20px; font-weight: 700; color: white; }
    .stat-label { font-size: 12px; color: rgba(255,255,255,0.5); }
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.25);
      border-radius: 12px; padding: 10px 16px;
      transition: all 0.3s;
    }
    .search-box:focus-within {
      border-color: var(--gold);
      background: rgba(124,92,191,0.05);
      box-shadow: 0 0 0 3px rgba(124,92,191,0.1);
    }
    .search-icon { color: rgba(124,92,191,0.6); font-size: 20px; flex-shrink: 0; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      color: white; font-size: 14px; font-family: var(--font-sans);
    }
    .search-input::placeholder { color: rgba(255,255,255,0.3); }
    .search-clear {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.3); display: flex; align-items: center;
      border-radius: 50%; transition: all 0.2s; flex-shrink: 0;
    }
    .search-clear .material-icons { font-size: 16px; }
    .search-clear:hover { color: white; background: rgba(255,255,255,0.1); }
    .reg-cards { display: none; }
    .reg-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px; padding: 16px; margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .reg-card:hover { border-color: rgba(124,92,191,0.4); }
    .reg-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 8px;
    }
    .reg-card-name {
      font-size: 15px; font-weight: 600; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .reg-card-body {
      display: grid; grid-template-columns: auto 1fr; gap: 6px 12px;
      font-size: 13px; margin-bottom: 12px;
    }
    .reg-card-label { color: rgba(255,255,255,0.4); white-space: nowrap; }
    .reg-card-value { color: rgba(255,255,255,0.85); overflow: hidden; text-overflow: ellipsis; }
    .reg-card-actions {
      display: flex; gap: 8px; justify-content: flex-end;
      padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);
    }
    .desktop-table { display: block; }
    @media (max-width: 768px) {
      .desktop-table { display: none; }
      .reg-cards { display: block; }
    }
  `],
  template: `
    <div>
      <div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px">
        <div>
          <a routerLink="/dashboard/events" class="back-link">
            <span class="material-icons">arrow_back</span> Volver a Eventos
          </a>
          <h2 class="section-title">Registrados</h2>
          <p class="section-subtitle">Personas registradas en el evento abierto</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="material-icons">people</span>
          <div>
            <div class="stat-value">{{ registrations().length }}</div>
            <div class="stat-label">Registrados</div>
          </div>
        </div>
        @if (capacity()) {
          <div class="stat-item">
            <span class="material-icons">event_seat</span>
            <div>
              <div class="stat-value">{{ capacity()! - registrations().length }}</div>
              <div class="stat-label">Lugares disponibles</div>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons">groups</span>
            <div>
              <div class="stat-value">{{ capacity() }}</div>
              <div class="stat-label">Cupo total</div>
            </div>
          </div>
        }
      </div>

      <!-- Search -->
      <div class="card mb-16">
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Buscar por nombre o email..." class="search-input">
          @if (search) {
            <button class="search-clear" (click)="search=''; filter()">
              <span class="material-icons">close</span>
            </button>
          }
        </div>
      </div>

      <!-- Desktop table -->
      <div class="card desktop-table" style="overflow:auto">
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Fecha registro</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (r of filtered(); track r.id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td><strong>{{ r.name }}</strong></td>
                <td>{{ r.email || '—' }}</td>
                <td>{{ r.phone || '—' }}</td>
                <td>{{ r.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <button class="btn btn-danger btn-sm btn-icon" (click)="deleteReg(r)" title="Eliminar">
                    <span class="material-icons" style="font-size:16px">delete</span>
                  </button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="text-center text-muted" style="padding:40px">No hay registros aún.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="reg-cards">
        @for (r of filtered(); track r.id; let i = $index) {
          <div class="reg-card">
            <div class="reg-card-header">
              <span class="reg-card-name">{{ r.name }}</span>
              <span class="badge badge-info">#{{ i + 1 }}</span>
            </div>
            <div class="reg-card-body">
              @if (r.email) {
                <span class="reg-card-label">Email</span>
                <span class="reg-card-value">{{ r.email }}</span>
              }
              @if (r.phone) {
                <span class="reg-card-label">Teléfono</span>
                <span class="reg-card-value">{{ r.phone }}</span>
              }
              <span class="reg-card-label">Registro</span>
              <span class="reg-card-value">{{ r.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="reg-card-actions">
              <button class="btn btn-danger btn-sm btn-icon" (click)="deleteReg(r)" title="Eliminar">
                <span class="material-icons" style="font-size:16px">delete</span>
              </button>
            </div>
          </div>
        }
        @empty {
          <div class="card" style="padding:40px;text-align:center">
            <p class="text-muted">No hay registros aún.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class RegistrationsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  eventId = 0;
  registrations = signal<Registration[]>([]);
  filtered = signal<Registration[]>([]);
  capacity = signal<number | null>(null);
  search = '';

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.load();
    this.api.getRegistrationStats(this.eventId).subscribe(s => this.capacity.set(s.capacity));
  }

  load() {
    this.api.getRegistrations(this.eventId).subscribe(r => {
      this.registrations.set(r);
      this.filter();
    });
  }

  filter() {
    const s = this.search.toLowerCase();
    this.filtered.set(s ? this.registrations().filter(r =>
      r.name.toLowerCase().includes(s) || (r.email || '').toLowerCase().includes(s)
    ) : this.registrations());
  }

  async deleteReg(r: Registration) {
    const ok = await this.dialog.confirm('Eliminar registro', `¿Eliminar el registro de "${r.name}"?`);
    if (!ok) return;
    this.api.deleteRegistration(this.eventId, r.id).subscribe(() => this.load());
  }
}
