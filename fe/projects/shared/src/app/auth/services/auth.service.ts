import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
    AuthState,
    GoogleAuthRequest,
    LoginRequest,
    TokenResponse,
    User
} from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';
    private tokenKey = 'auth_token';
    private refreshTokenKey = 'refresh_token';

    private authStateSubject = new BehaviorSubject<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
    });

    public authState$ = this.authStateSubject.asObservable();

    constructor(private http: HttpClient) {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            // Don't validate token on init to avoid extra API calls
            // Just set authenticated state and load profile
            // If token is invalid, API calls will fail and trigger proper logout via interceptor
            this.updateAuthState({
                isAuthenticated: true,
                token: token,
                loading: false
            });
            this.loadUserProfile();
        }
    }

    login(credentials: LoginRequest): Observable<TokenResponse> {
        this.updateAuthState({ loading: true, error: null });

        return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => this.handleAuthSuccess(response)),
                catchError(error => this.handleAuthError(error))
            );
    }

    googleAuth(code: string): Observable<TokenResponse> {
        this.updateAuthState({ loading: true, error: null });

        const request: GoogleAuthRequest = { code };
        return this.http.post<TokenResponse>(`${this.apiUrl}/google/callback`, request)
            .pipe(
                tap(response => this.handleAuthSuccess(response)),
                catchError(error => this.handleAuthError(error))
            );
    }

    getGoogleAuthUrl(): Observable<{ authUrl: string }> {
        return this.http.get<{ authUrl: string }>(`${this.apiUrl}/google/url`);
    }

    refreshToken(): Observable<TokenResponse> {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, { refreshToken })
            .pipe(
                tap(response => this.handleAuthSuccess(response)),
                catchError(error => {
                    this.logout();
                    return throwError(() => error);
                })
            );
    }

    logout(): void {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe();
        }

        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);

        this.updateAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
        });
    }

    validateToken(token: string): Observable<boolean> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, {}, { headers })
            .pipe(
                map(response => response.valid),
                catchError(() => throwError(() => false))
            );
    }

    getCurrentUser(): Observable<User | null> {
        return this.authState$.pipe(map(state => state.user));
    }

    isAuthenticated(): Observable<boolean> {
        return this.authState$.pipe(map(state => state.isAuthenticated));
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private handleAuthSuccess(response: TokenResponse): void {
        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem(this.refreshTokenKey, response.refreshToken);

        this.updateAuthState({
            isAuthenticated: true,
            token: response.accessToken,
            loading: false,
            error: null
        });

        this.loadUserProfile();
    }

    private handleAuthError(error: any): Observable<never> {
        const errorMessage = error.error?.message || 'Authentication failed';

        this.updateAuthState({
            loading: false,
            error: errorMessage
        });

        return throwError(() => new Error(errorMessage));
    }

    private loadUserProfile(): void {
        const token = this.getToken();
        if (!token) return;

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<any>(`${this.apiUrl}/decode-token`, { headers })
            .subscribe({
                next: (userInfo) => {
                    const user: User = {
                        id: userInfo.sub,
                        email: userInfo.email,
                        roles: userInfo.roles || [],
                        permissions: userInfo.permissions || []
                    };

                    this.updateAuthState({ user });
                },
                error: (error) => {
                    // Don't logout on decode-token error to avoid infinite loop
                    // The AuthInterceptor will handle 401 errors and try to refresh
                    console.error('Failed to load user profile:', error);

                    // Just clear the user but keep authenticated state
                    // If token is truly invalid, other API calls will trigger proper logout
                    this.updateAuthState({
                        user: null,
                        error: 'Failed to load user profile'
                    });
                }
            });
    }

    private updateAuthState(updates: Partial<AuthState>): void {
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({ ...currentState, ...updates });
    }
}