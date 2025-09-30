import { Price } from './price.interface';

/**
 * PriceType entity interface
 * Different pricing categories for products
 */
export interface PriceType {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Price type name */
  name: string;

  /** Where the price type is used */
  usage: ('sale' | 'purchase')[];

  /** Prices associated with this type */
  prices: Price[];

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * PriceType creation DTO (without id, createdAt, updatedAt)
 */
export interface CreatePriceTypeDto {
  name: string;
  usage: ('sale' | 'purchase')[];
}

/**
 * PriceType update DTO (all fields optional)
 */
export type UpdatePriceTypeDto = Partial<CreatePriceTypeDto>;

/**
 * Price type filtering DTO for GET requests
 */
export interface FindPriceTypesDto {
  /** Filter by usage type */
  byUsage?: ('sale' | 'purchase')[];
}

/**
 * Default price types
 */
export const DEFAULT_PRICE_TYPES = {
  DEALER: 'Дилерская цена',
  WHOLESALE: 'Оптом цена',
  RETAIL: 'Розничная цена',
} as const;
