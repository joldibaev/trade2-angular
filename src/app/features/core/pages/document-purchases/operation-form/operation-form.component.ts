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
  Validators,
  FormsModule,
} from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../core/services/product.service';
import { OperationService } from '../../../../../core/services/operation.service';
import {
  CreatePurchaseOperationDto,
  UpdateOperationDto,
  Operation,
} from '../../../../../shared/entities/operation.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Message } from 'primeng/message';
import { finalize } from 'rxjs';
import { Ripple } from 'primeng/ripple';
import { Product } from '../../../../../shared/entities/product.interface';

@Component({
  selector: 'app-operation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AutoCompleteModule,
    InputNumberModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Ripple,
  ],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly operationService = inject(OperationService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For add mode
  documentPurchaseId?: number = this.dialogConfig.data?.documentPurchaseId;

  // For edit mode
  operation?: Operation = this.dialogConfig.data?.operation;

  // Loading state
  loading = signal(false);

  // Filtered products for autocomplete
  filteredProducts = signal<Product[]>([]);

  // Selected product
  selectedProduct = signal<Product | null>(null);

  // Reactive form
  operationForm = new FormGroup({
    product: new FormControl<Product | null>(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    quantity: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    price: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    markup: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
  });

  // Computed values
  totalCost = computed(() => {
    const quantity = this.operationForm.get('quantity')?.value || 0;
    const costPrice = this.operationForm.get('price')?.value || 0;
    return quantity * costPrice;
  });

  sellingPrice = computed(() => {
    const costPrice = this.operationForm.get('price')?.value || 0;
    const markup = this.operationForm.get('markup')?.value || 0;
    return costPrice * (1 + markup / 100);
  });

  totalSelling = computed(() => {
    const quantity = this.operationForm.get('quantity')?.value || 0;
    return quantity * this.sellingPrice();
  });

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Добавить'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  ngOnInit() {
    if (this.isEditMode() && this.operation) {
      // Initialize form with existing operation data
      this.operationForm.patchValue({
        product: this.operation.product,
        quantity: this.operation.quantity,
        price: this.operation.price,
        markup: 0,
      });
      this.selectedProduct.set(this.operation.product);
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveOperation() {
    if (this.operationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.operationForm.getRawValue();

    if (this.isEditMode()) {
      this.updateOperation({
        productId: formValue.product?.id,
        price: formValue.price,
        quantity: formValue.quantity,
        quantityPositive: true,
      });
    } else {
      if (!formValue.product || !this.documentPurchaseId) return;

      this.createOperation({
        productId: formValue.product.id,
        quantity: formValue.quantity,
        price: formValue.price,
        quantityPositive: true,
        documentPurchaseId: this.documentPurchaseId,
      });
    }
  }

  private createOperation(operationDto: CreatePurchaseOperationDto) {
    this.operationService
      .createPurchaseOperation(operationDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: createdOperation => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Операция создана успешно',
          });
          this.dialogRef.close(createdOperation);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать операцию. Попробуйте еще раз.',
          });
          console.error('Error creating operation:', error);
        },
      });
  }

  private updateOperation(operationDto: UpdateOperationDto) {
    const operationId = this.operation?.id;
    if (!operationId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти операцию для обновления',
      });
      return;
    }

    this.operationService
      .update(operationId, operationDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedOperation: Operation) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Операция обновлена успешно',
          });
          this.dialogRef.close(updatedOperation);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить операцию. Попробуйте еще раз.',
          });
          console.error('Error updating operation:', error);
        },
      });
  }

  // Product search
  searchProducts(event: { query: string }) {
    const query = event.query.trim();

    if (!query) {
      this.filteredProducts.set([]);
      return;
    }

    this.productService
      .search(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: products => {
          this.filteredProducts.set(products);
        },
        error: (error: unknown) => {
          console.error('Error searching products:', error);
          this.filteredProducts.set([]);
        },
      });
  }

  onProductSelect(event: { value: Product }) {
    this.selectedProduct.set(event.value);
    this.operationForm.patchValue({
      product: event.value,
    });
  }

  clearProductSelection() {
    this.selectedProduct.set(null);
    this.operationForm.patchValue({
      product: null,
    });
  }
}
