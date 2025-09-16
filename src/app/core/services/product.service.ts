import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '../../shared/entities/product.interface';
import { Observable } from 'rxjs';

/**
 * Product service for managing product entities
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService extends _baseCrudService<Product, CreateProductDto, UpdateProductDto> {
  constructor() {
    super('products');
  }

  /**
   * Search products by name, article, or barcode
   */
  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}/search`, {
      params: { query },
    });
  }

  /**
   * Get products by category ID
   */
  getByCategoryId(categoryId: string): Observable<Product[]> {
    return this.getAll({ categoryId });
  }
}
