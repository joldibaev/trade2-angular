import { Store } from './store.interface';

/**
 * Cashbox entity interface
 * Cash management for each store location
 */
export interface Cashbox {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Cashbox name */
  name: string;

  /** Store ID */
  storeId: string;

  /** Associated store */
  store: Store;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Cashbox creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateCashboxDto {
  name: string;
  storeId: string;
}

/**
 * Cashbox update DTO (all fields optional)
 */
export type UpdateCashboxDto = Partial<CreateCashboxDto>;
