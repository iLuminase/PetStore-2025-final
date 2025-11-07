import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from '../../service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloak = inject(KeycloakService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = await keycloak.isLoggedIn();

  if (!isLoggedIn) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  // Check roles if route requires them
  const requiredRoles = route.data['roles'] as Array<string>;
  if (requiredRoles && requiredRoles.length > 0) {
    let hasRequiredRole = false;

    // Check for ADMIN or MANAGER roles specifically
    if (requiredRoles.includes('ADMIN') || requiredRoles.includes('MANAGER')) {
      hasRequiredRole = authService.isAdmin();
    } else {
      // For other roles, use standard role check
      const userRoles = keycloak.getUserRoles();
      hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    }

    if (!hasRequiredRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
