import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError, throwError } from 'rxjs';
import { UserStorage } from '../storages/user.storage';
import { RefreshTokenStorage } from '../storages/refresh-token.storage';
import { LoginDto, RefreshTokenDto, AuthResponse } from '../../shared/entities/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private userStorage = inject(UserStorage);
  private refreshTokenStorage = inject(RefreshTokenStorage);

  login(username: string, password: string) {
    const loginData: LoginDto = { username, password };
    return this.apiService.post<AuthResponse>('/auth/login', loginData).pipe(
      tap(({ access_token, refresh_token }) => {
        this.userStorage.set(access_token);
        this.refreshTokenStorage.set(refresh_token);
      })
    );
  }

  refreshTokens() {
    const refreshToken = this.refreshTokenStorage.get();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshData: RefreshTokenDto = { refresh_token: refreshToken };
    return this.apiService.post<AuthResponse>('/auth/refresh', refreshData).pipe(
      tap(({ access_token, refresh_token }) => {
        this.userStorage.set(access_token);
        this.refreshTokenStorage.set(refresh_token);
      }),
      catchError(error => {
        // Если refresh токен недействителен, очищаем все токены
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout() {
    this.userStorage.remove();
    this.refreshTokenStorage.remove();
  }

  isAuthenticated(): boolean {
    return this.userStorage.has() && this.refreshTokenStorage.has();
  }

  getAccessToken(): string | undefined {
    return this.userStorage.get();
  }

  getRefreshToken(): string | undefined {
    return this.refreshTokenStorage.get();
  }
}
