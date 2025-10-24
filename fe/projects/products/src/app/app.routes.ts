import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./product-list/product-list').then(m => m.ProductList)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./product-detail/product-detail').then(m => m.ProductDetail)
    },
    {
        path: 'product/:id/edit',
        loadComponent: () => import('./product-edit/product-edit.component').then(m => m.ProductEditComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./cart/cart').then(m => m.CartComponent)
    },
    { path: '**', redirectTo: '' }
];
