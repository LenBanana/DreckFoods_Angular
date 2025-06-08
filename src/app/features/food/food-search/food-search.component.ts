import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FoodService } from '../../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FoodSearchDto, FoodSearchResponse } from '../../../core/models/food.models';
import { AddFoodModalComponent } from '../add-food-modal/add-food-modal.component';
import { FoodSortBy, SortDirection } from '../../../core/models/enums/sorting.models';
import { catchError, of } from 'rxjs';
import { FoodSearchResultsComponent, FoodResultsLayout } from '../../../shared/components/food-search-results/food-search-results.component';
import { SearchOptionsComponent } from '../../../shared/components/search-options/search-options.component';
import { FoodSearchInputComponent } from '../../../shared/components/food-search-input/food-search-input.component';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    AddFoodModalComponent,
    SearchOptionsComponent,
    FoodSearchResultsComponent,
    FoodSearchInputComponent
  ],
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent implements OnInit {
  private foodService = inject(FoodService);

  // Search state
  searchResponse: FoodSearchResponse | null = null;
  pastEatenFoods: FoodSearchResponse | null = null;
  isSearching = false;
  isLoadingPastFoods = false;
  errorMessage = '';
  selectedFood: FoodSearchDto | null = null;
  currentQuery = '';
  isSearchMode = false;

  // Search options
  pageSize = 6;
  possiblePageSizes = [3, 6, 9, 15, 21, 30];
  sortBy: FoodSortBy = FoodSortBy.Name;
  sortDirection: SortDirection = SortDirection.Ascending;
  layout: FoodResultsLayout = 'grid';

  ngOnInit() {
    this.loadPastEatenFoods();
  }

  // Search handlers
  onSearchResults(response: FoodSearchResponse | null) {
    this.searchResponse = response;
    this.isSearchMode = !!response && !!this.currentQuery;
  }

  onSearchError(error: string) {
    this.errorMessage = error;
  }

  onIsSearching(isSearching: boolean) {
    this.isSearching = isSearching;
  }

  onSearchQuery(query: string) {
    this.currentQuery = query;
    if (!query) {
      this.isSearchMode = false;
      this.searchResponse = null;
    }
  }

  // Search options handlers
  onSortByChange(sortBy: FoodSortBy) {
    this.sortBy = sortBy;
    this.refreshResults();
  }

  onSortDirectionChange(sortDirection: SortDirection) {
    this.sortDirection = sortDirection;
    this.refreshResults();
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.refreshResults();
  }

  onLayoutChange(layout: FoodResultsLayout) {
    this.layout = layout;
  }

  // Results handlers
  onFoodSelected(food: FoodSearchDto) {
    this.openAddFoodModal(food);
  }

  onPageChange(page: number) {
    if (this.isSearchMode && this.currentQuery) {
      this.performSearch(this.currentQuery, page);
    } else {
      this.loadPastEatenFoods(page);
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  // Modal handlers
  openAddFoodModal(food: FoodSearchDto) {
    this.selectedFood = food;
  }

  closeAddFoodModal() {
    this.selectedFood = null;
  }

  onFoodAdded() {
    this.closeAddFoodModal();
    if (!this.isSearchMode) {
      this.loadPastEatenFoods();
    }
  }

  // Data loading
  private loadPastEatenFoods(page: number = 1) {
    this.isLoadingPastFoods = true;
    this.errorMessage = '';

    this.foodService.getPastEatenFoods(page, this.pageSize)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load past eaten foods. Please try again.';
          return of(null);
        })
      )
      .subscribe(results => {
        if (results) {
          this.pastEatenFoods = results;
        }
        this.isLoadingPastFoods = false;
      });
  }

  private performSearch(query: string, page: number = 1) {
    this.isSearching = true;
    this.errorMessage = '';

    this.foodService.searchFoods(query, page, this.pageSize, this.sortBy, this.sortDirection)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Search failed. Please try again.';
          return of(null);
        })
      )
      .subscribe(results => {
        if (results) {
          this.searchResponse = results;
        }
        this.isSearching = false;
      });
  }

  private refreshResults() {
    if (this.isSearchMode && this.currentQuery) {
      this.performSearch(this.currentQuery);
    } else {
      this.loadPastEatenFoods();
    }
  }

  // Utility methods
  clearError() {
    this.errorMessage = '';
  }

  getCurrentResults(): FoodSearchResponse | null {
    return this.isSearchMode ? this.searchResponse : this.pastEatenFoods;
  }

  isCurrentlyLoading(): boolean {
    return this.isSearchMode ? this.isSearching : this.isLoadingPastFoods;
  }

  get hasResults(): boolean {
    return !!this.getCurrentResults()?.foods?.length;
  }

  get showResults(): boolean {
    return (this.isSearchMode && !!this.searchResponse) || (!this.isSearchMode && !!this.pastEatenFoods);
  }
}
