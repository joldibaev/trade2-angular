import { Store } from './store.interface';
import { Vendor } from './vendor.interface';
import { User } from './user.interface';
import { PriceType } from './price-type.interface';
import { Operation } from './operation.interface';

/**
 * Document Purchase entity interface
 * Purchase documents in the system
 */
export interface DocumentPurchase {
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

  /** Vendor ID */
  vendorId: string;

  /** Associated vendor */
  vendor: Vendor;

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
 * Document Purchase creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateDocumentPurchaseDto {
  date: Date;
  storeId: string;
  vendorId: string;
  priceTypeId: string;
  note?: string;
}

/**
 * Document Purchase update DTO (all fields optional)
 */
export interface UpdateDocumentPurchaseDto extends Partial<CreateDocumentPurchaseDto> {
  performed?: boolean;
}
