import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { AppRole } from '../models/auth.models';

export const adminEditorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && (user.role === AppRole.Admin || user.role === AppRole.DataEditor)) {
    return true;
  }

  // Redirect to dashboard if user doesn't have the required role
  router.navigate(['/dashboard']);
  return false;
};
