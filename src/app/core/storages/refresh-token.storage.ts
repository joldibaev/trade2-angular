import { Injectable } from '@angular/core';
import { _baseStorageStorage } from './_base-storage.storage';

@Injectable({ providedIn: 'root' })
export class RefreshTokenStorage extends _baseStorageStorage {
  constructor() {
    super('trade-ng-refresh-token');
  }
}
