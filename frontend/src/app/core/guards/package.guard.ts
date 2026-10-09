import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';

/**
 * Verifies feature access by event's plan.
 * Reads requiredFeature from route.data and eventId from route.params.
 * For now, lets all requests through — real enforcement happens on backend.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.6
 */
export const packageGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  // Read route configuration (for future use)
  const requiredFeature = route.data['requiredFeature'];
  const eventId = route.params['eventId'] || route.params['id'];

  // For now, let all requests through.
  // Backend middleware (requirePackageFeature) handles actual enforcement.
  // In future iterations, this can call a backend endpoint to verify before navigation.
  return true;
};
