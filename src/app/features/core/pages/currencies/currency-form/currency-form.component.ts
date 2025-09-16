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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CurrencyService } from '../../../../../core/services/currency.service';
import {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
} from '../../../../../shared/entities/currency.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { InputNumber } from 'primeng/inputnumber';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-currency-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    InputNumber,
    Ripple,
  ],
  templateUrl: './currency-form.component.html',
  styleUrl: './currency-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFormComponent implements OnInit {
  private readonly currencyService = inject(CurrencyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  currency?: Currency = this.dialogConfig.data?.currency;

  // Loading state
  loading = signal(false);

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  currencyForm = new FormGroup({
    value: new FormControl<number | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.currency) {
      // Initialize form with existing currency data
      this.currencyForm.patchValue({
        value: this.currency.value,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveCurrency() {
    if (this.currencyForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const { value } = this.currencyForm.getRawValue();
    if (!value) return;

    if (this.isEditMode()) {
      this.updateCurrency({ value });
    } else {
      this.createCurrency({ value });
    }
  }

  private createCurrency(currencyDto: CreateCurrencyDto) {
    this.currencyService
      .create(currencyDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdCurrency: Currency) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Валюта создана успешно',
          });
          this.dialogRef.close(createdCurrency);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать валюту. Попробуйте еще раз.',
          });
          console.error('Error creating currency:', error);
        },
      });
  }

  private updateCurrency(currencyDto: UpdateCurrencyDto) {
    const currencyId = this.currency?.id;
    if (!currencyId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти валюту для обновления',
      });
      return;
    }

    this.currencyService
      .update(currencyId, currencyDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedCurrency: Currency) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Валюта обновлена успешно',
          });
          this.dialogRef.close(updatedCurrency);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить валюту. Попробуйте еще раз.',
          });
          console.error('Error updating currency:', error);
        },
      });
  }
}
