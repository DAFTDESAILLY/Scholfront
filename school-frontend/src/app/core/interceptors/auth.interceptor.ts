import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // No agregar token a endpoints públicos
    const isPublicEndpoint = req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh');

    if (token && !isPublicEndpoint) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es 401 y NO es un endpoint público, hacer logout y redirigir
            if (error.status === 401 && !isPublicEndpoint) {
                console.error('Token inválido o expirado. Cerrando sesión...');
                authService.logout();
                router.navigate(['/auth/login']);
            }

            return throwError(() => error);
        })
    );
};