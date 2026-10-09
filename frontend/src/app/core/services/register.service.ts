import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

export interface VerifyResponse {
  message: string;
  token: string;
  user: any;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  register(data: RegisterData) {
    return this.http.post<RegisterResponse>(`${this.api}/register`, data);
  }

  verifyEmail(token: string) {
    return this.http.post<VerifyResponse>(`${this.api}/register/verify/${token}`, {});
  }

  resendVerification(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/register/resend`, { email });
  }
}
