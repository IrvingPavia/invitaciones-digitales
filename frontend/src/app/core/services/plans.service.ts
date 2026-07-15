import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  features: string[];
  max_guests: number | null;
  is_trial: boolean;
  trial_days: number | null;
  volume_discount: { min_qty: number; discount_pct: number }[];
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class PlansService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getPlans() {
    return this.http.get<Plan[]>(`${this.api}/plans`);
  }

  getPlan(id: number) {
    return this.http.get<Plan>(`${this.api}/plans/${id}`);
  }

  createPlan(data: Partial<Plan>) {
    return this.http.post<Plan>(`${this.api}/admin/plans`, data);
  }

  updatePlan(id: number, data: Partial<Plan>) {
    return this.http.put<Plan>(`${this.api}/admin/plans/${id}`, data);
  }

  togglePlanStatus(id: number, status: 'active' | 'inactive') {
    return this.http.patch<Plan>(`${this.api}/admin/plans/${id}/status`, { status });
  }
}
