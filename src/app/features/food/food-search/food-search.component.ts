import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FoodSearchDto } from '../../../core/models/food.models';
import { AddFoodModalComponent } from '../add-food-modal/add-food-modal.component';
import { FoodSearchContainerComponent, FoodSearchConfig } from '../../../shared/components/food-search-container/food-search-container.component';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [
    CommonModule,
    AddFoodModalComponent,
    FoodSearchContainerComponent
  ],
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent {
  selectedFood: FoodSearchDto | null = null;

  searchConfig: FoodSearchConfig = {
    placeholder: 'Search for food or scan barcode...',
    showBarcodeScanner: true,
    layout: 'grid',
    pageSize: 6,
    possiblePageSizes: [3, 6, 9, 15, 21, 30],
    showSearchOptions: true,
    showLayoutOptions: true,
    showRecentFoods: true,
    showResultsHeader: true,
    showPagination: true,
    showImages: true,
    showNutrition: true,
    showBrand: true,
    showTags: true,
    actionButtonText: 'Add',
    actionButtonIcon: 'fas fa-plus',
    emptySearchMessage: 'No foods found for your search',
    emptyRecentMessage: 'No recently eaten foods',
    emptySearchIcon: 'fas fa-search',
    emptyRecentIcon: 'fas fa-history',
    initialStateMessage: 'Enter a food name above or scan a barcode to find nutrition information.',
    initialStateIcon: 'fas fa-apple-alt'
  };

  // Event handlers
  onFoodSelected(food: FoodSearchDto) {
    this.openAddFoodModal(food);
  }

  onSearchError(error: string) {
    // Handle search errors if needed - could show notifications, etc.
    console.error('Search error:', error);
  }

  onSearchStateChange(state: { isSearching: boolean; isSearchMode: boolean; hasResults: boolean; currentQuery: string }) {
    // Handle search state changes if needed - could update URL params, analytics, etc.
    console.log('Search state changed:', state);
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
    // The container component will automatically refresh recent foods if needed
  }
}
