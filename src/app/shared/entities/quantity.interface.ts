import { Store } from './store.interface';
import { Product } from './product.interface';

export interface Quantity {
  productId: string;
  product?: Product;
  storeId: string;
  store?: Store;
  quantity: number;
}
