import { Product } from './product.interface';

export enum BarcodeType {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  CODE128 = 'CODE128',
  QR = 'QR',
  OTHER = 'OTHER',
}

/**
 * Barcode entity interface
 * Product barcode management
 */
export interface Barcode {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Barcode code */
  code: string;

  /** Barcode type */
  type: BarcodeType;

  /** Product ID */
  productId: string;

  /** Associated product */
  product: Product;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Barcode creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateBarcodeDto {
  code: string;
  type: BarcodeType;
  productId: string;
}

/**
 * Barcode update DTO (all fields optional)
 */
export interface UpdateBarcodeDto {
  code?: string;
  type?: BarcodeType;
  productId?: string;
}
