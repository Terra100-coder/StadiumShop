import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/products/list/product-list.component').then(
        (component) => component.ProductListComponent
      ),
  },
];
