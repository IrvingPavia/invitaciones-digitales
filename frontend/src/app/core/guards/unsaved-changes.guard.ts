import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { DialogService } from '../services/dialog.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const dialog = inject(DialogService);
    return await dialog.confirm(
      'Cambios sin guardar',
      'Tienes configuraciones pendientes por guardar. ¿Deseas salir sin guardar?'
    );
  }
  return true;
};
