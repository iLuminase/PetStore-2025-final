import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/oauth-callback.component').then(m => m.OAuthCallbackComponent)
  },
  {
    path: 'products',
    loadChildren: () =>
      loadRemoteModule('products', './routes').then(m => m.routes)
    // Removed canActivate: [AuthGuard] to allow public access
  },
  {
    path: '**',
    component: HomeComponent,
  }
];
