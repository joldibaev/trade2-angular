import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import {
  DocumentSell,
  CreateDocumentSellDto,
  UpdateDocumentSellDto,
} from '../../shared/entities/document-sell.interface';

/**
 * Document Sell service for managing sales document entities
 */
@Injectable({
  providedIn: 'root',
})
export class DocumentSellService extends _baseCrudService<
  DocumentSell,
  CreateDocumentSellDto,
  UpdateDocumentSellDto
> {
  constructor() {
    super('document-sells');
  }
}
