import { Store } from './store.interface';
import { Customer } from './customer.interface';
import { User } from './user.interface';
import { PriceType } from './price-type.interface';
import { Operation } from './operation.interface';

/**
 * Document Sell entity interface
 * Sales documents in the system
 */
export interface DocumentSell {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Whether the document has been performed */
  performed: boolean;

  /** Document date */
  date: Date;

  /** Store ID */
  storeId: string;

  /** Associated store */
  store: Store;

  /** Customer ID */
  customerId?: string;

  /** Associated customer */
  customer?: Customer;

  /** Author ID */
  authorId: string;

  /** Author (User) who created the document */
  author: User;

  /** Price type ID */
  priceTypeId: string;

  /** Price type for this document */
  priceType: PriceType;

  /** Additional note for this document */
  note?: string;

  /** Operations related to this document */
  operations: Operation[];

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Document Sell creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateDocumentSellDto {
  date?: string;
  storeId: string;
  customerId?: string;
  priceTypeId: string;
  note?: string;
}

/**
 * Document Sell update DTO (all fields optional)
 */
export interface UpdateDocumentSellDto {
  performed?: boolean;
  date?: string;
  storeId?: string;
  customerId?: string;
  priceTypeId?: string;
  note?: string;
}
