import { Routes } from '@angular/router';

export const routes: Routes = [
    // Products routes (when accessed via /products)
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
    // Admin routes (when accessed via /admin)
    {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./admin-product-list/admin-product-list.component').then(m => m.AdminProductListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent)
    },
    {
        path: 'low-stock',
        loadComponent: () => import('./low-stock/low-stock.component').then(m => m.LowStockComponent)
    },
    // Admin product edit route
    {
        path: 'admin/product/:id/edit',
        loadComponent: () => import('./product-edit/product-edit.component').then(m => m.ProductEditComponent)
    }
];
