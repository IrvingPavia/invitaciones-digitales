import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">
          <img src="assets/icons/vitely-logo.png" alt="Vitely" style="height:40px;margin-bottom:8px;">
          <p>Panel Administrativo</p>
        </div>

        @if (!showChangePassword) {
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
        } @else {
          <div class="change-pwd-section">
            <p class="change-pwd-title">Cambio de contraseña requerido</p>
            <p class="change-pwd-desc">Por seguridad, debes cambiar tu contraseña antes de continuar.</p>
            <form (ngSubmit)="changePassword()">
              <div class="form-group">
                <label>Nueva contraseña</label>
                <input type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="Mínimo 6 caracteres" required minlength="6" autocomplete="new-password">
              </div>
              <div class="form-group">
                <label>Confirmar contraseña</label>
                <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Repetir contraseña" required autocomplete="new-password">
              </div>
              @if (error) {
                <p class="error-msg">{{ error }}</p>
              }
              <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
                <span class="material-icons">{{ loading ? 'hourglass_empty' : 'lock_reset' }}</span>
                {{ loading ? 'Guardando...' : 'Cambiar contraseña' }}
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0e0e18 0%, #1a1a2a 50%, #12121a 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: rgba(26,26,42,0.9);
      border: 1px solid rgba(124,92,191,0.3);
      border-radius: 16px;
      padding: 40px;
      width: 100%; max-width: 400px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .login-logo {
      text-align: center; margin-bottom: 32px;
      p { color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 8px; }
    }
    .error-msg { color: #ff6b7a; font-size: 13px; margin-bottom: 12px; text-align: center; }
    .change-pwd-title { color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 8px; text-align: center; }
    .change-pwd-desc { color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 20px; text-align: center; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  username = ''; password = ''; loading = false; error = '';
  showChangePassword = false;
  newPassword = ''; confirmPassword = '';

  login() {
    if (!this.username || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const user = this.auth.getUser();
        if (user?.must_change_password) {
          this.showChangePassword = true;
          this.loading = false;
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (e) => { this.error = e.error?.error || 'Error al iniciar sesión'; this.loading = false; }
    });
  }

  changePassword() {
    if (!this.newPassword || !this.confirmPassword) return;
    if (this.newPassword.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'Las contraseñas no coinciden'; return; }

    this.loading = true; this.error = '';
    this.http.put<any>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword: this.password,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        // Update stored user to remove must_change_password flag
        const user = this.auth.getUser();
        if (user) {
          user.must_change_password = false;
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.router.navigate(['/dashboard']);
      },
      error: (e) => { this.error = e.error?.error || 'Error al cambiar contraseña'; this.loading = false; }
    });
  }
}
