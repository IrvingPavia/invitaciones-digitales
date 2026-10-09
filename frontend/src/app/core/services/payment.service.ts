import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CreateSessionResponse {
  session_url: string;
  transaction_id: number;
}

export interface TransactionStatus {
  id: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway: 'stripe' | 'mercadopago';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  createSession(planId: number, quantity: number, gateway: 'stripe' | 'mercadopago') {
    return this.http.post<CreateSessionResponse>(`${this.api}/payments/create-session`, {
      plan_id: planId,
      quantity,
      gateway
    });
  }

  getTransactionStatus(transactionId: number) {
    return this.http.get<TransactionStatus>(`${this.api}/payments/status/${transactionId}`);
  }
}
