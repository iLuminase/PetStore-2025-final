import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  public profile?: KeycloakProfile | null;

  constructor(private readonly keycloak: KeycloakService) {
    this.initialize();
  }

  public async initialize() {
    try {
      const isLoggedIn = await this.keycloak.isLoggedIn();
      this.isLoggedInSubject.next(isLoggedIn);
      if (isLoggedIn) {
        this.profile = await this.keycloak.loadUserProfile();
        console.log('User logged in:', this.profile);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.isLoggedInSubject.next(false);
    }
  }

  public login() {
    return this.keycloak.login();
  }

  public logout() {
    return this.keycloak.logout(window.location.origin);
  }

  public getToken(): string | undefined {
    return this.keycloak.getKeycloakInstance().token;
  }

  public getUsername(): string {
    return this.profile?.username || '';
  }

  public getEmail(): string {
    if (this.profile) {
      return (this.profile as any).email || '';
    }
    return '';
  }

  public hasRole(role: string): boolean {
    return this.keycloak.getUserRoles().includes(role);
  }

  public hasGroup(groupName: string): boolean {
    // Check if user belongs to a specific group
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;
    return tokenParsed?.['groups']?.includes(`/${groupName}`) || false;
  }

  public isAdmin(): boolean {
    // Check if user has ADMIN role OR belongs to admin_access group
    return this.hasRole('ADMIN') || this.hasGroup('admin_access');
  }

  public refreshToken() {
    return this.keycloak.updateToken(5);
  }
}
