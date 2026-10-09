import { Injectable, signal } from '@angular/core';

/**
 * Coordina la selección entre múltiples DragBoxComponent para que
 * solo uno esté seleccionado a la vez (como en Word/PowerPoint).
 *
 * Cada DragBox se registra con un token único (su propia instancia).
 * Al seleccionar uno, el servicio actualiza el "activo" y los demás,
 * que observan este signal, se deseleccionan solos.
 */
@Injectable({ providedIn: 'root' })
export class DragBoxSelectionService {
  /** Instancia actualmente seleccionada (o null si ninguna). */
  readonly active = signal<object | null>(null);

  select(token: object) {
    this.active.set(token);
  }

  clear(token?: object) {
    if (!token || this.active() === token) {
      this.active.set(null);
    }
  }
}
