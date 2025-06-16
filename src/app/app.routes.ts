import {Routes} from '@angular/router';

import {authGuard, noAuthGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth/confirm-email',
    loadComponent: () =>
      import('./features/auth/confirm-email/confirm-email.component').then(
        (m) => m.ConfirmEmailComponent,
      ),
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'food',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/food/food.routes').then((m) => m.foodRoutes),
  },
  {
    path: 'weight',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/weight/weight.routes').then((m) => m.weightRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: 'test-alerts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./test-alerts.component').then((m) => m.TestAlertsComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
