import { Category } from './category.interface';
import { Barcode } from './barcode.interface';
import { Quantity } from './quantity.interface';
import { Price } from './price.interface';

/**
 * Product entity interface
 * Products in the inventory system
 */
export interface Product {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Product name */
  name: string;

  /** Product article/SKU */
  article: string;

  /** Category ID */
  categoryId: string;

  /** Associated category */
  category: Category;

  /** Associated category */
  quantities: Quantity[];

  /** Product barcodes */
  barcodes: Barcode[];

  /** Product prices */
  prices: Price[];

  /** Weighted Average Cost (WAC) */
  wac: number;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Product creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateProductDto {
  name: string;
  article: string;
  categoryId: string;
}

/**
 * Product update DTO (all fields optional)
 */
export type UpdateProductDto = Partial<CreateProductDto>;

/**
 * Product filtering DTO for GET requests
 */
export interface GetProductsDto {
  /** Search products by name or article */
  search?: string;
  /** Filter products by category ID */
  categoryId?: string;
}
