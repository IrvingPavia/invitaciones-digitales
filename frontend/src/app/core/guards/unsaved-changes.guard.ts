import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { DialogService } from '../services/dialog.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  save?(): void;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const dialog = inject(DialogService);
    const result = await dialog.unsavedChanges(
      'Cambios sin guardar',
      'Tienes cambios pendientes. ¿Qué deseas hacer?'
    );

    switch (result) {
      case 'save':
        // Save and allow navigation
        if (component.save) {
          component.save();
        }
        return true;
      case 'discard':
        // Discard changes and allow navigation
        return true;
      case 'cancel':
        // Stay on current page
        return false;
    }
  }
  return true;
};
