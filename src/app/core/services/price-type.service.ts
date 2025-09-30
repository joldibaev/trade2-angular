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
   * Get price types for sales (usage contains 'sale')
   */
  getForSales() {
    return this.getAllAsResource({ byUsage: 'sale' });
  }

  /**
   * Get price types for purchases (usage contains 'purchase')
   */
  getForPurchases() {
    return this.getAllAsResource({ byUsage: 'purchase' });
  }

  /**
   * Get price types for both sales and purchases
   */
  getForBoth() {
    return this.getAllAsResource({ byUsage: 'sale,purchase' });
  }

  /**
   * Get price types by custom usage array
   */
  getByUsage(usage: ('sale' | 'purchase')[]) {
    return this.getAllAsResource({ byUsage: usage.join(',') });
  }
}
