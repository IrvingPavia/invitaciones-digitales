import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Profile {
  id: number;
  full_name: string;
  email: string;
  email_verified: boolean;
  verification_status: 'none' | 'pending' | 'verified';
  self_registered: boolean;
  created_at: string;
}

export interface Purchase {
  id: number;
  plan_id: number;
  plan_name: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  events_assigned: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getProfile() {
    return this.http.get<Profile>(`${this.api}/profile`);
  }

  updateProfile(data: { full_name?: string; email?: string }) {
    return this.http.put<Profile>(`${this.api}/profile`, data);
  }

  changePassword(data: { current_password: string; new_password: string }) {
    return this.http.put<{ message: string }>(`${this.api}/profile/password`, data);
  }

  getPurchases() {
    return this.http.get<Purchase[]>(`${this.api}/profile/purchases`);
  }
}
