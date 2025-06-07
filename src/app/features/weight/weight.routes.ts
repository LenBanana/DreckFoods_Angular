import { Routes } from '@angular/router';

export const weightRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./weight-tracker/weight-tracker.component').then(m => m.WeightTrackerComponent)
  }
];
