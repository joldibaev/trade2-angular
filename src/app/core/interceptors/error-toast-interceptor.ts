import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'Произошла неизвестная ошибка';

      // Проверяем тип ошибки
      if (error.status === 0) {
        // Ошибка соединения (бэкенд выключен)
        errorMessage =
          'Сервер недоступен. Проверьте подключение к интернету или обратитесь к администратору';
      } else if (error.status >= 500) {
        // Ошибка сервера
        errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже';
      } else if (error.status === 404) {
        // Не найдено
        errorMessage = 'Запрашиваемый ресурс не найден';
      } else if (error.status === 401) {
        // Не авторизован
        errorMessage = 'Необходима авторизация';
      } else if (error.status === 403) {
        // Доступ запрещен
        errorMessage = 'Доступ запрещен';
      } else if (error.error?.message) {
        // Сообщение от сервера
        const message = error.error.message;

        if (Array.isArray(message)) {
          message.forEach(msg => {
            messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: msg,
            });
          });
          return throwError(() => error);
        } else if (typeof message === 'string') {
          errorMessage = message;
        }
      } else if (error.message) {
        // Сообщение об ошибке из самого error объекта
        errorMessage = error.message;
      }

      messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: errorMessage,
      });

      return throwError(() => error);
    })
  );
};
