import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Restringe una ruta al rol `root`. Cualquier otro rol se redirige al dashboard.
 * Se usa para la pestaña "Configurar" (config avanzada), que solo debe ver root.
 */
export const rootGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (user?.role === 'root') return true;
  router.navigate(['/dashboard']);
  return false;
};
