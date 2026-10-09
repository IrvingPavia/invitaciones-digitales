import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, Profile, Purchase } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h2 class="page-title">
        <span class="material-icons">person</span>
        Mi Perfil
      </h2>

      <!-- Section 1: Edit Profile -->
      <div class="card section-card">
        <h3 class="section-heading">
          <span class="material-icons">edit</span>
          Información Personal
        </h3>

        @if (profileLoading()) {
          <div class="loading-state">
            <span class="material-icons spin">sync</span>
            Cargando perfil...
          </div>
        } @else {
          <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="form-grid">
            <div class="form-group">
              <label for="full_name">Nombre completo</label>
              <input id="full_name" type="text" formControlName="full_name" placeholder="Tu nombre completo">
              @if (profileForm.get('full_name')?.touched && profileForm.get('full_name')?.hasError('required')) {
                <span class="field-error">El nombre es requerido</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input id="email" type="email" formControlName="email" placeholder="tu@correo.com">
              @if (profileForm.get('email')?.touched && profileForm.get('email')?.hasError('required')) {
                <span class="field-error">El correo es requerido</span>
              }
              @if (profileForm.get('email')?.touched && profileForm.get('email')?.hasError('email')) {
                <span class="field-error">Ingresa un correo válido</span>
              }
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || profileSaving()">
                @if (profileSaving()) {
                  <span class="material-icons spin">sync</span>
                } @else {
                  <span class="material-icons">save</span>
                }
                Guardar cambios
              </button>
            </div>

            @if (profileSuccess()) {
              <div class="alert alert-success">
                <span class="material-icons">check_circle</span>
                {{ profileSuccess() }}
              </div>
            }
            @if (profileError()) {
              <div class="alert alert-error">
                <span class="material-icons">error</span>
                {{ profileError() }}
              </div>
            }
          </form>

          <p class="info-note">
            <span class="material-icons">info</span>
            Si cambias tu correo electrónico, se enviará un enlace de verificación al nuevo correo antes de aplicar el cambio.
          </p>
        }
      </div>

      <!-- Section 2: Change Password -->
      <div class="card section-card">
        <h3 class="section-heading">
          <span class="material-icons">lock</span>
          Cambiar Contraseña
        </h3>

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="form-grid">
          <div class="form-group">
            <label for="current_password">Contraseña actual</label>
            <input id="current_password" type="password" formControlName="current_password" placeholder="Tu contraseña actual">
            @if (passwordForm.get('current_password')?.touched && passwordForm.get('current_password')?.hasError('required')) {
              <span class="field-error">La contraseña actual es requerida</span>
            }
          </div>

          <div class="form-group">
            <label for="new_password">Nueva contraseña</label>
            <input id="new_password" type="password" formControlName="new_password" placeholder="Mínimo 8 caracteres">
            @if (passwordForm.get('new_password')?.touched && passwordForm.get('new_password')?.hasError('required')) {
              <span class="field-error">La nueva contraseña es requerida</span>
            }
            @if (passwordForm.get('new_password')?.touched && passwordForm.get('new_password')?.hasError('minlength')) {
              <span class="field-error">La contraseña debe tener al menos 8 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label for="confirm_new_password">Confirmar nueva contraseña</label>
            <input id="confirm_new_password" type="password" formControlName="confirm_new_password" placeholder="Repite la nueva contraseña">
            @if (passwordForm.get('confirm_new_password')?.touched && passwordForm.get('confirm_new_password')?.hasError('required')) {
              <span class="field-error">Confirma tu nueva contraseña</span>
            }
            @if (passwordForm.get('confirm_new_password')?.touched && passwordMismatch()) {
              <span class="field-error">Las contraseñas no coinciden</span>
            }
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || passwordMismatch() || passwordSaving()">
              @if (passwordSaving()) {
                <span class="material-icons spin">sync</span>
              } @else {
                <span class="material-icons">vpn_key</span>
              }
              Cambiar contraseña
            </button>
          </div>

          @if (passwordSuccess()) {
            <div class="alert alert-success">
              <span class="material-icons">check_circle</span>
              {{ passwordSuccess() }}
            </div>
          }
          @if (passwordError()) {
            <div class="alert alert-error">
              <span class="material-icons">error</span>
              {{ passwordError() }}
            </div>
          }
        </form>
      </div>

      <!-- Section 3: Purchase History -->
      <div class="card section-card">
        <h3 class="section-heading">
          <span class="material-icons">receipt_long</span>
          Historial de Compras
        </h3>

        @if (purchasesLoading()) {
          <div class="loading-state">
            <span class="material-icons spin">sync</span>
            Cargando historial...
          </div>
        } @else if (purchases().length === 0) {
          <div class="empty-state">
            <span class="material-icons">shopping_bag</span>
            <p>Aún no tienes compras registradas</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="purchases-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Plan</th>
                  <th>Cantidad</th>
                  <th>Descuento</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (purchase of purchases(); track purchase.id) {
                  <tr>
                    <td>{{ formatDate(purchase.created_at) }}</td>
                    <td>{{ purchase.plan_name }}</td>
                    <td class="text-center">{{ purchase.quantity }}</td>
                    <td class="text-center">{{ purchase.discount_pct > 0 ? purchase.discount_pct + '%' : '—' }}</td>
                    <td class="text-right">\${{ purchase.total_amount.toFixed(2) }}</td>
                    <td>
                      <span class="status-badge" [class]="'status-' + purchase.status">
                        {{ getStatusLabel(purchase.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 24px;
    }
    .page-title .material-icons {
      font-size: 28px;
      color: var(--gold);
    }

    .section-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(124, 92, 191, 0.2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(124, 92, 191, 0.15);
    }
    .section-heading .material-icons {
      font-size: 20px;
      color: var(--gold);
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .form-group input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(124, 92, 191, 0.25);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 14px;
      color: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    .form-group input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.15);
    }

    .field-error {
      font-size: 12px;
      color: #f87171;
      margin-top: 2px;
    }

    .form-actions {
      margin-top: 4px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: #fff;
      box-shadow: 0 4px 15px rgba(124, 92, 191, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(124, 92, 191, 0.4);
    }
    .btn .material-icons {
      font-size: 18px;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      margin-top: 8px;
      animation: fadeIn 0.3s ease;
    }
    .alert .material-icons {
      font-size: 18px;
    }
    .alert-success {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
    .alert-error {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      color: #f87171;
    }

    .info-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(124, 92, 191, 0.08);
      border: 1px solid rgba(124, 92, 191, 0.15);
      border-radius: 10px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.5;
    }
    .info-note .material-icons {
      font-size: 16px;
      color: var(--gold);
      flex-shrink: 0;
      margin-top: 1px;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
    .empty-state .material-icons {
      font-size: 48px;
      color: rgba(124, 92, 191, 0.3);
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Purchase History Table */
    .table-wrapper {
      overflow-x: auto;
      border-radius: 10px;
      border: 1px solid rgba(124, 92, 191, 0.15);
    }

    .purchases-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .purchases-table thead {
      background: rgba(124, 92, 191, 0.1);
    }
    .purchases-table th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .purchases-table td {
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.85);
      border-top: 1px solid rgba(124, 92, 191, 0.1);
      white-space: nowrap;
    }
    .purchases-table tbody tr:hover {
      background: rgba(124, 92, 191, 0.05);
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .status-completed {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
    }
    .status-pending {
      background: rgba(250, 204, 21, 0.15);
      color: #facc15;
    }
    .status-failed {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
    }
    .status-refunded {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-container { padding: 0 8px; }
      .section-card { padding: 16px; }
      .page-title { font-size: 18px; }
      .purchases-table th, .purchases-table td { padding: 10px 12px; font-size: 12px; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  // Signals
  profileLoading = signal(true);
  profileSaving = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  passwordSaving = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  purchasesLoading = signal(true);
  purchases = signal<Purchase[]>([]);

  // Forms
  profileForm: FormGroup = this.fb.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm: FormGroup = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_new_password: ['', Validators.required]
  });

  ngOnInit() {
    this.loadProfile();
    this.loadPurchases();
  }

  passwordMismatch(): boolean {
    const newPwd = this.passwordForm.get('new_password')?.value;
    const confirmPwd = this.passwordForm.get('confirm_new_password')?.value;
    return confirmPwd?.length > 0 && newPwd !== confirmPwd;
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.profileSaving.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');

    const data = this.profileForm.value;
    this.profileService.updateProfile(data).subscribe({
      next: (profile) => {
        this.profileSaving.set(false);
        this.profileSuccess.set('Perfil actualizado correctamente');
        this.profileForm.patchValue({
          full_name: profile.full_name,
          email: profile.email
        });
        setTimeout(() => this.profileSuccess.set(''), 5000);
      },
      error: (err) => {
        this.profileSaving.set(false);
        this.profileError.set(err.error?.error || 'Error al actualizar el perfil');
        setTimeout(() => this.profileError.set(''), 5000);
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid || this.passwordMismatch()) return;

    this.passwordSaving.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    const { current_password, new_password } = this.passwordForm.value;
    this.profileService.changePassword({ current_password, new_password }).subscribe({
      next: (res) => {
        this.passwordSaving.set(false);
        this.passwordSuccess.set(res.message || 'Contraseña actualizada correctamente');
        this.passwordForm.reset();
        setTimeout(() => this.passwordSuccess.set(''), 5000);
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordError.set(err.error?.error || 'Error al cambiar la contraseña');
        setTimeout(() => this.passwordError.set(''), 5000);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      completed: 'Completada',
      pending: 'Pendiente',
      failed: 'Fallida',
      refunded: 'Reembolsada'
    };
    return labels[status] || status;
  }

  private loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          full_name: profile.full_name || '',
          email: profile.email || ''
        });
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileLoading.set(false);
        this.profileError.set('Error al cargar el perfil');
      }
    });
  }

  private loadPurchases() {
    this.profileService.getPurchases().subscribe({
      next: (purchases) => {
        this.purchases.set(purchases);
        this.purchasesLoading.set(false);
      },
      error: () => {
        this.purchasesLoading.set(false);
      }
    });
  }
}
