import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PurchaseFilters {
  status?: string;
  plan_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface Purchase {
  id: number;
  user_id: number;
  plan_id: number;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  events_assigned: number;
  created_at: string;
  username: string;
  user_name: string;
  user_email: string;
  plan_name: string;
}

export interface PurchaseDetail extends Purchase {
  events: PurchaseEvent[];
  transactions: PurchaseTransaction[];
}

export interface PurchaseEvent {
  id: number;
  name: string;
  slug: string;
  event_type: string;
  event_date: string | null;
  lifecycle_status: 'available' | 'active' | 'completed';
  deactivation_date: string | null;
  active: boolean;
  created_at: string;
}

export interface PurchaseTransaction {
  id: number;
  gateway: 'stripe' | 'mercadopago';
  gateway_session_id: string;
  gateway_payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'purchase' | 'postponement';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  purchases: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminMetrics {
  revenue_month: number;
  sales_by_plan: { plan_name: string; count: number; total: number }[];
  trial_conversion: { trial_users: number; converted: number; ratio: number };
  active_events: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getPurchases(filters: PurchaseFilters = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.plan_id) params = params.set('plan_id', filters.plan_id.toString());
    if (filters.from_date) params = params.set('from_date', filters.from_date);
    if (filters.to_date) params = params.set('to_date', filters.to_date);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaginatedResponse<Purchase>>(`${this.api}/admin/purchases`, { params });
  }

  getPurchaseDetail(id: number) {
    return this.http.get<PurchaseDetail>(`${this.api}/admin/purchases/${id}`);
  }

  extendEvent(eventId: number, data: { new_deactivation_date: string; reason: string }) {
    return this.http.put<any>(`${this.api}/admin/events/${eventId}/extend`, data);
  }

  exportPurchases(filters: PurchaseFilters = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.plan_id) params = params.set('plan_id', filters.plan_id.toString());
    if (filters.from_date) params = params.set('from_date', filters.from_date);
    if (filters.to_date) params = params.set('to_date', filters.to_date);

    return this.http.get(`${this.api}/admin/purchases/export`, { params, responseType: 'blob' });
  }

  getMetrics() {
    return this.http.get<AdminMetrics>(`${this.api}/admin/metrics`);
  }
}
