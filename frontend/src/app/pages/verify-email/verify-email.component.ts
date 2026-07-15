import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RegisterService } from '../../core/services/register.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="verify-page">
      <div class="verify-card">
        <!-- Loading State -->
        @if (loading) {
          <div class="verify-status">
            <span class="material-icons spinning">hourglass_empty</span>
            <h2>Verificando tu correo...</h2>
            <p>Por favor espera un momento.</p>
          </div>
        }

        <!-- Success State -->
        @if (!loading && success) {
          <div class="verify-status">
            <span class="material-icons success-icon">check_circle</span>
            <h2>¡Correo verificado!</h2>
            <p>Tu cuenta ha sido activada exitosamente.</p>
            <p class="redirect-msg">Serás redirigido al panel en unos segundos...</p>
          </div>
        }

        <!-- Error State -->
        @if (!loading && !success && errorMessage) {
          <div class="verify-status">
            <span class="material-icons error-icon">error</span>
            <h2>Error de verificación</h2>
            <p class="error-detail">{{ errorMessage }}</p>

            @if (!showResendForm) {
              <button class="btn btn-secondary" (click)="showResendForm = true">
                <span class="material-icons">mail</span>
                Reenviar correo de verificación
              </button>
            }

            @if (showResendForm) {
              <form class="resend-form" (ngSubmit)="resendVerification()">
                <div class="form-group">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    [(ngModel)]="resendEmail"
                    name="resendEmail"
                    placeholder="tu@correo.com"
                    required
                  >
                </div>
                @if (resendMessage) {
                  <p class="resend-msg" [class.resend-success]="resendSuccess">{{ resendMessage }}</p>
                }
                <button type="submit" class="btn btn-primary" [disabled]="resendLoading">
                  <span class="material-icons">{{ resendLoading ? 'hourglass_empty' : 'send' }}</span>
                  {{ resendLoading ? 'Enviando...' : 'Enviar' }}
                </button>
              </form>
            }

            <a routerLink="/login" class="back-link">Volver al inicio de sesión</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0e0e18 0%, #1a1a2a 50%, #12121a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .verify-card {
      background: rgba(26, 26, 42, 0.9);
      border: 1px solid rgba(124, 92, 191, 0.3);
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 440px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .verify-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .verify-status h2 {
      color: #fff;
      font-size: 22px;
      font-weight: 600;
      margin: 8px 0 0;
    }
    .verify-status p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin: 0;
    }
    .success-icon {
      font-size: 64px;
      color: #4caf50;
    }
    .error-icon {
      font-size: 64px;
      color: #ff6b7a;
    }
    .error-detail {
      color: #ff6b7a !important;
      font-size: 14px;
    }
    .redirect-msg {
      color: rgba(255, 255, 255, 0.4) !important;
      font-size: 13px !important;
      margin-top: 8px !important;
    }
    .spinning {
      font-size: 48px;
      color: #7c5cbf;
      animation: spin 1.5s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 16px;
    }
    .btn-primary {
      background: #7c5cbf;
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #6a4daa;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: rgba(124, 92, 191, 0.15);
      color: #b39ddb;
      border: 1px solid rgba(124, 92, 191, 0.3);
    }
    .btn-secondary:hover {
      background: rgba(124, 92, 191, 0.25);
    }
    .resend-form {
      width: 100%;
      margin-top: 20px;
      text-align: left;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      margin-bottom: 6px;
    }
    .form-group input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus {
      border-color: #7c5cbf;
    }
    .resend-msg {
      font-size: 13px;
      color: #ff6b7a;
      text-align: center;
      margin-bottom: 12px;
    }
    .resend-msg.resend-success {
      color: #4caf50;
    }
    .back-link {
      display: inline-block;
      margin-top: 20px;
      color: #b39ddb;
      font-size: 13px;
      text-decoration: none;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: #d1c4e9;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private registerService = inject(RegisterService);

  loading = true;
  success = false;
  errorMessage = '';
  showResendForm = false;
  resendEmail = '';
  resendLoading = false;
  resendMessage = '';
  resendSuccess = false;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token de verificación no proporcionado.';
      return;
    }
    this.verifyToken(token);
  }

  private verifyToken(token: string): void {
    this.registerService.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = true;
        // Store JWT token and user data following AuthService pattern
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard/paquetes']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private getErrorMessage(err: any): string {
    const code = err.error?.code;
    switch (code) {
      case 'TOKEN_EXPIRED':
        return 'El enlace de verificación ha expirado. Solicita uno nuevo.';
      case 'INVALID_VERIFICATION_TOKEN':
        return 'El token de verificación es inválido.';
      case 'EMAIL_ALREADY_VERIFIED':
        return 'Este correo ya ha sido verificado. Puedes iniciar sesión.';
      default:
        return err.error?.error || err.error?.message || 'Ocurrió un error al verificar tu correo.';
    }
  }

  resendVerification(): void {
    if (!this.resendEmail) return;
    this.resendLoading = true;
    this.resendMessage = '';
    this.resendSuccess = false;

    this.registerService.resendVerification(this.resendEmail).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.resendSuccess = true;
        this.resendMessage = res.message || 'Correo de verificación reenviado exitosamente.';
      },
      error: (err) => {
        this.resendLoading = false;
        this.resendSuccess = false;
        this.resendMessage = err.error?.error || 'Error al reenviar el correo de verificación.';
      }
    });
  }
}
