import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService, GoogleOAuthService } from '../../../../shared/src/app/auth';

@Component({
    selector: 'app-shell-oauth-callback',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="callback-container">
      <div class="callback-content">
        <div class="spinner"></div>
        <h2>{{ message }}</h2>
        <p *ngIf="error" class="error">{{ error }}</p>
      </div>
    </div>
  `,
    styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .callback-content {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    h2 {
      color: #1f2937;
      margin-bottom: 10px;
    }

    .error {
      color: #ef4444;
      font-weight: 500;
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
    message = 'Processing authentication...';
    error: string | null = null;

    constructor(
        private authService: AuthService,
        private googleOAuthService: GoogleOAuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.handleOAuthCallback();
    }

    private handleOAuthCallback(): void {
        const code = this.googleOAuthService.extractCodeFromUrl();

        if (code) {
            this.message = 'Authenticating with Google...';

            this.authService.googleAuth(code).subscribe({
                next: () => {
                    this.message = 'Authentication successful! Redirecting...';
                    setTimeout(() => {
                        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
                        localStorage.removeItem('redirectUrl');
                        this.router.navigate([redirectUrl]);
                    }, 1500);
                },
                error: (error) => {
                    this.error = 'Authentication failed. Please try again.';
                    console.error('OAuth callback error:', error);
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 3000);
                }
            });
        } else {
            this.error = 'No authorization code received.';
            setTimeout(() => {
                this.router.navigate(['/login']);
            }, 3000);
        }
    }
}