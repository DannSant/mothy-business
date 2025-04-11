import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component')
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products-page/products-page.component')
  },
  {
    path: 'products/add',
    loadComponent: () => import('./pages/product-add-page/product-add-page.component')
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./pages/product-add-page/product-add-page.component')
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/order-list-page/order-list-page.component')
  },
  {
    path: 'orders/add',
    loadComponent: () => import('./pages/order-add-page/order-add-page.component')
  },
  {
    path: 'orders/edit/:id',
    loadComponent: () => import('./pages/order-edit-page/order-edit-page.component')
  }
];
