import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PriceTypeService } from '../../../../core/services/price-type.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/table-column.interface';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { PriceType } from '../../../../shared/entities/price-type.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PriceTypeFormComponent } from './price-type-form/price-type-form.component';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-price-types',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './price-types-list.component.html',
  styleUrl: './price-types-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceTypesListComponent {
  private readonly priceTypeService = inject(PriceTypeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  priceTypes = this.priceTypeService.getAllAsResource();

  columns = signal<TableColumn<PriceType>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    {
      field: 'usage',
      header: 'Использование',
      sortable: true,
      type: 'text',
    },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(priceType: PriceType) {
    this.openEditDialog(priceType);
  }

  openEditDialog(priceType: PriceType) {
    const ref = this.dialogService.open(PriceTypeFormComponent, {
      header: 'Редактировать тип цены',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        priceType,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.priceTypes.reload();
      }
    });
  }

  deleted(priceTypes: PriceType[]) {
    const ids = priceTypes.map(({ id }) => id);

    this.priceTypeService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено типов цен: ${response.deletedCount}`,
          });
          this.priceTypes.reload();
        },
        error: error => {
          console.error('Error deleting price types:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить типы цен',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(PriceTypeFormComponent, {
      header: 'Добавить тип цены',
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
        this.priceTypes.reload();
      }
    });
  }
}
