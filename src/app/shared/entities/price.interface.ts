import { Product } from './product.interface';
import { PriceType } from './price-type.interface';

/**
 * Price entity interface
 * Product pricing with different price types
 */
export interface Price {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Price value */
  value: number;

  /** Associated product */
  product: Product;

  /** Price type */
  type: PriceType;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Price creation DTO (without id, createdAt, updatedAt)
 */
export interface CreatePriceDto {
  value: number;
  productId: string;
  priceTypeId: string;
}

/**
 * Price update DTO (all fields optional)
 */
export interface UpdatePriceDto {
  value?: number;
  productId?: string;
  priceTypeId?: string;
}

/**
 * Price lookup parameters
 */
export interface PriceLookupParams {
  productId: string;
  priceTypeId: string;
}
