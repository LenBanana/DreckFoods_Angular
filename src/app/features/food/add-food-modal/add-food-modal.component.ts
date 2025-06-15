import {Component, EventEmitter, inject, Input, OnInit, Output,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {catchError, of} from 'rxjs';

import {FoodService} from '../../../core/services/food.service';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';
import {FoodSearchDto} from '../../../core/models/food.models';
import { formatLocalISO } from '../../../core/extensions/date.extensions';
import { format } from 'date-fns';

@Component({
  selector: 'app-add-food-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './add-food-modal.component.html',
  styleUrls: ['./add-food-modal.component.scss'],
})
export class AddFoodModalComponent implements OnInit {
  @Input() food!: FoodSearchDto;
  @Output() close = new EventEmitter<void>();
  @Output() foodAdded = new EventEmitter<void>();
  addFoodForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  calculatedNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    caffeine: 0,
    sugar: 0,
  };
  private fb = inject(FormBuilder);
  private foodService = inject(FoodService);

  constructor() {
    this.addFoodForm = this.fb.group({
      gramsConsumed: [
        100,
        [Validators.required, Validators.min(0.1), Validators.max(10000)],
      ],
      consumedAt: [
        format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        Validators.required,
      ],
    });
  }

  ngOnInit() {
    this.calculateNutrition();
  }

  onAmountChange() {
    this.calculateNutrition();
  }

  onSubmit() {
    if (this.addFoodForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      var consumedAtValue = this.addFoodForm.get('consumedAt')?.value;
      var consumedAt = new Date(new Date(consumedAtValue).toISOString());
      // Ensure consumedAt is in ISO format
      var entryDate = formatLocalISO(consumedAt);

      const request = {
        fddbFoodId: this.food.id,
        gramsConsumed: this.addFoodForm.get('gramsConsumed')?.value,
        consumedAt: entryDate,
      };

      this.foodService
        .addFoodEntry(request)
        .pipe(
          catchError((error) => {
            this.errorMessage =
              error.error?.message ||
              'Failed to add food entry. Please try again.';
            this.isLoading = false;
            return of(null);
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.foodAdded.emit();
          }
          this.isLoading = false;
        });
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  private calculateNutrition() {
    const grams = this.addFoodForm.get('gramsConsumed')?.value || 0;
    const multiplier = grams / 100;

    this.calculatedNutrition = {
      calories: this.food.nutrition.calories.value * multiplier,
      protein: this.food.nutrition.protein.value * multiplier,
      carbs: this.food.nutrition.carbohydrates.total.value * multiplier,
      fat: this.food.nutrition.fat.value * multiplier,
      fiber: this.food.nutrition.fiber.value * multiplier,
      caffeine: this.food.nutrition.caffeine?.value
        ? this.food.nutrition.caffeine.value * multiplier
        : 0,
      sugar: this.food.nutrition.carbohydrates.sugar.value * multiplier,
    };
  }
}
