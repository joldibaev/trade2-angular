import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Product } from '../../../../shared/entities/product.interface';
import { Category } from '../../../../shared/entities/category.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductFormComponent } from './product-form/product-form.component';
import { TreeModule } from 'primeng/tree';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TableColumn } from '../../../../shared/components/table/interfaces/table-column.interface';

@Component({
  selector: 'app-products',
  imports: [
    TableModule,
    TableComponent,
    AsyncPipe,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    TreeModule,
    Card,
    Ripple,
    LoaderComponent,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  update = new BehaviorSubject(Date.now());

  // Load all products initially, then filter by category
  products$ = this.activatedRoute.queryParams.pipe(
    switchMap(params =>
      this.update.pipe(
        switchMap(() => {
          const categoryId = params['categoryId'];
          if (categoryId) return this.productService.getByCategoryId(categoryId);
          return this.productService.getAll();
        })
      )
    )
  );

  // category
  categories$ = this.categoryService
    .getAll()
    .pipe(tap(categories => this.categories.set(categories)));

  categories = signal<Category[]>([]);
  selectedCategory = signal<TreeNode | undefined>(undefined);

  columns = computed<TableColumn<Product>[]>(() => [
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    { field: 'article', header: 'Артикул', sortable: true, type: 'text' },
    {
      field: 'count',
      header: 'Количество',
      sortable: true,
      type: 'number',
      computeFn: (row: Product) => {
        return row.quantities.reduce((total, { quantity }) => total + quantity, 0);
      },
    },
    {
      field: 'category.name',
      header: 'Категория',
      sortable: true,
      type: 'text',
    },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  tree = computed<TreeNode[]>(() => {
    if (!this.categories) return [];

    const lookup: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    const categories = this.categories();

    categories.forEach(cat => {
      lookup[cat.id] = {
        key: cat.id,
        label: cat.name,
        data: cat,
        expanded: true,
        children: [],
      };
    });

    categories.forEach(cat => {
      if (cat.parentId) {
        lookup[cat.parentId].children?.push(lookup[cat.id]);
      } else {
        roots.push(lookup[cat.id]);
      }
    });

    return roots;
  });

  deleted(products: Product[]) {
    const ids = products.map(({ id }) => id);

    this.productService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено товаров: ${response.deletedCount}`,
          });
          this.update.next(Date.now());
        },
        error: error => {
          console.error('Error deleting products:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить товары',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(ProductFormComponent, {
      header: 'Добавить товар',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      focusOnShow: false,
      resizable: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'add',
        product: null,
      },
    });

    ref.onClose.subscribe((result: Product) => {
      if (result) {
        this.update.next(Date.now());
      }
    });
  }

  openEditDialog(product: Product) {
    const ref = this.dialogService.open(ProductFormComponent, {
      header: 'Редактировать товар',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      focusOnShow: false,
      resizable: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        product: product,
      },
    });

    ref.onClose.subscribe((result: Product) => {
      if (result) {
        this.update.next(Date.now());
      }
    });
  }

  onCategorySelected() {
    const categoryId = this.selectedCategory()?.key;
    if (!categoryId) return;

    void this.router.navigate([], { queryParams: { categoryId } });
  }
}
