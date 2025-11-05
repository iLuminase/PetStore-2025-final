import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'shared/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Pet Store Login</h2>
        
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              [(ngModel)]="credentials.username" 
              required
              class="form-control"
              placeholder="Enter your username">
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required
              class="form-control"
              placeholder="Enter your password">
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              [disabled]="!loginForm.form.valid || loading"
              class="btn btn-primary">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
          
          <div class="oauth-section">
            <hr>
            <button 
              type="button" 
              (click)="googleLogin()" 
              [disabled]="loading"
              class="btn btn-google">
              Login with Google
            </button>
          </div>
        </form>
        
        <div class="error-message" *ngIf="error">
          {{ error }}
        </div>
        
        <div class="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> password</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
    }
    
    .form-actions {
      margin: 1.5rem 0;
    }
    
    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-primary {
      background-color: #667eea;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #5a67d8;
    }
    
    .btn-google {
      background-color: #db4437;
      color: white;
      margin-top: 0.5rem;
    }
    
    .btn-google:hover:not(:disabled) {
      background-color: #c23321;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .oauth-section hr {
      margin: 1rem 0;
      border: none;
      border-top: 1px solid #eee;
    }
    
    .error-message {
      color: #e53e3e;
      text-align: center;
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #fed7d7;
      border-radius: 5px;
    }
    
    .demo-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f7fafc;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
    }
    
    .demo-credentials h4 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 0.9rem;
    }
    
    .demo-credentials p {
      margin: 0.25rem 0;
      font-size: 0.85rem;
      color: #4a5568;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
    credentials = {
        username: '',
        password: ''
    };

    loading = false;
    error = '';
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // Check if already authenticated
        this.authService.authState$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(state => {
            if (state.isAuthenticated) {
                this.router.navigate(['/']);
            }
            this.loading = state.loading;
            this.error = state.error || '';
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    login() {
        if (!this.credentials.username || !this.credentials.password) {
            this.error = 'Please enter both username and password';
            return;
        }

        this.error = '';
        this.authService.login(this.credentials).subscribe({
            next: () => {
                // Redirect to saved URL or home
                const redirectUrl = localStorage.getItem('redirectUrl') || '/';
                localStorage.removeItem('redirectUrl');
                this.router.navigateByUrl(redirectUrl);
            },
            error: (error) => {
                console.error('Login failed:', error);
                this.error = error.error?.message || 'Login failed. Please check your credentials.';
            }
        });
    }

    googleLogin() {
        this.error = '';
        this.authService.getGoogleAuthUrl().subscribe({
            next: (response) => {
                window.location.href = response.authUrl;
            },
            error: (error) => {
                console.error('Google login failed:', error);
                this.error = 'Google login is not available at the moment.';
            }
        });
    }
}