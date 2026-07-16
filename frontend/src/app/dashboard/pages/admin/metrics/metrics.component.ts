import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminMetrics } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-page">
      <div class="header">
        <h2 class="section-title">Métricas</h2>
        <p class="section-subtitle">Dashboard de rendimiento del negocio</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="material-icons spin">sync</span>
          <p>Cargando métricas...</p>
        </div>
      }

      @if (!loading() && metrics()) {
        <div class="metrics-grid">
          <!-- Revenue card -->
          <div class="metric-card revenue">
            <div class="metric-icon">
              <span class="material-icons">payments</span>
            </div>
            <div class="metric-content">
              <span class="metric-label">Ingresos del mes</span>
              <span class="metric-value">\${{ metrics()!.revenue_month | number:'1.2-2' }} MXN</span>
            </div>
          </div>

          <!-- Active events card -->
          <div class="metric-card events">
            <div class="metric-icon">
              <span class="material-icons">event</span>
            </div>
            <div class="metric-content">
              <span class="metric-label">Eventos activos</span>
              <span class="metric-value">{{ metrics()!.active_events }}</span>
            </div>
          </div>

          <!-- Trial conversion card -->
          <div class="metric-card conversion">
            <div class="metric-icon">
              <span class="material-icons">trending_up</span>
            </div>
            <div class="metric-content">
              <span class="metric-label">Conversión Trial</span>
              <span class="metric-value">{{ (metrics()!.trial_conversion.ratio * 100) | number:'1.0-0' }}%</span>
              <span class="metric-sub">
                {{ metrics()!.trial_conversion.converted }} de {{ metrics()!.trial_conversion.trial_users }} usuarios trial
              </span>
            </div>
          </div>

          <!-- Sales by plan card -->
          <div class="metric-card sales-plan full-width">
            <div class="metric-header">
              <div class="metric-icon">
                <span class="material-icons">bar_chart</span>
              </div>
              <span class="metric-label">Ventas por paquete</span>
            </div>
            <div class="plan-list">
              @for (plan of metrics()!.sales_by_plan; track plan.plan_name) {
                <div class="plan-row">
                  <span class="plan-name">{{ plan.plan_name || 'Sin nombre' }}</span>
                  <div class="plan-bar-container">
                    <div class="plan-bar" [style.width.%]="getBarWidth(plan.total)"></div>
                  </div>
                  <span class="plan-count">{{ plan.count }} ventas</span>
                  <span class="plan-total">\${{ plan.total | number:'1.2-2' }}</span>
                </div>
              }
              @if (metrics()!.sales_by_plan.length === 0) {
                <p class="text-muted">Sin ventas registradas</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; padding: 24px; }
    .header { margin-bottom: 24px; }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
    .section-subtitle { color: rgba(255,255,255,0.6); margin: 0; font-size: 0.9rem; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: rgba(255,255,255,0.6); }
    .metrics-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;
    }
    .metric-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px;
      transition: border-color 0.2s;
    }
    .metric-card:hover { border-color: rgba(187,134,252,0.3); }
    .metric-card.full-width { grid-column: 1 / -1; flex-direction: column; align-items: stretch; }
    .metric-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .metric-icon {
      width: 44px; height: 44px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .metric-icon .material-icons { font-size: 1.3rem; }
    .revenue .metric-icon { background: rgba(76,175,80,0.15); }
    .revenue .metric-icon .material-icons { color: #4caf50; }
    .events .metric-icon { background: rgba(33,150,243,0.15); }
    .events .metric-icon .material-icons { color: #42a5f5; }
    .conversion .metric-icon { background: rgba(255,193,7,0.15); }
    .conversion .metric-icon .material-icons { color: #ffc107; }
    .sales-plan .metric-icon { background: rgba(187,134,252,0.15); }
    .sales-plan .metric-icon .material-icons { color: #bb86fc; }
    .metric-content { display: flex; flex-direction: column; gap: 2px; }
    .metric-label { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
    .metric-value { color: #fff; font-size: 1.4rem; font-weight: 700; }
    .metric-sub { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
    .plan-list { display: flex; flex-direction: column; gap: 10px; }
    .plan-row {
      display: flex; align-items: center; gap: 12px; padding: 8px 0;
    }
    .plan-name { color: #fff; font-size: 0.85rem; font-weight: 500; min-width: 140px; }
    .plan-bar-container {
      flex: 1; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;
    }
    .plan-bar {
      height: 100%; background: linear-gradient(90deg, #bb86fc, #6366f1);
      border-radius: 4px; min-width: 4px; transition: width 0.5s ease;
    }
    .plan-count { color: rgba(255,255,255,0.5); font-size: 0.8rem; min-width: 70px; text-align: right; }
    .plan-total { color: #bb86fc; font-size: 0.85rem; font-weight: 600; min-width: 90px; text-align: right; }
    .text-muted { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      :host { padding: 16px; }
      .metrics-grid { grid-template-columns: 1fr; }
      .plan-row { flex-wrap: wrap; }
      .plan-name { min-width: 100%; }
    }

    /* Light mode support */
    :host-context(body.light-mode) .section-title { color: #333; }
    :host-context(body.light-mode) .section-subtitle { color: #666; }
    :host-context(body.light-mode) .loading-state { color: #666; }
    :host-context(body.light-mode) .metric-card {
      background: #ffffff; border-color: #e0e0e8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    :host-context(body.light-mode) .metric-card:hover { border-color: rgba(124,92,191,0.3); }
    :host-context(body.light-mode) .metric-label { color: #666; }
    :host-context(body.light-mode) .metric-value { color: #333; }
    :host-context(body.light-mode) .metric-sub { color: #888; }
    :host-context(body.light-mode) .plan-name { color: #333; }
    :host-context(body.light-mode) .plan-count { color: #666; }
    :host-context(body.light-mode) .plan-total { color: #7c5cbf; }
    :host-context(body.light-mode) .plan-bar-container { background: rgba(124,92,191,0.1); }
    :host-context(body.light-mode) .text-muted { color: #888; }
  `]
})
export class MetricsComponent implements OnInit {
  private adminService = inject(AdminService);

  metrics = signal<AdminMetrics | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    this.loading.set(true);
    this.adminService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getBarWidth(total: number): number {
    const m = this.metrics();
    if (!m || m.sales_by_plan.length === 0) return 0;
    const max = Math.max(...m.sales_by_plan.map(p => p.total));
    return max > 0 ? (total / max) * 100 : 0;
  }
}
