import { ToggleButtonChangeEvent } from 'primeng/togglebutton';

export interface BaseTableColumn {
  field: string;
  header: string;
  widthFit?: boolean;
  sortable?: boolean;
}

export interface TextTableColumn extends BaseTableColumn {
  type: 'text';
}

export interface NumberTableColumn extends BaseTableColumn {
  type: 'number';
}

export interface ToggleButtonTableColumn<T> extends BaseTableColumn {
  type: 'toggle-button';
  onChange: (data: T, event: ToggleButtonChangeEvent) => void;
}

export interface DateTableColumn extends BaseTableColumn {
  type: 'date';
}

export interface ActionTableColumn<T> extends BaseTableColumn {
  type: 'action';
  callback: (row: T) => void;
}

export type TableComputeFn<T> = (row: T) => unknown;
export interface ComputeTableColumn<T> extends BaseTableColumn {
  type: 'compute';
  computeFn: TableComputeFn<T>;
}

export type TableColumn<T> =
  | TextTableColumn
  | NumberTableColumn
  | ToggleButtonTableColumn<T>
  | DateTableColumn
  | ActionTableColumn<T>
  | ComputeTableColumn<T>;
