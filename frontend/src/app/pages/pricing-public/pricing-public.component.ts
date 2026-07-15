import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlansService, Plan } from '../../core/services/plans.service';

@Component({
  selector: 'app-pricing-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pricing-page">
      <!-- Navigation -->
      <nav class="pp-nav">
        <a routerLink="/">
          <img src="assets/icons/vitely-logo.png" class="pp-nav-logo" alt="Vitely">
        </a>
        <div class="pp-nav-links">
          <a routerLink="/">Inicio</a>
          <a routerLink="/login" class="pp-nav-cta">Iniciar sesión</a>
        </div>
      </nav>

      <!-- Hero -->
      <section class="pp-hero">
        <div class="pp-hero-glow"></div>
        <h1 class="pp-hero-title">Paquetes y Precios</h1>
        <p class="pp-hero-sub">Elige el paquete ideal para tu evento. Pago único, sin suscripciones.</p>
      </section>

      <!-- Plans Cards -->
      <section class="pp-plans">
        @if (loading()) {
          <div class="pp-loading">
            <span class="material-icons spinning">hourglass_empty</span>
            <p>Cargando paquetes...</p>
          </div>
        } @else {
          <div class="pp-plans-grid">
            @for (plan of plans(); track plan.id) {
              <div class="pp-plan-card" [class.pp-recommended]="plan.slug === 'completo'">
                @if (plan.slug === 'completo') {
                  <div class="pp-badge">Recomendado</div>
                }
                <h3 class="pp-plan-name">{{ plan.name }}</h3>
                <p class="pp-plan-desc">{{ plan.description }}</p>
                <div class="pp-plan-price">
                  <span class="pp-price-amount">\${{ plan.price | number:'1.0-0' }}</span>
                  <span class="pp-price-unit">MXN / evento</span>
                </div>
                <ul class="pp-plan-features">
                  @for (feature of plan.features; track feature) {
                    <li>
                      <span class="material-icons">check_circle</span>
                      {{ getFeatureLabel(feature) }}
                    </li>
                  }
                </ul>
                <div class="pp-plan-guests">
                  <span class="material-icons">people</span>
                  {{ plan.max_guests ? plan.max_guests + ' invitados máx.' : 'Invitados ilimitados' }}
                </div>
                @if (plan.volume_discount && plan.volume_discount.length > 0) {
                  <div class="pp-volume-discount">
                    <span class="material-icons">local_offer</span>
                    <span>Descuento por volumen disponible</span>
                  </div>
                }
                <a
                  routerLink="/registro"
                  [queryParams]="{ plan: plan.slug }"
                  class="pp-plan-btn"
                  [class.pp-plan-btn-primary]="plan.slug === 'completo'"
                >
                  {{ plan.is_trial ? 'Probar gratis' : 'Comenzar' }}
                </a>
              </div>
            }
          </div>
        }
      </section>

      <!-- Feature Comparison Table -->
      <section class="pp-comparison">
        <h2 class="pp-section-title">Comparativa de funcionalidades</h2>
        <p class="pp-section-sub">Compara lo que incluye cada paquete</p>
        <div class="pp-table-wrapper">
          <table class="pp-table" aria-label="Tabla comparativa de funcionalidades por paquete">
            <thead>
              <tr>
                <th>Funcionalidad</th>
                @for (plan of plans(); track plan.id) {
                  <th>{{ plan.name }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (feature of comparisonFeatures; track feature.key) {
                <tr>
                  <td>{{ feature.label }}</td>
                  @for (plan of plans(); track plan.id) {
                    <td>
                      @if (plan.features.includes(feature.key) || plan.features.includes('all')) {
                        <span class="material-icons pp-check">check_circle</span>
                      } @else {
                        <span class="material-icons pp-cross">cancel</span>
                      }
                    </td>
                  }
                </tr>
              }
              <tr>
                <td>Límite de invitados</td>
                @for (plan of plans(); track plan.id) {
                  <td>{{ plan.max_guests ? plan.max_guests : 'Ilimitados' }}</td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Volume Discount Section -->
      @if (plansWithDiscount().length > 0) {
        <section class="pp-discounts">
          <h2 class="pp-section-title">Descuentos por volumen</h2>
          <p class="pp-section-sub">Compra múltiples eventos y ahorra</p>
          <div class="pp-discounts-grid">
            @for (plan of plansWithDiscount(); track plan.id) {
              <div class="pp-discount-card">
                <h4>{{ plan.name }}</h4>
                <ul>
                  @for (tier of plan.volume_discount; track tier.min_qty) {
                    <li>
                      <strong>{{ tier.min_qty }}+ eventos:</strong> {{ tier.discount_pct }}% de descuento
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </section>
      }

      <!-- FAQ Section -->
      <section class="pp-faq">
        <h2 class="pp-section-title">Preguntas frecuentes</h2>
        <p class="pp-section-sub">Resolvemos tus dudas</p>
        <div class="pp-faq-list">
          @for (faq of faqs; track faq.question) {
            <div class="pp-faq-item" (click)="toggleFaq(faq)" (keydown.enter)="toggleFaq(faq)" tabindex="0" role="button" [attr.aria-expanded]="faq.open">
              <div class="pp-faq-question">
                <span>{{ faq.question }}</span>
                <span class="material-icons">{{ faq.open ? 'expand_less' : 'expand_more' }}</span>
              </div>
              @if (faq.open) {
                <p class="pp-faq-answer">{{ faq.answer }}</p>
              }
            </div>
          }
        </div>
      </section>

      <!-- CTA -->
      <section class="pp-cta">
        <div class="pp-cta-glow"></div>
        <h2>¿Listo para crear tu invitación?</h2>
        <p>Regístrate y elige tu paquete. Pago único, sin sorpresas.</p>
        <a routerLink="/registro" class="pp-btn pp-btn-primary pp-btn-lg">
          <span class="material-icons">rocket_launch</span>
          Crear mi cuenta
        </a>
      </section>

      <!-- Footer -->
      <footer class="pp-footer">
        <img src="assets/icons/vitely-logo.png" class="pp-footer-logo" alt="Vitely">
        <p>Invitaciones digitales profesionales</p>
        <p class="pp-footer-copy">© 2025 Vitely. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pricing-page {
      background: linear-gradient(135deg, #06060e 0%, #0e0e1a 50%, #06060e 100%);
      color: white;
      min-height: 100vh;
      font-family: var(--font-sans);
    }

    /* Nav */
    .pp-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 40px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      backdrop-filter: blur(16px);
      background: rgba(6, 6, 14, 0.85);
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    }
    .pp-nav-logo { height: 36px; object-fit: contain; }
    .pp-nav-links { display: flex; align-items: center; gap: 24px; }
    .pp-nav-links a { color: rgba(255, 255, 255, 0.65); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .pp-nav-links a:hover { color: white; }
    .pp-nav-cta { background: linear-gradient(135deg, #7c5cbf, #6246a3) !important; color: white !important; padding: 9px 22px; border-radius: 10px; font-weight: 600 !important; }

    /* Hero */
    .pp-hero {
      padding: 140px 40px 80px;
      text-align: center;
      position: relative;
    }
    .pp-hero-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 400px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%);
      filter: blur(80px);
      pointer-events: none;
    }
    .pp-hero-title {
      font-family: var(--font-montserrat);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      margin-bottom: 16px;
      position: relative;
      background: linear-gradient(135deg, #ffffff, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .pp-hero-sub {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.55);
      position: relative;
      max-width: 500px;
      margin: 0 auto;
    }

    /* Plans Grid */
    .pp-plans { padding: 0 40px 80px; }
    .pp-plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .pp-plan-card {
      background: rgba(12, 12, 24, 0.6);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 20px;
      padding: 36px 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.3s;
      position: relative;
    }
    .pp-plan-card:hover {
      border-color: rgba(139, 92, 246, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(139, 92, 246, 0.1);
    }
    .pp-recommended {
      border-color: rgba(124, 92, 191, 0.5);
      background: rgba(124, 92, 191, 0.08);
    }
    .pp-badge {
      position: absolute;
      top: -12px;
      background: linear-gradient(135deg, #7c5cbf, #a78bfa);
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .pp-plan-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      margin-top: 8px;
    }
    .pp-plan-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .pp-plan-price { margin-bottom: 24px; }
    .pp-price-amount {
      font-size: 36px;
      font-weight: 800;
      color: #c084fc;
    }
    .pp-price-unit {
      display: block;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 4px;
    }
    .pp-plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 20px;
      width: 100%;
      text-align: left;
    }
    .pp-plan-features li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .pp-plan-features li:last-child { border-bottom: none; }
    .pp-plan-features .material-icons {
      font-size: 18px;
      color: #7c5cbf;
    }
    .pp-plan-guests {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
    }
    .pp-plan-guests .material-icons { font-size: 18px; color: #a78bfa; }
    .pp-volume-discount {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #fbbf24;
      margin-bottom: 20px;
    }
    .pp-volume-discount .material-icons { font-size: 16px; }
    .pp-plan-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      background: rgba(124, 92, 191, 0.15);
      color: #c4b5fd;
      border: 1px solid rgba(124, 92, 191, 0.3);
      margin-top: auto;
    }
    .pp-plan-btn:hover {
      background: rgba(124, 92, 191, 0.25);
      border-color: rgba(124, 92, 191, 0.5);
      transform: translateY(-1px);
    }
    .pp-plan-btn-primary {
      background: linear-gradient(135deg, #7c5cbf, #6246a3);
      color: white;
      border: none;
    }
    .pp-plan-btn-primary:hover {
      background: linear-gradient(135deg, #8d6dd0, #7357b4);
      box-shadow: 0 4px 20px rgba(124, 92, 191, 0.4);
    }

    /* Comparison Table */
    .pp-comparison { padding: 80px 40px; }
    .pp-section-title {
      font-family: var(--font-montserrat);
      font-size: clamp(24px, 3.5vw, 36px);
      font-weight: 700;
      text-align: center;
      margin-bottom: 12px;
    }
    .pp-section-sub {
      text-align: center;
      color: rgba(255, 255, 255, 0.45);
      font-size: 15px;
      margin-bottom: 48px;
    }
    .pp-table-wrapper {
      max-width: 900px;
      margin: 0 auto;
      overflow-x: auto;
    }
    .pp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .pp-table th, .pp-table td {
      padding: 14px 16px;
      text-align: center;
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    }
    .pp-table th {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      background: rgba(139, 92, 246, 0.06);
      font-size: 13px;
    }
    .pp-table th:first-child, .pp-table td:first-child { text-align: left; }
    .pp-table td {
      color: rgba(255, 255, 255, 0.6);
    }
    .pp-check { color: #7c5cbf; font-size: 20px; }
    .pp-cross { color: rgba(255, 255, 255, 0.2); font-size: 20px; }

    /* Volume Discounts */
    .pp-discounts { padding: 80px 40px; }
    .pp-discounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .pp-discount-card {
      background: rgba(12, 12, 24, 0.5);
      border: 1px solid rgba(139, 92, 246, 0.12);
      border-radius: 14px;
      padding: 24px;
    }
    .pp-discount-card h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #c4b5fd;
    }
    .pp-discount-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .pp-discount-card li {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .pp-discount-card li:last-child { border-bottom: none; }
    .pp-discount-card li strong { color: #fbbf24; }

    /* FAQ */
    .pp-faq { padding: 80px 40px; }
    .pp-faq-list {
      max-width: 700px;
      margin: 0 auto;
    }
    .pp-faq-item {
      background: rgba(12, 12, 24, 0.5);
      border: 1px solid rgba(139, 92, 246, 0.1);
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 20px 24px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pp-faq-item:hover {
      border-color: rgba(139, 92, 246, 0.3);
    }
    .pp-faq-question {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
    .pp-faq-question .material-icons {
      color: #a78bfa;
      font-size: 22px;
    }
    .pp-faq-answer {
      margin-top: 12px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.7;
    }

    /* CTA */
    .pp-cta {
      padding: 100px 40px;
      text-align: center;
      position: relative;
    }
    .pp-cta-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 300px;
      background: radial-gradient(ellipse, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
      filter: blur(60px);
      pointer-events: none;
    }
    .pp-cta h2 {
      font-family: var(--font-montserrat);
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      position: relative;
    }
    .pp-cta p {
      color: rgba(255, 255, 255, 0.45);
      font-size: 16px;
      margin-bottom: 32px;
      position: relative;
    }

    /* Buttons */
    .pp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }
    .pp-btn-primary {
      background: linear-gradient(135deg, #7c5cbf, #6246a3);
      color: white;
      box-shadow: 0 4px 20px rgba(124, 92, 191, 0.3);
    }
    .pp-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(124, 92, 191, 0.5);
    }
    .pp-btn-lg { padding: 16px 36px; font-size: 16px; }
    .pp-btn .material-icons { font-size: 20px; }

    /* Footer */
    .pp-footer {
      padding: 48px 40px;
      text-align: center;
      border-top: 1px solid rgba(139, 92, 246, 0.08);
    }
    .pp-footer-logo { height: 28px; object-fit: contain; margin-bottom: 12px; }
    .pp-footer p { color: rgba(255, 255, 255, 0.35); font-size: 13px; margin-bottom: 4px; }

    /* Loading */
    .pp-loading {
      text-align: center;
      padding: 60px 0;
      color: rgba(255, 255, 255, 0.5);
    }
    .pp-loading .material-icons { font-size: 32px; color: #7c5cbf; margin-bottom: 12px; }
    .spinning { animation: spin 1.2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 768px) {
      .pp-nav { padding: 14px 20px; }
      .pp-hero { padding: 120px 20px 60px; }
      .pp-plans, .pp-comparison, .pp-discounts, .pp-faq, .pp-cta { padding-left: 20px; padding-right: 20px; }
      .pp-plans-grid { grid-template-columns: 1fr; }
      .pp-table { font-size: 12px; }
      .pp-table th, .pp-table td { padding: 10px 8px; }
    }
  `]
})
export class PricingPublicComponent implements OnInit {
  private plansService = inject(PlansService);

  plans = signal<Plan[]>([]);
  loading = signal(true);

  comparisonFeatures = [
    { key: 'landing_builder', label: 'Landing page personalizable' },
    { key: 'card_editor', label: 'Editor de tarjetas físicas' },
    { key: 'qr_codes', label: 'Códigos QR por invitado' },
    { key: 'guest_management', label: 'Gestión de invitados' },
    { key: 'pdf_export', label: 'Exportación a PDF' }
  ];

  faqs: { question: string; answer: string; open: boolean }[] = [
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, AMEX) a través de Stripe, y transferencias bancarias, OXXO y PSE a través de MercadoPago.',
      open: false
    },
    {
      question: '¿Puedo postergar la fecha de mi evento?',
      answer: 'Sí, puedes postergar tu evento una vez siempre que falten más de 7 días para la fecha actual del evento. Se aplica una tarifa de postergación.',
      open: false
    },
    {
      question: '¿Qué pasa cuando mi evento termina?',
      answer: 'Tu invitación permanecerá activa hasta 3 días después de la fecha del evento. Después de eso, el evento pasa a estado "completado" y la invitación se desactiva automáticamente.',
      open: false
    },
    {
      question: '¿Qué incluye cada paquete?',
      answer: 'El paquete "Invitación Digital" incluye landing page, gestión de invitados y códigos QR. "Tarjeta Física" incluye editor de tarjetas y exportación PDF. "Completo" incluye todas las funcionalidades.',
      open: false
    },
    {
      question: '¿Hay descuento si compro más de un evento?',
      answer: 'Sí, ofrecemos descuentos por volumen al comprar múltiples eventos en una sola transacción. El porcentaje de descuento varía según la cantidad de eventos y el paquete seleccionado.',
      open: false
    },
    {
      question: '¿Es un pago único o recurrente?',
      answer: 'Es un pago único por evento. No generamos cargos recurrentes ni suscripciones automáticas. Pagas una vez y tu evento estará activo hasta su fecha de desactivación.',
      open: false
    }
  ];

  ngOnInit(): void {
    this.plansService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans.filter(p => p.status === 'active').sort((a, b) => a.sort_order - b.sort_order));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  plansWithDiscount = () => {
    return this.plans().filter(p => p.volume_discount && p.volume_discount.length > 0);
  };

  getFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
      landing_builder: 'Landing page personalizable',
      card_editor: 'Editor de tarjetas físicas',
      qr_codes: 'Códigos QR por invitado',
      guest_management: 'Gestión de invitados',
      pdf_export: 'Exportación a PDF',
      all: 'Todas las funcionalidades'
    };
    return labels[feature] || feature;
  }

  toggleFaq(faq: { open: boolean }): void {
    faq.open = !faq.open;
  }
}
