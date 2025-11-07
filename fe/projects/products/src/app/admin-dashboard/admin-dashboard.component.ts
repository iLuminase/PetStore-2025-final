import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { Product, ProductService } from '../../../../shared/src/app/product';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    authState: AuthState | null = null;
    totalProducts = 0;
    lowStockProducts = 0;
    categories: string[] = [];
    brands: string[] = [];
    recentProducts: Product[] = [];
    loading = false;
    error: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Auth check is handled by auth guard, so we can directly load data
        this.authService.authState$
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.authState = state;
            });

        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    userHasRole(roles: string[]): boolean {
        // Auth is handled by auth guard, so always return true for admin components
        return true;
    }

    loadDashboardData(): void {
        this.loading = true;

        // Load total products count
        this.productService.getProducts({ size: 1 }).subscribe({
            next: (response) => {
                this.totalProducts = response.totalElements;
            },
            error: (err) => console.error('Error loading product count', err)
        });

        // Load low stock products
        this.productService.getLowStockProducts(10).subscribe({
            next: (products: Product[]) => {
                this.lowStockProducts = products.length;
            },
            error: (err: any) => console.error('Error loading low stock products', err)
        });

        // Load categories
        this.productService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (err) => console.error('Error loading categories', err)
        });

        // Load brands
        this.productService.getBrands().subscribe({
            next: (brands: string[]) => {
                this.brands = brands;
            },
            error: (err: any) => console.error('Error loading brands', err)
        });

        // Load recent products (last 5)
        this.productService.getProducts({
            page: 0,
            size: 5,
            sort: 'createdAt,desc'
        }).subscribe({
            next: (response) => {
                this.recentProducts = response.content;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading recent products', err);
                this.error = 'Không thể tải dữ liệu dashboard';
                this.loading = false;
            }
        });
    }

    navigateToProducts(): void {
        this.router.navigate(['/admin/products']);
    }

    navigateToCreateProduct(): void {
        this.router.navigate(['/admin/create']);
    }

    navigateToLowStock(): void {
        this.router.navigate(['/admin/low-stock']);
    }
}