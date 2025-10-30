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
    path: 'products',
    loadChildren: () =>
      loadRemoteModule('products', './routes').then(m => m.routes)
  },
  {
    path: '**',
    component: HomeComponent,
  }
];
