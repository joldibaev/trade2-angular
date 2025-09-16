import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CurrencyService } from '../../../../core/services/currency.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/table-column.interface';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Currency } from '../../../../shared/entities/currency.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CurrencyFormComponent } from './currency-form/currency-form.component';

@Component({
  selector: 'app-currencies',
  imports: [
    TableModule,
    TableComponent,
    AsyncPipe,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
  ],
  templateUrl: './currencies-list.component.html',
  styleUrl: './currencies-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrenciesListComponent {
  private readonly currencyService = inject(CurrencyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  update = new BehaviorSubject(Date.now());
  currencies$ = this.update.pipe(switchMap(() => this.currencyService.getAll()));

  columns = signal<TableColumn<Currency>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'value', header: 'Значение', sortable: true, type: 'text' },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(currency: Currency) {
    this.openEditDialog(currency);
  }

  deleted(currencies: Currency[]) {
    const ids = currencies.map(({ id }) => id);

    this.currencyService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено валют: ${response.deletedCount}`,
          });
          this.update.next(Date.now());
        },
        error: error => {
          console.error('Error deleting currencies:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить валюты',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(CurrencyFormComponent, {
      header: 'Добавить валюту',
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
        this.update.next(Date.now());
      }
    });
  }

  openEditDialog(currency: Currency) {
    const ref = this.dialogService.open(CurrencyFormComponent, {
      header: 'Редактировать валюту',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        currency,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.update.next(Date.now());
      }
    });
  }
}
