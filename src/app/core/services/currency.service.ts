import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { _baseCrudService } from './_base-crud.service';
import {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
} from '../../shared/entities/currency.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService extends _baseCrudService<
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto
> {
  protected override readonly http = inject(HttpClient);
  protected override readonly apiService = inject(ApiService);

  constructor() {
    super('currencies');
  }

  /**
   * Get latest currency exchange rate
   */
  getLatest(): Observable<Currency> {
    return this.http.get<Currency>(`${this.apiService.baseUrl}/${this.endpoint}/latest`);
  }
}
