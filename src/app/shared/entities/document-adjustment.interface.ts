import { Store } from './store.interface';
import { User } from './user.interface';
import { Operation } from './operation.interface';

/**
 * Document Adjustment entity interface
 * Inventory adjustment documents in the system
 */
export interface DocumentAdjustment {
  /** Unique identifier */
  id: number;

  /** Whether the document has been performed */
  performed: boolean;

  /** Document date */
  date: Date;

  /** Store ID */
  storeId: string;

  /** Associated store */
  store: Store;

  /** Author ID */
  authorId: string;

  /** Author (User) who created the document */
  author: User;

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
 * Document Adjustment creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateDocumentAdjustmentDto {
  date?: string;
  storeId: string;
  note?: string;
}

/**
 * Document Adjustment update DTO (all fields optional)
 */
export interface UpdateDocumentAdjustmentDto {
  performed?: boolean;
  date?: string;
  storeId?: string;
  note?: string;
}
