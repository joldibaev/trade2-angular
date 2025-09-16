import { Routes } from '@angular/router';
import { hasAuthTokenGuard } from './core/guards/has-auth-token-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/core', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'core',
    canMatch: [hasAuthTokenGuard],
    loadChildren: () => import('./features/core/core.routes').then(m => m.routes),
  },
];
