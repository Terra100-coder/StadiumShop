import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    const returnUrl = `/${segments.map((segment) => segment.path).join('/')}`;
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  return authService.isAdmin() ? true : router.createUrlTree(['/']);
};
