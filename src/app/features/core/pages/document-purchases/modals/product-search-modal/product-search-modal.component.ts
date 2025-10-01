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
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductService } from '../../../../../../core/services/product.service';
import { Product } from '../../../../../../shared/entities/product.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Ripple } from 'primeng/ripple';
import { Message } from 'primeng/message';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-search-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ListboxModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Ripple,
    Message,
    FormsModule,
  ],
  templateUrl: './product-search-modal.component.html',
  styleUrl: './product-search-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchModalComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);

  // Loading state
  loading = signal(false);

  // Search results
  searchResults = signal<Product[]>([]);

  // Selected product
  selectedProduct = signal<Product | undefined>(undefined);

  // Search form
  searchForm = new FormGroup({
    search: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  ngOnInit() {
    this.searchForm.controls.search.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((query: string) => query.length >= 2),
        switchMap((query: string) => {
          this.loading.set(true);
          return this.productService.search(query);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (products: Product[]) => {
          this.searchResults.set(products);
        },
        error: error => {
          console.error('Error searching products:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось выполнить поиск товаров',
          });
          this.searchResults.set([]);
        },
      });
  }

  confirmSelection() {
    const selectedProduct = this.selectedProduct();
    if (selectedProduct) {
      this.dialogRef.close(selectedProduct.id);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
