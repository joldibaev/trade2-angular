/**
 * Customer entity interface
 * End customers purchasing office supplies
 */
export interface Customer {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Customer name */
  name: string;

  /** Contact phone (optional) */
  phone?: string;

  /** Customer address (optional) */
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
 * Customer creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateCustomerDto {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/**
 * Customer update DTO (all fields optional)
 */
export type UpdateCustomerDto = Partial<CreateCustomerDto>;
