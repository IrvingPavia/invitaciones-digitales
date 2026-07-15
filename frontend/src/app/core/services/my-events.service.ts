import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface MyEvent {
  id: number;
  name: string;
  slug: string;
  event_type: string;
  event_date: string | null;
  lifecycle_status: 'available' | 'active' | 'completed';
  deactivation_date: string | null;
  postponed: boolean;
  plan_type: string;
  purchase_id: number;
}

export interface ActivateEventData {
  event_date: string;
  name: string;
  event_type: string;
  slug: string;
}

export interface PostponementCheck {
  can_postpone: boolean;
  reason?: string;
  fee: number;
}

@Injectable({ providedIn: 'root' })
export class MyEventsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getMyEvents() {
    return this.http.get<MyEvent[]>(`${this.api}/my-events`);
  }

  activateEvent(id: number, data: ActivateEventData) {
    return this.http.post<MyEvent>(`${this.api}/my-events/${id}/activate`, data);
  }

  checkPostponement(id: number) {
    return this.http.post<PostponementCheck>(`${this.api}/my-events/${id}/postpone`, {});
  }

  payPostponement(id: number, data: { gateway: string; new_date: string }) {
    return this.http.post<{ session_url: string; transaction_id: number }>(
      `${this.api}/my-events/${id}/postpone/pay`, data
    );
  }
}
