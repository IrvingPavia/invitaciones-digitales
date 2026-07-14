import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Event } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AgGridAngular],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .event-cards { display: none; }
    .event-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
      overflow: hidden;
    }
    .event-card:hover { border-color: rgba(124,92,191,0.4); }
    .event-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 8px;
    }
    .event-card-name {
      font-size: 16px; font-weight: 700; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .event-card-body {
      display: flex; flex-direction: column; gap: 8px;
      font-size: 13px; margin-bottom: 0;
    }
    .event-card-row { display: flex; align-items: center; gap: 12px; }
    .event-card-label { color: rgba(255,255,255,0.5); min-width: 70px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
    .event-card-value { color: rgba(255,255,255,0.9); flex: 1; overflow: hidden; text-overflow: ellipsis; }
    .event-card-actions {
      margin-top: 12px; padding-top: 0; border-top: none;
    }
    .card-action-btn {
      display: flex; align-items: center; justify-content: center; width: 100%;
      background: rgba(124,92,191,0.15); border: none;
      border-radius: 8px; padding: 10px 24px;
      color: #c084fc; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
      cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
      &:hover { background: rgba(124,92,191,0.25); }
      &:active { transform: scale(0.98); }
      &:active::after {
        content: ''; position: absolute;
        top: 0; left: -100%; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(192,132,252,0.4), transparent);
        animation: cardShimmer 0.6s ease-out forwards;
      }
    }
    @keyframes cardShimmer { 0% { left: -100%; } 100% { left: 100%; } }
    .card-action-menu {
      display: flex; flex-direction: column; gap: 2px;
      margin-top: 8px; padding: 8px;
      background: rgba(12,12,24,0.95); border: 1px solid rgba(139,92,246,0.3);
      border-radius: 10px; animation: menuSlide 0.2s ease;
    }
    @keyframes menuSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .card-action-menu {
      display: flex; flex-direction: column; gap: 2px;
      margin-top: 10px; padding: 8px;
      background: rgba(12,12,24,0.9); border: 1px solid rgba(139,92,246,0.25);
      border-radius: 12px; animation: menuSlide 0.2s ease;
    }
    @keyframes menuSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .card-menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 8px;
      color: rgba(255,255,255,0.8); font-size: 13px;
      background: none; border: none; cursor: pointer;
      text-decoration: none; transition: all 0.2s;
      .material-icons { font-size: 18px; color: rgba(255,255,255,0.5); }
      &:hover { background: rgba(139,92,246,0.12); color: white; .material-icons { color: #c084fc; } }
      &.danger { color: #f87171; .material-icons { color: #f87171; } }
      &.danger:hover { background: rgba(248,113,113,0.1); }
    }
    .grid-wrapper { width: 100%; flex: 1; min-height: 0; }
    .desktop-table { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    @media (max-width: 768px) {
      :host { overflow: hidden; display: flex; flex-direction: column; }
      :host::-webkit-scrollbar { display: none; }
      .desktop-table { display: none !important; }
      .mobile-header { flex-shrink: 0; }
      .search-inline { display: flex; flex-shrink: 0; }
      .event-cards {
        display: block; flex: 1; overflow-y: auto; overflow-x: hidden;
        scrollbar-width: none; -webkit-overflow-scrolling: touch;
        padding-bottom: 16px;
      }
      .event-cards::-webkit-scrollbar { display: none; }
    }
    .scroll-top-bar {
      display: none;
    }
    .search-inline {
      display: flex;
      align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 10px; padding: 6px 12px;
      transition: all 0.3s;
    }
    .search-inline:focus-within {
      border-color: var(--gold);
      box-shadow: 0 0 0 2px rgba(124,92,191,0.1);
    }
    .search-icon { color: rgba(124,92,191,0.6); font-size: 20px; flex-shrink: 0; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      color: white; font-size: 14px; font-family: var(--font-sans);
      &::placeholder { color: rgba(255,255,255,0.3); }
    }
    .search-clear {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.3); display: flex; align-items: center;
      border-radius: 50%; transition: all 0.2s; flex-shrink: 0;
      .material-icons { font-size: 16px; }
      &:hover { color: white; background: rgba(255,255,255,0.1); }
    }
    @media (max-width: 768px) {
      .scroll-top-bar {
        display: flex; align-items: center; justify-content: center;
        width: 100%; padding: 14px;
        background: rgba(124,92,191,0.12); border: none; border-radius: 0;
        color: #c084fc; font-size: 14px; font-weight: 600;
        cursor: pointer; margin: 0; flex-shrink: 0;
      }
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
    <div style="display:flex;flex-direction:column;flex:1;min-height:0">
      <div class="flex-between mb-24 mobile-header">
        <div>
          <h2 class="section-title">Eventos</h2>
          <p class="section-subtitle">Gestiona tus eventos de invitaciones</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons">add</span> Nuevo Evento
        </button>
      </div>

      <!-- Search -->
      <div class="search-inline mb-8">
        <span class="material-icons search-icon">search</span>
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearchChange()" placeholder="Buscar evento..." class="search-input">
        @if (search) {
          <button class="search-clear" (click)="search=''; onSearchChange()">
            <span class="material-icons">close</span>
          </button>
        }
      </div>

      <div class="card desktop-table" style="position:relative">
        <div class="grid-wrapper ag-theme-quartz ag-theme-custom-dark">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [rowData]="events()"
            [columnDefs]="colDefs"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="50"
            [paginationPageSizeSelector]="[25, 50, 100]"
            [animateRows]="true"
            [quickFilterText]="search"
            (gridReady)="onGridReady($event)"
          />
        </div>
        @if (openMenuId !== null) {
          <div class="action-dropdown ag-dropdown-overlay" (click)="$event.stopPropagation()">
            @for (e of events(); track e.id) {
              @if (e.id === openMenuId) {
                @if (e.event_mode === 'open') {
                  <a class="dropdown-item" (click)="navigate('/dashboard/registrations', e.id)"><span class="material-icons">how_to_reg</span>Registrados</a>
                } @else {
                  <a class="dropdown-item" (click)="navigate('/dashboard/guests', e.id)"><span class="material-icons">people</span>Invitados</a>
                }
                <a class="dropdown-item" (click)="navigate('/dashboard/config', e.id)"><span class="material-icons">settings</span>Configurar</a>
                <a class="dropdown-item" (click)="navigate('/dashboard/builder', e.id)"><span class="material-icons">dashboard_customize</span>Builder</a>
                <a class="dropdown-item" (click)="navigate('/dashboard/cards', e.id)"><span class="material-icons">style</span>Tarjetas</a>
                <a class="dropdown-item" [href]="environment.baseUrl + '/invitacion/' + e.slug" target="_blank" (click)="closeMenu()"><span class="material-icons">open_in_new</span>Ver Landing</a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" (click)="editEvent(e); closeMenu()"><span class="material-icons">edit</span>Editar</button>
                <button class="dropdown-item" (click)="duplicateEvent(e); closeMenu()"><span class="material-icons">content_copy</span>Duplicar</button>
                <button class="dropdown-item danger" (click)="deleteEvent(e); closeMenu()"><span class="material-icons">delete</span>Eliminar</button>
              }
            }
          </div>
        }
      </div>

      <!-- Mobile cards -->
      <div class="event-cards" #cardsContainer>
        @for (e of filteredEvents(); track e.id) {
          <div class="event-card">
            <div class="event-card-header">
              <span class="event-card-name">{{ e.name }}</span>
              <span class="badge" [class.badge-success]="e.active" [class.badge-danger]="!e.active">{{ e.active ? 'Activo' : 'Inactivo' }}</span>
            </div>
            <div class="event-card-body">
              <div class="event-card-row">
                <span class="event-card-label">Tipo</span>
                <span class="event-card-value"><span class="badge badge-info">{{ e.event_type }}</span></span>
              </div>
              <div class="event-card-row">
                <span class="event-card-label">Fecha</span>
                <span class="event-card-value">{{ e.event_date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="event-card-row">
                <span class="event-card-label">Invitados</span>
                <span class="event-card-value">{{ e.total_guests || 0 }} total · {{ e.confirmed_guests || 0 }} confirmados</span>
              </div>
              <div class="event-card-row">
                <span class="event-card-label">URL</span>
                <span class="event-card-value" style="font-size:11px;color:var(--gold);">/invitacion/{{ e.slug }}</span>
              </div>
            </div>
            <div class="event-card-actions">
              <button class="card-action-btn" (click)="mobileMenuId = mobileMenuId === e.id ? null : e.id">
                <span>Acciones</span>
              </button>
            </div>
            @if (mobileMenuId === e.id) {
              <div class="card-action-menu">
                @if (e.event_mode === 'open') {
                  <a [routerLink]="['/dashboard/registrations', e.id]" class="card-menu-item"><span class="material-icons">how_to_reg</span>Registrados</a>
                } @else {
                  <a [routerLink]="['/dashboard/guests', e.id]" class="card-menu-item"><span class="material-icons">people</span>Invitados</a>
                }
                <a [routerLink]="['/dashboard/config', e.id]" class="card-menu-item"><span class="material-icons">settings</span>Configurar</a>
                <a [routerLink]="['/dashboard/builder', e.id]" class="card-menu-item"><span class="material-icons">dashboard_customize</span>Builder</a>
                <a [routerLink]="['/dashboard/cards', e.id]" class="card-menu-item"><span class="material-icons">style</span>Tarjetas</a>
                <a [href]="environment.baseUrl + '/invitacion/' + e.slug" target="_blank" class="card-menu-item"><span class="material-icons">open_in_new</span>Ver Landing</a>
                <button class="card-menu-item" (click)="editEvent(e); mobileMenuId = null"><span class="material-icons">edit</span>Editar</button>
                <button class="card-menu-item" (click)="duplicateEvent(e); mobileMenuId = null"><span class="material-icons">content_copy</span>Duplicar</button>
                <button class="card-menu-item danger" (click)="deleteEvent(e); mobileMenuId = null"><span class="material-icons">delete</span>Eliminar</button>
              </div>
            }
          </div>
        }
        @empty {
          <div class="card" style="padding:40px;text-align:center">
            <p class="text-muted">No hay eventos. Crea el primero.</p>
          </div>
        }
      </div>
      @if (showScrollTop) {
        <button class="scroll-top-bar" (click)="scrollToTop()">Volver</button>
      }
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
export class EventsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private router = inject(Router);
  events = signal<Event[]>([]);
  showModal = signal(false);
  saving = signal(false);
  editing = false;
  editId = 0;
  environment = environment;
  openMenuId: number | null = null;
  mobileMenuId: number | null = null;
  showScrollTop = false;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  private menuListener: any = null;
  private gridApi!: GridApi;
  form: any = { name: '', event_type: 'Boda', event_date: '', slug: '', active: 1, event_mode: 'private', max_capacity: null, landing_template: 'elegante' };
  formDate = '';
  formHour = 19;
  formMin = 0;
  search = '';
  filteredEvents = signal<Event[]>([]);

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    suppressSizeToFit: false,
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Nombre',
      field: 'name',
      minWidth: 200,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        return `<strong>${params.data.name}</strong><br><small style="color:rgba(255,255,255,0.4);font-size:11px">/invitacion/${params.data.slug}</small>`;
      }
    },
    {
      headerName: 'Tipo',
      field: 'event_type',
      minWidth: 120,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value ? `<span class="badge badge-info">${params.value}</span>` : ''
    },
    {
      headerName: 'Fecha',
      field: 'event_date',
      minWidth: 120,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const d = new Date(params.value);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    },
    {
      headerName: 'Invitados',
      field: 'total_guests',
      headerTooltip: 'Invitados',
      width: 90,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value || '0'
    },
    {
      headerName: 'Confirm.',
      field: 'confirmed_guests',
      headerTooltip: 'Confirmados',
      width: 90,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value || '0'
    },
    {
      headerName: 'Estado',
      field: 'active',
      width: 90,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (params.data == null) return '';
        return params.data.active
          ? '<span class="badge badge-success">Activo</span>'
          : '<span class="badge badge-danger">Inactivo</span>';
      }
    },
    {
      headerName: '',
      field: 'id',
      width: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      resizable: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => {
        return `<button class="btn btn-secondary btn-sm btn-icon ag-action-btn" title="Acciones"><span class="material-icons" style="font-size:18px">more_vert</span></button>`;
      },
      onCellClicked: (params: any) => {
        if (params.data) {
          this.toggleMenu(params.data.id);
        }
      }
    }
  ];

  landingTemplates = [
    { key: 'elegante', name: 'Elegante', bg: 'linear-gradient(135deg, #1a1a2e, #0d1117)', accent: '#d4a017' },
    { key: 'moderno', name: 'Moderno', bg: 'linear-gradient(135deg, #1e1e32, #2d2d44)', accent: '#a78bfa' },
    { key: 'romantico', name: 'Romántico', bg: 'linear-gradient(135deg, #2d1525, #1a0a14)', accent: '#f4a7c1' },
    { key: 'festivo', name: 'Festivo', bg: 'linear-gradient(135deg, #1a1a2e, #2d2200)', accent: '#fbbf24' },
    { key: 'corporativo', name: 'Corporativo', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', accent: '#60a5fa' },
  ];

  ngOnInit() {
    this.load();
    this.menuListener = (e: MouseEvent) => { this.openMenuId = null; };
    document.addEventListener('click', this.menuListener);
    setTimeout(() => this.setupScrollListener(), 500);
  }

  private setupScrollListener() {
    const el = this.cardsContainer?.nativeElement;
    if (el) {
      el.addEventListener('scroll', () => {
        this.showScrollTop = el.scrollTop > 100;
      });
    }
  }

  scrollToTop() {
    const el = this.cardsContainer?.nativeElement;
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.fitColumns();
    window.addEventListener('resize', () => {
      setTimeout(() => this.fitColumns(), 100);
    });
  }

  private fitColumns() {
    if (!this.gridApi) return;
    const totalMinWidth = this.colDefs.reduce((sum, col) => sum + ((col as any).minWidth || (col as any).width || 80), 0);
    const gridWidth = document.querySelector('.grid-wrapper')?.clientWidth || 0;
    if (gridWidth > totalMinWidth) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  ngOnDestroy() {
    if (this.menuListener) document.removeEventListener('click', this.menuListener);
  }

  toggleMenu(id: number) { this.openMenuId = this.openMenuId === id ? null : id; }
  closeMenu() { this.openMenuId = null; }

  navigate(path: string, id: number) {
    this.closeMenu();
    this.router.navigate([path, id]);
  }

  load() { this.api.getEvents().subscribe(e => { this.events.set(e); this.filterEvents(); }); }

  filterEvents() {
    const s = this.search.toLowerCase();
    this.filteredEvents.set(s ? this.events().filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.event_type.toLowerCase().includes(s) ||
      e.slug.toLowerCase().includes(s)
    ) : this.events());
  }

  onSearchChange() {
    this.filterEvents();
  }

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
