import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { _baseCrudService } from './_base-crud.service';
import {
  CreateOperationDto,
  CreatePurchaseOperationDto,
  CreateSellOperationDto,
  Operation,
  UpdateOperationDto,
} from '../../shared/entities/operation.interface';
import { ApiService } from './api.service';

/**
 * Operation service for managing operation entities
 * Handles both purchase and sell operations with different creation DTOs
 */
@Injectable({
  providedIn: 'root',
})
export class OperationService extends _baseCrudService<
  Operation,
  CreateOperationDto,
  UpdateOperationDto
> {
  protected override readonly http = inject(HttpClient);
  protected override readonly apiService = inject(ApiService);

  constructor() {
    super('operations');
  }

  /**
   * Create purchase operation (with cost price)
   */
  createPurchaseOperation(operation: CreatePurchaseOperationDto): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiService.baseUrl}/${this.endpoint}`, operation);
  }

  /**
   * Create sell operation (without cost price)
   */
  createSellOperation(operation: CreateSellOperationDto): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiService.baseUrl}/${this.endpoint}`, operation);
  }

  /**
   * Get operations by document sell ID
   */
  getByDocumentSell(documentSellId: number): Observable<Operation[] | null> {
    if (!documentSellId) return of(null);

    return this.http.get<Operation[]>(`${this.apiService.baseUrl}/${this.endpoint}`, {
      params: { documentSellId: documentSellId.toString() },
    });
  }

  /**
   * Get operations by document purchase ID
   */
  getByDocumentPurchase(documentPurchaseId: number): Observable<Operation[] | null> {
    if (!documentPurchaseId) return of(null);

    return this.http.get<Operation[]>(`${this.apiService.baseUrl}/${this.endpoint}`, {
      params: { documentPurchaseId: documentPurchaseId.toString() },
    });
  }
}
