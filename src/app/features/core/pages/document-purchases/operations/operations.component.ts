import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OperationFormComponent } from '../modals/operation-form/operation-form.component';
import { ProductSearchModalComponent } from '../modals/product-search-modal/product-search-modal.component';
import { Ripple } from 'primeng/ripple';
import { Operation } from '../../../../../shared/entities/operation.interface';
import { OperationService } from '../../../../../core/services/operation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableColumn } from '../../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-operations',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsComponent {
  private readonly operationService = inject(OperationService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Input properties
  operations = input.required<Operation[]>();
  documentPurchaseId = input<string | undefined>();

  operationsChanged = output<void>();

  columnsOperation = computed<TableColumn<Operation>[]>(() => [
    {
      field: 'product.name',
      header: 'Товар',
      sortable: true,
      type: 'link',
      getLink: (operation: Operation) => {
        return ['/core/products', operation.product.id];
      },
    },
    {
      field: 'quantity',
      header: 'Количество',
      sortable: true,
      type: 'number',
    },
    {
      field: 'operationProps.price',
      header: 'Цена',
      sortable: true,
      type: 'number',
    },
    {
      field: 'total',
      header: 'Сумма',
      sortable: true,
      type: 'number',
      computeFn: (operation: Operation) => {
        return operation.quantity * (operation.operationProps?.price || 0);
      },
    },
  ]);

  openOperationDialog() {
    // Check if document purchase is selected
    if (!this.documentPurchaseId()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Сначала выберите документ покупки',
      });
      return;
    }

    // Open product search modal first
    this.openProductSearchModal();
  }

  private openProductSearchModal() {
    const ref = this.dialogService.open(ProductSearchModalComponent, {
      header: 'Выберите товар',
      width: '600px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      appendTo: 'body',
    });

    ref.onClose.subscribe((productId: string | undefined) => {
      if (productId) {
        this.openOperationFormWithProduct(productId);
      }
    });
  }

  private openOperationFormWithProduct(productId: string) {
    const ref = this.dialogService.open(OperationFormComponent, {
      header: 'Добавить операцию',
      width: '700px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      appendTo: 'body',
      data: {
        mode: 'add',
        documentPurchaseId: this.documentPurchaseId(),
        productId,
      },
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.operationsChanged.emit();
      }
    });
  }

  editedOperation(operation: Operation) {
    this.openOperationEditDialog(operation);
  }

  private openOperationEditDialog(operation: Operation) {
    const ref = this.dialogService.open(OperationFormComponent, {
      header: 'Редактировать операцию',
      width: '700px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      appendTo: 'body',
      data: {
        mode: 'edit',
        operation,
        productId: operation.productId,
      },
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.operationsChanged.emit();
      }
    });
  }

  deletedOperation(operations: Operation[]) {
    const ids = operations.map(({ id }) => id);

    this.operationService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено операций: ${response.deletedCount}`,
          });
          this.operationsChanged.emit();
        },
        error: error => {
          console.error('Error deleting operations:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить операции',
          });
        },
      });
  }
}
