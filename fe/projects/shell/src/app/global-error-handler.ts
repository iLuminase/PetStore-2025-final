import { ErrorHandler, Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private keycloak: KeycloakService) { }

    handleError(error: any): void {
        console.error('Global error caught:', error);

        // Check if it's a Keycloak related error
        if (error?.message?.includes('keycloak') ||
            error?.message?.includes('token') ||
            error?.message?.includes('unauthorized') ||
            error?.status === 401) {

            console.log('Keycloak error detected - clearing session and redirecting to login');

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // Force logout and login
            this.keycloak.logout(window.location.origin);
        }
    }
}