import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService, GoogleOAuthService } from '../../../../shared/src/app/auth';

@Component({
    selector: 'app-shell-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Welcome to PetStore</h2>
          <p>Sign in to your account</p>
        </div>

        <div class="login-content">
          <!-- Google Sign-In Button -->
          <button 
            type="button" 
            class="google-signin-btn"
            (click)="signInWithGoogle()"
            [disabled]="loading">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Traditional Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label for="username">Email or Username</label>
              <input 
                type="text" 
                id="username"
                formControlName="username"
                placeholder="Enter your email or username"
                [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              <div class="error-message" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                <span *ngIf="loginForm.get('username')?.errors?.['required']">Username is required</span>
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
              </div>
            </div>

            <button 
              type="submit" 
              class="login-btn"
              [disabled]="loginForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .login-header p {
      color: #6b7280;
      font-size: 16px;
    }

    .google-signin-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .google-signin-btn:hover:not(:disabled) {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .google-signin-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 20px 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: #6b7280;
      font-size: 14px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-group input {
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .login-btn {
      padding: 12px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .login-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: #ef4444;
      font-size: 14px;
      text-align: center;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    loading = false;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private googleOAuthService: GoogleOAuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        // Check if we're already authenticated
        this.authService.isAuthenticated()
            .pipe(takeUntil(this.destroy$))
            .subscribe(isAuthenticated => {
                if (isAuthenticated) {
                    this.redirectAfterLogin();
                }
            });

        // Initialize Google OAuth
        this.googleOAuthService.initializeOneTap();

        // Listen for auth state changes
        this.authService.authState$
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.loading = state.loading;
                this.error = state.error;

                if (state.isAuthenticated) {
                    this.redirectAfterLogin();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const credentials = this.loginForm.value;
            this.authService.login(credentials).subscribe({
                next: () => {
                    // Success is handled by the auth state subscription
                },
                error: (error) => {
                    console.error('Login failed:', error);
                }
            });
        }
    }

    signInWithGoogle(): void {
        this.googleOAuthService.signInWithRedirect();
    }

    private redirectAfterLogin(): void {
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');
        this.router.navigate([redirectUrl]);
    }
}