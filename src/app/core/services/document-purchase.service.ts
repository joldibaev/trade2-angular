import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  DocumentPurchase,
  CreateDocumentPurchaseDto,
  UpdateDocumentPurchaseDto,
} from '../../shared/entities/document-purchase.interface';

/**
 * Document Purchase service for managing purchase document entities
 */
@Injectable({
  providedIn: 'root',
})
export class DocumentPurchaseService extends _baseCrudService<
  DocumentPurchase,
  CreateDocumentPurchaseDto,
  UpdateDocumentPurchaseDto
> {
  constructor() {
    super('document-purchases');
  }
}
