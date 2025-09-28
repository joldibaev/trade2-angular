import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../../shared/components/table/interfaces/table-column.interface';
import { Quantity } from '../../../../../shared/entities/quantity.interface';

@Component({
  selector: 'app-product-quantities',
  imports: [TableComponent],
  templateUrl: './product-quantities.component.html',
  styleUrl: './product-quantities.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuantitiesComponent {
  quantities = input.required<Quantity[]>();

  columns = computed<TableColumn<Quantity>[]>(() => [
    { field: 'store.name', header: 'Магазин', type: 'text', sortable: true },
    { field: 'quantity', header: 'Количество', type: 'number', sortable: true },
  ]);
}
