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
import { CategoryService } from '../../../../../core/services/category.service';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../../../../shared/entities/category.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, of, switchMap, finalize } from 'rxjs';
import { Message } from 'primeng/message';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-category-form',
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
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
  host: {
    class: 'flex flex-col gap-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  category?: Category = this.dialogConfig.data?.category;

  // Loading state
  loading = signal(false);

  // Categories for dropdown
  update = new BehaviorSubject(Date.now());
  categories$ = this.update.pipe(
    switchMap(() =>
      this.categoryService.getAll().pipe(switchMap(categories => of(categories || [])))
    )
  );

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Создать'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  categoryForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    parentId: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    if (this.isEditMode() && this.category) {
      // Initialize form with existing category data
      this.categoryForm.patchValue({
        name: this.category.name,
        parentId: this.category.parentId || '',
      });
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.categoryForm.getRawValue();

    if (this.isEditMode()) {
      this.updateCategory(formValue);
    } else {
      this.createCategory(formValue);
    }
  }

  private createCategory(categoryDto: CreateCategoryDto) {
    this.categoryService
      .create(categoryDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdCategory: unknown) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Категория создана успешно',
          });
          this.dialogRef.close(createdCategory);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать категорию. Попробуйте еще раз.',
          });
          console.error('Error creating category:', error);
        },
      });
  }

  private updateCategory(categoryDto: UpdateCategoryDto) {
    const categoryId = this.category?.id;
    if (!categoryId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти категорию для обновления',
      });
      return;
    }

    this.categoryService
      .update(categoryId, categoryDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedCategory: unknown) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Категория обновлена успешно',
          });
          this.dialogRef.close(updatedCategory);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить категорию. Попробуйте еще раз.',
          });
          console.error('Error updating category:', error);
        },
      });
  }
}
