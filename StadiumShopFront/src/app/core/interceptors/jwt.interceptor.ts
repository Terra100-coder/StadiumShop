import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../../environment';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const productsUrl = `${environment.apiUrl}/products`;
  const isPublicRequest = request.url === `${environment.apiUrl}/auth/login` ||
    request.url === productsUrl ||
    request.url.startsWith(`${productsUrl}/`);
  const token = authService.getToken();
  const authenticatedRequest = !isPublicRequest && token !== null;
  const requestWithToken = authenticatedRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(requestWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authenticatedRequest) {
        authService.logout();

        if (!router.url.startsWith('/login')) {
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
      }

      return throwError(() => error);
    })
  );
};
