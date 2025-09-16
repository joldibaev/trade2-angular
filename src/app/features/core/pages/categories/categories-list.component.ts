import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CategoryService } from '../../../../core/services/category.service';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/table-column.interface';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Category } from '../../../../shared/entities/category.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CategoryFormComponent } from './category-form/category-form.component';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-categories',
  imports: [
    TableModule,
    TableComponent,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    ToastModule,
    Ripple,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css',
  host: {
    class: 'flex flex-col h-full p-4 gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  categories = this.categoryService.getAllAsResource();

  columns = signal<TableColumn<Category>[]>([
    { field: 'id', header: 'ID', sortable: true, type: 'text' },
    { field: 'name', header: 'Название', sortable: true, type: 'text' },
    {
      field: 'parent.name',
      header: 'Родительская категория',
      sortable: true,
      type: 'text',
    },
    { field: 'updatedAt', header: 'Изменено в', type: 'date' },
    { field: 'createdAt', header: 'Создано в', type: 'date' },
  ]);

  edited(category: Category) {
    this.openEditDialog(category);
  }

  deleted(categories: Category[]) {
    const ids = categories.map(({ id }) => id);

    this.categoryService
      .delete(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Удалено категорий: ${response.deletedCount}`,
          });
          this.categories.reload();
        },
        error: error => {
          console.error('Error deleting categories:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить категории',
          });
        },
      });
  }

  // Methods for dynamic dialog
  openCreateDialog() {
    const ref = this.dialogService.open(CategoryFormComponent, {
      header: 'Добавить категорию',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'add',
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.categories.reload();
      }
    });
  }

  openEditDialog(category: Category) {
    const ref = this.dialogService.open(CategoryFormComponent, {
      header: 'Редактировать категорию',
      width: '500px',
      modal: true,
      closable: true,
      draggable: false,
      resizable: false,
      focusOnShow: false,
      styleClass: 'p-fluid',
      data: {
        mode: 'edit',
        category,
      },
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.categories.reload();
      }
    });
  }
}
