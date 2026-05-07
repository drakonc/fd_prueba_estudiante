import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authStore.accessToken();
  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      const esEndpointAuth = req.url.includes('/Auth/login') || req.url.includes('/Auth/refresh') || req.url.includes('/Registro');
      if (error.status === 401 && !esEndpointAuth && authStore.estaAutenticado()) {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          return authService.refresh(refreshToken).pipe(
            switchMap(res => {
              if (res.operacionExitosa && res.datos?.tokens) {
                authStore.actualizarTokens(
                  res.datos.tokens.accessToken,
                  res.datos.tokens.refreshToken
                );
                const reintento = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.datos.tokens.accessToken}` }
                });
                return next(reintento);
              }
              authStore.limpiarSesion();
              router.navigate(['/login']);
              return throwError(() => error);
            }),
            catchError(() => {
              authStore.limpiarSesion();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        }
        authStore.limpiarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
