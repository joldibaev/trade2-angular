import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VendorsListComponent } from './pages/vendors/vendors-list.component';
import { CustomersListComponent } from './pages/customers/customers-list.component';
import { StoresListComponent } from './pages/stores/stores-list.component';
import { CashboxesListComponent } from './pages/cashboxes/cashboxes-list.component';
import { ProductsListComponent } from './pages/products/products-list.component';
import { CategoriesListComponent } from './pages/categories/categories-list.component';
import { DocumentSellsListComponent } from './pages/document-sells/document-sells-list.component';
import { DocumentPurchasesListComponent } from './pages/document-purchases/document-purchases-list.component';
import { PriceTypesListComponent } from './pages/price-types/price-types-list.component';
import { CurrenciesListComponent } from './pages/currencies/currencies-list.component';
import { CoreComponent } from './core.component';

export const routes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vendors', component: VendorsListComponent },
      { path: 'customers', component: CustomersListComponent },
      { path: 'stores', component: StoresListComponent },
      { path: 'cashboxes', component: CashboxesListComponent },
      { path: 'products', component: ProductsListComponent },
      { path: 'categories', component: CategoriesListComponent },
      { path: 'price-types', component: PriceTypesListComponent },
      { path: 'currencies', component: CurrenciesListComponent },
      { path: 'document-sells', component: DocumentSellsListComponent },
      { path: 'document-purchases', component: DocumentPurchasesListComponent },
    ],
  },
];
