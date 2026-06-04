import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  type: 'confirm' | 'alert' | 'success';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  visible = signal(false);
  config = signal<DialogConfig>({ type: 'alert', title: '', message: '' });
  private resolver: ((value: boolean) => void) | null = null;

  confirm(title: string, message: string, confirmText = 'Eliminar'): Promise<boolean> {
    this.config.set({ type: 'confirm', title, message, confirmText, cancelText: 'Cancelar' });
    this.visible.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  alert(title: string, message: string): Promise<boolean> {
    this.config.set({ type: 'alert', title, message, confirmText: 'Aceptar' });
    this.visible.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  success(title: string, message: string): Promise<boolean> {
    this.config.set({ type: 'success', title, message, confirmText: 'Aceptar' });
    this.visible.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  close(result: boolean) {
    this.visible.set(false);
    this.resolver?.(result);
    this.resolver = null;
  }
}
