import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { UserStorage } from '../storages/user.storage';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const userStorage = inject(UserStorage);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = userStorage.get();

  // Добавляем токен к запросу
  let headers = req.headers;
  if (token) {
    headers = req.headers.set('authorization', `Bearer ${token}`);
  }

  const modifiedReq = req.clone({ headers });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Если получили 401 и это не запрос на refresh или login
      if (
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login')
      ) {
        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
          // Пытаемся обновить токены
          return authService.refreshTokens().pipe(
            switchMap(() => {
              // Повторяем оригинальный запрос с новым токеном
              const newToken = authService.getAccessToken();
              const newHeaders = req.headers.set('authorization', `Bearer ${newToken}`);
              return next(req.clone({ headers: newHeaders }));
            }),
            catchError(() => {
              // Если не удалось обновить токены, перенаправляем на страницу входа
              authService.logout();
              void router.navigate(['/auth']);
              return throwError(() => error);
            })
          );
        } else {
          // Нет refresh токена, перенаправляем на страницу входа
          authService.logout();
          void router.navigate(['/auth']);
        }
      }

      return throwError(() => error);
    })
  );
};
