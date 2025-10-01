import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  output,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { DocumentPurchaseService } from '../../../../../core/services/document-purchase.service';
import { StoreService } from '../../../../../core/services/store.service';
import { VendorService } from '../../../../../core/services/vendor.service';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DocumentPurchaseFormComponent } from '../modals/document-purchase-form/document-purchase-form.component';
import { Ripple } from 'primeng/ripple';
import { DocumentPurchase } from '../../../../../shared/entities/document-purchase.interface';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToggleButtonChangeEvent } from 'primeng/togglebutton';
import { TableColumn } from '../../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-documents',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {
  private readonly documentPurchaseService = inject(DocumentPurchaseService);
  private readonly storeService = inject(StoreService);
  private readonly vendorService = inject(VendorService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Output events
  documentSelected = output<DocumentPurchase>();

  // Resources
  documentPurchasesResource = this.documentPurchaseService.getAllAsResource();
  storesResource = this.storeService.getAllAsResource();
  vendorsResource = this.vendorService.getAllAsResource();

  // Computed values
  stores = computed(() => this.storesResource.value() || []);
  vendors = computed(() => this.vendorsResource.value() || []);

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
        this.documentSelected.emit(documentPurchase);
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

  editedDocumentPurchase(documentPurchase: DocumentPurchase) {
    this.openDocumentPurchaseEditDialog(documentPurchase);
  }

  deletedDocumentPurchases(documentPurchases: DocumentPurchase[]) {
    const ids = documentPurchases.map(({ id }) => id);

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

  private openDocumentPurchaseEditDialog(documentPurchase: DocumentPurchase) {
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
}
