import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import { Vendor, CreateVendorDto, UpdateVendorDto } from '../../shared/entities/vendor.interface';

/**
 * Vendor service for managing vendor entities
 */
@Injectable({
  providedIn: 'root',
})
export class VendorService extends _baseCrudService<Vendor, CreateVendorDto, UpdateVendorDto> {
  constructor() {
    super('vendors');
  }
}
