import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import { Store, CreateStoreDto, UpdateStoreDto } from '../../shared/entities/store.interface';

/**
 * Store service for managing store entities
 */
@Injectable({
  providedIn: 'root',
})
export class StoreService extends _baseCrudService<Store, CreateStoreDto, UpdateStoreDto> {
  constructor() {
    super('stores');
  }
}
