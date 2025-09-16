import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for accessing nested object properties using dot notation
 * Usage: {{ object | nestedValue:'property.subProperty' }}
 */
@Pipe({
  name: 'nestedValue',
})
export class NestedValuePipe implements PipeTransform {
  transform(obj: unknown, path: string): unknown {
    if (!obj || !path) {
      return undefined;
    }

    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
}
