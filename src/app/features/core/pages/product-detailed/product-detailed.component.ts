import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { CategoryService } from '../../../../core/services/category.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ProductQuantitiesComponent } from './product-quantities/product-quantities.component';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ProductBarcodeComponent } from './product-barcode/product-barcode.component';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-product-detailed',
  imports: [
    AsyncPipe,
    InputText,
    InputNumber,
    Message,
    ReactiveFormsModule,
    Select,
    LoaderComponent,
    ProductQuantitiesComponent,
    ButtonDirective,
    ButtonLabel,
    ButtonIcon,
    ProductBarcodeComponent,
    Divider,
  ],
  templateUrl: './product-detailed.component.html',
  styleUrl: './product-detailed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col p-4 gap-4',
  },
})
export class ProductDetailedComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  product$ = this.activatedRoute.params.pipe(
    switchMap(params =>
      this.productService
        .getById(params['productId'])
        .pipe(tap(product => this.productForm.patchValue(product)))
    )
  );

  categories = this.categoryService.getAllAsResource();

  productForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [] }),
    article: new FormControl('', { nonNullable: true, validators: [] }),
    categoryId: new FormControl('', { nonNullable: true, validators: [] }),
    wac: new FormControl<number | null>(null),
    createdAt: new FormControl<Date | null>(null, { validators: [] }),
    updatedAt: new FormControl<Date | null>(null, { validators: [] }),
    deletedAt: new FormControl<Date | null>(null, { validators: [] }),
  });
}
