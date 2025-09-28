import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { VendorService } from '../../../../core/services/vendor.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Vendor } from '../../../../shared/entities/vendor.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { Ripple } from 'primeng/ripple';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-vendors',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './vendors-list.component.html',
  styleUrl: './vendors-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorsListComponent {
  private readonly vendorService = inject(VendorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  vendors = this.vendorService.getAllAsResource();

  columns = signal<TableColumn<Vendor>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    { field: 'phone', header: 'Телефон', sortable: true, type: 'text' },
    { field: 'address', header: 'Адрес', sortable: true, type: 'text' },
  ]);

  edited(vendor: Vendor) {
    this.openEditDialog(vendor);
  }

  deleted(vendors: Vendor[]) {
    const ids = vendors.map(({ id }) => id);

    this.vendorService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено поставщиков: ${response.deletedCount}`,
          });
          this.vendors.reload();
        },
        error: error => {
          console.error('Error deleting vendors:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить поставщиков',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(VendorFormComponent, {
      header: 'Добавить поставщика',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'add',
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.vendors.reload();
      }
    });
  }

  openEditDialog(vendor: Vendor) {
    const ref = this.dialogService.open(VendorFormComponent, {
      header: 'Редактировать поставщика',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        vendor,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.vendors.reload();
      }
    });
  }
}
