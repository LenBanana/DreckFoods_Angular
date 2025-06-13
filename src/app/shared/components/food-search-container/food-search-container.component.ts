import {Component, EventEmitter, inject, Input, OnInit, Output,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {catchError, of} from 'rxjs';

import {FoodService} from '../../../core/services/food.service';
import {FoodSearchDto, FoodSearchResponse,} from '../../../core/models/food.models';
import {FoodSortBy, SortDirection,} from '../../../core/models/enums/sorting.models';
import {FoodSearchInputComponent} from '../food-search-input/food-search-input.component';
import {FoodResultsLayout, FoodSearchResultsComponent,} from '../food-search-results/food-search-results.component';
import {SearchOptionsComponent} from '../search-options/search-options.component';

export interface FoodSearchConfig {
  placeholder?: string;
  showBarcodeScanner?: boolean;

  layout?: FoodResultsLayout;
  pageSize?: number;
  possiblePageSizes?: number[];

  showSearchOptions?: boolean;
  showLayoutOptions?: boolean;
  showRecentFoods?: boolean;
  showResultsHeader?: boolean;
  showPagination?: boolean;

  showImages?: boolean;
  showNutrition?: boolean;
  showBrand?: boolean;
  showTags?: boolean;

  actionButtonText?: string;
  actionButtonIcon?: string;

  emptySearchMessage?: string;
  emptyRecentMessage?: string;
  emptySearchIcon?: string;
  emptyRecentIcon?: string;
  initialStateMessage?: string;
  initialStateIcon?: string;
}

@Component({
  selector: 'app-food-search-container',
  standalone: true,
  imports: [
    CommonModule,
    FoodSearchInputComponent,
    FoodSearchResultsComponent,
    SearchOptionsComponent,
  ],
  templateUrl: './food-search-container.component.html',
  styleUrls: ['./food-search-container.component.scss'],
})
export class FoodSearchContainerComponent implements OnInit {
  @Input() config: FoodSearchConfig = {};

  @Output() foodSelected = new EventEmitter<FoodSearchDto>();
  @Output() searchError = new EventEmitter<string>();
  @Output() searchStateChange = new EventEmitter<{
    isSearching: boolean;
    isSearchMode: boolean;
    hasResults: boolean;
    currentQuery: string;
  }>();
  searchResponse: FoodSearchResponse | null = null;
  recentFoodsResponse: FoodSearchResponse | null = null;
  isSearching = false;
  isLoadingRecent = false;
  errorMessage = '';
  currentQuery = '';
  isSearchMode = false;
  sortBy: FoodSortBy = FoodSortBy.Name;
  sortDirection: SortDirection = SortDirection.Ascending;
  private foodService = inject(FoodService);

  get placeholder(): string {
    return this.config.placeholder || 'Search for food or scan barcode...';
  }

  get showBarcodeScanner(): boolean {
    return this.config.showBarcodeScanner ?? true;
  }

  get layout(): FoodResultsLayout {
    return this.config.layout || 'list';
  }

  get pageSize(): number {
    return this.config.pageSize || 6;
  }

  get possiblePageSizes(): number[] {
    return this.config.possiblePageSizes || [6, 12, 18, 24, 30];
  }

  get showSearchOptions(): boolean {
    return this.config.showSearchOptions ?? true;
  }

  get showLayoutOptions(): boolean {
    return this.config.showLayoutOptions ?? true;
  }

  get showRecentFoods(): boolean {
    return this.config.showRecentFoods ?? true;
  }

  get showResultsHeader(): boolean {
    return this.config.showResultsHeader ?? true;
  }

  get showPagination(): boolean {
    return this.config.showPagination ?? true;
  }

  get showImages(): boolean {
    return this.config.showImages ?? true;
  }

  get showNutrition(): boolean {
    return this.config.showNutrition ?? true;
  }

  get showBrand(): boolean {
    return this.config.showBrand ?? true;
  }

  get showTags(): boolean {
    return this.config.showTags ?? true;
  }

  get actionButtonText(): string {
    return this.config.actionButtonText || 'Add';
  }

  get actionButtonIcon(): string {
    return this.config.actionButtonIcon || 'fas fa-plus';
  }

  get emptySearchMessage(): string {
    return this.config.emptySearchMessage || 'No foods found for your search';
  }

  get emptyRecentMessage(): string {
    return this.config.emptyRecentMessage || 'No recently added foods';
  }

  get emptySearchIcon(): string {
    return this.config.emptySearchIcon || 'fas fa-search';
  }

  get emptyRecentIcon(): string {
    return this.config.emptyRecentIcon || 'fas fa-history';
  }

  get initialStateMessage(): string {
    return (
      this.config.initialStateMessage ||
      'Enter a food name above or scan a barcode to find foods.'
    );
  }

  get initialStateIcon(): string {
    return this.config.initialStateIcon || 'fas fa-search';
  }

  get hasResults(): boolean {
    return !!this.getCurrentResults()?.foods?.length;
  }

  get showResults(): boolean {
    return (
      (this.isSearchMode && !!this.searchResponse) ||
      (!this.isSearchMode && this.showRecentFoods && !!this.recentFoodsResponse)
    );
  }

  get hasQuery(): boolean {
    return this.currentQuery.length > 0;
  }

  get showRecentSection(): boolean {
    return (
      this.showRecentFoods &&
      !this.hasQuery &&
      !!this.recentFoodsResponse?.foods?.length
    );
  }

  get showInitialState(): boolean {
    return (
      !this.hasQuery &&
      (!this.showRecentFoods || !this.recentFoodsResponse?.foods?.length) &&
      !this.isLoadingRecent
    );
  }

  get currentEmptyMessage(): string {
    return this.isSearchMode
      ? this.emptySearchMessage
      : this.emptyRecentMessage;
  }

  get currentEmptyIcon(): string {
    return this.isSearchMode ? this.emptySearchIcon : this.emptyRecentIcon;
  }

  ngOnInit() {
    if (this.showRecentFoods) {
      this.loadRecentFoods();
    }
    this.emitStateChange();
  }

  onSearchResults(response: FoodSearchResponse | null) {
    this.searchResponse = response;
    this.isSearchMode = !!response && !!this.currentQuery;
    this.emitStateChange();
  }

  onSearchErrorEvent(error: string) {
    this.errorMessage = error;
    this.searchError.emit(error);
    this.emitStateChange();
  }

  onIsSearching(isSearching: boolean) {
    this.isSearching = isSearching;
    this.emitStateChange();
  }

  onSearchQuery(query: string) {
    this.currentQuery = query;
    if (!query) {
      this.isSearchMode = false;
      this.searchResponse = null;
    }
    this.emitStateChange();
  }

  onSortByChange(sortBy: FoodSortBy) {
    this.sortBy = sortBy;
    this.refreshResults();
  }

  onSortDirectionChange(sortDirection: SortDirection) {
    this.sortDirection = sortDirection;
    this.refreshResults();
  }

  onPageSizeChange(pageSize: number) {
    this.config.pageSize = pageSize;
    this.refreshResults();
  }

  onLayoutChange(layout: FoodResultsLayout) {
    this.config.layout = layout;
  }

  onFoodSelected(food: FoodSearchDto) {
    this.foodSelected.emit(food);
  }

  onPageChange(page: number) {
    if (this.isSearchMode && this.currentQuery) {
      this.performSearch(this.currentQuery, page);
    } else if (this.showRecentFoods) {
      this.loadRecentFoods(page);
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  clearError() {
    this.errorMessage = '';
  }

  getCurrentResults(): FoodSearchResponse | null {
    return this.isSearchMode ? this.searchResponse : this.recentFoodsResponse;
  }

  isCurrentlyLoading(): boolean {
    return this.isSearchMode ? this.isSearching : this.isLoadingRecent;
  }

  private loadRecentFoods(page: number = 1) {
    this.isLoadingRecent = true;
    this.errorMessage = '';

    this.foodService
      .getPastEatenFoods(page, this.pageSize)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load recent foods. Please try again.';
          this.searchError.emit(this.errorMessage);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.recentFoodsResponse = results;
        }
        this.isLoadingRecent = false;
        this.emitStateChange();
      });
  }

  private performSearch(query: string, page: number = 1) {
    this.isSearching = true;
    this.errorMessage = '';

    this.foodService
      .searchFoods(query, page, this.pageSize, this.sortBy, this.sortDirection)
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
        this.emitStateChange();
      });
  }

  private refreshResults() {
    if (this.isSearchMode && this.currentQuery) {
      this.performSearch(this.currentQuery);
    } else if (this.showRecentFoods) {
      this.loadRecentFoods();
    }
  }

  private emitStateChange() {
    this.searchStateChange.emit({
      isSearching: this.isCurrentlyLoading(),
      isSearchMode: this.isSearchMode,
      hasResults: this.hasResults,
      currentQuery: this.currentQuery,
    });
  }
}
