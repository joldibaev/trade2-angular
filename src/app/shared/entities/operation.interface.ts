import { Product } from './product.interface';
import { Store } from './store.interface';
import { DocumentPurchase } from './document-purchase.interface';
import { DocumentSell } from './document-sell.interface';
import { DocumentAdjustment } from './document-adjustment.interface';

/**
 * Operation entity interface
 * Individual product movements with quantities and costs
 *
 * Business Rules:
 * - An operation must be linked to either a DocumentPurchase OR DocumentSell (not both)
 * - price is required for all operations
 * - price represents the cost price for purchases and sell price for sales
 */
export interface Operation {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Quantity of products moved */
  quantity: number;

  /** Price per unit */
  price: number;

  /** Total amount (quantity × price) - computed field */
  total: number;

  /** Product being moved */
  product: Product;

  /** Store where movement occurs */
  store: Store;

  /** Associated purchase document (optional) */
  documentPurchase?: DocumentPurchase;

  /** Associated sell document (optional) */
  documentSell?: DocumentSell;

  /** Associated adjustment document (optional) */
  documentAdjustment?: DocumentAdjustment;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Operation creation DTO (unified for both purchase and sell operations)
 */
export interface CreateOperationDto {
  quantity: number;
  price: number;
  productId: string;
  quantityPositive?: boolean;
  documentPurchaseId?: number;
  documentSellId?: number;
  documentAdjustmentId?: number;
}

/**
 * Operation creation DTO for purchase operations (convenience interface)
 */
export interface CreatePurchaseOperationDto extends CreateOperationDto {
  documentPurchaseId: number;
}

/**
 * Operation creation DTO for sell operations (convenience interface)
 */
export interface CreateSellOperationDto extends CreateOperationDto {
  documentSellId: number;
}

/**
 * Operation update DTO (all fields optional)
 */
export type UpdateOperationDto = Partial<CreateOperationDto>;

/**
 * Operation filtering DTO for GET requests
 */
export interface GetOperationsDto {
  /** Document Sell ID for filtering operations */
  documentSellId?: number;
}
