import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodSearchDto } from '../../../../core/models/food.models';
import { FoodSelectorComponent } from '../../../../shared/components/food-selector/food-selector.component';

export interface MealItem {
  food: FoodSearchDto | null;
  weight: number;
}

@Component({
  selector: 'app-meal-item-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FoodSelectorComponent],
  templateUrl: './meal-item-manager.component.html',
  styleUrls: ['./meal-item-manager.component.scss']
})
export class MealItemManagerComponent implements OnChanges {
  @Input() items: MealItem[] = [];
  @Input() showValidation = false;

  @Output() itemsChange = new EventEmitter<MealItem[]>();
  @Output() validationChange = new EventEmitter<boolean>();

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

    const itemsWithoutFood = this.items.filter(item => !item.food);
    if (itemsWithoutFood.length > 0) {
      errors.push(`${itemsWithoutFood.length} item(s) need a food selected`);
    }

    const itemsWithInvalidWeight = this.items.filter(item => !item.weight || item.weight <= 0);
    if (itemsWithInvalidWeight.length > 0) {
      errors.push(`${itemsWithInvalidWeight.length} item(s) need a valid weight`);
    }

    return errors;
  }

  get isValid(): boolean {
    return this.validationErrors.length === 0;
  }
}
