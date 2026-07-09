import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../../../core/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .user-cards { display: none; }
    .user-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px; padding: 16px; margin-bottom: 12px;
      transition: border-color 0.2s;
      overflow: hidden;
    }
    .user-card:hover { border-color: rgba(124,92,191,0.4); }
    .user-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
    .user-card-name { font-size: 16px; font-weight: 700; color: white; flex: 1; min-width: 0; }
    .user-card-body { display: flex; flex-direction: column; gap: 8px; font-size: 13px; margin-bottom: 12px; }
    .user-card-row { display: flex; align-items: center; gap: 12px; }
    .user-card-label { color: rgba(255,255,255,0.5); min-width: 80px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
    .user-card-value { color: rgba(255,255,255,0.9); flex: 1; }
    .user-card-actions { margin-top: 12px; padding-top: 0; border-top: none; }
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
    .grid-wrapper { width: 100%; flex: 1; min-height: 0; }
    .desktop-table { display: flex; flex-direction: column; flex: 1; min-height: 0; }
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
    .pwd-cell {
      display: flex; align-items: center; gap: 6px;
    }
    .pwd-masked { color: rgba(255,255,255,0.3); font-size: 12px; letter-spacing: 2px; }
    .pwd-visible { color: var(--gold-light); font-size: 12px; font-family: monospace; letter-spacing: 1px; }
    .pwd-toggle {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: rgba(255,255,255,0.4); display: flex; align-items: center;
      border-radius: 4px; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { color: var(--gold-light); background: rgba(124,92,191,0.1); }
    }
    @media (max-width: 768px) {
      :host { overflow: hidden; display: flex; flex-direction: column; }
      :host::-webkit-scrollbar { display: none; }
      .desktop-table { display: none !important; }
      .mobile-header { flex-shrink: 0; }
      .search-inline { display: flex; flex-shrink: 0; }
      .user-cards {
        display: block; flex: 1; overflow-y: auto; overflow-x: hidden;
        scrollbar-width: none; -webkit-overflow-scrolling: touch;
        padding-bottom: 16px;
      }
      .user-cards::-webkit-scrollbar { display: none; }
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
  `],
  template: `
    <div style="display:flex;flex-direction:column;flex:1;min-height:0">
      <div class="flex-between mb-24 mobile-header">
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

      <!-- Search -->
      <div class="search-inline mb-8">
        <span class="material-icons search-icon">search</span>
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearchChange()" placeholder="Buscar usuario..." class="search-input">
        @if (search) {
          <button class="search-clear" (click)="search=''; onSearchChange()">
            <span class="material-icons">close</span>
          </button>
        }
      </div>

      <!-- Desktop table -->
      <div class="card desktop-table" style="position:relative">
        <div class="grid-wrapper ag-theme-quartz ag-theme-custom-dark">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [rowData]="users()"
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
            @for (u of users(); track u.id) {
              @if (u.id === openMenuId) {
                @if (u.role !== 'root' || currentUser?.role === 'root') {
                  <button class="dropdown-item" (click)="editUser(u); closeMenu()"><span class="material-icons">edit</span>Editar</button>
                  <button class="dropdown-item" (click)="resetPassword(u); closeMenu()"><span class="material-icons">lock_reset</span>Resetear contrasena</button>
                }
                @if (u.role !== 'root' && u.id !== currentUser?.id) {
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item danger" (click)="deleteUser(u); closeMenu()"><span class="material-icons">delete</span>Eliminar</button>
                }
              }
            }
          </div>
        }
      </div>

      <!-- Mobile cards -->
      <div class="user-cards" #cardsContainer>
        @for (u of filteredUsers(); track u.id) {
          <div class="user-card">
            <div class="user-card-header">
              <span class="user-card-name">{{ u.username }}</span>
              <span class="badge" [class.badge-danger]="u.role==='root'" [class.badge-info]="u.role==='admin'" [class.badge-warning]="u.role==='client'">{{ u.role }}</span>
            </div>
            <div class="user-card-body">
              <div class="user-card-row">
                <span class="user-card-label">Contraseña</span>
                <span class="user-card-value">
                  @if (u.plain_password) {
                    <div class="pwd-cell">
                      @if (visiblePwd === u.id) {
                        <span class="pwd-visible">{{ u.plain_password }}</span>
                      } @else {
                        <span class="pwd-masked">••••••••</span>
                      }
                      <button class="pwd-toggle" (mousedown)="visiblePwd = u.id" (mouseup)="visiblePwd = 0" (mouseleave)="visiblePwd = 0" (touchstart)="visiblePwd = u.id" (touchend)="visiblePwd = 0">
                        <span class="material-icons">{{ visiblePwd === u.id ? 'visibility' : 'visibility_off' }}</span>
                      </button>
                    </div>
                  } @else { <span class="text-muted">—</span> }
                </span>
              </div>
              <div class="user-card-row">
                <span class="user-card-label">Gestión</span>
                <span class="user-card-value">{{ u.can_manage_users ? 'Sí' : '—' }}</span>
              </div>
              <div class="user-card-row">
                <span class="user-card-label">Eventos</span>
                <span class="user-card-value">
                  @if (u.events?.length) { {{ u.events.length }} asignado(s) }
                  @else if (u.role !== 'client') { Todos }
                  @else { — }
                </span>
              </div>
            </div>
            <div class="user-card-actions">
              <button class="card-action-btn" (click)="mobileMenuId = mobileMenuId === u.id ? null : u.id">
                <span>Acciones</span>
              </button>
            </div>
            @if (mobileMenuId === u.id) {
              <div class="card-action-menu">
                @if (u.role !== 'root' || currentUser?.role === 'root') {
                  <button class="card-menu-item" (click)="editUser(u); mobileMenuId = null"><span class="material-icons">edit</span>Editar</button>
                  <button class="card-menu-item" (click)="resetPassword(u); mobileMenuId = null"><span class="material-icons">lock_reset</span>Restablecer contraseña</button>
                }
                @if (u.role !== 'root' && u.id !== currentUser?.id) {
                  <button class="card-menu-item danger" (click)="deleteUser(u); mobileMenuId = null"><span class="material-icons">delete</span>Eliminar</button>
                }
              </div>
            }
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
  private dialog = inject(DialogService);
  openMenuId: number | null = null;
  mobileMenuId: number | null = null;
  showScrollTop = false;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  private menuListener: any = null;
  private auth = inject(AuthService);
  private gridApi!: GridApi;
  users = signal<any[]>([]);
  allEvents = signal<Event[]>([]);
  showModal = signal(false);
  saving = signal(false);
  generatedPassword = signal<string>('');
  generatedForUser = signal<string>('');
  editing = false;
  editId = 0;
  currentUser: any;
  visiblePwd = 0;
  search = '';
  filteredUsers = signal<any[]>([]);
  form: any = { username: '', password: '', role: 'admin', can_manage_users: false, event_ids: [] };

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  colDefs: ColDef[] = [
    {
      headerName: 'Usuario',
      field: 'username',
      minWidth: 130,
      cellRenderer: (params: any) => params.value ? `<strong>${params.value}</strong>` : ''
    },
    {
      headerName: 'Rol',
      field: 'role',
      width: 90,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const cls = params.value === 'root' ? 'badge-danger' : params.value === 'admin' ? 'badge-info' : 'badge-warning';
        return `<span class="badge ${cls}">${params.value}</span>`;
      }
    },
    {
      headerName: 'Contraseña',
      field: 'plain_password',
      minWidth: 120,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.value) return '<span style="color:rgba(255,255,255,0.3)">—</span>';
        return '<span style="color:rgba(255,255,255,0.3);font-size:12px;letter-spacing:2px">••••••••</span>';
      }
    },
    {
      headerName: 'Gestión',
      field: 'can_manage_users',
      width: 85,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => params.value ? 'Sí' : '—'
    },
    {
      headerName: 'Eventos',
      field: 'events',
      minWidth: 150,
      sortable: false,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const events = params.data.events || [];
        if (events.length) {
          return events.map((ev: any) => `<span class="event-chip">${ev.name}</span>`).join(' ');
        }
        return params.data.role !== 'client'
          ? '<span style="color:rgba(255,255,255,0.4)">Todos</span>'
          : '<span style="color:rgba(255,255,255,0.4)">—</span>';
      }
    },
    {
      headerName: 'Creado',
      field: 'created_at',
      width: 95,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-center',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const d = new Date(params.value);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
      cellRenderer: () => `<button class="btn btn-secondary btn-sm btn-icon ag-action-btn" title="Acciones"><span class="material-icons" style="font-size:18px">more_vert</span></button>`,
      onCellClicked: (params: any) => {
        if (params.data) this.toggleMenu(params.data.id);
      }
    }
  ];

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.load();
    this.api.getEvents().subscribe(e => this.allEvents.set(e));
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

  ngOnDestroy() { if (this.menuListener) document.removeEventListener('click', this.menuListener); }
  toggleMenu(id: number) { this.openMenuId = this.openMenuId === id ? null : id; }
  closeMenu() { this.openMenuId = null; }

  load() {
    this.api.getUsers().subscribe(u => {
      // Sort: root first, then admin, then client
      const sorted = u.sort((a: any, b: any) => {
        const order: any = { root: 0, admin: 1, client: 2 };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
      });
      this.users.set(sorted);
      this.filterUsers();
    });
  }

  filterUsers() {
    const s = this.search.toLowerCase();
    this.filteredUsers.set(s ? this.users().filter((u: any) =>
      u.username.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    ) : this.users());
  }

  onSearchChange() {
    this.filterUsers();
  }

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
      error: (e) => { this.dialog.alert('Error', e.error?.error || 'Error al guardar'); this.saving.set(false); }
    });
  }

  async resetPassword(u: any) {
    const ok = await this.dialog.confirm('Resetear contraseña', `¿Resetear contraseña de "${u.username}"? Se generará una nueva.`);
    if (!ok) return;
    this.api.resetUserPassword(u.id).subscribe({
      next: (res) => {
        this.generatedPassword.set(res.password);
        this.generatedForUser.set(u.username);
      },
      error: (e) => this.dialog.alert('Error', e.error?.error || 'Error al resetear')
    });
  }

  copyPassword() {
    navigator.clipboard.writeText(this.generatedPassword());
  }

  async deleteUser(u: any) {
    const ok = await this.dialog.confirm('Eliminar usuario', `¿Eliminar usuario "${u.username}"?`);
    if (!ok) return;
    this.api.deleteUser(u.id).subscribe({
      next: () => this.load(),
      error: (e) => this.dialog.alert('Error', e.error?.error || 'Error al eliminar')
    });
  }
}
