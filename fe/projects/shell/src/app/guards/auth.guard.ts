import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../../../../shared/src/app/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url, route.data['roles']);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url, route.data['roles']);
  }

  private checkAuth(url: string, requiredRoles?: string[]): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/login']);
          return false;
        }

        // If no roles required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        // Check if user has required roles
        // TODO: Implement role checking with backend
        return true;
      })
    );
  }
}

