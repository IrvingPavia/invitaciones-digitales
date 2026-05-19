import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <span class="material-icons">auto_awesome</span>
          <h1>Invitaciones</h1>
          <p>Panel Administrativo</p>
        </div>
        <form (ngSubmit)="login()" #f="ngForm">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="admin" required autocomplete="username">
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required autocomplete="current-password">
          </div>
          @if (error) {
            <p class="error-msg">{{ error }}</p>
          }
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span class="material-icons">{{ loading ? 'hourglass_empty' : 'login' }}</span>
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0d1117 0%, #1a1a2e 50%, #16213e 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: rgba(26,26,46,0.9);
      border: 1px solid rgba(212,160,23,0.3);
      border-radius: 16px;
      padding: 40px;
      width: 100%; max-width: 400px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .login-logo {
      text-align: center; margin-bottom: 32px;
      .material-icons { font-size: 48px; color: var(--gold); }
      h1 { font-family: var(--font-script); font-size: 32px; color: var(--gold); margin: 8px 0 4px; }
      p { color: rgba(255,255,255,0.5); font-size: 13px; }
    }
    .error-msg { color: #ff6b7a; font-size: 13px; margin-bottom: 12px; text-align: center; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = ''; password = ''; loading = false; error = '';

  login() {
    if (!this.username || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error = e.error?.error || 'Error al iniciar sesión'; this.loading = false; }
    });
  }
}
