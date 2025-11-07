import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Cart, CartService } from '../../../../shared/src/app/cart';
import { AuthService } from '../../service/auth.service';

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
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  cart: Cart = {
    items: [],
    userId: '',
    totalItems: 0,
    totalQuantity: 0,
    totalAmount: 0,
    totalPrice: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: ''
  } as unknown as Cart;
  itemsQuantity = 0;
  cartItemCount = 0;
  isLoggedIn = false;
  username: string = '';

  constructor(
    private cartService: CartService,
    public router: Router,
    public authService: AuthService
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.username = this.authService.getUsername() || '';
      } else {
        this.username = '';
      }
    });
  }

  ngOnInit(): void {
    // @ts-ignore - cart$ is a BehaviorSubject in the service
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe((cart: Cart) => {
      if (cart && cart.items) {
        this.cart = cart;
        this.itemsQuantity = cart.items.length || 0;
        this.cartItemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      } else {
        this.cart = {
          userId: 0,
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          totalAmount: 0,
          totalPrice: 0,
          subtotal: 0,
          tax: 0,
          shipping: 0,
          id: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.itemsQuantity = 0;
        this.cartItemCount = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    this.authService.login();
  }

  onLogin(): void {
    this.authService.login();
  }

  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
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

  get cartTotal(): number {
    return this.cart ? this.cart.totalAmount : 0;
  }

  hasAdminRole(): boolean {
    return this.authService.isAdmin();
  }
}
