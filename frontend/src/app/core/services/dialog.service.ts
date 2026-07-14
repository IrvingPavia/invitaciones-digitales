import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  type: 'confirm' | 'alert' | 'success' | 'three-way';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  thirdText?: string;  // For three-way dialogs (middle button)
}

export type ThreeWayResult = 'save' | 'discard' | 'cancel';

@Injectable({ providedIn: 'root' })
export class DialogService {
  visible = signal(false);
  config = signal<DialogConfig>({ type: 'alert', title: '', message: '' });
  private resolver: ((value: boolean) => void) | null = null;
  private threeWayResolver: ((value: ThreeWayResult) => void) | null = null;

  confirm(title: string, message: string, confirmText = 'Eliminar'): Promise<boolean> {
    this.config.set({ type: 'confirm', title, message, confirmText, cancelText: 'Cancelar' });
    this.visible.set(true);
    return new Promise(resolve => { this.resolver = resolve; });
  }

  /** Three-way dialog: Save / Discard / Cancel */
  unsavedChanges(title: string, message: string): Promise<ThreeWayResult> {
    this.config.set({
      type: 'three-way', title, message,
      confirmText: 'Guardar',
      thirdText: 'Descartar',
      cancelText: 'Cancelar'
    });
    this.visible.set(true);
    return new Promise(resolve => { this.threeWayResolver = resolve; });
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

  closeThreeWay(result: ThreeWayResult) {
    this.visible.set(false);
    this.threeWayResolver?.(result);
    this.threeWayResolver = null;
  }
}
