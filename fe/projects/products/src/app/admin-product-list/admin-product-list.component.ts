import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { ModalComponent } from '../../../../shared/src/app/common';
import { Product, ProductSearchParams, ProductService } from '../../../../shared/src/app/product';

@Component({
    selector: 'app-admin-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ModalComponent],
    templateUrl: './admin-product-list.component.html',
    styleUrl: './admin-product-list.component.scss'
})
export class AdminProductListComponent implements OnInit, OnDestroy {
    authState: AuthState | null = null;
    products: Product[] = [];
    loading = false;
    error: string | null = null;

    // Pagination
    currentPage = 0;
    totalPages = 0;
    pageSize = 10;
    totalElements = 0;

    // Search and filter
    searchTerm = '';
    selectedCategory = '';
    selectedBrand = '';
    categories: string[] = [];
    brands: string[] = [];

    // Stock management
    stockUpdateQuantity: { [key: number]: number } = {};

    // Success modal (simplified)
    showSuccessModal = false;
    successMessage = '';

    // Throttling to prevent API overload
    private isLoading = false;
    private lastLoadTime = 0;
    private readonly LOAD_THROTTLE_MS = 1000; // Minimum 1 second between loads

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

        this.loadProducts();
        this.loadCategories();
        this.loadBrands();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    userHasRole(roles: string[]): boolean {
        // Auth is handled by auth guard, so always return true for admin components
        return true;
    }

    loadProducts(): void {
        // Throttling to prevent API overload
        const now = Date.now();
        if (this.isLoading || (now - this.lastLoadTime) < this.LOAD_THROTTLE_MS) {
            console.log('loadProducts throttled - too frequent calls');
            return;
        }

        this.isLoading = true;
        this.lastLoadTime = now;
        this.loading = true;
        this.error = null;

        const params: ProductSearchParams = {
            page: this.currentPage,
            size: this.pageSize,
            sort: 'createdAt,desc' // Sản phẩm mới nhất lên đầu
        };

        if (this.searchTerm.trim()) {
            params.name = this.searchTerm.trim();
        }

        if (this.selectedCategory) {
            params.category = this.selectedCategory;
        }

        if (this.selectedBrand) {
            params.brand = this.selectedBrand;
        }

        this.productService.getProducts(params, true).subscribe({
            next: (response) => {
                console.log('Admin loaded products:', response.content.length, 'total elements:', response.totalElements);

                this.products = response.content;
                this.totalPages = response.totalPages;
                this.totalElements = response.totalElements;
                this.loading = false;
                this.isLoading = false; // Reset loading flag

                // Initialize stock update quantities
                this.products.forEach(product => {
                    if (!this.stockUpdateQuantity[product.id]) {
                        this.stockUpdateQuantity[product.id] = 1;
                    }
                });
            },
            error: (err: any) => {
                console.error('Error loading products', err);
                this.error = 'Không thể tải danh sách sản phẩm';
                this.loading = false;
                this.isLoading = false; // Reset loading flag
            }
        });
    }

    loadCategories(): void {
        this.productService.getCategories().subscribe({
            next: (categories: string[]) => {
                this.categories = categories;
            },
            error: (err: any) => console.error('Error loading categories', err)
        });
    }

    loadBrands(): void {
        this.productService.getBrands().subscribe({
            next: (brands: string[]) => {
                this.brands = brands;
            },
            error: (err: any) => console.error('Error loading brands', err)
        });
    }

    onSearch(): void {
        this.currentPage = 0;
        this.loadProducts();
    }

    onCategoryChange(): void {
        this.currentPage = 0;
        this.loadProducts();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.selectedBrand = '';
        this.currentPage = 0;
        this.loadProducts();
    }

    // refreshProducts removed to prevent API overload

    previousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadProducts();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.loadProducts();
        }
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadProducts();
        }
    }

    editProduct(productId: number): void {
        console.log('EditProduct clicked with ID:', productId);
        if (!productId || productId <= 0) {
            console.error('Invalid product ID:', productId);
            alert('ID sản phẩm không hợp lệ');
            return;
        }
        console.log('Navigating to:', ['/admin/product', productId, 'edit']);
        this.router.navigate(['/admin/product', productId, 'edit']).then(
            success => console.log('Navigation success:', success),
            error => console.error('Navigation error:', error)
        );
    }

    // Removed toggleProductStatus to prevent excessive API calls

    increaseStock(productId: number): void {
        const quantity = this.stockUpdateQuantity[productId] || 1;
        this.productService.increaseStock(productId, quantity).subscribe({
            next: () => {
                // Update local product stock
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    product.stockQuantity += quantity;
                }
            },
            error: (err: any) => {
                console.error('Error increasing stock', err);
                alert('Không thể cập nhật tồn kho. Vui lòng thử lại.');
            }
        });
    }

    decreaseStock(productId: number): void {
        const quantity = this.stockUpdateQuantity[productId] || 1;
        const product = this.products.find(p => p.id === productId);

        if (product && product.stockQuantity < quantity) {
            alert('Số lượng giảm không thể lớn hơn tồn kho hiện tại');
            return;
        }

        this.productService.decreaseStock(productId, quantity).subscribe({
            next: () => {
                // Update local product stock
                if (product) {
                    product.stockQuantity -= quantity;
                }
            },
            error: (err: any) => {
                console.error('Error decreasing stock', err);
                alert('Không thể cập nhật tồn kho. Vui lòng thử lại.');
            }
        });
    }

    setStock(productId: number, newStock: number): void {
        if (newStock < 0) {
            alert('Số lượng tồn kho không thể âm');
            return;
        }

        this.productService.updateStock(productId, newStock).subscribe({
            next: () => {
                // Update local product stock
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    product.stockQuantity = newStock;
                }
            },
            error: (err: any) => {
                console.error('Error updating stock', err);
                alert('Không thể cập nhật tồn kho. Vui lòng thử lại.');
            }
        });
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

    navigateToCreate(): void {
        this.router.navigate(['/admin/create']);
    }

    navigateToDashboard(): void {
        this.router.navigate(['/admin/dashboard']);
    }

    getStockStatus(stockQuantity: number): string {
        if (stockQuantity === 0) return 'out-of-stock';
        if (stockQuantity < 10) return 'low-stock';
        return 'in-stock';
    }

    getStockStatusText(stockQuantity: number): string {
        if (stockQuantity === 0) return 'Hết hàng';
        if (stockQuantity < 10) return 'Sắp hết';
        return 'Còn hàng';
    }

    getActiveStatus(active?: boolean): string {
        return active ? 'active' : 'inactive';
    }

    getActiveStatusText(active?: boolean): string {
        return active ? 'Hoạt động' : 'Đã tắt';
    }

    getProductStatusTooltip(active?: boolean): string {
        return active
            ? 'Sản phẩm đang hoạt động và có thể bán được'
            : 'Sản phẩm đã bị tắt và không thể bán';
    }

    getStockStatusTooltip(stockQuantity: number): string {
        if (stockQuantity === 0) return 'Sản phẩm đã hết hàng - cần nhập thêm';
        if (stockQuantity < 10) return `Còn ${stockQuantity} sản phẩm - sắp hết hàng`;
        return `Còn ${stockQuantity} sản phẩm trong kho`;
    }

    shouldShowPage(pageIndex: number): boolean {
        return pageIndex === 0 ||
            pageIndex === this.totalPages - 1 ||
            Math.abs(pageIndex - this.currentPage) <= 2;
    }

    // Toggle functionality removed to prevent API overload

    closeSuccessModal(): void {
        this.showSuccessModal = false;
        this.successMessage = '';
    }

    // getToggleMessage removed to cleanup code
}