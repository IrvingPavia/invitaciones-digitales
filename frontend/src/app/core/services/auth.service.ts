import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn$ = this._isLoggedIn.asObservable();

  login(username: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._isLoggedIn.next(true);
      }));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem('token'); }
  getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
  hasToken() { return !!localStorage.getItem('token'); }
}
