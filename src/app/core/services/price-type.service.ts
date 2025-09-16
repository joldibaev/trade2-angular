import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  PriceType,
  CreatePriceTypeDto,
  UpdatePriceTypeDto,
} from '../../shared/entities/price-type.interface';

/**
 * Price Type service for managing price type entities
 */
@Injectable({
  providedIn: 'root',
})
export class PriceTypeService extends _baseCrudService<
  PriceType,
  CreatePriceTypeDto,
  UpdatePriceTypeDto
> {
  constructor() {
    super('price-types');
  }

  /**
   * Get price types for sales (usage: 'sale' or 'both')
   */
  getForSales() {
    return this.getAllAsResource({ byUsage: 'sale' });
  }

  /**
   * Get price types for purchases (usage: 'purchase' or 'both')
   */
  getForPurchases() {
    return this.getAllAsResource({ byUsage: 'purchase' });
  }
}
