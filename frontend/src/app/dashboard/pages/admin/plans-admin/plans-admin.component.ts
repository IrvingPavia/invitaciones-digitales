import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlansService, Plan } from '../../../../core/services/plans.service';
import { DialogService } from '../../../../core/services/dialog.service';

@Component({
  selector: 'app-plans-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex;flex-direction:column;flex:1;min-height:0;padding:24px">
      <div class="flex-between mb-24">
        <div>
          <h2 class="section-title">Administración de Paquetes</h2>
          <p class="section-subtitle">Gestiona los paquetes disponibles para los clientes</p>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <span class="material-icons">add</span> Nuevo Paquete
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="empty-state">
          <span class="material-icons spin">autorenew</span>
          <p>Cargando paquetes...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="empty-state">
          <span class="material-icons" style="color:#f87171">error</span>
          <p>{{ error() }}</p>
          <button class="btn btn-secondary btn-sm" (click)="loadPlans()">Reintentar</button>
        </div>
      }

      <!-- Plans table -->
      @if (!loading() && !error()) {
        <div class="plans-table-wrapper">
          <table class="plans-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Precio</th>
                <th>Invitados</th>
                <th>Trial</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (plan of plans(); track plan.id) {
                <tr [class.inactive-row]="plan.status === 'inactive'">
                  <td class="center">{{ plan.sort_order }}</td>
                  <td><strong>{{ plan.name }}</strong></td>
                  <td class="slug-cell">{{ plan.slug }}</td>
                  <td class="center">\${{ plan.price | number:'1.2-2' }}</td>
                  <td class="center">{{ plan.max_guests ?? '∞' }}</td>
                  <td class="center">
                    @if (plan.is_trial) {
                      <span class="badge badge-info">{{ plan.trial_days }}d</span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td class="center">
                    <span class="status-badge" [class.active]="plan.status === 'active'" [class.inactive]="plan.status === 'inactive'">
                      {{ plan.status === 'active' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon-sm" title="Editar" (click)="openEdit(plan)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon-sm" [title]="plan.status === 'active' ? 'Desactivar' : 'Activar'" (click)="toggleStatus(plan)">
                      <span class="material-icons">{{ plan.status === 'active' ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-table">No hay paquetes registrados</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal Create/Edit -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditing() ? 'Editar Paquete' : 'Nuevo Paquete' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="closeModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="grid-2">
              <div class="form-group">
                <label>Nombre *</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Ej: Invitación Digital">
              </div>
              <div class="form-group">
                <label>Slug *</label>
                <input type="text" [(ngModel)]="form.slug" placeholder="ej: invitacion-digital">
              </div>
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="form.description" rows="2" placeholder="Descripción breve del paquete"></textarea>
            </div>

            <div class="grid-3">
              <div class="form-group">
                <label>Precio (MXN) *</label>
                <input type="number" [(ngModel)]="form.price" min="0" step="0.01" placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Máx. Invitados</label>
                <input type="number" [(ngModel)]="form.max_guests" min="1" placeholder="Ilimitado si vacío">
              </div>
              <div class="form-group">
                <label>Orden</label>
                <input type="number" [(ngModel)]="form.sort_order" min="0" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label>Features (separadas por coma)</label>
              <input type="text" [(ngModel)]="form.features_text" placeholder="landing_builder, card_editor, pdf_export, qr_codes, guest_management">
              <small class="form-hint">Opciones: landing_builder, card_editor, pdf_export, qr_codes, guest_management, all</small>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="toggle-pill-inline" (click)="form.is_trial = !form.is_trial">
                  <span class="toggle-pill-dot-sm" [class.active]="form.is_trial"></span>
                  <span>Es paquete Trial</span>
                </label>
              </div>
              @if (form.is_trial) {
                <div class="form-group">
                  <label>Días de trial</label>
                  <input type="number" [(ngModel)]="form.trial_days" min="1" placeholder="7">
                </div>
              }
            </div>

            <div class="form-group">
              <label>Descuento por volumen (JSON)</label>
              <textarea [(ngModel)]="form.volume_discount_text" rows="2" placeholder='[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}]'></textarea>
              <small class="form-hint">Formato: [&#123;"min_qty": N, "discount_pct": N&#125;, ...]</small>
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select [(ngModel)]="form.status">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(255, 255, 255, 0.6);
      .material-icons { font-size: 48px; margin-bottom: 16px; color: #7c5cbf; }
      p { font-size: 15px; margin-bottom: 16px; }
    }

    .spin { animation: spin 1.2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .plans-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid rgba(124, 92, 191, 0.2);
      background: rgba(26, 26, 42, 0.6);
    }

    .plans-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        text-align: left;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid rgba(124, 92, 191, 0.2);
        background: rgba(124, 92, 191, 0.06);
        white-space: nowrap;
      }

      td {
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.85);
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        vertical-align: middle;
      }

      tr:last-child td { border-bottom: none; }
      tr:hover td { background: rgba(124, 92, 191, 0.06); }
    }

    .inactive-row td { opacity: 0.5; }
    .center { text-align: center; }
    .slug-cell { color: rgba(255, 255, 255, 0.5); font-family: monospace; font-size: 12px; }
    .text-muted { color: rgba(255, 255, 255, 0.3); }

    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      &.active { background: rgba(76, 175, 80, 0.15); color: #66bb6a; }
      &.inactive { background: rgba(248, 113, 113, 0.15); color: #f87171; }
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-icon-sm {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      .material-icons { font-size: 18px; }
      &:hover { color: #c084fc; background: rgba(124, 92, 191, 0.12); }
    }

    .empty-table {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      padding: 40px 16px !important;
    }

    .modal-lg {
      max-width: 640px;
      width: 95vw;
    }

    .modal-body {
      max-height: 65vh;
      overflow-y: auto;
      padding: 16px 24px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      input, textarea, select {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(124, 92, 191, 0.3);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #7c5cbf;
          box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.15);
        }

        &::placeholder { color: rgba(255, 255, 255, 0.3); }
      }

      textarea { resize: vertical; }
      select { appearance: auto; }
    }

    .form-hint {
      display: block;
      margin-top: 4px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 11px;
    }

    .toggle-pill-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      user-select: none;
      margin-top: 24px;
    }

    .toggle-pill-dot-sm {
      width: 36px;
      height: 20px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.15);
      position: relative;
      transition: all 0.3s;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        top: 2px;
        left: 2px;
        transition: all 0.3s;
      }

      &.active {
        background: var(--gold, #7c5cbf);
        &::after { left: 18px; background: white; }
      }
    }

    .badge-info {
      background: rgba(124, 92, 191, 0.15);
      color: #c084fc;
      padding: 3px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .plans-table { font-size: 12px; }
      .plans-table th, .plans-table td { padding: 8px 10px; }
    }
  `]
})
export class PlansAdminComponent implements OnInit {
  private plansService = inject(PlansService);
  private dialog = inject(DialogService);

  plans = signal<Plan[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  isEditing = signal(false);
  saving = signal(false);

  editId = 0;
  form: any = this.getEmptyForm();

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.error.set('');
    this.plansService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans.sort((a, b) => a.sort_order - b.sort_order));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los paquetes.');
        this.loading.set(false);
      }
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.form = this.getEmptyForm();
    this.showModal.set(true);
  }

  openEdit(plan: Plan): void {
    this.isEditing.set(true);
    this.editId = plan.id;
    this.form = {
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      max_guests: plan.max_guests,
      is_trial: plan.is_trial,
      trial_days: plan.trial_days,
      features_text: (plan.features || []).join(', '),
      volume_discount_text: plan.volume_discount?.length ? JSON.stringify(plan.volume_discount) : '',
      status: plan.status,
      sort_order: plan.sort_order || 0
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  save(): void {
    if (!this.form.name || !this.form.slug) {
      this.dialog.alert('Validación', 'Nombre y slug son requeridos.');
      return;
    }

    const data: Partial<Plan> = {
      name: this.form.name.trim(),
      slug: this.form.slug.trim(),
      description: this.form.description?.trim() || '',
      price: Number(this.form.price) || 0,
      max_guests: this.form.max_guests ? Number(this.form.max_guests) : null,
      is_trial: !!this.form.is_trial,
      trial_days: this.form.is_trial ? (Number(this.form.trial_days) || 7) : null,
      features: this.parseFeatures(this.form.features_text),
      volume_discount: this.parseVolumeDiscount(this.form.volume_discount_text),
      status: this.form.status || 'active',
      sort_order: Number(this.form.sort_order) || 0
    };

    this.saving.set(true);

    const obs = this.isEditing()
      ? this.plansService.updatePlan(this.editId, data)
      : this.plansService.createPlan(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadPlans();
      },
      error: (err) => {
        this.saving.set(false);
        this.dialog.alert('Error', err.error?.error || 'Error al guardar el paquete.');
      }
    });
  }

  async toggleStatus(plan: Plan): Promise<void> {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'desactivar' : 'activar';

    let message = `¿${action.charAt(0).toUpperCase() + action.slice(1)} el paquete "${plan.name}"?`;
    if (newStatus === 'inactive') {
      message += '\n\nNota: Los eventos ya comprados con este paquete seguirán activos.';
    }

    const confirmed = await this.dialog.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} paquete`,
      message,
      action.charAt(0).toUpperCase() + action.slice(1)
    );

    if (!confirmed) return;

    this.plansService.togglePlanStatus(plan.id, newStatus).subscribe({
      next: () => this.loadPlans(),
      error: (err) => this.dialog.alert('Error', err.error?.error || 'Error al cambiar estado.')
    });
  }

  private getEmptyForm() {
    return {
      name: '',
      slug: '',
      description: '',
      price: 0,
      max_guests: null as number | null,
      is_trial: false,
      trial_days: 7,
      features_text: '',
      volume_discount_text: '',
      status: 'active' as 'active' | 'inactive',
      sort_order: 0
    };
  }

  private parseFeatures(text: string): string[] {
    if (!text) return [];
    return text.split(',').map(f => f.trim()).filter(f => f.length > 0);
  }

  private parseVolumeDiscount(text: string): { min_qty: number; discount_pct: number }[] {
    if (!text || !text.trim()) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }
}
