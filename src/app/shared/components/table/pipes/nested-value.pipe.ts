import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nestedValue',
})
export class NestedValuePipe implements PipeTransform {
  transform(obj: unknown, path: string): string {
    if (!obj || !path) {
      return '';
    }

    const result = path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key] ?? '';
      }
      return '';
    }, obj);

    return String(result);
  }
}
