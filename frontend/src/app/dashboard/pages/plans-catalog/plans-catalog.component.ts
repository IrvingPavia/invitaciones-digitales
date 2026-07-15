import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlansService, Plan } from '../../../core/services/plans.service';

@Component({
  selector: 'app-plans-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans-catalog.component.html',
  styleUrl: './plans-catalog.component.scss'
})
export class PlansCatalogComponent implements OnInit {
  private plansService = inject(PlansService);
  private router = inject(Router);

  plans = signal<Plan[]>([]);
  loading = signal(true);
  error = signal('');
  activatingTrial = signal(false);
  quantities = signal<Record<number, number>>({});

  private readonly featureLabels: Record<string, string> = {
    landing_builder: 'Builder de landing pages',
    card_editor: 'Editor de tarjetas físicas',
    pdf_export: 'Exportación a PDF',
    qr_codes: 'Códigos QR',
    guest_management: 'Gestión de invitados',
    all: 'Todas las funcionalidades'
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.error.set('');

    this.plansService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans.sort((a, b) => a.sort_order - b.sort_order));
        const initialQtys: Record<number, number> = {};
        plans.forEach(p => { initialQtys[p.id] = 1; });
        this.quantities.set(initialQtys);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los paquetes. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  isRecommended(plan: Plan): boolean {
    return plan.slug === 'completo' || plan.name.toLowerCase().includes('completo');
  }

  getFeatureLabels(features: string[]): string[] {
    if (!features) return [];
    return features.map(f => this.featureLabels[f] || f);
  }

  getQuantity(planId: number): number {
    return this.quantities()[planId] || 1;
  }

  onQuantityChange(planId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 50) value = 50;

    this.quantities.update(qtys => ({ ...qtys, [planId]: value }));
  }

  getAppliedDiscount(plan: Plan): number {
    if (!plan.volume_discount || plan.volume_discount.length === 0) return 0;
    const qty = this.getQuantity(plan.id);
    const sorted = [...plan.volume_discount].sort((a, b) => b.min_qty - a.min_qty);
    const tier = sorted.find(t => qty >= t.min_qty);
    return tier ? tier.discount_pct : 0;
  }

  getDiscountAmount(plan: Plan): number {
    const qty = this.getQuantity(plan.id);
    const discount = this.getAppliedDiscount(plan);
    return plan.price * qty * (discount / 100);
  }

  calculateTotal(plan: Plan): number {
    const qty = this.getQuantity(plan.id);
    const discount = this.getAppliedDiscount(plan);
    return plan.price * qty * (1 - discount / 100);
  }

  activateTrial(plan: Plan): void {
    this.activatingTrial.set(true);
    this.router.navigate(['/dashboard/checkout'], {
      queryParams: { planId: plan.id, quantity: 1, trial: true }
    });
  }

  goToCheckout(plan: Plan): void {
    const quantity = this.getQuantity(plan.id);
    this.router.navigate(['/dashboard/checkout'], {
      queryParams: { planId: plan.id, quantity }
    });
  }
}
