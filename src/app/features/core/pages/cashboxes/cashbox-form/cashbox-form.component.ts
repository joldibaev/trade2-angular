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
import { SelectModule } from 'primeng/select';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CashboxService } from '../../../../../core/services/cashbox.service';
import { StoreService } from '../../../../../core/services/store.service';
import {
  Cashbox,
  CreateCashboxDto,
  UpdateCashboxDto,
} from '../../../../../shared/entities/cashbox.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, of } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-cashbox-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Ripple,
  ],
  templateUrl: './cashbox-form.component.html',
  styleUrl: './cashbox-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashboxFormComponent implements OnInit {
  private readonly cashboxService = inject(CashboxService);
  private readonly storeService = inject(StoreService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  cashbox?: Cashbox = this.dialogConfig.data?.cashbox;

  // Loading state
  loading = signal(false);

  // Stores for dropdown
  stores$ = this.storeService.getAll().pipe(switchMap(stores => of(stores || [])));

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  cashboxForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    storeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.cashbox) {
      // Initialize form with existing cashbox data
      this.cashboxForm.patchValue({
        name: this.cashbox.name,
        storeId: this.cashbox.storeId,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveCashbox() {
    if (this.cashboxForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.cashboxForm.getRawValue();

    if (this.isEditMode()) {
      this.updateCashbox(formValue);
    } else {
      this.createCashbox(formValue);
    }
  }

  private createCashbox(cashboxDto: CreateCashboxDto) {
    this.cashboxService
      .create(cashboxDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdCashbox: Cashbox) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Касса создана успешно',
          });
          this.dialogRef.close(createdCashbox);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать кассу. Попробуйте еще раз.',
          });
          console.error('Error creating cashbox:', error);
        },
      });
  }

  private updateCashbox(cashboxDto: UpdateCashboxDto) {
    const cashboxId = this.cashbox?.id;
    if (!cashboxId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: '',
      });
      return;
    }

    this.cashboxService
      .update(cashboxId, cashboxDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedCashbox: Cashbox) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Касса обновлена успешно',
          });
          this.dialogRef.close(updatedCashbox);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить кассу. Попробуйте еще раз.',
          });
          console.error('Error updating cashbox:', error);
        },
      });
  }
}
