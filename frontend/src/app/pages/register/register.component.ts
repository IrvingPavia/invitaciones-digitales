import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { RegisterService } from '../../core/services/register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-card">
        <div class="register-logo">
          <img src="assets/icons/vitely-logo.png" alt="Vitely" style="height:40px;margin-bottom:8px;">
          <p>Crea tu cuenta</p>
        </div>

        @if (success()) {
          <div class="success-message" role="alert">
            <span class="material-icons success-icon">mark_email_read</span>
            <h2>¡Revisa tu correo!</h2>
            <p>Hemos enviado un enlace de verificación a <strong>{{ form.value.email }}</strong>.</p>
            <p class="success-hint">Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
              <label for="full_name">Nombre completo</label>
              <input
                id="full_name"
                type="text"
                formControlName="full_name"
                placeholder="Tu nombre completo"
                autocomplete="name"
                [attr.aria-invalid]="form.get('full_name')?.invalid && form.get('full_name')?.touched"
                aria-describedby="full_name_error"
              >
              @if (form.get('full_name')?.invalid && form.get('full_name')?.touched) {
                <span class="field-error" id="full_name_error" role="alert">El nombre es obligatorio</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="tu@correo.com"
                autocomplete="email"
                [attr.aria-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                aria-describedby="email_error"
              >
              @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                <span class="field-error" id="email_error" role="alert">El correo es obligatorio</span>
              } @else if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <span class="field-error" id="email_error" role="alert">Ingresa un correo válido</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  [attr.aria-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
                  aria-describedby="password_error"
                >
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <span class="material-icons">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
                <span class="field-error" id="password_error" role="alert">La contraseña es obligatoria</span>
              } @else if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
                <span class="field-error" id="password_error" role="alert">La contraseña debe tener al menos 8 caracteres</span>
              }
            </div>

            @if (serverError()) {
              <p class="error-msg" role="alert">{{ serverError() }}</p>
            }

            <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">
              <span class="material-icons">{{ loading() ? 'hourglass_empty' : 'person_add' }}</span>
              {{ loading() ? 'Registrando...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="login-link">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0e0e18 0%, #1a1a2a 50%, #12121a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .register-card {
      background: rgba(26, 26, 42, 0.9);
      border: 1px solid rgba(124, 92, 191, 0.3);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .register-logo {
      text-align: center;
      margin-bottom: 32px;

      p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 16px;
        font-weight: 500;
        margin-top: 8px;
      }
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 6px;
      }

      input {
        width: 100%;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(124, 92, 191, 0.3);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        transition: border-color 0.2s;
        box-sizing: border-box;

        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        &:focus {
          outline: none;
          border-color: #7c5cbf;
          box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.15);
        }

        &[aria-invalid="true"] {
          border-color: #ff6b7a;
        }
      }
    }

    .password-wrapper {
      position: relative;

      input {
        padding-right: 44px;
      }
    }

    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.5);
      padding: 4px;
      display: flex;
      align-items: center;

      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }

      .material-icons {
        font-size: 20px;
      }
    }

    .field-error {
      display: block;
      color: #ff6b7a;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-msg {
      color: #ff6b7a;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #7c5cbf, #6246a3);
      color: #fff;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #8d6dd0, #7357b4);
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(124, 92, 191, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .w-full {
      width: 100%;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;

      a {
        color: #a78bfa;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          color: #c4b5fd;
          text-decoration: underline;
        }
      }
    }

    .success-message {
      text-align: center;
      padding: 20px 0;

      .success-icon {
        font-size: 48px;
        color: #7c5cbf;
        margin-bottom: 16px;
      }

      h2 {
        color: #fff;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .success-hint {
        color: rgba(255, 255, 255, 0.5);
        font-size: 13px;
        margin-top: 12px;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private registerService = inject(RegisterService);
  private route = inject(ActivatedRoute);

  showPassword = signal(false);
  loading = signal(false);
  success = signal(false);
  serverError = signal('');

  selectedPlan = '';

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.selectedPlan = params['plan'] || '';
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set('');

    const data = this.form.getRawValue();

    this.registerService.register(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.error || err.error?.message || 'Error al crear la cuenta';
        if (message.toLowerCase().includes('ya está registrado') || message.toLowerCase().includes('already exists') || err.status === 409) {
          this.serverError.set('El correo ya está registrado');
        } else {
          this.serverError.set(message);
        }
      }
    });
  }
}
