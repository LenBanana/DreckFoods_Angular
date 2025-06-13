import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MealItemManagerComponent,
  MealItem,
} from '../meal-item-manager/meal-item-manager.component';
import { FoodSearchDto } from '../../../../core/models/food.models';
import {
  MealResponseDTO,
  CreateMealDTO,
  MealItemDTO,
} from '../../../../core/models/meal.models';

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

  private fb = inject(FormBuilder);

  mealForm: FormGroup;
  mealItems: MealItem[] = [];
  isItemsValid = false;
  showValidation = false;

  constructor() {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  ngOnInit() {
    if (this.meal) {
      this.mealForm.patchValue({
        name: this.meal.name,
        description: this.meal.description || '',
      });

      this.mealItems = this.meal.items.map((item) => ({
        food: this.createFoodFromMealItem(item),
        weight: item.weight,
      }));
    } else {
      this.mealItems = [];
    }
  }

  private createFoodFromMealItem(item: any): FoodSearchDto {
    return {
      id: item.fddbFoodId,
      name: item.foodName,
      url: '',
      description: '',
      imageUrl: '',
      brand: '',
      tags: [],
      nutrition: {
        calories: { value: 0, unit: 'kcal' },
        protein: { value: 0, unit: 'g' },
        fat: { value: 0, unit: 'g' },
        carbohydrates: {
          total: { value: 0, unit: 'g' },
          sugar: { value: 0, unit: 'g' },
          polyols: { value: 0, unit: 'g' },
        },
        minerals: {
          salt: { value: 0, unit: 'g' },
          iron: { value: 0, unit: 'mg' },
          zinc: { value: 0, unit: 'mg' },
          magnesium: { value: 0, unit: 'mg' },
          chloride: { value: 0, unit: 'mg' },
          manganese: { value: 0, unit: 'mg' },
          sulfur: { value: 0, unit: 'mg' },
          potassium: { value: 0, unit: 'mg' },
          calcium: { value: 0, unit: 'mg' },
          phosphorus: { value: 0, unit: 'mg' },
          copper: { value: 0, unit: 'mg' },
          fluoride: { value: 0, unit: 'mg' },
          iodine: { value: 0, unit: 'mg' },
        },
        fiber: { value: 0, unit: 'g' },
        kilojoules: { value: 0, unit: 'kJ' },
        caffeine: { value: 0, unit: 'mg' },
      },
    } as FoodSearchDto;
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
      }
    });

    return totalNutrition;
  }
}
