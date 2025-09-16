import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../../shared/entities/customer.interface';

/**
 * Customer service for managing customer entities
 */
@Injectable({
  providedIn: 'root',
})
export class CustomerService extends _baseCrudService<
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto
> {
  constructor() {
    super('customers');
  }
}
