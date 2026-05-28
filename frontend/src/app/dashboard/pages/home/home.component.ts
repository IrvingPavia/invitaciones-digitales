import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event, KPIs } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- CLIENT VIEW -->
      @if (isClient) {
        <div class="flex-between mb-16">
          <div>
            <h2 class="section-title">Mi Evento</h2>
            <p class="section-subtitle">Resumen de tu invitación digital</p>
          </div>
        </div>

        @if (events().length > 1) {
          <div class="card mb-16">
            <div class="flex gap-12" style="align-items:center;flex-wrap:wrap">
              <span class="material-icons text-gold">event</span>
              <span style="font-size:14px;color:rgba(255,255,255,0.7)">Evento:</span>
              <select (change)="selectEvent($event)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(212,160,23,0.3);border-radius:8px;padding:8px 12px;color:white;font-size:14px;flex:1;max-width:300px">
                @for (e of events(); track e.id) {
                  <option [value]="e.id" [selected]="selectedEvent()?.id === e.id">{{ e.name }}</option>
                }
              </select>
            </div>
          </div>
        }

        <!-- Client quick actions -->
        @if (selectedEvent()) {
          <div class="client-actions mb-24">
            <a [routerLink]="['/dashboard/guests', selectedEvent()!.id]" class="client-action-card">
              <span class="material-icons">people</span>
              <span>Invitados</span>
            </a>
            <a [routerLink]="['/dashboard/config', selectedEvent()!.id]" class="client-action-card">
              <span class="material-icons">settings</span>
              <span>Configurar</span>
            </a>
            <a [routerLink]="['/dashboard/cards', selectedEvent()!.id]" class="client-action-card">
              <span class="material-icons">style</span>
              <span>Tarjetas</span>
            </a>
            <a [href]="environment.baseUrl + '/invitacion/' + selectedEvent()!.slug" target="_blank" class="client-action-card primary">
              <span class="material-icons">open_in_new</span>
              <span>Ver Landing</span>
            </a>
          </div>
        }
      }

      <!-- ADMIN/ROOT VIEW -->
      @if (!isClient) {
        <div class="flex-between mb-16">
          <div>
            <h2 class="section-title">Dashboard</h2>
            <p class="section-subtitle">Resumen general de tus eventos</p>
          </div>
          <a routerLink="/dashboard/events" class="btn btn-primary">
            <span class="material-icons">add</span> Nuevo Evento
          </a>
        </div>

        <!-- Event selector -->
        @if (events().length > 0) {
          <div class="card mb-16">
            <div class="flex gap-12" style="align-items:center;flex-wrap:wrap">
              <span class="material-icons text-gold">event</span>
              <span style="font-size:14px;color:rgba(255,255,255,0.7)">Evento activo:</span>
              <select (change)="selectEvent($event)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(212,160,23,0.3);border-radius:8px;padding:8px 12px;color:white;font-size:14px;flex:1;max-width:300px">
                @for (e of events(); track e.id) {
                  <option [value]="e.id" [selected]="selectedEvent()?.id === e.id">{{ e.name }}</option>
                }
              </select>
              @if (selectedEvent()) {
                <a [routerLink]="['/dashboard/guests', selectedEvent()!.id]" class="btn btn-secondary btn-sm">
                  <span class="material-icons">people</span> Invitados
                </a>
                <a [routerLink]="['/dashboard/config', selectedEvent()!.id]" class="btn btn-secondary btn-sm">
                  <span class="material-icons">settings</span> Configurar
                </a>
                <a [routerLink]="['/dashboard/cards', selectedEvent()!.id]" class="btn btn-secondary btn-sm">
                  <span class="material-icons">style</span> Tarjetas
                </a>
                <a [href]="environment.baseUrl + '/invitacion/' + selectedEvent()!.slug" target="_blank" class="btn btn-primary btn-sm">
                  <span class="material-icons">open_in_new</span> Ver Landing
                </a>
              }
            </div>
          </div>
        }
      }

      <!-- KPIs (both views) -->
      @if (kpis()) {
        <div class="grid-4 mb-24">
          <div class="kpi-card">
            <div class="kpi-icon"><span class="material-icons">mail</span></div>
            <div><div class="kpi-value">{{ kpis()!.total_invitations }}</div><div class="kpi-label">Total Invitaciones</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:rgba(40,167,69,0.15);color:#5cb85c"><span class="material-icons">check_circle</span></div>
            <div><div class="kpi-value" style="color:#5cb85c">{{ kpis()!.confirmed_invitations }}</div><div class="kpi-label">Confirmadas</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:rgba(255,193,7,0.15);color:#ffc107"><span class="material-icons">pending</span></div>
            <div><div class="kpi-value" style="color:#ffc107">{{ kpis()!.pending_invitations }}</div><div class="kpi-label">Pendientes</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" style="background:rgba(23,162,184,0.15);color:#17a2b8"><span class="material-icons">groups</span></div>
            <div><div class="kpi-value" style="color:#17a2b8">{{ kpis()!.total_confirmed_guests }}</div><div class="kpi-label">Asistentes Confirmados</div></div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="card">
          <div class="flex-between mb-16">
            <span style="font-size:14px;color:rgba(255,255,255,0.7)">Progreso de confirmaciones</span>
            <span class="text-gold" style="font-weight:700">{{ confirmPct() }}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.1);border-radius:8px;height:12px;overflow:hidden">
            <div [style.width.%]="confirmPct()" style="height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:8px;transition:width 0.5s ease"></div>
          </div>
          <div class="flex-between mt-16" style="font-size:13px;color:rgba(255,255,255,0.5)">
            <span>{{ kpis()!.total_confirmed_guests }} / {{ kpis()!.total_seats }} asientos confirmados</span>
            <span>{{ kpis()!.total_seats - kpis()!.total_confirmed_guests }} disponibles</span>
          </div>
        </div>
      }

      @if (events().length === 0 && !loading()) {
        <div class="card text-center" style="padding:60px">
          <span class="material-icons" style="font-size:64px;color:rgba(212,160,23,0.3)">event_note</span>
          <h3 style="margin:16px 0 8px;color:rgba(255,255,255,0.7)">{{ isClient ? 'No tienes eventos asignados' : 'No hay eventos creados' }}</h3>
          <p class="text-muted" style="margin-bottom:24px">{{ isClient ? 'Contacta al administrador para que te asigne un evento' : 'Crea tu primer evento para comenzar' }}</p>
          @if (!isClient) {
            <a routerLink="/dashboard/events" class="btn btn-primary">
              <span class="material-icons">add</span> Crear Evento
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .client-actions {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .client-action-card {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 24px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(212,160,23,0.2);
      border-radius: 12px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
    }
    .client-action-card:hover {
      border-color: var(--gold);
      background: rgba(212,160,23,0.05);
      color: var(--gold-light);
      transform: translateY(-2px);
    }
    .client-action-card .material-icons { font-size: 32px; color: var(--gold); }
    .client-action-card.primary {
      background: rgba(212,160,23,0.08);
      border-color: rgba(212,160,23,0.4);
    }
    .client-action-card.primary:hover {
      background: rgba(212,160,23,0.15);
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  events = signal<Event[]>([]);
  selectedEvent = signal<Event | null>(null);
  kpis = signal<KPIs | null>(null);
  loading = signal(true);
  environment = environment;
  user = this.auth.getUser();
  isClient = this.user?.role === 'client';

  ngOnInit() {
    this.api.getEvents().subscribe(events => {
      this.events.set(events);
      this.loading.set(false);
      if (events.length > 0) this.loadKPIs(events[0]);
    });
  }

  selectEvent(e: any) {
    const event = this.events().find(ev => ev.id === +e.target.value);
    if (event) this.loadKPIs(event);
  }

  loadKPIs(event: Event) {
    this.selectedEvent.set(event);
    this.api.getKPIs(event.id).subscribe(k => this.kpis.set(k));
  }

  confirmPct() {
    const k = this.kpis();
    if (!k || !k.total_seats) return 0;
    return Math.round((k.total_confirmed_guests / k.total_seats) * 100);
  }
}
