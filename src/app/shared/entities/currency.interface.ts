export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Currency extends BaseEntity {
  /** Currency value */
  value: number;
}

export interface CreateCurrencyDto {
  value: number;
}

export interface UpdateCurrencyDto extends Partial<CreateCurrencyDto> {
  value?: number;
}
