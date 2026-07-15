import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Purchase, PurchaseDetail, PurchaseFilters } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-purchases-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="purchases-admin">
      <div class="header">
        <div>
          <h2 class="section-title">Compras</h2>
          <p class="section-subtitle">Administración de compras y transacciones</p>
        </div>
        <button class="btn btn-secondary" (click)="exportExcel()" [disabled]="exporting()">
          <span class="material-icons">download</span>
          {{ exporting() ? 'Exportando...' : 'Exportar Excel' }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select [(ngModel)]="filters.status" (ngModelChange)="loadPurchases()">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="completed">Completada</option>
          <option value="failed">Fallida</option>
          <option value="refunded">Reembolsada</option>
        </select>
        <input type="date" [(ngModel)]="filters.from_date" (change)="loadPurchases()" placeholder="Desde">
        <input type="date" [(ngModel)]="filters.to_date" (change)="loadPurchases()" placeholder="Hasta">
        <button class="btn btn-sm btn-secondary" (click)="clearFilters()">
          <span class="material-icons">clear</span> Limpiar
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="material-icons spin">sync</span>
          <p>Cargando compras...</p>
        </div>
      }

      @if (!loading() && purchases().length === 0) {
        <div class="empty-state">
          <span class="material-icons">receipt_long</span>
          <p>No se encontraron compras</p>
        </div>
      }

      @if (!loading() && purchases().length > 0) {
        <div class="purchases-list">
          @for (purchase of purchases(); track purchase.id) {
            <div class="purchase-card" [class.expanded]="expandedId() === purchase.id">
              <div class="purchase-row" (click)="toggleExpand(purchase.id)">
                <div class="purchase-info">
                  <span class="purchase-id">#{{ purchase.id }}</span>
                  <span class="purchase-user">{{ purchase.user_name || purchase.username }}</span>
                  <span class="purchase-plan">{{ purchase.plan_name }}</span>
                </div>
                <div class="purchase-meta">
                  <span class="purchase-amount">\${{ purchase.total_amount | number:'1.2-2' }}</span>
                  <span class="badge" [class]="'badge-' + purchase.status">{{ purchase.status }}</span>
                  <span class="purchase-date">{{ purchase.created_at | date:'dd/MM/yy' }}</span>
                  <span class="material-icons expand-icon">
                    {{ expandedId() === purchase.id ? 'expand_less' : 'expand_more' }}
                  </span>
                </div>
              </div>

              @if (expandedId() === purchase.id) {
                <div class="purchase-detail">
                  @if (detailLoading()) {
                    <div class="loading-state sm">
                      <span class="material-icons spin">sync</span>
                    </div>
                  } @else if (detail()) {
                    <div class="detail-sections">
                      <!-- Events -->
                      <div class="detail-section">
                        <h4>Eventos ({{ detail()!.events.length }})</h4>
                        @for (event of detail()!.events; track event.id) {
                          <div class="event-row">
                            <span class="event-name">{{ event.name || 'Sin nombre' }}</span>
                            <span class="badge badge-sm" [class]="'badge-' + event.lifecycle_status">
                              {{ event.lifecycle_status }}
                            </span>
                            <span class="event-date">
                              {{ event.deactivation_date ? (event.deactivation_date | date:'dd/MM/yy') : '—' }}
                            </span>
                            <button class="btn btn-xs btn-secondary" (click)="openExtendForm(event.id, $event)">
                              <span class="material-icons">schedule</span> Extender
                            </button>
                          </div>
                        }
                      </div>

                      <!-- Transactions -->
                      <div class="detail-section">
                        <h4>Transacciones ({{ detail()!.transactions.length }})</h4>
                        @for (tx of detail()!.transactions; track tx.id) {
                          <div class="tx-row">
                            <span class="tx-gateway">{{ tx.gateway }}</span>
                            <span class="tx-amount">\${{ tx.amount | number:'1.2-2' }} {{ tx.currency }}</span>
                            <span class="badge badge-sm" [class]="'badge-' + tx.status">{{ tx.status }}</span>
                            <span class="tx-type">{{ tx.type }}</span>
                            <span class="tx-date">{{ tx.created_at | date:'dd/MM/yy HH:mm' }}</span>
                          </div>
                        }
                        @if (detail()!.transactions.length === 0) {
                          <p class="text-muted">Sin transacciones registradas</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination -->
        <div class="pagination-bar">
          <span class="pagination-info">
            Página {{ pagination().page }} de {{ pagination().pages }} ({{ pagination().total }} registros)
          </span>
          <div class="pagination-actions">
            <button class="btn btn-sm btn-secondary" [disabled]="pagination().page <= 1" (click)="goToPage(pagination().page - 1)">
              <span class="material-icons">chevron_left</span>
            </button>
            <button class="btn btn-sm btn-secondary" [disabled]="pagination().page >= pagination().pages" (click)="goToPage(pagination().page + 1)">
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      }

      <!-- Extend Modal -->
      @if (extendEventId()) {
        <div class="modal-overlay" (click)="closeExtendForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Extender fecha de desactivación</h3>
              <button class="btn btn-icon btn-secondary" (click)="closeExtendForm()">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="form-group">
              <label>Nueva fecha de desactivación</label>
              <input type="datetime-local" [(ngModel)]="extendDate">
            </div>
            <div class="form-group">
              <label>Razón</label>
              <textarea [(ngModel)]="extendReason" rows="3" placeholder="Razón de la extensión..."></textarea>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeExtendForm()">Cancelar</button>
              <button class="btn btn-primary" (click)="submitExtend()" [disabled]="extending() || !extendDate">
                {{ extending() ? 'Guardando...' : 'Extender' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
    .section-subtitle { color: rgba(255,255,255,0.6); margin: 0; font-size: 0.9rem; }
    .filters-bar {
      display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
    }
    .filters-bar select, .filters-bar input {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 0.85rem;
    }
    .filters-bar select:focus, .filters-bar input:focus {
      outline: none; border-color: #bb86fc;
    }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: rgba(255,255,255,0.6); }
    .loading-state.sm { padding: 24px; }
    .empty-state { text-align: center; padding: 48px; color: rgba(255,255,255,0.4); }
    .empty-state .material-icons { font-size: 3rem; display: block; margin-bottom: 12px; }
    .purchases-list { display: flex; flex-direction: column; gap: 8px; }
    .purchase-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; overflow: hidden; transition: border-color 0.2s;
    }
    .purchase-card:hover { border-color: rgba(187,134,252,0.3); }
    .purchase-card.expanded { border-color: rgba(187,134,252,0.4); }
    .purchase-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 18px; cursor: pointer; gap: 12px; flex-wrap: wrap;
    }
    .purchase-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .purchase-id { color: rgba(255,255,255,0.4); font-size: 0.8rem; font-weight: 600; }
    .purchase-user { color: #fff; font-weight: 500; font-size: 0.9rem; }
    .purchase-plan { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
    .purchase-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .purchase-amount { color: #bb86fc; font-weight: 600; font-size: 0.9rem; }
    .purchase-date { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
    .expand-icon { color: rgba(255,255,255,0.4); font-size: 1.2rem; }
    .badge { padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .badge-sm { padding: 2px 6px; font-size: 0.65rem; }
    .badge-completed { background: rgba(76,175,80,0.15); color: #4caf50; }
    .badge-pending { background: rgba(255,193,7,0.15); color: #ffc107; }
    .badge-failed { background: rgba(244,67,54,0.15); color: #f44336; }
    .badge-refunded { background: rgba(156,39,176,0.15); color: #ce93d8; }
    .badge-available { background: rgba(33,150,243,0.15); color: #42a5f5; }
    .badge-active { background: rgba(76,175,80,0.15); color: #4caf50; }
    .purchase-detail { padding: 0 18px 18px; border-top: 1px solid rgba(255,255,255,0.06); }
    .detail-sections { display: flex; flex-direction: column; gap: 16px; margin-top: 14px; }
    .detail-section h4 { color: rgba(255,255,255,0.7); font-size: 0.85rem; font-weight: 600; margin: 0 0 10px; }
    .event-row, .tx-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      background: rgba(255,255,255,0.02); border-radius: 6px; margin-bottom: 6px; flex-wrap: wrap;
    }
    .event-name, .tx-gateway { color: #fff; font-size: 0.85rem; font-weight: 500; min-width: 100px; }
    .event-date, .tx-date { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
    .tx-amount { color: #bb86fc; font-size: 0.85rem; font-weight: 500; }
    .tx-type { color: rgba(255,255,255,0.5); font-size: 0.8rem; }
    .pagination-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 20px; padding: 12px 0;
    }
    .pagination-info { color: rgba(255,255,255,0.5); font-size: 0.85rem; }
    .pagination-actions { display: flex; gap: 6px; }
    .text-muted { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #bb86fc, #6366f1); color: #fff; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.1); }
    .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
    .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-sm { padding: 6px 10px; font-size: 0.8rem; }
    .btn-xs { padding: 4px 8px; font-size: 0.75rem; }
    .btn-xs .material-icons { font-size: 0.9rem; }
    .btn-icon { padding: 6px; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex;
      align-items: center; justify-content: center; z-index: 1000; padding: 24px;
    }
    .modal {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
      padding: 24px; width: 100%; max-width: 440px;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { color: #fff; font-size: 1.1rem; margin: 0; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-bottom: 6px; }
    .form-group input, .form-group textarea {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 0.9rem; resize: vertical;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #bb86fc; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      :host { padding: 16px; }
      .purchase-row { flex-direction: column; align-items: flex-start; }
      .purchase-meta { width: 100%; justify-content: flex-start; }
    }
  `]
})
export class PurchasesAdminComponent implements OnInit {
  private adminService = inject(AdminService);

  purchases = signal<Purchase[]>([]);
  loading = signal(false);
  exporting = signal(false);
  expandedId = signal<number | null>(null);
  detail = signal<PurchaseDetail | null>(null);
  detailLoading = signal(false);
  pagination = signal({ page: 1, limit: 20, total: 0, pages: 0 });

  // Extend form
  extendEventId = signal<number | null>(null);
  extendDate = '';
  extendReason = '';
  extending = signal(false);

  filters: PurchaseFilters = {
    status: '',
    from_date: '',
    to_date: '',
    page: 1,
    limit: 20
  };

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading.set(true);
    const f: PurchaseFilters = { ...this.filters };
    if (!f.status) delete f.status;
    if (!f.from_date) delete f.from_date;
    if (!f.to_date) delete f.to_date;

    this.adminService.getPurchases(f).subscribe({
      next: (res) => {
        this.purchases.set(res.purchases);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.filters = { status: '', from_date: '', to_date: '', page: 1, limit: 20 };
    this.loadPurchases();
  }

  goToPage(page: number): void {
    this.filters.page = page;
    this.loadPurchases();
  }

  toggleExpand(id: number): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      this.detail.set(null);
      return;
    }
    this.expandedId.set(id);
    this.loadDetail(id);
  }

  private loadDetail(id: number): void {
    this.detailLoading.set(true);
    this.detail.set(null);
    this.adminService.getPurchaseDetail(id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
      }
    });
  }

  openExtendForm(eventId: number, event: Event): void {
    event.stopPropagation();
    this.extendEventId.set(eventId);
    this.extendDate = '';
    this.extendReason = '';
  }

  closeExtendForm(): void {
    this.extendEventId.set(null);
  }

  submitExtend(): void {
    const eventId = this.extendEventId();
    if (!eventId || !this.extendDate) return;

    this.extending.set(true);
    this.adminService.extendEvent(eventId, {
      new_deactivation_date: this.extendDate,
      reason: this.extendReason
    }).subscribe({
      next: () => {
        this.extending.set(false);
        this.closeExtendForm();
        // Reload detail
        const expanded = this.expandedId();
        if (expanded) this.loadDetail(expanded);
      },
      error: () => {
        this.extending.set(false);
      }
    });
  }

  exportExcel(): void {
    this.exporting.set(true);
    const f: PurchaseFilters = { ...this.filters };
    if (!f.status) delete f.status;
    if (!f.from_date) delete f.from_date;
    if (!f.to_date) delete f.to_date;
    delete f.page;
    delete f.limit;

    this.adminService.exportPurchases(f).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compras.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => {
        this.exporting.set(false);
      }
    });
  }
}
