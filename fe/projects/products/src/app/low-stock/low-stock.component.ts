import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { Product, ProductService } from '../../../../shared/src/app/product';

@Component({
    selector: 'app-low-stock',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './low-stock.component.html',
    styleUrl: './low-stock.component.scss'
})
export class LowStockComponent implements OnInit, OnDestroy {
    authState: AuthState | null = null;
    lowStockProducts: Product[] = [];
    loading = false;
    error: string | null = null;
    threshold = 10;
    stockUpdateQuantity: { [key: number]: number } = {};

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check authentication and authorization
        this.authService.authState$
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.authState = state;
                // Auth is handled by auth guard
            });

        this.loadLowStockProducts();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    userHasRole(roles: string[]): boolean {
        // Auth is handled by auth guard, so always return true for admin components
        return true;
    }

    loadLowStockProducts(): void {
        this.loading = true;
        this.error = null;

        this.productService.getLowStockProducts(this.threshold).subscribe({
            next: (products: Product[]) => {
                this.lowStockProducts = products;
                this.loading = false;

                // Initialize stock update quantities
                this.lowStockProducts.forEach(product => {
                    if (!this.stockUpdateQuantity[product.id]) {
                        this.stockUpdateQuantity[product.id] = 50; // Default restock amount
                    }
                });
            },
            error: (err: any) => {
                console.error('Error loading low stock products', err);
                this.error = 'Không thể tải danh sách sản phẩm sắp hết hàng';
                this.loading = false;
            }
        });
    }

    onThresholdChange(): void {
        if (this.threshold > 0) {
            this.loadLowStockProducts();
        }
    }

    restockProduct(productId: number): void {
        const quantity = this.stockUpdateQuantity[productId] || 50;

        this.productService.increaseStock(productId, quantity).subscribe({
            next: () => {
                // Update local product stock and remove from list if above threshold
                const productIndex = this.lowStockProducts.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    this.lowStockProducts[productIndex].stockQuantity += quantity;

                    // Remove from low stock list if now above threshold
                    if (this.lowStockProducts[productIndex].stockQuantity >= this.threshold) {
                        this.lowStockProducts.splice(productIndex, 1);
                    }
                }
            },
            error: (err: any) => {
                console.error('Error restocking product', err);
                alert('Không thể tăng tồn kho. Vui lòng thử lại.');
            }
        });
    }

    editProduct(productId: number): void {
        this.router.navigate(['/products/product', productId, 'edit']);
    }

    getProductImageUrl(product: Product): string {
        // Priority: 1. External URL -> 2. Database image -> 3. Placeholder
        if (product.imageUrl && product.imageUrl.trim()) {
            // If it's already a full URL, use it directly
            if (product.imageUrl.startsWith('http')) {
                return product.imageUrl;
            }
            // If it's a relative path, use it directly
            return product.imageUrl;
        }
        // Fallback to database image if no external imageUrl
        return this.productService.getProductImageUrl(product.id);
    }

    handleImageError(event: any): void {
        event.target.src = '/assets/images/placeholder-product.svg';
    }

    navigateToDashboard(): void {
        this.router.navigate(['/admin/dashboard']);
    }

    navigateToAllProducts(): void {
        this.router.navigate(['/admin/products']);
    }

    getStockStatus(stockQuantity: number): string {
        if (stockQuantity === 0) return 'critical';
        if (stockQuantity < 5) return 'very-low';
        return 'low';
    }

    getStockStatusText(stockQuantity: number): string {
        if (stockQuantity === 0) return 'Hết hàng';
        if (stockQuantity < 5) return 'Rất ít';
        return 'Sắp hết';
    }

    getPriorityLevel(stockQuantity: number): number {
        if (stockQuantity === 0) return 1; // Critical
        if (stockQuantity < 3) return 2; // Very high
        if (stockQuantity < 5) return 3; // High
        return 4; // Medium
    }

    sortProductsByPriority(): Product[] {
        return [...this.lowStockProducts].sort((a, b) => {
            const priorityA = this.getPriorityLevel(a.stockQuantity);
            const priorityB = this.getPriorityLevel(b.stockQuantity);
            return priorityA - priorityB;
        });
    }

    getCriticalStockCount(): number {
        return this.lowStockProducts.filter(p => p.stockQuantity === 0).length;
    }

    getVeryLowStockCount(): number {
        return this.lowStockProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity < 5).length;
    }
}