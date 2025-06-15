import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MealItem, MealItemManagerComponent, } from '../meal-item-manager/meal-item-manager.component';
import { CreateMealDTO, MealItemDTO, MealResponseDTO, } from '../../../../core/models/meal.models';
import { FoodService } from '../../../../core/services/food.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-meal-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MealItemManagerComponent],
  templateUrl: './meal-form-modal.component.html',
  styleUrls: ['./meal-form-modal.component.scss'],
})
export class MealFormModalComponent implements OnInit {
  @Input() meal: MealResponseDTO | null = null;
  @Input() isSubmitting = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateMealDTO>();
  mealForm: FormGroup;
  mealItems: MealItem[] = [];
  isItemsValid = false;
  showValidation = false;
  private fb = inject(FormBuilder);
  private foodService = inject(FoodService);

  constructor() {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  get isEdit(): boolean {
    return !!this.meal;
  }

  get isFormInvalid(): boolean {
    return (
      this.mealForm.invalid || !this.isItemsValid || this.mealItems.length === 0
    );
  }

  get calculatedNutrition() {
    if (!this.mealItems || this.mealItems.length === 0) return null;

    const totalNutrition = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: {
        total: 0,
        sugar: 0,
        polyols: 0,
      },
      minerals: {
        salt: 0,
        iron: 0,
        zinc: 0,
        magnesium: 0,
        chloride: 0,
        manganese: 0,
        sulfur: 0,
        potassium: 0,
        calcium: 0,
        phosphorus: 0,
        copper: 0,
        fluoride: 0,
        iodine: 0,
      },
      fiber: 0,
      caffeine: 0,
      salt: 0,
    };

    this.mealItems.forEach((item) => {
      if (item.food) {
        totalNutrition.calories +=
          item.food.nutrition.calories.value * (item.weight / 100);
        totalNutrition.protein +=
          item.food.nutrition.protein.value * (item.weight / 100);
        totalNutrition.fat +=
          item.food.nutrition.fat.value * (item.weight / 100);
        totalNutrition.carbohydrates.total +=
          item.food.nutrition.carbohydrates.total.value * (item.weight / 100);
        totalNutrition.carbohydrates.sugar +=
          item.food.nutrition.carbohydrates.sugar.value * (item.weight / 100);
        totalNutrition.carbohydrates.polyols +=
          item.food.nutrition.carbohydrates.polyols.value * (item.weight / 100);

        (
          Object.keys(item.food.nutrition.minerals) as Array<
            keyof typeof totalNutrition.minerals
          >
        ).forEach((key) => {
          if (totalNutrition.minerals[key] !== undefined) {
            totalNutrition.minerals[key] +=
              (item.food?.nutrition.minerals[key].value ?? 0) *
              (item.weight / 100);
          }
        });

        totalNutrition.fiber +=
          item.food.nutrition.fiber.value * (item.weight / 100);
        totalNutrition.caffeine +=
          item.food.nutrition.caffeine?.value * (item.weight / 100);
        totalNutrition.salt +=
          item.food.nutrition.minerals.salt.value * (item.weight / 100);
      }
    });

    return totalNutrition;
  }
  ngOnInit() {
    if (this.meal) {
      this.mealForm.patchValue({
        name: this.meal.name,
        description: this.meal.description || '',
      });

      // Fetch nutritional data for all meal items
      const foodRequests = this.meal.items.map(item =>
        this.foodService.getFoodById(item.fddbFoodId)
      );

      if (foodRequests.length > 0) {
        forkJoin(foodRequests).subscribe(foods => {
          this.mealItems = this.meal!.items.map((item, index) => ({
            food: foods[index],
            weight: item.weight,
          }));
        });
      } else {
        this.mealItems = [];
      }
    } else {
      this.mealItems = [];
    }
  }

  onItemsChange(items: MealItem[]) {
    this.mealItems = items;

    if (items.length > 0) {
      this.showValidation = false;
    }
  }

  onValidationChange(isValid: boolean) {
    this.isItemsValid = isValid;
  }

  onSubmit() {
    if (this.isFormInvalid) {
      this.showValidation = true;
      return;
    }

    const mealData: CreateMealDTO = {
      name: this.mealForm.value.name,
      description: this.mealForm.value.description || undefined,
      items: this.mealItems.map(
        (item) =>
          ({
            fddbFoodId: item.food!.id,
            weight: item.weight,
          }) as MealItemDTO,
      ),
    };

    this.submit.emit(mealData);
  }
  onClose() {
    this.close.emit();
  }
}
