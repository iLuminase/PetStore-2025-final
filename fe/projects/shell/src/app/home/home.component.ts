import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil } from 'rxjs';
import { Product, ProductService } from '../../../../shared/src/app/product';

@Component({
  selector: 'app-shell-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  username: string = '';
  isAuthenticated: boolean = false;
  latestProducts: Product[] = [];
  loading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private keycloak: KeycloakService,
    private productService: ProductService
  ) { }

  async ngOnInit() {
    this.isAuthenticated = await this.keycloak.isLoggedIn();
    if (this.isAuthenticated) {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.username || profile.email || 'User';
    }

    // Load latest products
    this.loadLatestProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLatestProducts(): void {
    this.loading = true;
    this.productService.getProducts({ page: 0, size: 6, sort: 'createdAt,desc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.latestProducts = response.content;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading latest products:', error);
          this.loading = false;
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
    // Fallback to database image endpoint
    return `http://localhost:8082/api/products/${product.id}/image`;
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
