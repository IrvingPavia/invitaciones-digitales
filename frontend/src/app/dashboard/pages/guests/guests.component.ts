import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Guest } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AgGridAngular],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .guests-page { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.25);
      border-radius: 12px; padding: 10px 16px;
      transition: all 0.3s;
      &:focus-within {
        border-color: var(--gold);
        background: rgba(124,92,191,0.05);
        box-shadow: 0 0 0 3px rgba(124,92,191,0.1);
      }
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
    /* Mobile cards */
    .guest-cards { display: none; }
    .guest-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
      overflow: hidden;
    }
    .guest-card:hover { border-color: rgba(124,92,191,0.4); }
    .guest-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 8px;
    }
    .guest-card-name {
      font-size: 16px; font-weight: 700; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .guest-card-body {
      display: flex; flex-direction: column; gap: 8px;
      font-size: 13px; margin-bottom: 0;
    }
    .guest-card-row { display: flex; align-items: center; gap: 12px; }
    .guest-card-label { color: rgba(255,255,255,0.5); min-width: 70px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
    .guest-card-value { color: rgba(255,255,255,0.9); flex: 1; overflow: hidden; text-overflow: ellipsis; }
    .guest-card-actions {
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
    .desktop-table { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .grid-wrapper { width: 100%; flex: 1; min-height: 0; }
    .btn-xs {
      padding: 6px 8px; font-size: 12px; border-radius: 8px;
      display: inline-flex; align-items: center; gap: 0;
      .material-icons { font-size: 16px; }
    }
    .search-inline {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 10px; padding: 6px 12px;
      transition: all 0.3s;
      &:focus-within {
        border-color: var(--gold);
        box-shadow: 0 0 0 2px rgba(124,92,191,0.1);
      }
    }
    @media (max-width: 768px) {
      :host { overflow: hidden; display: flex; flex-direction: column; }
      :host::-webkit-scrollbar { display: none; }
      .desktop-table { display: none !important; }
      .mobile-header { flex-shrink: 0; }
      .search-inline { flex-shrink: 0; }
      .guest-cards {
        display: block; flex: 1; overflow-y: auto; overflow-x: hidden;
        scrollbar-width: none; -webkit-overflow-scrolling: touch;
        padding-bottom: 16px;
      }
      .guest-cards::-webkit-scrollbar { display: none; }
    }
    .scroll-top-bar {
      display: none;
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
  `],
  template: `
    <div class="guests-page">
      <div class="flex-between mb-12 mobile-header" style="flex-wrap:wrap;gap:8px">
        <div>
          <a routerLink="/dashboard/events" class="back-link">
            <span class="material-icons">arrow_back</span> Volver
          </a>
          <h2 class="section-title" style="margin-bottom:2px">Invitados</h2>
          <p class="section-subtitle" style="margin:0">{{ eventName ? eventName + ' — ' : '' }}{{ guests().length }} invitados</p>
        </div>
        <div class="flex gap-6" style="flex-wrap:wrap;align-items:center">
          <button class="btn btn-secondary btn-xs" (click)="downloadTemplate()" title="Descargar plantilla"><span class="material-icons">download</span></button>
          <label class="btn btn-secondary btn-xs" style="cursor:pointer" title="Importar Excel">
            <span class="material-icons">upload_file</span>
            <input type="file" accept=".xlsx,.xls" (change)="importExcel($event)" style="display:none">
          </label>
          <button class="btn btn-secondary btn-xs" (click)="exportExcel()" title="Exportar"><span class="material-icons">table_view</span></button>
          <button class="btn btn-secondary btn-xs" (click)="shareAll()" [disabled]="!guestsWithPhone().length" title="Enviar invitaciones"><span class="material-icons">send</span></button>
          <button class="btn btn-primary btn-xs" (click)="openModal()" title="Agregar invitado"><span class="material-icons">person_add</span></button>
        </div>
      </div>

      <!-- Search inline -->
      <div class="search-inline mb-8">
        <span class="material-icons search-icon">search</span>
        <input type="text" [(ngModel)]="search" (ngModelChange)="onQuickFilter()" placeholder="Buscar por nombre, familia o código..." class="search-input">
        @if (search) {
          <button class="search-clear" (click)="search=''; onQuickFilter()">
            <span class="material-icons">close</span>
          </button>
        }
      </div>

      <div class="card desktop-table" style="position:relative">
        <div class="grid-wrapper ag-theme-quartz ag-theme-custom-dark">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [rowData]="guests()"
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
            @for (g of guests(); track g.id) {
              @if (g.id === openMenuId) {
                <button class="dropdown-item" (click)="shareGuest(g); closeMenu()"><span class="material-icons">share</span>Compartir</button>
                <button class="dropdown-item" (click)="showQR(g); closeMenu()"><span class="material-icons">qr_code</span>Ver QR</button>
                <button class="dropdown-item" (click)="editGuest(g); closeMenu()"><span class="material-icons">edit</span>Editar</button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item danger" (click)="deleteGuest(g); closeMenu()"><span class="material-icons">delete</span>Eliminar</button>
              }
            }
          </div>
        }
      </div>

      <!-- Mobile cards -->
      <div class="guest-cards" #cardsContainer>
        @for (g of filtered(); track g.id) {
          <div class="guest-card">
            <div class="guest-card-header">
              <span class="guest-card-name">
                @if (g.family_name) { {{ g.family_name }} } @else { {{ g.guest_names }} }
              </span>
              <span class="badge" [class.badge-info]="g.guest_type==='family'" [class.badge-warning]="g.guest_type==='individual'">{{ g.guest_type === 'family' ? 'Familia' : 'Individual' }}</span>
            </div>
            <div class="guest-card-body">
              <div class="guest-card-row">
                <span class="guest-card-label">Código</span>
                <span class="guest-card-value"><code style="color:var(--gold);font-size:12px">{{ g.unique_code }}</code></span>
              </div>
              @if (g.family_name) {
                <div class="guest-card-row">
                  <span class="guest-card-label">Invitados</span>
                  <span class="guest-card-value">{{ g.guest_names }}</span>
                </div>
              }
              <div class="guest-card-row">
                <span class="guest-card-label">Total</span>
                <span class="guest-card-value">{{ guestCount(g) }} persona{{ guestCount(g) > 1 ? 's' : '' }}</span>
              </div>
              @if (g.guest_type === 'individual' && g.max_companions > 0) {
                <div class="guest-card-row">
                  <span class="guest-card-label">Acomp.</span>
                  <span class="guest-card-value">{{ g.max_companions }}</span>
                </div>
              }
              <div class="guest-card-row">
                <span class="guest-card-label">Estado</span>
                <span class="guest-card-value">
                  @if (g.confirmed) {
                    <span class="badge badge-success">✓ Confirmado ({{ g.confirmed_count }})</span>
                  } @else {
                    <span class="badge badge-warning">Pendiente</span>
                  }
                </span>
              </div>
            </div>
            <div class="guest-card-actions">
              <button class="card-action-btn" (click)="mobileMenuId = mobileMenuId === g.id ? null : g.id">
                <span>Acciones</span>
              </button>
            </div>
            @if (mobileMenuId === g.id) {
              <div class="card-action-menu">
                <button class="card-menu-item" (click)="shareGuest(g); mobileMenuId = null"><span class="material-icons">share</span>Compartir</button>
                <button class="card-menu-item" (click)="showQR(g); mobileMenuId = null"><span class="material-icons">qr_code</span>Ver QR</button>
                <button class="card-menu-item" (click)="editGuest(g); mobileMenuId = null"><span class="material-icons">edit</span>Editar</button>
                <button class="card-menu-item danger" (click)="deleteGuest(g); mobileMenuId = null"><span class="material-icons">delete</span>Eliminar</button>
              </div>
            }
          </div>
        }
        @empty {
          <div class="card" style="padding:40px;text-align:center">
            <p class="text-muted">No hay invitados. Importa desde Excel o agrega manualmente.</p>
          </div>
        }
      </div>
      @if (showScrollTop) {
        <button class="scroll-top-bar" (click)="scrollToTop()">Volver</button>
      }
    </div>

    <!-- Guest Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Invitado' : 'Nuevo Invitado' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="closeModal()"><span class="material-icons">close</span></button>
          </div>
          <div class="form-group">
            <label>Tipo de Invitado</label>
            <select [(ngModel)]="form.guest_type">
              <option value="individual">Individual</option>
              <option value="family">Familia</option>
            </select>
          </div>
          @if (form.guest_type === 'family') {
            <div class="form-group">
              <label>Nombre de Familia</label>
              <input type="text" [(ngModel)]="form.family_name" placeholder="Familia García">
            </div>
          }
          <div class="form-group">
            <label>{{ form.guest_type === 'family' ? 'Nombres (separados por coma)' : 'Nombre del Invitado' }} *</label>
            <input type="text" [(ngModel)]="form.guest_names" [placeholder]="form.guest_type === 'family' ? 'Juan García, María García, Pedro García' : 'Juan Pérez'">
          </div>
          @if (form.guest_type === 'individual') {
            <div class="form-group">
              <label>Acompañantes permitidos</label>
              <input type="number" [(ngModel)]="form.max_companions" min="0" max="10">
            </div>
          }
          <div class="form-group">
            <label>Notas</label>
            <textarea [(ngModel)]="form.notes" placeholder="Mesa VIP, restricciones alimentarias..."></textarea>
          </div>
          <div class="form-group">
            <label>Teléfono (WhatsApp)</label>
            <input type="tel" [(ngModel)]="form.phone" placeholder="521XXXXXXXXXX (con lada, sin +)">
            <small style="color:rgba(255,255,255,0.4);font-size:11px;display:block;margin-top:4px;">Formato: código de país + número. Ej: 521234567890 (MX)</small>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- QR Modal -->
    @if (qrData()) {
      <div class="modal-overlay" (click)="qrData.set(null)">
        <div class="modal" style="max-width:360px;text-align:center" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Código QR</h3>
            <button class="btn btn-icon btn-secondary" (click)="qrData.set(null)"><span class="material-icons">close</span></button>
          </div>
          <img [src]="qrData()!.qr" style="width:200px;height:200px;border-radius:8px;margin:16px auto;display:block">
          <p style="font-size:12px;color:rgba(255,255,255,0.5);word-break:break-all;margin-bottom:16px">{{ qrData()!.url }}</p>
          <a [href]="qrData()!.qr" download="qr.png" class="btn btn-primary btn-sm">
            <span class="material-icons">download</span> Descargar QR
          </a>
        </div>
      </div>
    }
  `
})
export class GuestsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  eventId = 0;
  eventSlug = '';
  eventName = '';
  openMenuId: number | null = null;
  mobileMenuId: number | null = null;
  showScrollTop = false;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  private menuListener: any = null;
  private gridApi!: GridApi;
  guests = signal<Guest[]>([]);
  filtered = signal<Guest[]>([]);
  showModal = signal(false);
  saving = signal(false);
  qrData = signal<{ qr: string; url: string } | null>(null);
  editing = false; editId = 0; search = '';
  form: any = { guest_type: 'individual', family_name: '', guest_names: '', max_companions: 0, phone: '', notes: '' };

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Código',
      field: 'unique_code',
      minWidth: 110,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value ? `<code style="color:var(--gold);font-size:12px">${params.value}</code>` : ''
    },
    {
      headerName: 'Tipo',
      field: 'guest_type',
      minWidth: 100,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const cls = params.value === 'family' ? 'badge-info' : 'badge-warning';
        const label = params.value === 'family' ? 'Familia' : 'Individual';
        return `<span class="badge ${cls}">${label}</span>`;
      }
    },
    {
      headerName: 'Familia/Nombre',
      field: 'guest_names',
      minWidth: 200,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        let html = '';
        if (params.data.family_name) html += `<strong>${params.data.family_name}</strong><br>`;
        html += `<small style="color:rgba(255,255,255,0.5)">${params.data.guest_names}</small>`;
        return html;
      },
      getQuickFilterText: (params: any) => `${params.data?.family_name || ''} ${params.data?.guest_names || ''} ${params.data?.unique_code || ''}`
    },
    {
      headerName: 'Teléfono',
      field: 'phone',
      minWidth: 130,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value
        ? `<span style="font-size:12px;color:rgba(255,255,255,0.7)">${params.value}</span>`
        : '<span style="font-size:11px;color:rgba(255,255,255,0.3)">—</span>'
    },
    {
      headerName: 'Estado',
      field: 'confirmed',
      minWidth: 140,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        return params.data.confirmed
          ? `<span class="badge badge-success">✓ Confirmado (${params.data.confirmed_count || 0})</span>`
          : '<span class="badge badge-warning">Pendiente</span>';
      }
    },
    {
      headerName: 'Enviado',
      field: 'invitation_sent',
      minWidth: 100,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        return params.data.invitation_sent
          ? '<span class="badge badge-success" style="font-size:11px">✓ Enviado</span>'
          : '<span style="font-size:11px;color:rgba(255,255,255,0.3)">—</span>';
      }
    },
    {
      headerName: '',
      field: 'id',
      width: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: () => `<button class="btn btn-secondary btn-sm btn-icon ag-action-btn" title="Acciones"><span class="material-icons" style="font-size:18px">more_vert</span></button>`,
      onCellClicked: (params: any) => {
        if (params.data) this.toggleMenu(params.data.id);
      }
    }
  ];

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => { this.eventSlug = e.slug; this.eventName = e.name; });
    this.load();
    this.menuListener = () => { this.openMenuId = null; };
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

  onQuickFilter() {
    this.filterGuests();
  }

  ngOnDestroy() { if (this.menuListener) document.removeEventListener('click', this.menuListener); }
  toggleMenu(id: number) { this.openMenuId = this.openMenuId === id ? null : id; }
  closeMenu() { this.openMenuId = null; }

  load() {
    this.api.getGuests(this.eventId).subscribe(g => { this.guests.set(g); this.filterGuests(); });
  }

  filterGuests() {
    const s = this.search.toLowerCase();
    this.filtered.set(s ? this.guests().filter(g =>
      g.guest_names.toLowerCase().includes(s) ||
      (g.family_name || '').toLowerCase().includes(s) ||
      g.unique_code.toLowerCase().includes(s)
    ) : this.guests());
  }

  guestCount(g: Guest) {
    return g.guest_type === 'family' ? g.guest_names.split(',').length : g.max_companions + 1;
  }

  openModal() { this.editing = false; this.form = { guest_type: 'individual', family_name: '', guest_names: '', max_companions: 0, phone: '', notes: '' }; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  editGuest(g: Guest) {
    this.editing = true; this.editId = g.id;
    this.form = { guest_type: g.guest_type, family_name: g.family_name, guest_names: g.guest_names, max_companions: g.max_companions, phone: g.phone || '', notes: g.notes };
    this.showModal.set(true);
  }

  save() {
    if (!this.form.guest_names) return;
    this.saving.set(true);
    const data = { ...this.form, event_id: this.eventId };
    const obs = this.editing ? this.api.updateGuest(this.editId, data) : this.api.createGuest(data);
    obs.subscribe({ next: () => { this.load(); this.closeModal(); this.saving.set(false); }, error: () => this.saving.set(false) });
  }

  async deleteGuest(g: Guest) {
    const ok = await this.dialog.confirm('Eliminar invitado', '¿Eliminar este invitado?');
    if (!ok) return;
    this.api.deleteGuest(g.id).subscribe(() => this.load());
  }

  landingUrl(g: Guest) {
    const origin = environment.production ? window.location.origin : 'http://localhost';
    return `${origin}${environment.baseUrl}/invitacion/${this.eventSlug}?t=${g.unique_code}`;
  }

  showQR(g: Guest) { this.api.getGuestQR(g.id).subscribe(d => this.qrData.set(d)); }

  importExcel(e: any) {
    const file = e.target.files[0]; if (!file) return;
    this.api.importGuests(this.eventId, file).subscribe({
      next: (r) => { this.dialog.success('Importación exitosa', `${r.imported} invitados importados`); this.load(); e.target.value = ''; },
      error: () => this.dialog.alert('Error', 'Error al importar el archivo')
    });
  }

  exportExcel() {
    this.api.exportGuests(this.eventId).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'invitados.xlsx'; a.click();
    });
  }

  downloadTemplate() {
    this.api.downloadTemplate().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'plantilla_invitados.xlsx'; a.click();
    });
  }

  // === Share functionality ===
  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }

  guestsWithPhone(): Guest[] {
    return this.guests().filter(g => g.phone && !g.invitation_sent);
  }

  private buildMessage(g: Guest): string {
    const name = g.family_name || g.guest_names.split(',')[0].trim();
    const link = this.landingUrl(g);
    // Default message template
    let msg = `¡Hola ${name}! 🎉\nEstás cordialmente invitado(a) a nuestro evento.\nAquí tu invitación personal:\n${link}\n\n¡Te esperamos! 💕`;
    return msg;
  }

  shareGuest(g: Guest) {
    const url = this.landingUrl(g);
    if (this.isMobile() && g.phone) {
      // Open WhatsApp with pre-filled message
      const msg = encodeURIComponent(this.buildMessage(g));
      window.open(`https://wa.me/${g.phone}?text=${msg}`, '_blank');
      // Mark as sent
      this.api.markGuestSent(g.id).subscribe(() => {
        g.invitation_sent = 1;
        g.sent_at = new Date().toISOString();
      });
    } else if (this.isMobile() && !g.phone) {
      // Mobile without phone — use native share API or copy
      if (navigator.share) {
        navigator.share({ title: 'Invitación', text: this.buildMessage(g), url }).then(() => {
          this.api.markGuestSent(g.id).subscribe(() => { g.invitation_sent = 1; });
        }).catch(() => {});
      } else {
        this.copyToClipboard(url);
      }
    } else {
      // Desktop — copy link
      this.copyToClipboard(url);
    }
  }

  async shareAll() {
    const pending = this.guestsWithPhone();
    if (!pending.length) return;
    const ok = await this.dialog.confirm(
      'Enviar invitaciones',
      `Se abrirá WhatsApp para ${pending.length} invitado(s) con teléfono. En mobile se abrirá uno por uno. ¿Continuar?`
    );
    if (!ok) return;

    if (this.isMobile()) {
      // Open WhatsApp sequentially with short delay
      for (let i = 0; i < pending.length; i++) {
        const g = pending[i];
        const msg = encodeURIComponent(this.buildMessage(g));
        setTimeout(() => {
          window.open(`https://wa.me/${g.phone}?text=${msg}`, '_blank');
        }, i * 1500);
      }
      // Mark all as sent
      const ids = pending.map(g => g.id);
      this.api.bulkMarkSent(this.eventId, ids).subscribe(() => {
        pending.forEach(g => { g.invitation_sent = 1; g.sent_at = new Date().toISOString(); });
      });
    } else {
      // Desktop: copy all links as list
      const links = pending.map(g => {
        const name = g.family_name || g.guest_names.split(',')[0].trim();
        return `${name}: ${this.landingUrl(g)}`;
      }).join('\n');
      this.copyToClipboard(links);
      this.dialog.success('Links copiados', `${pending.length} links copiados al portapapeles. Pégalos manualmente en WhatsApp Web.`);
      // Mark as sent
      const ids = pending.map(g => g.id);
      this.api.bulkMarkSent(this.eventId, ids).subscribe(() => {
        pending.forEach(g => { g.invitation_sent = 1; g.sent_at = new Date().toISOString(); });
      });
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.dialog.success('Copiado', 'Link copiado al portapapeles');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.dialog.success('Copiado', 'Link copiado al portapapeles');
    });
  }
}
