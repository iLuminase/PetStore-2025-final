import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';

import { AuthService } from '../../../../shared/src/app/auth';
import { Cart, CartItem, CartService } from '../../../../shared/src/app/cart';

@Component({
  selector: 'app-products-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartItems: CartItem[] = [];
  loading = false;
  error: string | null = null;
  isAuthenticated = false;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to cart changes first
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        if (cart) {
          this.cart = cart;
          this.cartItems = cart.items;
        }
      });

    // Check authentication - only react to isAuthenticated changes
    this.authService.authState$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) =>
          prev.isAuthenticated === curr.isAuthenticated
        )
      )
      .subscribe(state => {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = state.isAuthenticated;

        if (!state.isAuthenticated) {
          this.router.navigate(['/login']);
        } else if (state.isAuthenticated && !wasAuthenticated) {
          // Only load cart once when just authenticated (state changed from false to true)
          this.loadCart();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;

    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        this.cart = cart;
        this.cartItems = cart.items;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading cart', err);
        this.error = 'Không thể tải giỏ hàng. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(item.productId.toString());
      return;
    }

    this.cartService.updateCartItem(item.productId.toString(), { quantity }).subscribe({
      next: (response) => {
        console.log('Cart updated successfully');
      },
      error: (err: any) => {
        console.error('Error updating cart', err);
        alert('Không thể cập nhật giỏ hàng. Vui lòng thử lại.');
      }
    });
  }

  removeItem(productId: string): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      this.cartService.removeFromCart(productId).subscribe({
        next: (response) => {
          console.log('Item removed from cart');
        },
        error: (err: any) => {
          console.error('Error removing item', err);
          alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
      });
    }
  }

  clearCart(): void {
    if (confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          console.log('Cart cleared');
          this.cart = null;
          this.cartItems = [];
        },
        error: (err: any) => {
          console.error('Error clearing cart', err);
          alert('Không thể xóa giỏ hàng. Vui lòng thử lại.');
        }
      });
    }
  }

  checkout(): void {
    // Navigate to checkout page (to be implemented)
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  getTotal(): number {
    return this.cart ? this.cart.totalPrice : 0;
  }

  getTotalItems(): number {
    return this.cart ? this.cart.totalItems : 0;
  }

  getItemCount(): number {
    return this.cartItems.length;
  }

  getCartItemImageUrl(item: CartItem): string {
    // Priority: productImageUrl, productImage, then placeholder
    if (item.productImageUrl) {
      // If it's already a full URL, use it directly
      if (item.productImageUrl.startsWith('http')) {
        return item.productImageUrl;
      }
      // If it starts with /api/products/, prepend the API base URL
      if (item.productImageUrl.startsWith('/api/products/')) {
        return 'http://localhost:8080' + item.productImageUrl;
      }
      return item.productImageUrl;
    }
    if (item.productImage) {
      // If it's already a full URL, use it directly
      if (item.productImage.startsWith('http')) {
        return item.productImage;
      }
      // If it starts with /api/products/, prepend the API base URL
      if (item.productImage.startsWith('/api/products/')) {
        return 'http://localhost:8080' + item.productImage;
      }
      return item.productImage;
    }
    return '/assets/images/placeholder-product.svg';
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/placeholder-product.svg';
  }

  // New methods for modern cart design
  promoCode: string = '';
  recommendedProducts: any[] = [];

  trackByCartItem(index: number, item: CartItem): any {
    return item.productId;
  }

  getSubtotal(): number {
    return this.getTotal();
  }

  getShippingFee(): number {
    return 0; // Free shipping
  }

  getDiscount(): number {
    return 0; // No discount for now
  }

  applyPromoCode(): void {
    if (this.promoCode.trim()) {
      // TODO: Implement promo code logic
      console.log('Applying promo code:', this.promoCode);
    }
  }

  proceedToCheckout(): void {
    // TODO: Navigate to checkout page
    console.log('Proceeding to checkout...');
  }

  saveForLater(): void {
    // TODO: Implement save for later functionality
    console.log('Saving cart for later...');
  }

  shareCart(): void {
    // TODO: Implement share cart functionality
    console.log('Sharing cart...');
  }

  addRecommendedToCart(product: any): void {
    // TODO: Add recommended product to cart
    console.log('Adding recommended product:', product);
  }
}
