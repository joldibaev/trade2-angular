import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
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
  ValueChangeEvent,
} from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../core/services/product.service';
import { OperationService } from '../../../../../core/services/operation.service';
import { PriceTypeService } from '../../../../../core/services/price-type.service';
import { CurrencyService } from '../../../../../core/services/currency.service';
import {
  CreatePurchaseOperationDto,
  Operation,
  UpdateOperationDto,
  ProductPrice,
} from '../../../../../shared/entities/operation.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Message } from 'primeng/message';
import { filter, finalize } from 'rxjs';
import { Ripple } from 'primeng/ripple';
import { Product } from '../../../../../shared/entities/product.interface';
import { PriceType } from '../../../../../shared/entities/price-type.interface';
import { FloatLabel } from 'primeng/floatlabel';

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
    FloatLabel,
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
  selectedProduct = signal<Product | undefined>(undefined);

  // Price types (filtered by backend for sales)
  priceTypesResource = this.priceTypeService.getForSales();
  priceTypes = computed(() => this.priceTypesResource.value() || []);

  // Dynamic price type forms
  priceTypeForms = signal<
    {
      id: string;
      name: string;
      form: FormGroup<{
        markup: FormControl<number>;
        priceUzs: FormControl<number>;
        priceUsd: FormControl<number>;
      }>;
    }[]
  >([]);

  // Reactive form
  operationForm = new FormGroup({
    product: new FormControl<Product | null>(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // Row 1: количество | стоимость (UZS) | сумма (UZS)
    quantity: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    priceUzs: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    totalCostUzs: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    // Row 2: курс валют | стоимость (USD) | сумма (USD)
    exchangeRate: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    priceUsd: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    totalCostUsd: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Добавить'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  constructor() {
    // Initialize form listeners first
    this.initFormListeners();

    effect(() => {
      if (this.priceTypesResource.hasValue()) {
        this.initPriceTypeForms(this.priceTypes());
      }
    });
  }

  ngOnInit() {
    // Load latest currency exchange rate
    this.currencyService
      .getLatest()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: currency => {
          if (currency) {
            this.operationForm.patchValue({
              exchangeRate: currency.value,
            });
          }
        },
        error: error => {
          console.error('Error loading currency rate:', error);
          this.messageService.add({
            severity: 'warn',
            summary: 'Предупреждение',
            detail: 'Не удалось загрузить курс валют. Используется значение по умолчанию.',
          });
        },
      });

    if (this.isEditMode() && this.operation) {
      // Initialize form with existing operation data
      this.operationForm.patchValue({
        product: this.operation.product,
        quantity: this.operation.quantity,
        priceUzs: this.operation.operationProps?.price || 1,
        exchangeRate: this.operation.operationProps?.exchangeRate || 1,
        priceUsd: this.operation.operationProps?.price || 1,
      });
      this.selectedProduct.set(this.operation.product);
    }
  }


  private initPriceTypeForms(priceTypes: PriceType[]) {
    const forms = priceTypes.map(priceType => ({
      id: priceType.id,
      name: priceType.name,
      form: new FormGroup({
        markup: new FormControl(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(0)],
        }),
        priceUzs: new FormControl(0, {
          nonNullable: true,
          validators: [Validators.min(1)],
        }),
        priceUsd: new FormControl(0, {
          nonNullable: true,
          validators: [Validators.min(0.01)],
        }),
      }),
    }));

    this.priceTypeForms.set(forms);
    this.initPriceTypeListeners();
  }

  private initPriceTypeListeners() {
    this.priceTypeForms().forEach(priceTypeForm => {
      const form = priceTypeForm.form;
      const controls = form.controls;

      form.events
        .pipe(
          filter(event => event instanceof ValueChangeEvent),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(event => {
          const { priceUzs, exchangeRate } = this.operationForm.getRawValue();
          if (!priceUzs || !exchangeRate) return;

          switch (event.source) {
            case controls.markup: {
              const markup = controls.markup.value || 0;
              const price = priceUzs * (1 + markup / 100);
              const priceUsd = price / exchangeRate;
              form.patchValue({ priceUzs: price, priceUsd }, { emitEvent: false });
              break;
            }
            case controls.priceUzs: {
              const price = controls.priceUzs.value || 0;
              const markup = priceUzs > 0 ? (price / priceUzs - 1) * 100 : 0;
              const priceUsd = price / exchangeRate;
              form.patchValue({ markup, priceUsd }, { emitEvent: false });
              break;
            }
            case controls.priceUsd: {
              const priceUsd = controls.priceUsd.value || 0;
              const price = priceUsd * exchangeRate;
              const markup = priceUzs > 0 ? (price / priceUzs - 1) * 100 : 0;
              form.patchValue({ priceUzs: price, markup }, { emitEvent: false });
              break;
            }
          }
        });
    });
  }

  private initFormListeners() {
    console.log('initFormListeners');
    this.operationForm.events
      .pipe(
        filter(event => event instanceof ValueChangeEvent),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ source }) => {
        console.log(source);

        const controls = this.operationForm.controls;
        const { quantity, priceUzs, totalCostUzs, exchangeRate, priceUsd, totalCostUsd } =
          this.operationForm.getRawValue();

        switch (source) {
          case controls.quantity: {
            const nextTotalUzs = priceUzs * quantity;
            const nextTotalUsd = priceUsd * quantity;

            this.operationForm.patchValue(
              {
                totalCostUzs: nextTotalUzs,
                totalCostUsd: nextTotalUsd,
              },
              { emitEvent: false }
            );
            break;
          }

          case controls.priceUzs: {
            const nextTotalUzs = priceUzs * quantity;
            const nextPriceUsd = exchangeRate > 0 ? priceUzs / exchangeRate : 0;
            const nextTotalUsd = nextPriceUsd * quantity;

            this.operationForm.patchValue(
              {
                totalCostUzs: nextTotalUzs,
                priceUsd: nextPriceUsd,
                totalCostUsd: nextTotalUsd,
              },
              { emitEvent: false }
            );
            this.recalcAllPriceTypesFromCost(priceUzs, exchangeRate);
            break;
          }

          case controls.exchangeRate: {
            const nextPriceUsd = exchangeRate > 0 ? priceUzs / exchangeRate : 0;
            const nextTotalUsd = nextPriceUsd * quantity;

            this.operationForm.patchValue(
              {
                priceUsd: nextPriceUsd,
                totalCostUsd: nextTotalUsd,
              },
              { emitEvent: false }
            );
            this.recalcAllPriceTypesFromCost(priceUzs, exchangeRate);
            break;
          }

          case controls.priceUsd: {
            const nextPriceUzs = priceUsd * exchangeRate;
            const nextTotalUzs = nextPriceUzs * quantity;
            const nextTotalUsd = priceUsd * quantity;

            this.operationForm.patchValue(
              {
                priceUzs: nextPriceUzs,
                totalCostUzs: nextTotalUzs,
                totalCostUsd: nextTotalUsd,
              },
              { emitEvent: false }
            );
            this.recalcAllPriceTypesFromCost(nextPriceUzs, exchangeRate);
            break;
          }

          case controls.totalCostUzs: {
            const nextPriceUzs = quantity > 0 ? totalCostUzs / quantity : 0;
            const nextPriceUsd = exchangeRate > 0 ? nextPriceUzs / exchangeRate : 0;
            const nextTotalUsd = nextPriceUsd * quantity;

            this.operationForm.patchValue(
              {
                priceUzs: nextPriceUzs,
                priceUsd: nextPriceUsd,
                totalCostUsd: nextTotalUsd,
              },
              { emitEvent: false }
            );
            this.recalcAllPriceTypesFromCost(nextPriceUzs, exchangeRate);
            break;
          }

          case controls.totalCostUsd: {
            const nextPriceUsd = quantity > 0 ? totalCostUsd / quantity : 0;
            const nextPriceUzs = nextPriceUsd * exchangeRate;
            const nextTotalUzs = nextPriceUzs * quantity;

            this.operationForm.patchValue(
              {
                priceUzs: nextPriceUzs,
                priceUsd: nextPriceUsd,
                totalCostUzs: nextTotalUzs,
              },
              { emitEvent: false }
            );
            this.recalcAllPriceTypesFromCost(nextPriceUzs, exchangeRate);
            break;
          }
        }
      });
  }

  private recalcAllPriceTypesFromCost(baseCost: number, exchangeRate: number) {
    if (!baseCost) return;

    this.priceTypeForms().forEach(priceTypeForm => {
      const form = priceTypeForm.form;
      const { markup } = form.getRawValue();
      const price = baseCost * (1 + markup / 100);
      const priceUsd = price / exchangeRate;
      form.patchValue({ priceUzs: price, priceUsd }, { emitEvent: false });
    });
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

    // Prepare prices data
    const prices = this.priceTypeForms().map(priceTypeForm => {
      const priceFormValue = priceTypeForm.form.getRawValue();
      return {
        priceTypeId: priceTypeForm.id, // Теперь это UUID строка
        price: priceFormValue.priceUzs, // Только цена в UZS
      };
    });

    if (this.isEditMode()) {
      this.updateOperation({
        productId: formValue.product?.id,
        quantity: formValue.quantity!,
        quantityPositive: true,
        operationProps: {
          price: formValue.priceUzs!,
          exchangeRate: formValue.exchangeRate!,
        },
        prices,
      });
    } else {
      if (!formValue.product || !this.documentPurchaseId) return;

      this.createOperation({
        productId: formValue.product.id,
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
    this.selectedProduct.set(undefined);
    this.operationForm.patchValue({
      product: null,
    });
  }
}
