/**
 * Vendor entity interface
 * Suppliers for purchasing office supplies
 */
export interface Vendor {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Vendor name */
  name: string;

  /** Contact phone (optional) */
  phone?: string;

  /** Vendor address (optional) */
  address?: string;

  /** Additional notes (optional) */
  notes?: string;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Vendor creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateVendorDto {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/**
 * Vendor update DTO (all fields optional except id)
 */
export type UpdateVendorDto = Partial<CreateVendorDto>;
