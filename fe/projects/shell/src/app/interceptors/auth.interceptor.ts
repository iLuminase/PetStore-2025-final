import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private keycloakService: KeycloakService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Skip adding token for Keycloak endpoints
        if (request.url.includes('keycloak') || request.url.includes('auth/realms')) {
            return next.handle(request);
        }

        return from(this.keycloakService.getToken()).pipe(
            switchMap(token => {
                if (token) {
                    const clonedRequest = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    return next.handle(clonedRequest);
                }
                return next.handle(request);
            })
        );
    }
}