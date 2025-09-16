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
import { ProductService } from '../../../../../core/services/product.service';
import { CategoryService } from '../../../../../core/services/category.service';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '../../../../../shared/entities/product.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-product-form',
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
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  product?: Product = this.dialogConfig.data?.product;

  // Loading state
  loading = signal(false);

  // Categories for dropdown
  categories = this.categoryService.getAllAsResource();

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    article: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    categoryId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.product) {
      // Initialize form with existing product data
      this.productForm.patchValue({
        name: this.product.name,
        article: this.product.article,
        categoryId: this.product.categoryId,
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.productForm.getRawValue();

    if (this.isEditMode()) {
      this.updateProduct(formValue);
    } else {
      this.createProduct(formValue);
    }
  }

  private createProduct(productDto: CreateProductDto) {
    this.productService
      .create(productDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdProduct: Product) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Товар создан успешно',
          });
          this.dialogRef.close(createdProduct);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать товар. Попробуйте еще раз.',
          });
          console.error('Error creating product:', error);
        },
      });
  }

  private updateProduct(productDto: UpdateProductDto) {
    const productId = this.product?.id;
    if (!productId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти товар для обновления',
      });
      return;
    }

    this.productService
      .update(productId, productDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedProduct: Product) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Товар обновлен успешно',
          });
          this.dialogRef.close(updatedProduct);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить товар. Попробуйте еще раз.',
          });
          console.error('Error updating product:', error);
        },
      });
  }
}
