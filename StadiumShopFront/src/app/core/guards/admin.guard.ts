import { CanActivateChildFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authorizeAdmin(authService, router, `/${segments.map((segment) => segment.path).join('/')}`);
};

export const adminChildGuard: CanActivateChildFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authorizeAdmin(authService, router, state.url);
};

function authorizeAdmin(authService: AuthService, router: Router, returnUrl: string): boolean | UrlTree {
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  return authService.isAdmin() ? true : router.createUrlTree(['/']);
}
