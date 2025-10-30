import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Cart, CartService } from '../../../../shared/src/app/cart';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shell-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    MatMenuModule,
    CommonModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
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

    // Check login status
    this.checkLoginStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async checkLoginStatus(): Promise<void> {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = await this.authService.getUserProfile();
      this.loadCart();
    }
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
    this.authService.login();
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
    return this.currentUser?.username || this.currentUser?.email || '';
  }

  get cartTotal(): number {
    return this.cart ? this.cart.totalPrice : 0;
  }
}
