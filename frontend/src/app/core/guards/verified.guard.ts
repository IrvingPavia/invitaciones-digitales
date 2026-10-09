import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Blocks dashboard access if user's email is not verified.
 * Admin/root users that were NOT self-registered bypass this check.
 * Otherwise redirects to /verificacion-pendiente.
 *
 * Validates: Requirements 1.8, 9.1
 */
export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Admin/root bypass: only if NOT self-registered
  if (['root', 'admin'].includes(user.role) && !user.self_registered) {
    return true;
  }

  // Check verification status
  if (user.verification_status === 'verified' && user.email_verified === 1) {
    return true;
  }

  router.navigate(['/verificacion-pendiente']);
  return false;
};
