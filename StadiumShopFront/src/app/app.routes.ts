import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart-page/cart-page.component').then(
        (component) => component.CartPageComponent
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/detail/product-detail.component').then(
        (component) => component.ProductDetailComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/products/list/product-list.component').then(
        (component) => component.ProductListComponent
      ),
  },
];
