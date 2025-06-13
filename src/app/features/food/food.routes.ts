import {Routes} from '@angular/router';
import {adminEditorGuard} from '../../core/guards/admin-editor.guard';

export const foodRoutes: Routes = [
  {
    path: 'search',
    loadComponent: () =>
      import('./food-search/food-search.component').then(
        (m) => m.FoodSearchComponent,
      ),
  },
  {
    path: 'entries',
    loadComponent: () =>
      import('./food-entries/food-entries.component').then(
        (m) => m.FoodEntriesComponent,
      ),
  },
  {
    path: 'meals',
    loadComponent: () =>
      import('./meals/meals.component').then((m) => m.MealsComponent),
  },
  {
    path: 'editor/:id',
    loadComponent: () =>
      import('./food-db-editor/food-db-editor.component').then(
        (m) => m.FoodDbEditorComponent,
      ),
    canActivate: [adminEditorGuard],
  },
  {
    path: '',
    redirectTo: 'entries',
    pathMatch: 'full',
  },
];
