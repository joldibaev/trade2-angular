import { Product } from './product.interface';

/**
 * Category entity interface
 * Hierarchical product categorization system
 */
export interface Category {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Category name */
  name: string;

  /** Parent category for hierarchy (optional) */
  parentId?: string;

  /** Parent category */
  parent?: Category;

  /** Child categories */
  children?: Category[];

  /** Products in this category */
  products?: Product[];

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Category creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateCategoryDto {
  name: string;
  parentId?: string;
}

/**
 * Category update DTO (all fields optional)
 */
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

/**
 * Category with nested children (for hierarchical display)
 */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
