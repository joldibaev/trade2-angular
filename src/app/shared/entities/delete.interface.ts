/**
 * Delete DTOs for bulk operations
 * Used for mass deletion of entities
 */

/**
 * Generic delete DTO for bulk operations
 */
export interface DeleteDto {
  /** Array of entity IDs to delete */
  ids: string[];
}

/**
 * Currency delete DTO
 */
export interface DeleteCurrenciesDto {
  ids: string[];
}

/**
 * Product delete DTO
 */
export interface DeleteProductsDto {
  ids: string[];
}

/**
 * Category delete DTO
 */
export interface DeleteCategoriesDto {
  ids: string[];
}

/**
 * Store delete DTO
 */
export interface DeleteStoresDto {
  ids: string[];
}

/**
 * Customer delete DTO
 */
export interface DeleteCustomersDto {
  ids: string[];
}

/**
 * Vendor delete DTO
 */
export interface DeleteVendorsDto {
  ids: string[];
}

/**
 * Price type delete DTO
 */
export interface DeletePriceTypesDto {
  ids: string[];
}

/**
 * Price delete DTO
 */
export interface DeletePricesDto {
  ids: string[];
}

/**
 * Operation delete DTO
 */
export interface DeleteOperationsDto {
  ids: string[];
}

/**
 * Cashbox delete DTO
 */
export interface DeleteCashboxesDto {
  ids: string[];
}

/**
 * Document purchase delete DTO
 */
export interface DeleteDocumentPurchasesDto {
  ids: number[];
}

/**
 * Document sell delete DTO
 */
export interface DeleteDocumentSellsDto {
  ids: number[];
}
