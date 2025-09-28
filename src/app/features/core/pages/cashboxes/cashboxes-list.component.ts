import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CashboxService } from '../../../../core/services/cashbox.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Cashbox } from '../../../../shared/entities/cashbox.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CashboxFormComponent } from './cashbox-form/cashbox-form.component';
import { Ripple } from 'primeng/ripple';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-cashboxes',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './cashboxes-list.component.html',
  styleUrl: './cashboxes-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashboxesListComponent {
  private readonly cashboxService = inject(CashboxService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  cashboxes = this.cashboxService.getAllAsResource();

  columns = computed<TableColumn<Cashbox>[]>(() => [
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    {
      field: 'store.name',
      header: 'Магазин',
      sortable: true,
      type: 'text',
    },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(cashbox: Cashbox) {
    this.openEditDialog(cashbox);
  }

  deleted(cashboxes: Cashbox[]) {
    const ids = cashboxes.map(({ id }) => id);

    this.cashboxService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено касс: ${response.deletedCount}`,
          });
          this.cashboxes.reload();
        },
        error: error => {
          console.error('Error deleting cashboxes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить кассы',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(CashboxFormComponent, {
      header: 'Добавить кассу',
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
        this.cashboxes.reload();
      }
    });
  }

  openEditDialog(cashbox: Cashbox) {
    const ref = this.dialogService.open(CashboxFormComponent, {
      header: 'Редактировать кассу',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        cashbox,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.cashboxes.reload();
      }
    });
  }
}
