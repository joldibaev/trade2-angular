import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CustomerService } from '../../../../core/services/customer.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Customer } from '../../../../shared/entities/customer.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { Ripple } from 'primeng/ripple';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-customers',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersListComponent {
  private readonly customerService = inject(CustomerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  customers = this.customerService.getAllAsResource();

  columns = signal<TableColumn<Customer>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Имя', sortable: true, type: 'text' },
    {
      field: 'summary',
      header: 'Краткая информация',
      sortable: false,
      type: 'text',
      computeFn: (customer: Customer) => {
        const parts = [customer.name];
        if (customer.phone) parts.push(`📞 ${customer.phone}`);
        if (customer.address) parts.push(`📍 ${customer.address}`);
        return parts.join(' • ');
      },
    },
    { field: 'phone', header: 'Телефон', sortable: true, type: 'text' },
    { field: 'address', header: 'Адрес', sortable: true, type: 'text' },
    { field: 'notes', header: 'Заметки', sortable: true, type: 'text' },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(customer: Customer) {
    this.openEditDialog(customer);
  }

  deleted(customers: Customer[]) {
    const ids = customers.map(({ id }) => id);

    this.customerService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено клиентов: ${response.deletedCount}`,
          });
          this.customers.reload();
        },
        error: error => {
          console.error('Error deleting customers:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить клиентов',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(CustomerFormComponent, {
      header: 'Добавить клиента',
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
        this.customers.reload();
      }
    });
  }

  openEditDialog(customer: Customer) {
    const ref = this.dialogService.open(CustomerFormComponent, {
      header: 'Редактировать клиента',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        customer,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.customers.reload();
      }
    });
  }
}
