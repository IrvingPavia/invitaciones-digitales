import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog.visible()) {
      <div class="dialog-overlay" (click)="dialog.close(false)">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <div class="dialog-icon">
            @switch (dialog.config().type) {
              @case ('confirm') { <span class="material-icons icon-warn">warning</span> }
              @case ('three-way') { <span class="material-icons icon-warn">save</span> }
              @case ('alert') { <span class="material-icons icon-info">info</span> }
              @case ('success') { <span class="material-icons icon-success">check_circle</span> }
            }
          </div>
          <h3 class="dialog-title">{{ dialog.config().title }}</h3>
          <p class="dialog-message">{{ dialog.config().message }}</p>
          <div class="dialog-actions">
            @if (dialog.config().type === 'confirm') {
              <button class="dialog-btn dialog-btn-cancel" (click)="dialog.close(false)">{{ dialog.config().cancelText || 'Cancelar' }}</button>
              <button class="dialog-btn dialog-btn-danger" (click)="dialog.close(true)">{{ dialog.config().confirmText || 'Confirmar' }}</button>
            } @else if (dialog.config().type === 'three-way') {
              <button class="dialog-btn dialog-btn-cancel" (click)="dialog.closeThreeWay('cancel')">{{ dialog.config().cancelText || 'Cancelar' }}</button>
              <button class="dialog-btn dialog-btn-discard" (click)="dialog.closeThreeWay('discard')">{{ dialog.config().thirdText || 'Descartar' }}</button>
              <button class="dialog-btn dialog-btn-primary" (click)="dialog.closeThreeWay('save')">{{ dialog.config().confirmText || 'Guardar' }}</button>
            } @else {
              <button class="dialog-btn dialog-btn-primary" (click)="dialog.close(true)">{{ dialog.config().confirmText || 'Aceptar' }}</button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: fadeIn 0.2s ease;
    }
    .dialog-box {
      background: #1e1e32; border: 1px solid rgba(124,92,191,0.3);
      border-radius: 16px; padding: 32px; max-width: 400px; width: 100%;
      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: scaleIn 0.2s ease;
    }
    .dialog-icon { margin-bottom: 16px; }
    .dialog-icon .material-icons { font-size: 48px; }
    .icon-warn { color: #f0ad4e; }
    .icon-info { color: #5bc0de; }
    .icon-success { color: #5cb85c; }
    .dialog-title {
      font-size: 18px; font-weight: 600; color: white; margin-bottom: 8px;
    }
    .dialog-message {
      font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 24px;
    }
    .dialog-actions { display: flex; gap: 12px; justify-content: center; }
    .dialog-btn {
      padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
      border: none; cursor: pointer; transition: all 0.2s; min-width: 100px;
    }
    .dialog-btn-cancel {
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .dialog-btn-cancel:hover { background: rgba(255,255,255,0.12); color: white; }
    .dialog-btn-danger {
      background: rgba(220,53,69,0.9); color: white;
    }
    .dialog-btn-danger:hover { background: #dc3545; transform: translateY(-1px); }
    .dialog-btn-discard {
      background: rgba(245,158,11,0.15); color: #f59e0b;
      border: 1px solid rgba(245,158,11,0.3);
    }
    .dialog-btn-discard:hover { background: rgba(245,158,11,0.25); transform: translateY(-1px); }
    .dialog-btn-primary {
      background: rgba(124,92,191,0.9); color: white;
    }
    .dialog-btn-primary:hover { background: #7c5cbf; transform: translateY(-1px); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class DialogComponent {
  dialog = inject(DialogService);
}
