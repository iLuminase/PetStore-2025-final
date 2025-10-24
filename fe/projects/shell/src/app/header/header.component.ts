import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';

import { AuthService, User } from '../../../../shared/src/app/auth';
import { Cart, CartService } from '../../../../shared/src/app/cart';

@Component({
  selector: 'app-shell-header',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatButton,
    RouterLinkActive,
    MatMenuModule,
    CommonModule,
    MatDivider,
    MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  cart: Cart | null = null;
  cartItemCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to cart changes first
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        this.cartItemCount = cart ? cart.totalItems : 0;
      });

    // Subscribe to auth state changes
    // Use distinctUntilChanged to avoid loading cart multiple times
    this.authService.authState$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) =>
          prev.isAuthenticated === curr.isAuthenticated
        )
      )
      .subscribe(state => {
        const wasLoggedIn = this.isLoggedIn;
        this.isLoggedIn = state.isAuthenticated;
        this.currentUser = state.user;

        // Only load cart once when user just logged in (state changed from false to true)
        if (this.isLoggedIn && !wasLoggedIn) {
          this.loadCart();
        } else if (!this.isLoggedIn) {
          // Clear cart when logged out
          this.cart = null;
          this.cartItemCount = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.cartItemCount = cart.totalItems;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        console.log('Item removed from cart');
      },
      error: (err) => {
        console.error('Error removing item:', err);
      }
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    this.cartService.updateCartItem(productId, { quantity }).subscribe({
      next: (response) => {
        console.log('Cart updated');
      },
      error: (err) => {
        console.error('Error updating cart:', err);
      }
    });
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  get username(): string {
    return this.currentUser?.email || '';
  }

  get cartTotal(): number {
    return this.cart ? this.cart.totalPrice : 0;
  }
}
