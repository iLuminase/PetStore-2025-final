import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);

  const excludedUrls = ['/assets/', 'keycloak', '/protocol/openid-connect'];
  const shouldExclude = excludedUrls.some(url => req.url.includes(url));

  if (shouldExclude) {
    return next(req);
  }

  return from(keycloak.getToken()).pipe(
    switchMap(token => {
      if (token) {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(clonedReq);
      }
      return next(req);
    }),
    catchError(error => {
      if (error.status === 401) {
        console.error('401 Unauthorized - Redirecting to login...');
        keycloak.login();
      }
      return throwError(() => error);
    })
  );
};
