/**
 * Store entity interface
 * Physical store locations for inventory management
 */
export interface Store {
  /** Unique identifier (UUID v7) */
  id: string;

  /** Store name */
  name: string;

  /** Record creation date */
  createdAt: Date;

  /** Last update date */
  updatedAt: Date;

  /** Soft delete date */
  deletedAt?: Date;
}

/**
 * Store creation DTO (without id, createdAt, updatedAt)
 */
export interface CreateStoreDto {
  name: string;
}

/**
 * Store update DTO (all fields optional)
 */
export type UpdateStoreDto = Partial<CreateStoreDto>;
