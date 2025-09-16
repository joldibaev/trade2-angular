import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
} from '../../shared/entities/currency.interface';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService extends _baseCrudService<
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto
> {
  constructor() {
    super('currencies');
  }
}
