import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, OnInit, Output,} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {catchError, of} from 'rxjs';

import {FoodSortBy, SortDirection,} from '../../../core/models/enums/sorting.models';
import {FoodSearchDto, FoodSearchResponse,} from '../../../core/models/food.models';
import {FoodService} from '../../../core/services/food.service';
import {FoodSearchInputComponent} from '../food-search-components/food-search-input/food-search-input.component';
import {FoodResultsLayout, FoodSearchResultsComponent,} from '../food-search-components/food-search-results/food-search-results.component';

@Component({
  selector: 'app-food-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FoodSearchInputComponent,
    FoodSearchResultsComponent
  ],
  templateUrl: './food-selector.component.html',
  styleUrls: ['./food-selector.component.scss'],
})
export class FoodSelectorComponent implements OnInit {
  @Input() title = 'Select Food';
  @Input() placeholder = 'Search for food or scan barcode...';
  @Input() showBarcodeScanner = true;
  @Input() showRecentFoods = true;
  @Input() showSortOptions = false;
  @Input() layout: FoodResultsLayout = 'list';
  @Input() pageSize = 10;
  @Input() actionButtonText = 'Add';
  @Input() actionButtonIcon = 'fas fa-plus';

  @Output() foodSelected = new EventEmitter<FoodSearchDto>();
  @Output() searchError = new EventEmitter<string>();
  searchResponse: FoodSearchResponse | null = null;
  recentFoods: FoodSearchDto[] = [];
  recentFoodsResponse: FoodSearchResponse | null = null;
  isSearching = false;
  isLoadingRecent = false;
  errorMessage = '';
  currentQuery = '';
  sortBy: FoodSortBy = FoodSortBy.Name;
  sortDirection: SortDirection = SortDirection.Ascending;
  sortByOptions = [
    {value: FoodSortBy.Name, label: 'Name'},
    {value: FoodSortBy.Calories, label: 'Calories'},
    {value: FoodSortBy.Protein, label: 'Protein'},
    {value: FoodSortBy.Carbs, label: 'Carbohydrates'},
    {value: FoodSortBy.Fat, label: 'Fat'},
    {value: FoodSortBy.Brand, label: 'Brand'},
  ];
  sortDirectionOptions = [
    {value: SortDirection.Ascending, label: 'Ascending'},
    {value: SortDirection.Descending, label: 'Descending'},
  ];
  private foodService = inject(FoodService);

  get hasSearchResults(): boolean {
    return (this.searchResponse?.foods?.length ?? 0) > 0;
  }

  get hasQuery(): boolean {
    return this.currentQuery.length > 0;
  }

  get showRecentSection(): boolean {
    return (
      this.showRecentFoods && !this.hasQuery && this.recentFoods.length > 0
    );
  }

  ngOnInit() {
    if (this.showRecentFoods) {
      this.loadRecentFoods();
    }
  }

  onSearchResults(response: FoodSearchResponse | null) {
    this.searchResponse = response;
  }

  onSearchError(error: string) {
    this.errorMessage = error;
    this.searchError.emit(error);
  }

  onIsSearching(isSearching: boolean) {
    this.isSearching = isSearching;
  }

  onSearchQuery(query: string) {
    this.currentQuery = query;
  }

  onFoodSelected(food: FoodSearchDto) {
    this.foodSelected.emit(food);
  }

  onPageChange(page: number) {
    if (!this.currentQuery) {
      this.loadRecentFoods(page);
      return;
    }

    this.isSearching = true;
    this.foodService
      .searchFoods(
        this.currentQuery,
        page,
        this.pageSize,
        this.sortBy,
        this.sortDirection,
      )
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Search failed. Please try again.';
          this.searchError.emit(this.errorMessage);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.searchResponse = results;
        }
        this.isSearching = false;
      });
  }

  onSortChange() {
    if (this.currentQuery) {
      this.performSearch();
    }
  }

  clearError() {
    this.errorMessage = '';
  }

  private performSearch() {
    if (!this.currentQuery) return;

    this.isSearching = true;
    this.foodService
      .searchFoods(
        this.currentQuery,
        1,
        this.pageSize,
        this.sortBy,
        this.sortDirection,
      )
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Search failed. Please try again.';
          this.searchError.emit(this.errorMessage);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.searchResponse = results;
        }
        this.isSearching = false;
      });
  }

  private loadRecentFoods(page: number = 1) {
    this.isLoadingRecent = true;
    this.foodService
      .getPastEatenFoods(page, this.pageSize)
      .pipe(
        catchError((error) => {
          console.error('Failed to load recent foods:', error);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.recentFoods = results.foods;
          this.recentFoodsResponse = results;
        }
        this.isLoadingRecent = false;
      });
  }
}
