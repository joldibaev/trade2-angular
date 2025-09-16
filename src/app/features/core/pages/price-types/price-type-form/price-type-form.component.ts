import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PriceTypeService } from '../../../../../core/services/price-type.service';
import {
  CreatePriceTypeDto,
  PriceType,
  UpdatePriceTypeDto,
} from '../../../../../shared/entities/price-type.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-price-type-form',
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
  templateUrl: './price-type-form.component.html',
  styleUrl: './price-type-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceTypeFormComponent implements OnInit {
  private readonly priceTypeService = inject(PriceTypeService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  priceType?: PriceType = this.dialogConfig.data?.priceType;

  // Loading state
  loading = signal(false);

  // Usage options
  usageOptions = [
    { label: 'Продажа', value: 'sale' },
    { label: 'Покупка', value: 'purchase' },
    { label: 'Продажа и покупка', value: 'both' },
  ];

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  priceTypeForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    usage: new FormControl<'sale' | 'purchase' | 'both'>('sale', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.priceType) {
      // Initialize form with existing price type data
      this.priceTypeForm.patchValue({
        name: this.priceType.name,
        usage: this.priceType.usage,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  savePriceType() {
    if (this.priceTypeForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.priceTypeForm.getRawValue();

    if (this.isEditMode()) {
      this.updatePriceType(formValue);
    } else {
      this.createPriceType(formValue);
    }
  }

  private createPriceType(priceTypeDto: CreatePriceTypeDto) {
    this.priceTypeService
      .create(priceTypeDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdPriceType: PriceType) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Тип цены создан успешно',
          });
          this.dialogRef.close(createdPriceType);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать тип цены. Попробуйте еще раз.',
          });
          console.error('Error creating price type:', error);
        },
      });
  }

  private updatePriceType(priceTypeDto: UpdatePriceTypeDto) {
    const priceTypeId = this.priceType?.id;
    if (!priceTypeId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти тип цены для обновления',
      });
      return;
    }

    this.priceTypeService
      .update(priceTypeId, priceTypeDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedPriceType: PriceType) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Тип цены обновлен успешно',
          });
          this.dialogRef.close(updatedPriceType);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить тип цены. Попробуйте еще раз.',
          });
          console.error('Error updating price type:', error);
        },
      });
  }
}
