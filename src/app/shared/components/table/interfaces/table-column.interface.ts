import { ToggleButtonChangeEvent } from 'primeng/togglebutton';

export type TableComputeFn<T> = (row: T) => number | string;
export type TableGetLinkFn<T> = (row: T) => string[];

export interface BaseTableColumn<T> {
  field: string;
  header: string;
  widthFit?: boolean;
  sortable?: boolean;
  computeFn?: TableComputeFn<T>;
}

export interface TextTableColumn<T> extends BaseTableColumn<T> {
  type: 'text';
}

export interface NumberTableColumn<T> extends BaseTableColumn<T> {
  type: 'number';
}

export interface DateTableColumn<T> extends BaseTableColumn<T> {
  type: 'date';
}

export interface LinkTableColumn<T> extends BaseTableColumn<T> {
  type: 'link';
  getLink: TableGetLinkFn<T>;
}

export interface ButtonTableColumn<T> extends BaseTableColumn<T> {
  type: 'button';
  callback: (row: T) => void;
}

export interface ToggleButtonTableColumn<T> extends BaseTableColumn<T> {
  type: 'toggle-button';
  onChange: (data: T, event: ToggleButtonChangeEvent) => void;
  on: { label: string; icon: string };
  off: { label: string; icon: string };
}

export type TableColumn<T> =
  | TextTableColumn<T>
  | NumberTableColumn<T>
  | DateTableColumn<T>
  | LinkTableColumn<T>
  | ButtonTableColumn<T>
  | ToggleButtonTableColumn<T>;
