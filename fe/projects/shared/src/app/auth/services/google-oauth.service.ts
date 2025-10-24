import { Injectable } from '@angular/core';

declare global {
    interface Window {
        google: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class GoogleOAuthService {
    private readonly googleClientId = '773273370469-snmfmgnpdfg8l328pppqeulf8ud9gc4r.apps.googleusercontent.com';
    private readonly redirectUri = 'http://localhost:4200/auth/callback';

    constructor() { }

    /**
     * Initialize Google Sign-In
     */
    loadGoogleScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.google) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google script'));
            document.head.appendChild(script);
        });
    }

    /**
     * Get Google Authorization URL for redirect
     */
    getAuthorizationUrl(): string {
        const params = new URLSearchParams({
            client_id: this.googleClientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Redirect to Google OAuth
     */
    signInWithRedirect(): void {
        window.location.href = this.getAuthorizationUrl();
    }

    /**
     * Initialize Google One Tap Sign-In
     */
    initializeOneTap(): Promise<void> {
        return this.loadGoogleScript().then(() => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: this.googleClientId,
                    callback: this.handleCredentialResponse.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: false
                });
            }
        });
    }

    /**
     * Show Google One Tap prompt
     */
    showOneTap(): void {
        if (window.google) {
            window.google.accounts.id.prompt();
        }
    }

    /**
     * Render Google Sign-In button
     */
    renderSignInButton(element: HTMLElement, options?: any): void {
        if (window.google) {
            window.google.accounts.id.renderButton(element, {
                theme: 'outline',
                size: 'large',
                width: '300',
                ...options
            });
        }
    }

    /**
     * Handle credential response from Google One Tap
     */
    private handleCredentialResponse(response: any): void {
        console.log('Google credential response:', response);
        // This would be handled differently - the JWT token from Google would need to be sent to your backend
        // For now, we'll use the redirect flow instead
    }

    /**
     * Extract authorization code from URL
     */
    extractCodeFromUrl(url: string = window.location.href): string | null {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('code');
    }

    /**
     * Check if current URL contains OAuth callback
     */
    isOAuthCallback(url: string = window.location.href): boolean {
        return url.includes('code=') && url.includes('auth/callback');
    }
}