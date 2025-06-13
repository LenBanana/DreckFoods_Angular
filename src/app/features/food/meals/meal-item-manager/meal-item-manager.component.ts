import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodSearchDto } from '../../../../core/models/food.models';
import {
  FoodSearchContainerComponent,
  FoodSearchConfig,
} from '../../../../shared/components/food-search-container/food-search-container.component';
import { AlertService } from '../../../../core/services/alert.service';

export interface MealItem {
  food: FoodSearchDto | null;
  weight: number;
}

@Component({
  selector: 'app-meal-item-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FoodSearchContainerComponent],
  templateUrl: './meal-item-manager.component.html',
  styleUrls: ['./meal-item-manager.component.scss'],
})
export class MealItemManagerComponent implements OnChanges {
  alertService = inject(AlertService);

  @Input() items: MealItem[] = [];
  @Input() showValidation = false;

  @Output() itemsChange = new EventEmitter<MealItem[]>();
  @Output() validationChange = new EventEmitter<boolean>();

  searchConfig: FoodSearchConfig = {
    placeholder: 'Search for foods to add to your meal...',
    showBarcodeScanner: true,
    layout: 'compact',
    pageSize: 6,
    possiblePageSizes: [3, 5, 10],
    showSearchOptions: true,
    showLayoutOptions: true,
    showRecentFoods: true,
    showResultsHeader: false,
    showPagination: true,
    showImages: true,
    showNutrition: true,
    showBrand: true,
    showTags: true,
    actionButtonText: 'Add',
    actionButtonIcon: 'fas fa-plus',
    emptySearchMessage: 'No foods found for your search',
    emptyRecentMessage: 'No recently added foods',
    emptySearchIcon: 'fas fa-search',
    emptyRecentIcon: 'fas fa-history',
    initialStateMessage:
      'Enter a food name above to search for foods to add to your meal.',
    initialStateIcon: 'fas fa-search',
  };

  ngOnChanges() {
    this.onItemChange();
  }

  onFoodSelected(food: FoodSearchDto) {
    this.items.push({ food, weight: 100 });
    this.onItemChange();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.onItemChange();
  }

  onItemChange() {
    this.itemsChange.emit(this.items);
    this.validationChange.emit(this.isValid);
  }

  getPercentage(weight: number): string {
    if (this.totalWeight === 0) return '0';
    return ((weight / this.totalWeight) * 100).toFixed(1);
  }

  get totalWeight(): number {
    return this.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  }

  get validationErrors(): string[] {
    const errors: string[] = [];

    const itemsWithoutFood = this.items.filter((item) => !item.food);
    if (itemsWithoutFood.length > 0) {
      errors.push(`${itemsWithoutFood.length} item(s) need a food selected`);
    }

    const itemsWithInvalidWeight = this.items.filter(
      (item) => !item.weight || item.weight <= 0,
    );
    if (itemsWithInvalidWeight.length > 0) {
      errors.push(
        `${itemsWithInvalidWeight.length} item(s) need a valid weight`,
      );
    }

    return errors;
  }

  get isValid(): boolean {
    return this.validationErrors.length === 0;
  }

  onSearchError(error: string) {
    console.error('Search error in meal manager:', error);
    this.alertService.error(
      'Failed to search for food items. Please try again later.',
    );
  }
}
