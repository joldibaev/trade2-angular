import { Pipe, PipeTransform } from '@angular/core';
import { TableGetLinkFn } from '../interfaces/table-column.interface';

@Pipe({
  name: 'getLink',
})
export class GetLinkPipe implements PipeTransform {
  transform<T>(rowDat: T, getLinkFn: TableGetLinkFn<T>): string[] {
    return getLinkFn(rowDat);
  }
}
