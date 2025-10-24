import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloakService: KeycloakService) { }

  // Lấy thông tin user
  async getUserProfile(): Promise<KeycloakProfile | null> {
    try {
      return await this.keycloakService.loadUserProfile();
    } catch (error) {
      console.error('Error loading user profile', error);
      return null;
    }
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  // Đăng nhập
  login(): void {
    this.keycloakService.login();
  }

  // Đăng xuất
  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }

  // Lấy username
  getUsername(): string {
    if (this.isLoggedIn()) {
      try {
        return this.keycloakService.getUsername();
      } catch (error) {
        console.error('Error getting username', error);
        return '';
      }
    }
    return '';
  }

  // Lấy roles
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  // Kiểm tra có role không
  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  // Lấy token
  getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }
}

