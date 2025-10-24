import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';

// Import from shared project
import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { AddToCartRequest, CartService } from '../../../../shared/src/app/cart';
import { Product, ProductSearchParams, ProductService } from '../../../../shared/src/app/product';

@Component({
  selector: 'app-products-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  authState$: Observable<AuthState>;
  authState: AuthState | null = null;

  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 12;

  // Search and filter
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.authState$ = this.authService.authState$;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    // Subscribe to auth state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => this.authState = state);

    // Subscribe to loading state
    this.productService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Subscribe to products updates
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => this.products = products);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  userHasRole(authState: AuthState | null, roles: string[]): boolean {
    if (!authState || !authState.user || !authState.user.roles) {
      return false;
    }
    return authState.user.roles.some(role => roles.includes(role));
  }

  addToCart(productId: number): void {
    // Check if user is logged in
    if (!this.authState?.isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      this.router.navigate(['/login']);
      return;
    }

    // Find the product to get its price
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      alert('Không tìm thấy sản phẩm');
      return;
    }

    const request: AddToCartRequest = {
      productId: productId,
      quantity: 1,
      price: product.price,
      productName: product.name,
      productImage: product.imageUrl
    };

    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        console.log('Product added to cart successfully!', response);
        alert('Đã thêm sản phẩm vào giỏ hàng!');
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    });
  }

  loadProducts(): void {
    const params: ProductSearchParams = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.searchTerm) {
      params.name = this.searchTerm;
    }

    if (this.selectedCategory) {
      params.category = this.selectedCategory;
    }

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.error = null;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Failed to load products. Please try again.';
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories', err)
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

  getProductImageUrl(product: Product): string {
    // Priority: imageUrl from product, then DB image endpoint, then placeholder
    if (product.imageUrl) {
      // If it's already a full URL or starts with /, use it directly
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/api/products/')) {
        return 'http://localhost:8088' + product.imageUrl;
      }
      return product.imageUrl;
    }
    // Fallback to placeholder
    return '/assets/images/placeholder-product.svg';
  }

  handleImageError(event: any): void {
    // Set placeholder image on error
    event.target.src = '/assets/images/placeholder-product.svg';
  }
}
