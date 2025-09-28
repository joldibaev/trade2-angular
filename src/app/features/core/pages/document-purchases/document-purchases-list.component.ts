import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DocumentPurchaseService } from '../../../../core/services/document-purchase.service';
import { StoreService } from '../../../../core/services/store.service';
import { VendorService } from '../../../../core/services/vendor.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { map, switchMap } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DocumentPurchaseFormComponent } from './document-purchase-form/document-purchase-form.component';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { Ripple } from 'primeng/ripple';
import { DocumentPurchase } from '../../../../shared/entities/document-purchase.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../../../core/services/operation.service';
import { Operation } from '../../../../shared/entities/operation.interface';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Splitter } from 'primeng/splitter';
import { ToggleButtonChangeEvent } from 'primeng/togglebutton';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-document-purchases',
  imports: [
    TableModule,
    TableComponent,
    AsyncPipe,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
    LoaderComponent,
    Splitter,
  ],
  templateUrl: './document-purchases-list.component.html',
  styleUrl: './document-purchases-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentPurchasesListComponent {
  private readonly documentPurchaseService = inject(DocumentPurchaseService);
  private readonly operationService = inject(OperationService);
  private readonly storeService = inject(StoreService);
  private readonly vendorService = inject(VendorService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  documentPurchasesResource = this.documentPurchaseService.getAllAsResource();

  storesResource = this.storeService.getAllAsResource();
  vendorsResource = this.vendorService.getAllAsResource();

  stores = computed(() => this.storesResource.value() || []);
  vendors = computed(() => this.vendorsResource.value() || []);

  documentPurchaseId = toSignal(
    this.activatedRoute.queryParams.pipe(
      map(params =>
        params['documentPurchaseId'] ? Number(params['documentPurchaseId']) : undefined
      )
    )
  );

  operations$ = this.activatedRoute.queryParams.pipe(
    switchMap(params => this.operationService.getByDocumentPurchase(params['documentPurchaseId']))
  );

  columnsDocument = computed<TableColumn<DocumentPurchase>[]>(() => [
    {
      field: 'id',
      header: 'ID',
      widthFit: true,
      sortable: true,
      type: 'button',
      computeFn: (documentPurchase: DocumentPurchase) => {
        return `Закуп ${documentPurchase.id}`;
      },
      callback: (documentPurchase: DocumentPurchase) => {
        return this.router.navigate([], {
          queryParams: { documentPurchaseId: documentPurchase.id },
        });
      },
    },
    {
      field: 'performed',
      header: 'Статус',
      widthFit: true,
      sortable: true,
      type: 'toggle-button',
      on: { label: 'Принят', icon: 'pi pi-lock' },
      off: { label: 'Черновик', icon: 'pi pi-lock-open' },
      onChange: (data: DocumentPurchase, event: ToggleButtonChangeEvent) => {
        this.documentPurchaseService
          .update(String(data.id), {
            performed: event.checked,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Успех',
              detail: 'Документ покупки обновлен успешно',
            });
          });
      },
    },
    { field: 'date', header: 'Дата', sortable: true, type: 'date' },
    {
      field: 'store.name',
      header: 'Магазин',
      sortable: true,
      type: 'text',
    },
    {
      field: 'vendor.name',
      header: 'Поставщик',
      sortable: true,
      type: 'text',
    },
    {
      field: 'author.firstName',
      header: 'Автор',
      sortable: true,
      type: 'text',
    },
    {
      field: 'priceType.name',
      header: 'Тип цены',
      sortable: true,
      type: 'text',
    },
    {
      field: 'note',
      header: 'Заметки',
      sortable: true,
      type: 'text',
    },
  ]);

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
      field: 'price',
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
        return operation.quantity * operation.price;
      },
    },
  ]);

  editedDocumentPurchase(documentPurchase: DocumentPurchase) {
    this.openDocumentPurchaseEditDialog(documentPurchase);
  }

  deletedDocumentPurchases(documentPurchases: DocumentPurchase[]) {
    const ids = documentPurchases.map(({ id }) => String(id));

    this.documentPurchaseService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено документов покупки: ${response.deletedCount}`,
          });
          this.documentPurchasesResource.reload();
        },
        error: error => {
          console.error('Error deleting document purchases:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить документы покупки',
          });
        },
      });
  }

  openCreateDialog() {
    const ref = this.dialogService.open(DocumentPurchaseFormComponent, {
      header: 'Добавить документ покупки',
      width: '600px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      appendTo: 'body',
      data: {
        mode: 'add',
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.documentPurchasesResource.reload();
      }
    });
  }

  openDocumentPurchaseEditDialog(documentPurchase: DocumentPurchase) {
    const ref = this.dialogService.open(DocumentPurchaseFormComponent, {
      header: 'Редактировать документ покупки',
      width: '600px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      appendTo: 'body',
      data: {
        mode: 'edit',
        documentPurchase,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.documentPurchasesResource.reload();
      }
    });
  }

  openOperationDialog() {
    // Get the first store ID (you might want to implement store selection logic)
    const stores = this.stores();
    if (stores.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Нет доступных складов. Сначала создайте склад.',
      });
      return;
    }

    const ref = this.dialogService.open(OperationFormComponent, {
      header: 'Добавить операцию',
      width: '500px',
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
      },
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.documentPurchasesResource.reload();
      }
    });
  }

  editedOperation(operation: Operation) {
    this.openOperationEditDialog(operation);
  }

  openOperationEditDialog(operation: Operation) {
    const ref = this.dialogService.open(OperationFormComponent, {
      header: 'Редактировать операцию',
      width: '500px',
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
      },
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.documentPurchasesResource.reload();
      }
    });
  }

  deletedOperation(operations: Operation[]) {
    const ids = operations.map(({ id }) => String(id));

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
          this.documentPurchasesResource.reload();
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
