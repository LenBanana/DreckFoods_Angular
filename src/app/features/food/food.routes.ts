import { Routes } from '@angular/router';

export const foodRoutes: Routes = [
  {
    path: 'search',
    loadComponent: () => import('./food-search/food-search.component').then(m => m.FoodSearchComponent)
  },
  {
    path: 'entries',
    loadComponent: () => import('./food-entries/food-entries.component').then(m => m.FoodEntriesComponent)
  },
  {
    path: '',
    redirectTo: 'entries',
    pathMatch: 'full'
  }
];