import { Pipe, PipeTransform } from '@angular/core';
import { TableComputeFn } from '../interfaces/table-column.interface';

@Pipe({
  name: 'tableCompute',
})
export class TableComputePipe implements PipeTransform {
  transform<T>(rowDat: T, computeFn: TableComputeFn<T>): number | string {
    return computeFn(rowDat);
  }
}
