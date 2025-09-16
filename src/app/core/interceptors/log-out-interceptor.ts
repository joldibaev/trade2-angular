import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { UserStorage } from '../storages/user.storage';
import { Router } from '@angular/router';

export const logOutInterceptor: HttpInterceptorFn = (req, next) => {
  const userStorage = inject(UserStorage);
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        if (userStorage.has()) {
          router.navigate(['/auth']).then(() => {
            userStorage.remove();
          });
        }
      }
      return throwError(() => error);
    })
  );
};
