import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService, Plan } from '../../../core/services/plans.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Payment status messages -->
    @if (paymentStatus() === 'success') {
      <div class="status-banner success">
        <span class="material-icons">check_circle</span>
        <div>
          <h3>¡Pago exitoso!</h3>
          <p>Tu compra ha sido procesada correctamente. Tus eventos están disponibles.</p>
        </div>
      </div>
    }

    @if (paymentStatus() === 'cancelled') {
      <div class="status-banner cancelled">
        <span class="material-icons">cancel</span>
        <div>
          <h3>Pago cancelado</h3>
          <p>El proceso de pago fue cancelado. Puedes intentarlo nuevamente.</p>
        </div>
      </div>
    }

    <!-- Checkout flow -->
    @if (!paymentStatus()) {
      <div class="checkout-container">
        <h2 class="section-title">Checkout</h2>
        <p class="section-subtitle">Resumen de tu compra</p>

        @if (loading()) {
          <div class="loading-state">
            <span class="material-icons spin">sync</span>
            <p>Cargando detalles del plan...</p>
          </div>
        }

        @if (error()) {
          <div class="status-banner cancelled">
            <span class="material-icons">error</span>
            <p>{{ error() }}</p>
          </div>
        }

        @if (plan() && !loading()) {
          <div class="checkout-grid">
            <!-- Purchase summary -->
            <div class="summary-card">
              <h3 class="card-title">Resumen de compra</h3>
              <div class="summary-rows">
                <div class="summary-row">
                  <span class="label">Plan</span>
                  <span class="value">{{ plan()!.name }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Cantidad de eventos</span>
                  <span class="value">{{ quantity() }}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Precio unitario</span>
                  <span class="value">\${{ plan()!.price | number:'1.2-2' }} MXN</span>
                </div>
                @if (discountPct() > 0) {
                  <div class="summary-row discount">
                    <span class="label">
                      <span class="material-icons">local_offer</span>
                      Descuento por volumen
                    </span>
                    <span class="value discount-value">-{{ discountPct() }}%</span>
                  </div>
                }
                <div class="summary-row total">
                  <span class="label">Total</span>
                  <span class="value">\${{ totalAmount() | number:'1.2-2' }} MXN</span>
                </div>
              </div>
            </div>

            <!-- Gateway selection -->
            <div class="gateway-card">
              <h3 class="card-title">Método de pago</h3>
              <div class="gateway-options">
                <label class="gateway-option" [class.selected]="selectedGateway() === 'stripe'">
                  <input
                    type="radio"
                    name="gateway"
                    value="stripe"
                    [checked]="selectedGateway() === 'stripe'"
                    (change)="selectGateway('stripe')" />
                  <div class="gateway-content">
                    <div class="gateway-icon">
                      <span class="material-icons">credit_card</span>
                    </div>
                    <div class="gateway-info">
                      <span class="gateway-name">Stripe</span>
                      <span class="gateway-desc">Tarjeta de crédito/débito</span>
                    </div>
                  </div>
                  <span class="radio-check"></span>
                </label>

                <label class="gateway-option" [class.selected]="selectedGateway() === 'mercadopago'">
                  <input
                    type="radio"
                    name="gateway"
                    value="mercadopago"
                    [checked]="selectedGateway() === 'mercadopago'"
                    (change)="selectGateway('mercadopago')" />
                  <div class="gateway-content">
                    <div class="gateway-icon mp-icon">
                      <span class="material-icons">account_balance</span>
                    </div>
                    <div class="gateway-info">
                      <span class="gateway-name">MercadoPago</span>
                      <span class="gateway-desc">Tarjetas, transferencias, OXXO</span>
                    </div>
                  </div>
                  <span class="radio-check"></span>
                </label>
              </div>

              <button
                class="pay-btn"
                [disabled]="creatingSession()"
                (click)="pay()">
                @if (creatingSession()) {
                  <span class="material-icons spin">sync</span>
                  Procesando...
                } @else {
                  <span class="material-icons">lock</span>
                  Pagar \${{ totalAmount() | number:'1.2-2' }} MXN
                }
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 4px;
    }

    .section-subtitle {
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 24px;
      font-size: 0.9rem;
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .status-banner.success {
      background: rgba(76, 175, 80, 0.12);
      border: 1px solid rgba(76, 175, 80, 0.3);
    }

    .status-banner.success .material-icons {
      color: #4caf50;
      font-size: 2rem;
    }

    .status-banner.success h3 {
      color: #4caf50;
      margin: 0 0 4px;
      font-size: 1.1rem;
    }

    .status-banner.success p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-size: 0.9rem;
    }

    .status-banner.cancelled {
      background: rgba(244, 67, 54, 0.12);
      border: 1px solid rgba(244, 67, 54, 0.3);
    }

    .status-banner.cancelled .material-icons {
      color: #f44336;
      font-size: 2rem;
    }

    .status-banner.cancelled h3 {
      color: #f44336;
      margin: 0 0 4px;
      font-size: 1.1rem;
    }

    .status-banner.cancelled p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-size: 0.9rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px;
      color: rgba(255, 255, 255, 0.6);
    }

    .loading-state .material-icons {
      font-size: 2rem;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }

    .summary-card, .gateway-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 24px;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-row .label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
    }

    .summary-row .value {
      color: #fff;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .summary-row.discount .label {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #4caf50;
    }

    .summary-row.discount .label .material-icons {
      font-size: 1rem;
    }

    .summary-row.discount .discount-value {
      color: #4caf50;
      font-weight: 600;
    }

    .summary-row.total {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 14px;
      margin-top: 4px;
    }

    .summary-row.total .label {
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
    }

    .summary-row.total .value {
      color: #bb86fc;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .gateway-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .gateway-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .gateway-option:hover {
      border-color: rgba(187, 134, 252, 0.3);
      background: rgba(187, 134, 252, 0.04);
    }

    .gateway-option.selected {
      border-color: #bb86fc;
      background: rgba(187, 134, 252, 0.08);
    }

    .gateway-option input[type="radio"] {
      display: none;
    }

    .gateway-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .gateway-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(99, 102, 241, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gateway-icon .material-icons {
      color: #6366f1;
      font-size: 1.2rem;
    }

    .gateway-icon.mp-icon {
      background: rgba(0, 158, 227, 0.15);
    }

    .gateway-icon.mp-icon .material-icons {
      color: #009ee3;
    }

    .gateway-info {
      display: flex;
      flex-direction: column;
    }

    .gateway-name {
      color: #fff;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .gateway-desc {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .radio-check {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      position: relative;
      transition: all 0.2s ease;
    }

    .gateway-option.selected .radio-check {
      border-color: #bb86fc;
    }

    .gateway-option.selected .radio-check::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #bb86fc;
    }

    .pay-btn {
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #bb86fc, #6366f1);
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .pay-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .pay-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pay-btn .material-icons {
      font-size: 1.1rem;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private plansService = inject(PlansService);
  private paymentService = inject(PaymentService);

  plan = signal<Plan | null>(null);
  quantity = signal<number>(1);
  selectedGateway = signal<'stripe' | 'mercadopago'>('stripe');
  loading = signal(false);
  creatingSession = signal(false);
  error = signal<string | null>(null);
  paymentStatus = signal<'success' | 'cancelled' | null>(null);

  discountPct = computed(() => {
    const p = this.plan();
    const qty = this.quantity();
    if (!p || !p.volume_discount || p.volume_discount.length === 0) return 0;

    const sorted = [...p.volume_discount].sort((a, b) => b.min_qty - a.min_qty);
    const applicable = sorted.find(rule => qty >= rule.min_qty);
    return applicable ? applicable.discount_pct : 0;
  });

  totalAmount = computed(() => {
    const p = this.plan();
    const qty = this.quantity();
    const discount = this.discountPct();
    if (!p) return 0;
    return p.price * qty * (1 - discount / 100);
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    // Handle payment status redirects
    if (params['payment'] === 'success') {
      this.paymentStatus.set('success');
      return;
    }
    if (params['payment'] === 'cancelled') {
      this.paymentStatus.set('cancelled');
      return;
    }

    // Read checkout params
    const planId = Number(params['planId']);
    const qty = Number(params['quantity']) || 1;

    if (!planId) {
      this.error.set('No se especificó un plan. Vuelve al catálogo para seleccionar uno.');
      return;
    }

    this.quantity.set(qty);
    this.fetchPlan(planId);
  }

  private fetchPlan(planId: number): void {
    this.loading.set(true);
    this.plansService.getPlan(planId).subscribe({
      next: (plan) => {
        this.plan.set(plan);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el plan. Intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  selectGateway(gateway: 'stripe' | 'mercadopago'): void {
    this.selectedGateway.set(gateway);
  }

  pay(): void {
    const p = this.plan();
    if (!p) return;

    this.creatingSession.set(true);
    this.paymentService.createSession(p.id, this.quantity(), this.selectedGateway()).subscribe({
      next: (response) => {
        window.location.href = response.session_url;
      },
      error: () => {
        this.creatingSession.set(false);
        this.error.set('Error al crear la sesión de pago. Intenta nuevamente.');
      }
    });
  }
}
