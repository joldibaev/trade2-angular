import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private httpClient = inject(HttpClient);

  readonly baseUrl = '/api';

  get<T>(endpoint: string) {
    return this.httpClient.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: unknown) {
    return this.httpClient.post<T>(`${this.baseUrl}${endpoint}`, body);
  }
}
