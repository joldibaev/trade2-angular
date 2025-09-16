import {
  Component,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StoreService } from '../../../../../core/services/store.service';
import {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
} from '../../../../../shared/entities/store.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-store-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Ripple,
  ],
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFormComponent implements OnInit {
  private readonly storeService = inject(StoreService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  store?: Store = this.dialogConfig.data?.store;

  // Loading state
  loading = signal(false);

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  storeForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.store) {
      // Initialize form with existing store data
      this.storeForm.patchValue({
        name: this.store.name,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveStore() {
    if (this.storeForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.storeForm.getRawValue();

    if (this.isEditMode()) {
      this.updateStore(formValue);
    } else {
      this.createStore(formValue);
    }
  }

  private createStore(storeDto: CreateStoreDto) {
    this.storeService
      .create(storeDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdStore: Store) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Склад создан успешно',
          });
          this.dialogRef.close(createdStore);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать склад. Попробуйте еще раз.',
          });
          console.error('Error creating store:', error);
        },
      });
  }

  private updateStore(storeDto: UpdateStoreDto) {
    const storeId = this.store?.id;
    if (!storeId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти склад для обновления',
      });
      return;
    }

    this.storeService
      .update(storeId, storeDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedStore: Store) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Склад обновлен успешно',
          });
          this.dialogRef.close(updatedStore);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить склад. Попробуйте еще раз.',
          });
          console.error('Error updating store:', error);
        },
      });
  }
}
