import { Injectable } from '@angular/core';
import { _baseStorageStorage } from './_base-storage.storage';

@Injectable({ providedIn: 'root' })
export class UserStorage extends _baseStorageStorage {
  constructor() {
    super('trade-ng-auth-token'); // key is available inside BaseStorage constructor
  }
}
