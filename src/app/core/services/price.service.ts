import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { _baseCrudService } from './_base-crud.service';
import {
  Price,
  CreatePriceDto,
  UpdatePriceDto,
  PriceLookupParams,
} from '../../shared/entities/price.interface';
import { ApiService } from './api.service';

/**
 * Price service for managing price entities with lookup capabilities
 */
@Injectable({
  providedIn: 'root',
})
export class PriceService extends _baseCrudService<Price, CreatePriceDto, UpdatePriceDto> {
  protected override readonly http = inject(HttpClient);
  protected override readonly apiService = inject(ApiService);

  constructor() {
    super('prices');
  }

  /**
   * Get prices for specific product
   */
  getByProductId(productId: string): Observable<Price[]> {
    const params = new HttpParams().set('productId', productId);
    return this.http.get<Price[]>(`${this.apiService.baseUrl}/${this.endpoint}`, { params });
  }

  /**
   * Get prices by price type
   */
  getByPriceTypeId(priceTypeId: string): Observable<Price[]> {
    const params = new HttpParams().set('priceTypeId', priceTypeId);
    return this.http.get<Price[]>(`${this.apiService.baseUrl}/${this.endpoint}`, { params });
  }

  /**
   * Get specific price for product and price type
   */
  getByProductAndPriceType(params: PriceLookupParams): Observable<Price> {
    const httpParams = new HttpParams()
      .set('productId', params.productId)
      .set('priceTypeId', params.priceTypeId);

    return this.http.get<Price>(`${this.apiService.baseUrl}/${this.endpoint}`, {
      params: httpParams,
    });
  }
}
