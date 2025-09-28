import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { Barcode } from '../../../../../shared/entities/barcode.interface';
import { TableColumn } from '../../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-product-barcode',
  imports: [TableComponent],
  templateUrl: './product-barcode.component.html',
  styleUrl: './product-barcode.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductBarcodeComponent {
  barcodes = input.required<Barcode[]>();

  /*
  * {
  "id": "019986a6-56c8-72b9-81ae-8a8cf9bc4880",
  "code": "6945658147339",
  "type": "EAN13",
  "productId": "019986a6-55d2-7a61-9684-1b271be6acef",
  "createdAt": "2025-09-26T15:31:12.200Z",
  "updatedAt": "2025-09-26T15:31:12.200Z",
  "deletedAt": null
}*/

  columns = computed<TableColumn<Barcode>[]>(() => [
    { field: 'code', header: 'Код', type: 'text', sortable: true },
    { field: 'type', header: 'Тип', type: 'text', sortable: true },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);
}
