import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { StoreService } from '../../../../core/services/store.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Store } from '../../../../shared/entities/store.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { StoreFormComponent } from './store-form/store-form.component';
import { Ripple } from 'primeng/ripple';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-stores',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './stores-list.component.html',
  styleUrl: './stores-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresListComponent {
  private readonly storeService = inject(StoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  stores = this.storeService.getAllAsResource();

  columns = signal<TableColumn<Store>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(store: Store) {
    this.openEditDialog(store);
  }

  deleted(stores: Store[]) {
    const ids = stores.map(({ id }) => id);

    this.storeService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено складов: ${response.deletedCount}`,
          });
          this.stores.reload();
        },
        error: error => {
          console.error('Error deleting stores:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить склады',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(StoreFormComponent, {
      header: 'Добавить склад',
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
        this.stores.reload();
      }
    });
  }

  openEditDialog(store: Store) {
    const ref = this.dialogService.open(StoreFormComponent, {
      header: 'Редактировать склад',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        store,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.stores.reload();
      }
    });
  }
}
