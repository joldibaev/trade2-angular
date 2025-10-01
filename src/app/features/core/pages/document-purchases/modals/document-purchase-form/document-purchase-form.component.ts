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
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DocumentPurchaseService } from '../../../../../../core/services/document-purchase.service';
import { StoreService } from '../../../../../../core/services/store.service';
import { VendorService } from '../../../../../../core/services/vendor.service';
import { PriceTypeService } from '../../../../../../core/services/price-type.service';
import {
  DocumentPurchase,
  CreateDocumentPurchaseDto,
  UpdateDocumentPurchaseDto,
} from '../../../../../../shared/entities/document-purchase.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Message } from 'primeng/message';
import { finalize } from 'rxjs';
import { Ripple } from 'primeng/ripple';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-document-purchase-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    SelectButtonModule,
    CheckboxModule,
    DatePickerModule,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Message,
    Ripple,
    Textarea,
  ],
  templateUrl: './document-purchase-form.component.html',
  styleUrl: './document-purchase-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentPurchaseFormComponent implements OnInit {
  private readonly documentPurchaseService = inject(DocumentPurchaseService);
  private readonly storeService = inject(StoreService);
  private readonly vendorService = inject(VendorService);
  private readonly priceTypeService = inject(PriceTypeService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  // Mode: 'add' or 'edit'
  mode: 'add' | 'edit' = this.dialogConfig.data?.mode || 'add';

  // For edit mode
  documentPurchase?: DocumentPurchase = this.dialogConfig.data?.documentPurchase;

  // Loading state
  loading = signal(false);

  // Resources for dropdowns
  storesResource = this.storeService.getAllAsResource();
  vendorsResource = this.vendorService.getAllAsResource();
  priceTypesResource = this.priceTypeService.getForPurchases();

  // Computed values
  stores = computed(() => this.storesResource.value() || []);
  vendors = computed(() => this.vendorsResource.value() || []);
  priceTypes = computed(() => this.priceTypesResource.value() || []);
  priceTypeOptions = computed(() =>
    this.priceTypes().map(priceType => ({
      label: priceType.name,
      value: priceType.id,
    }))
  );

  // Computed properties for UI
  isEditMode = computed(() => this.mode === 'edit');
  buttonLabel = computed(() => (this.isEditMode() ? 'Сохранить' : 'Добавить'));
  buttonIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // Reactive form
  documentPurchaseForm = new FormGroup({
    date: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    storeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    vendorId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    priceTypeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl<string | null>(null),
  });

  ngOnInit() {
    if (this.isEditMode() && this.documentPurchase) {
      // Initialize form with existing document purchase data
      this.documentPurchaseForm.patchValue({
        date: this.documentPurchase.date ? new Date(this.documentPurchase.date) : new Date(),
        storeId: this.documentPurchase.store.id,
        vendorId: this.documentPurchase.vendor.id,
        priceTypeId: this.documentPurchase.priceType.id,
        note: this.documentPurchase.note,
      });
    } else {
      // For add mode, auto-select price type if only one available
      const priceTypes = this.priceTypes();
      if (priceTypes.length === 1) {
        this.documentPurchaseForm.patchValue({
          priceTypeId: priceTypes[0].id,
        });
      }
    }
  }

  // Dialog methods
  closeDialog() {
    this.dialogRef.close();
  }

  saveDocumentPurchase() {
    if (this.documentPurchaseForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ошибка валидации',
        detail: 'Пожалуйста, заполните все обязательные поля',
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.documentPurchaseForm.getRawValue();

    if (this.isEditMode()) {
      this.updateDocumentPurchase({
        date: formValue.date,
        storeId: formValue.storeId,
        vendorId: formValue.vendorId,
        priceTypeId: formValue.priceTypeId,
        note: formValue.note || undefined,
      });
    } else {
      this.createDocumentPurchase({
        date: formValue.date,
        storeId: formValue.storeId,
        vendorId: formValue.vendorId,
        priceTypeId: formValue.priceTypeId,
        note: formValue.note || undefined,
      });
    }
  }

  private createDocumentPurchase(createDocumentPurchaseDto: CreateDocumentPurchaseDto) {
    this.documentPurchaseService
      .create(createDocumentPurchaseDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (createdDocument: DocumentPurchase) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Документ покупки создан успешно',
          });
          this.dialogRef.close(createdDocument);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось создать документ покупки. Попробуйте еще раз.',
          });
          console.error('Error creating document purchase:', error);
        },
      });
  }

  private updateDocumentPurchase(updateDocumentPurchaseDto: UpdateDocumentPurchaseDto) {
    const documentPurchaseId = this.documentPurchase?.id;
    if (!documentPurchaseId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось найти документ покупки для обновления',
      });
      return;
    }

    this.documentPurchaseService
      .update(String(documentPurchaseId), updateDocumentPurchaseDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedDocument: DocumentPurchase) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успех',
            detail: 'Документ покупки обновлен успешно',
          });
          this.dialogRef.close(updatedDocument);
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось обновить документ покупки. Попробуйте еще раз.',
          });
          console.error('Error updating document purchase:', error);
        },
      });
  }
}
