import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';

interface ExpiredEvent {
  id: number;
  name: string;
  event_date: string;
  deactivation_date: string;
  user: string;
  days_overdue: number;
}

interface ExpiredEventsResponse {
  expired_events: ExpiredEvent[];
  total: number;
}

@Component({
  selector: 'app-expired-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;flex-direction:column;flex:1;min-height:0">
      <div class="flex-between mb-24">
        <div>
          <h2 class="section-title">
            Eventos Expirados
            @if (total() > 0) {
              <span class="expired-badge">{{ total() }}</span>
            }
          </h2>
          <p class="section-subtitle">Eventos con fecha de desactivación vencida pendientes de completar</p>
        </div>
        @if (expiredEvents().length > 0) {
          <button class="btn btn-danger" (click)="deactivateAll()" [disabled]="deactivatingAll()">
            <span class="material-icons">block</span>
            {{ deactivatingAll() ? 'Procesando...' : 'Desactivar todos' }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="card text-center" style="padding:40px">
          <div class="spinner" style="margin:0 auto"></div>
        </div>
      } @else if (expiredEvents().length === 0) {
        <div class="card text-center" style="padding:40px">
          <span class="material-icons" style="font-size:48px;color:rgba(124,92,191,0.3)">check_circle</span>
          <p class="text-muted" style="margin-top:12px;">No hay eventos expirados pendientes</p>
        </div>
      } @else {
        @for (event of expiredEvents(); track event.id) {
          <div class="expired-card">
            <div class="expired-card-header">
              <span class="expired-card-name">{{ event.name }}</span>
              <span class="overdue-badge">{{ event.days_overdue }} días vencido</span>
            </div>
            <div class="expired-card-body">
              <div class="expired-card-row">
                <span class="expired-card-label">Fecha evento</span>
                <span class="expired-card-value">{{ event.event_date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="expired-card-row">
                <span class="expired-card-label">Desactivación</span>
                <span class="expired-card-value">{{ event.deactivation_date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="expired-card-row">
                <span class="expired-card-label">Usuario</span>
                <span class="expired-card-value">{{ event.user }}</span>
              </div>
            </div>
            <div class="expired-card-actions">
              <button class="btn btn-primary btn-sm" (click)="completeEvent(event)" [disabled]="completingId() === event.id">
                <span class="material-icons" style="font-size:16px">done</span>
                {{ completingId() === event.id ? 'Completando...' : 'Completar' }}
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .expired-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 8px;
      margin-left: 10px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      color: #f87171;
      vertical-align: middle;
    }

    .expired-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(124, 92, 191, 0.15);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .expired-card:hover {
      border-color: rgba(124, 92, 191, 0.3);
    }

    .expired-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 8px;
    }
    .expired-card-name {
      font-size: 16px;
      font-weight: 700;
      color: white;
      flex: 1;
      min-width: 0;
    }

    .overdue-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #f87171;
      white-space: nowrap;
    }

    .expired-card-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .expired-card-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .expired-card-label {
      color: rgba(255, 255, 255, 0.5);
      min-width: 100px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .expired-card-value {
      color: rgba(255, 255, 255, 0.9);
      flex: 1;
    }

    .expired-card-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
  `]
})
export class ExpiredEventsComponent implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(DialogService);

  expiredEvents = signal<ExpiredEvent[]>([]);
  total = signal(0);
  loading = signal(true);
  deactivatingAll = signal(false);
  completingId = signal<number | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<ExpiredEventsResponse>(`${environment.apiUrl}/admin/events/expired`).subscribe({
      next: (res) => {
        this.expiredEvents.set(res.expired_events);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  async deactivateAll() {
    const ok = await this.dialog.confirm(
      'Desactivar todos los eventos expirados',
      `¿Desactivar ${this.total()} evento(s) expirado(s)? Se marcarán como completados y no serán accesibles públicamente.`,
      'Desactivar todos'
    );
    if (!ok) return;

    this.deactivatingAll.set(true);
    this.http.post<{ deactivated_count: number; message: string }>(
      `${environment.apiUrl}/admin/events/deactivate-expired`, {}
    ).subscribe({
      next: (res) => {
        this.deactivatingAll.set(false);
        this.dialog.success('Eventos desactivados', res.message);
        this.load();
      },
      error: () => {
        this.deactivatingAll.set(false);
        this.dialog.alert('Error', 'No se pudieron desactivar los eventos');
      }
    });
  }

  async completeEvent(event: ExpiredEvent) {
    this.completingId.set(event.id);
    this.http.patch<{ message: string }>(
      `${environment.apiUrl}/admin/events/${event.id}/complete`, {}
    ).subscribe({
      next: () => {
        this.completingId.set(null);
        this.load();
      },
      error: () => {
        this.completingId.set(null);
        this.dialog.alert('Error', `No se pudo completar el evento "${event.name}"`);
      }
    });
  }
}
