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
  private initialized = false;

  constructor(private readonly keycloak: KeycloakService) {
    // Don't initialize in constructor, wait for APP_INITIALIZER to complete
    // Initialize will be called explicitly from AppComponent
  }

  public async initialize() {
    if (this.initialized) {
      return; // Already initialized
    }
    
    try {
      console.log('AuthService: Initializing...');
      // Keycloak.isLoggedIn() is synchronous, not async
      const isLoggedIn = this.keycloak.isLoggedIn();
      console.log('AuthService: isLoggedIn =', isLoggedIn);
      this.isLoggedInSubject.next(isLoggedIn);
      if (isLoggedIn) {
        this.profile = await this.keycloak.loadUserProfile();
        console.log('AuthService: User profile loaded:', this.profile);
      }
      this.initialized = true;
    } catch (error) {
      console.error('AuthService: Error initializing:', error);
      this.isLoggedInSubject.next(false);
    }
  }

  public updateLoginStatus(): void {
    const isLoggedIn = this.keycloak.isLoggedIn();
    console.log('Login status updated:', isLoggedIn);
    this.isLoggedInSubject.next(isLoggedIn);
    if (isLoggedIn) {
      this.keycloak.loadUserProfile().then(profile => {
        this.profile = profile;
        console.log('Profile updated:', profile);
      }).catch(error => {
        console.error('Error loading profile:', error);
      });
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
