import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { _baseCrudService } from './_base-crud.service';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryWithChildren,
} from '../../shared/entities/category.interface';
import { ApiService } from './api.service';

/**
 * Category service for managing category entities with hierarchical support
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService extends _baseCrudService<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  protected override readonly http = inject(HttpClient);
  protected override readonly apiService = inject(ApiService);

  constructor() {
    super('categories');
  }

  /**
   * Get categories by parent ID
   */
  getByParentId(parentId: string): Observable<Category[]> {
    const params = new HttpParams().set('parentId', parentId);
    return this.http.get<Category[]>(`${this.apiService.baseUrl}/${this.endpoint}`, { params });
  }

  /**
   * Get root categories only (categories without parent)
   */
  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiService.baseUrl}/${this.endpoint}/root`);
  }

  /**
   * Get categories with children (hierarchical structure)
   */
  getWithChildren(): Observable<CategoryWithChildren[]> {
    return this.http.get<CategoryWithChildren[]>(
      `${this.apiService.baseUrl}/${this.endpoint}/hierarchy`
    );
  }
}
