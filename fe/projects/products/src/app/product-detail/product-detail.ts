import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, AuthState } from '../../../../shared/src/app/auth';
import { AddToCartRequest, CartService } from '../../../../shared/src/app/cart';
import { Product, ProductService } from '../../../../shared/src/app/product';

@Component({
  selector: 'app-products-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetail implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  quantity = 1;
  selectedImage: string = '';
  authState: AuthState | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;
      });

    // Get product ID from route
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.loadProduct(id);
    } else {
      this.error = 'Invalid product ID';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (data: Product) => {
        this.product = data;
        this.selectedImage = this.getProductImageUrl();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading product', err);
        this.error = 'Failed to load product details. Please try again.';
        this.loading = false;
      }
    });
  }

  getProductImageUrl(): string {
    if (!this.product) return '/assets/images/placeholder-product.svg';

    // Priority: 1. External URL -> 2. Database image -> 3. Placeholder
    if (this.product.imageUrl && this.product.imageUrl.trim()) {
      // If it's already a full URL, use it directly
      if (this.product.imageUrl.startsWith('http')) {
        return this.product.imageUrl;
      }
      // If it's a relative path, use it directly
      return this.product.imageUrl;
    }
    // Fallback to database image if no external imageUrl
    return this.productService.getProductImageUrl(this.product.id);
  }

  handleImageError(event: any): void {
    // Set placeholder image on error
    event.target.src = '/assets/images/placeholder-product.svg';
  }

  addToCart(): void {
    if (!this.product) return;

    if (!this.authState?.isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      this.router.navigate(['/login']);
      return;
    }

    if (this.quantity < 1) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    if (this.quantity > this.product.stockQuantity) {
      alert(`Chỉ còn ${this.product.stockQuantity} sản phẩm trong kho`);
      return;
    }

    const request: AddToCartRequest = {
      productId: this.product.id,
      quantity: this.quantity,
      price: this.product.price,
      productName: this.product.name,
      productImage: this.product.imageUrl
    };

    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        alert(`Đã thêm ${this.quantity} sản phẩm vào giỏ hàng!`);
        this.quantity = 1; // Reset quantity
      },
      error: (err) => {
        console.error('Error adding to cart', err);
        alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  userHasRole(roles: string[]): boolean {
    if (!this.authState || !this.authState.user || !this.authState.user.roles) {
      return false;
    }
    return this.authState.user.roles.some(role => roles.includes(role));
  }
}
