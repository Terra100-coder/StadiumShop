import { Routes } from '@angular/router';
import { adminChildGuard, adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (component) => component.LoginComponent
      ),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    canActivateChild: [adminChildGuard],
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then(
        (component) => component.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (component) => component.AdminDashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/section-placeholder/admin-section-placeholder.component').then(
            (component) => component.AdminSectionPlaceholderComponent
          ),
        data: { title: 'Produits' },
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/section-placeholder/admin-section-placeholder.component').then(
            (component) => component.AdminSectionPlaceholderComponent
          ),
        data: { title: 'Commandes' },
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/section-placeholder/admin-section-placeholder.component').then(
            (component) => component.AdminSectionPlaceholderComponent
          ),
        data: { title: 'Catégories' },
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./features/admin/section-placeholder/admin-section-placeholder.component').then(
            (component) => component.AdminSectionPlaceholderComponent
          ),
        data: { title: 'Équipes' },
      },
    ],
  },
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./features/checkout/order-confirmation/order-confirmation.component').then(
        (component) => component.OrderConfirmationComponent
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout-page/checkout-page.component').then(
        (component) => component.CheckoutPageComponent
      ),
  },
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
