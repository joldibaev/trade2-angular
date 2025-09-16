import { Pipe, PipeTransform } from '@angular/core';
import { TableComputeFn } from './table-column.interface';

@Pipe({
  name: 'tableCompute',
})
export class TableComputePipe implements PipeTransform {
  transform<T>(rowDat: T, computeFn: TableComputeFn<T>): unknown {
    return computeFn(rowDat);
  }
}
