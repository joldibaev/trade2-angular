import { signal } from '@angular/core';

export class _baseStorageStorage {
  data = signal<string | undefined>(undefined);

  constructor(
    private readonly storageKey: string,
    protected readonly storage: Storage = localStorage
  ) {
    const stored = this.storage.getItem(this.storageKey);
    if (stored !== null) this.data.set(stored);
  }

  has(): boolean {
    return Boolean(this.data());
  }

  get(): string | undefined {
    return this.data();
  }

  set(value: string): void {
    this.storage.setItem(this.storageKey, value);
    this.data.set(value);
  }
  remove(): void {
    this.storage.removeItem(this.storageKey);
    this.data.set(undefined);
  }
}
