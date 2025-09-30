import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NestedValuePipe } from './pipes/nested-value.pipe';
import { ToggleButton } from 'primeng/togglebutton';
import { RouterLink } from '@angular/router';
import { TableComputePipe } from './pipes/table-compute.pipe';
import { TableColumn } from './interfaces/table-column.interface';
import { GetLinkPipe } from './pipes/get-link.pipe';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    DatePipe,
    IconField,
    InputIcon,
    InputText,
    SelectModule,
    ToggleSwitchModule,
    ButtonDirective,
    ButtonIcon,
    Ripple,
    ConfirmPopup,
    FormsModule,
    ButtonLabel,
    ConfirmDialogModule,
    NestedValuePipe,
    ToggleButton,
    ReactiveFormsModule,
    TableComputePipe,
    DecimalPipe,
    RouterLink,
    TableComputePipe,
    GetLinkPipe,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  providers: [NestedValuePipe, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TableComponent<T> {
  private confirmationService = inject(ConfirmationService);

  // input
  columns = input.required<TableColumn<T>[]>();
  values = input.required<T[]>();

  filter = input(false, { transform: booleanAttribute });
  virtualList = input(false, { transform: booleanAttribute });
  selectable = input(false, { transform: booleanAttribute });
  deletable = input(false, { transform: booleanAttribute });
  editable = input(false, { transform: booleanAttribute });

  // output
  edited = output<T>();
  deleted = output<T[]>();

  // totalColSpan
  totalColSpan = computed(() => this.columns().length + 3);

  // sort
  sortedValues = linkedSignal(() => structuredClone(this.values()));
  sortState = signal<undefined | 'asc' | 'desc'>(undefined);

  // selected
  selectedValues = linkedSignal(() => {
    return structuredClone(this.values().slice(0, 0));
  });

  // filter
  _filterColumns = linkedSignal(() => this.columns().map(column => column.field));

  // view
  table = viewChild.required<Table>('table');

  // helper methods
  private nestedValuePipe = inject(NestedValuePipe);

  // filter
  filterTableContent(event: Event) {
    const table = this.table();
    if (!(event.target instanceof HTMLInputElement)) return;

    table.filterGlobal(event.target.value.trim(), 'contains');
  }

  // delete
  confirmDeleteSelected(event: Event) {
    const target = event.target;
    if (!(target instanceof EventTarget)) return;

    this.confirmationService.confirm({
      target,
      message: 'Вы хотите удалить данную запись?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Отмена',
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
      acceptLabel: 'Удалить',
      acceptButtonProps: {
        severity: 'danger',
      },
      accept: () => {
        this.deleted.emit(this.selectedValues());
      },
    });
  }

  confirmDelete(event: Event, rowData: T) {
    const target = event.target;
    if (!(target instanceof EventTarget)) return;

    this.confirmationService.confirm({
      target,
      message: 'Вы хотите удалить данную запись?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Отмена',
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
      acceptLabel: 'Удалить',
      acceptButtonProps: {
        severity: 'danger',
      },
      accept: () => {
        this.deleted.emit([rowData]);
      },
    });
  }

  // sort
  customSort(event: SortEvent) {
    const field = event.field;
    if (!field) return;

    // Check if the column is sortable
    const column = this.columns().find(col => col.field === field);
    if (!column || !column.sortable) return;

    if (this.sortState() === undefined) {
      this.sortState.set('asc');

      this.sortTableData(event);
    } else if (this.sortState() === 'asc') {
      this.sortState.set('desc');

      this.sortTableData(event);
    } else if (this.sortState() === 'desc') {
      this.sortState.set(undefined);
      this.sortedValues.set(structuredClone(this.values()));
      this.table().reset();
    }
  }

  sortTableData(event: SortEvent) {
    const field = event.field;
    if (!field) return;

    const order = event.order;
    if (!order) return;

    console.log(event);

    event.data?.sort((data1, data2) => {
      const value1 = this.nestedValuePipe.transform(data1, field);
      const value2 = this.nestedValuePipe.transform(data2, field);

      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else {
        // Safe comparison for unknown types
        const v1 = value1 as string | number;
        const v2 = value2 as string | number;
        result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      }

      return order * result;
    });
  }
}
