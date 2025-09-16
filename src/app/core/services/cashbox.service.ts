import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  Cashbox,
  CreateCashboxDto,
  UpdateCashboxDto,
} from '../../shared/entities/cashbox.interface';

/**
 * Cashbox service for managing cashbox entities
 */
@Injectable({
  providedIn: 'root',
})
export class CashboxService extends _baseCrudService<Cashbox, CreateCashboxDto, UpdateCashboxDto> {
  constructor() {
    super('cashboxes');
  }
}
