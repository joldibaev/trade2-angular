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
import { TextareaModule } from 'primeng/textarea';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { VendorService } from '../../../../../core/services/vendor.service';
import {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto,
} from '../../../../../shared/entities/vendor.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-vendor-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Ripple,
  ],
  templateUrl: './vendor-form.component.html',
  styleUrl: './vendor-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorFormComponent implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  vendor?: Vendor = this.dialogConfig.data?.vendor;

  // Loading state
  loading = signal(false);

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  vendorForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    phone: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.vendor) {
      // Initialize form with existing vendor data
      this.vendorForm.patchValue({
        name: this.vendor.name,
        phone: this.vendor.phone,
        address: this.vendor.address,
        notes: this.vendor.notes,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveVendor() {
    if (this.vendorForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.vendorForm.getRawValue();

    if (this.isEditMode()) {
      this.updateVendor(formValue);
    } else {
      this.createVendor(formValue);
    }
  }

  private createVendor(vendorDto: CreateVendorDto) {
    this.vendorService
      .create(vendorDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdVendor: Vendor) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Поставщик создан успешно',
          });
          this.dialogRef.close(createdVendor);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать поставщика. Попробуйте еще раз.',
          });
          console.error('Error creating vendor:', error);
        },
      });
  }

  private updateVendor(vendorDto: UpdateVendorDto) {
    const vendorId = this.vendor?.id;
    if (!vendorId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти поставщика для обновления',
      });
      return;
    }

    this.vendorService
      .update(vendorId, vendorDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedVendor: Vendor) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Поставщик обновлен успешно',
          });
          this.dialogRef.close(updatedVendor);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить поставщика. Попробуйте еще раз.',
          });
          console.error('Error updating vendor:', error);
        },
      });
  }
}
