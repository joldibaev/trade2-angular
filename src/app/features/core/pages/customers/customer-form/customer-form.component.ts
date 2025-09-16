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
import { CustomerService } from '../../../../../core/services/customer.service';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../../../../../shared/entities/customer.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-customer-form',
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
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerFormComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  customer?: Customer = this.dialogConfig.data?.customer;

  // Loading state
  loading = signal(false);

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  customerForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    phone: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.customer) {
      // Initialize form with existing customer data
      this.customerForm.patchValue({
        name: this.customer.name,
        phone: this.customer.phone || '',
        address: this.customer.address || '',
        notes: this.customer.notes || '',
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveCustomer() {
    if (this.customerForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.customerForm.getRawValue();

    if (this.isEditMode()) {
      this.updateCustomer(formValue);
    } else {
      this.createCustomer(formValue);
    }
  }

  private createCustomer(customerDto: CreateCustomerDto) {
    this.customerService
      .create(customerDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdCustomer: Customer) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Клиент создан успешно',
          });
          this.dialogRef.close(createdCustomer);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать клиента. Попробуйте еще раз.',
          });
          console.error('Error creating customer:', error);
        },
      });
  }

  private updateCustomer(customerDto: UpdateCustomerDto) {
    const customerId = this.customer?.id;
    if (!customerId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти клиента для обновления',
      });
      return;
    }

    this.customerService
      .update(customerId, customerDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedCustomer: Customer) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Клиент обновлен успешно',
          });
          this.dialogRef.close(updatedCustomer);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить клиента. Попробуйте еще раз.',
          });
          console.error('Error updating customer:', error);
        },
      });
  }
}
