import { inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MessageService } from 'primeng/api';

/**
 * Base service providing common CRUD operations
 * @template T - Entity type
 * @template CreateDto - Create DTO type
 * @template UpdateDto - Update DTO type
 */
@Injectable({
  providedIn: 'root',
})
export abstract class _baseCrudService<T, CreateDto, UpdateDto> {
  protected readonly http = inject(HttpClient);
  protected readonly apiService = inject(ApiService);
  protected readonly messageService = inject(MessageService);
  readonly url: string;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  protected constructor(protected readonly endpoint: string) {
    this.url = `${this.apiService.baseUrl}/${this.endpoint}`;
  }

  /**
   * Get all entities with optional query parameters
   */
  getAll(params?: Record<string, string | number>): Observable<T[]> {
    return this.http.get<T[]>(this.url, {
      params,
    });
  }

  /**
   * Get all entities as resource with optional query parameters
   */
  getAllAsResource(params?: Record<string, string | number>) {
    return httpResource<T[]>(() => ({
      url: this.url,
      method: 'GET',
      params,
    }));
  }

  /**
   * Get entity by ID
   */
  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  /**
   * Create new entity
   */
  create(createDto: CreateDto): Observable<T> {
    return this.http.post<T>(this.url, createDto);
  }

  /**
   * Update entity by ID
   */
  update(id: string, updateDto: UpdateDto): Observable<T> {
    return this.http.patch<T>(`${this.url}/${id}`, updateDto);
  }

  /**
   * Delete entities by IDs
   */
  delete(ids: string[]): Observable<{ deletedCount: number }> {
    return this.http.post<{ deletedCount: number }>(`${this.url}/delete`, { ids });
  }
}
