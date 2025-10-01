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
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../../core/services/product.service';
import { OperationService } from '../../../../../../core/services/operation.service';
import { PriceTypeService } from '../../../../../../core/services/price-type.service';
import { CurrencyService } from '../../../../../../core/services/currency.service';
import {
  CreatePurchaseOperationDto,
  Operation,
  UpdateOperationDto,
} from '../../../../../../shared/entities/operation.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Ripple } from 'primeng/ripple';
import { Product } from '../../../../../../shared/entities/product.interface';
import { FloatLabel } from 'primeng/floatlabel';
import { LoaderComponent } from '../../../../../../shared/components/loader/loader.component';
import { PriceType } from '../../../../../../shared/entities/price-type.interface';
import { Divider } from 'primeng/divider';

interface PriceForm {
  markup: FormControl<number | null>;
  priceUzs: FormControl<number | null>;
  priceUsd: FormControl<number | null>;
}

interface PriceFormComputed {
  priceType: PriceType;
  form: FormGroup<PriceForm>;
}

@Component({
  selector: 'app-operation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputNumberModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Ripple,
    FloatLabel,
    LoaderComponent,
    Divider,
  ],
  templateUrl: './operation-form.component.html',
  styleUrl: './operation-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly operationService = inject(OperationService);
  private readonly priceTypeService = inject(PriceTypeService);
  private readonly currencyService = inject(CurrencyService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // For add mode
  documentPurchaseId?: string = this.dialogConfig.data?.documentPurchaseId;
  productId?: string = this.dialogConfig.data?.productId;

  // For edit mode
  operation?: Operation = this.dialogConfig.data?.operation;

  // Loading state
  loading = signal(false);

  // Price types
  priceTypesResource = this.priceTypeService.getForSales();
  priceTypeForms = computed<PriceFormComputed[]>(() => {
    if (!this.priceTypesResource.hasValue()) return [];

    return this.priceTypesResource.value()?.map(priceType => ({
      priceType,
      form: new FormGroup({
        markup: new FormControl<number | null>(null, {
          validators: [Validators.min(0.01)],
        }),
        priceUzs: new FormControl<number | null>(null, {
          validators: [Validators.min(1)],
        }),
        priceUsd: new FormControl<number | null>(null, {
          validators: [Validators.min(0.01)],
        }),
      }),
    }));
  });

  // Reactive form
  operationForm = new FormGroup({
    // Row 1: количество | стоимость (UZS) | сумма (UZS)
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    priceUzs: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    totalCostUzs: new FormControl<number | null>(null, {
      validators: [Validators.min(1)],
    }),
    // Row 2: курс валют | стоимость (USD) | сумма (USD)
    exchangeRate: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    priceUsd: new FormControl<number | null>(null, {
      validators: [Validators.min(0.01)],
    }),
    totalCostUsd: new FormControl<number | null>(null, {
      validators: [Validators.min(0.01)],
    }),
  });

  // Computed properties for UI
  isEditMode = computed(() => this.dialogConfig.data?.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Добавить'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Current product (loaded from service or operation)
  currentProduct = signal<Product | undefined>(undefined);

  ngOnInit() {
    if (!this.isEditMode()) {
      this.loadLastCurrency();
    }
    this.loadProductById(this.productId);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveOperation() {
    if (!this.currentProduct()) return;

    if (this.operationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    // Check if all price type forms are valid
    const isAllPriceTypesValid = this.priceTypeForms().every(
      priceTypeForm => priceTypeForm.form.valid
    );

    if (!isAllPriceTypesValid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все поля типов цен',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.operationForm.getRawValue();
    const selectedProduct = this.currentProduct();

    // Prepare prices data
    console.log(this.priceTypeForms());
    const prices = this.priceTypeForms()
      .filter(({ form }) => form.getRawValue().priceUzs)
      .map(({ form, priceType }) => {
        const priceFormValue = form.getRawValue();
        return {
          priceTypeId: priceType.id,
          price: priceFormValue.priceUzs!,
        };
      });

    if (this.isEditMode()) {
      this.updateOperation({
        productId: selectedProduct!.id,
        quantity: formValue.quantity!,
        quantityPositive: true,
        operationProps: {
          price: formValue.priceUzs!,
          exchangeRate: formValue.exchangeRate!,
        },
        prices,
      });
    } else {
      if (!selectedProduct || !this.documentPurchaseId) return;

      this.createOperation({
        productId: selectedProduct.id,
        quantity: formValue.quantity!,
        quantityPositive: true,
        documentPurchaseId: this.documentPurchaseId,
        operationProps: {
          price: formValue.priceUzs!,
          exchangeRate: formValue.exchangeRate!,
        },
        prices,
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

  private loadProductById(productId?: string) {
    if (!productId) return;

    this.productService
      .getById(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product: Product) => {
          this.currentProduct.set(product);
        },
        error: (error: unknown) => {
          console.error('Error loading product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось загрузить товар. Попробуйте еще раз.',
          });
        },
      });
  }

  private loadLastCurrency() {
    this.currencyService
      .getLatest()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(next => this.operationForm.patchValue({ exchangeRate: next.value }));
  }
}
