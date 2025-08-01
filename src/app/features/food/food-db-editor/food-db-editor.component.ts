import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {FoodEditorService} from '../../../core/services/food-editor.service';
import {AlertService} from '../../../core/services/alert.service';
import {FoodSearchDto} from '../../../core/models/food.models';
import {
  FddbFoodCompleteUpdateDTO,
  FddbFoodNutritionUpdateDTO,
  FddbFoodUpdateDTO,
} from '../../../core/models/food-editor.models';

@Component({
  selector: 'app-food-db-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './food-db-editor.component.html',
  styleUrls: ['./food-db-editor.component.scss'],
})
export class FoodDbEditorComponent implements OnInit {
  private static readonly KILOJOULE_TO_CALORIE_FACTOR = 0.239;
  private static readonly CALORIE_TO_KILOJOULE_FACTOR = 4.184;
  private static readonly DECIMAL_PRECISION = 10;
  foodId: number | null = null;
  currentFood: FoodSearchDto | null = null;
  isLoading = false;
  isSaving = false;
  activeTab: 'info' | 'nutrition' = 'info';
  foodInfoForm: FormGroup;
  nutritionForm: FormGroup;
  private foodEditorService = inject(FoodEditorService);
  private alertService = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.foodInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      url: [''],
      description: [''],
      imageUrl: [''],
      brand: [''],
      ean: [''],
      tags: [''],
    });

    this.nutritionForm = this.fb.group({
      kilojoulesValue: [null, [Validators.min(0)]],
      kilojoulesUnit: ['kJ'],

      caloriesValue: [null, [Validators.min(0)]],
      caloriesUnit: ['kcal'],

      proteinValue: [null, [Validators.min(0)]],
      proteinUnit: ['g'],

      fatValue: [null, [Validators.min(0)]],
      fatUnit: ['g'],

      carbohydratesTotalValue: [null, [Validators.min(0)]],
      carbohydratesTotalUnit: ['g'],
      carbohydratesSugarValue: [null, [Validators.min(0)]],
      carbohydratesSugarUnit: ['g'],
      carbohydratesPolyolsValue: [null, [Validators.min(0)]],
      carbohydratesPolyolsUnit: ['g'],

      fiberValue: [null, [Validators.min(0)]],
      fiberUnit: ['g'],

      saltValue: [null, [Validators.min(0)]],
      saltUnit: ['g'],
      ironValue: [null, [Validators.min(0)]],
      ironUnit: ['mg'],
      zincValue: [null, [Validators.min(0)]],
      zincUnit: ['mg'],
      magnesiumValue: [null, [Validators.min(0)]],
      magnesiumUnit: ['mg'],
      chlorideValue: [null, [Validators.min(0)]],
      chlorideUnit: ['mg'],
      manganeseValue: [null, [Validators.min(0)]],
      manganeseUnit: ['mg'],
      sulfurValue: [null, [Validators.min(0)]],
      sulfurUnit: ['mg'],
      potassiumValue: [null, [Validators.min(0)]],
      potassiumUnit: ['mg'],
      calciumValue: [null, [Validators.min(0)]],
      calciumUnit: ['mg'],
      phosphorusValue: [null, [Validators.min(0)]],
      phosphorusUnit: ['mg'],
      copperValue: [null, [Validators.min(0)]],
      copperUnit: ['mg'],
      fluorideValue: [null, [Validators.min(0)]],
      fluorideUnit: ['mg'],
      iodineValue: [null, [Validators.min(0)]],
      iodineUnit: ['μg'],
      caffeineValue: [null, [Validators.min(0)]],
      caffeineUnit: ['mg'],
    });
  }

  onKilojoulesChange(): void {
    const kilojoulesValue = this.nutritionForm.get('kilojoulesValue')?.value;
    if (kilojoulesValue !== null && kilojoulesValue !== '') {
      const calories = this.convertKilojoulesToCalories(kilojoulesValue);
      this.nutritionForm
        .get('caloriesValue')
        ?.setValue(calories, {emitEvent: false});
    }
  }

  onCaloriesChange(): void {
    const caloriesValue = this.nutritionForm.get('caloriesValue')?.value;
    if (caloriesValue !== null && caloriesValue !== '') {
      const kilojoules = this.convertCaloriesToKilojoules(caloriesValue);
      this.nutritionForm
        .get('kilojoulesValue')
        ?.setValue(kilojoules, {emitEvent: false});
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.foodId = +params['id'];
      if (this.foodId) {
        this.loadFood();
      } else {
        this.router.navigate(['/food/search']);
      }
    });
  }

  setActiveTab(tab: 'info' | 'nutrition'): void {
    this.activeTab = tab;
  }

  onSubmitFoodInfo(): void {
    if (this.foodInfoForm.invalid || !this.foodId) return;

    this.isSaving = true;
    const updateDto = this.buildFoodInfoDto(this.foodInfoForm.value);

    this.foodEditorService.updateFoodInfo(this.foodId, updateDto).subscribe({
      next: () =>
        this.handleSubmitSuccess('Food information updated successfully'),
      error: (error) =>
        this.handleSubmitError('Failed to update food information', error),
    });
  }

  onSubmitNutrition(): void {
    if (this.nutritionForm.invalid || !this.foodId) return;

    this.isSaving = true;
    const formValue = this.nutritionForm.value;

    const updateDto: FddbFoodNutritionUpdateDTO = {
      kilojoulesValue: formValue.kilojoulesValue,
      kilojoulesUnit: formValue.kilojoulesUnit,
      caloriesValue: formValue.caloriesValue,
      caloriesUnit: formValue.caloriesUnit,
      proteinValue: formValue.proteinValue,
      proteinUnit: formValue.proteinUnit,
      fatValue: formValue.fatValue,
      fatUnit: formValue.fatUnit,
      carbohydratesTotalValue: formValue.carbohydratesTotalValue,
      carbohydratesTotalUnit: formValue.carbohydratesTotalUnit,
      carbohydratesSugarValue: formValue.carbohydratesSugarValue,
      carbohydratesSugarUnit: formValue.carbohydratesSugarUnit,
      carbohydratesPolyolsValue: formValue.carbohydratesPolyolsValue,
      carbohydratesPolyolsUnit: formValue.carbohydratesPolyolsUnit,
      fiberValue: formValue.fiberValue,
      fiberUnit: formValue.fiberUnit,
      saltValue: formValue.saltValue,
      saltUnit: formValue.saltUnit,
      ironValue: formValue.ironValue,
      ironUnit: formValue.ironUnit,
      zincValue: formValue.zincValue,
      zincUnit: formValue.zincUnit,
      magnesiumValue: formValue.magnesiumValue,
      magnesiumUnit: formValue.magnesiumUnit,
      chlorideValue: formValue.chlorideValue,
      chlorideUnit: formValue.chlorideUnit,
      manganeseValue: formValue.manganeseValue,
      manganeseUnit: formValue.manganeseUnit,
      sulfurValue: formValue.sulfurValue,
      sulfurUnit: formValue.sulfurUnit,
      potassiumValue: formValue.potassiumValue,
      potassiumUnit: formValue.potassiumUnit,
      calciumValue: formValue.calciumValue,
      calciumUnit: formValue.calciumUnit,
      phosphorusValue: formValue.phosphorusValue,
      phosphorusUnit: formValue.phosphorusUnit,
      copperValue: formValue.copperValue,
      copperUnit: formValue.copperUnit,
      fluorideValue: formValue.fluorideValue,
      fluorideUnit: formValue.fluorideUnit,
      iodineValue: formValue.iodineValue,
      iodineUnit: formValue.iodineUnit,
      caffeineValue: formValue.caffeineValue,
      caffeineUnit: formValue.caffeineUnit,
    };
    this.foodEditorService
      .updateFoodNutrition(this.foodId, updateDto)
      .subscribe({
        next: () =>
          this.handleSubmitSuccess(
            'Nutrition information updated successfully',
          ),
        error: (error) =>
          this.handleSubmitError(
            'Failed to update nutrition information',
            error,
          ),
      });
  }

  onSubmitComplete(): void {
    if (
      (this.foodInfoForm.invalid && this.nutritionForm.invalid) ||
      !this.foodId
    )
      return;

    this.isSaving = true;
    const foodInfoValue = this.foodInfoForm.value;
    const nutritionValue = this.nutritionForm.value;
    const updateDto: FddbFoodCompleteUpdateDTO = {
      foodInfo: this.foodInfoForm.valid
        ? this.buildFoodInfoDto(foodInfoValue)
        : undefined,
      nutrition: this.nutritionForm.valid
        ? {
          kilojoulesValue: nutritionValue.kilojoulesValue,
          kilojoulesUnit: nutritionValue.kilojoulesUnit,
          caloriesValue: nutritionValue.caloriesValue,
          caloriesUnit: nutritionValue.caloriesUnit,
          proteinValue: nutritionValue.proteinValue,
          proteinUnit: nutritionValue.proteinUnit,
          fatValue: nutritionValue.fatValue,
          fatUnit: nutritionValue.fatUnit,
          carbohydratesTotalValue: nutritionValue.carbohydratesTotalValue,
          carbohydratesTotalUnit: nutritionValue.carbohydratesTotalUnit,
          carbohydratesSugarValue: nutritionValue.carbohydratesSugarValue,
          carbohydratesSugarUnit: nutritionValue.carbohydratesSugarUnit,
          carbohydratesPolyolsValue: nutritionValue.carbohydratesPolyolsValue,
          carbohydratesPolyolsUnit: nutritionValue.carbohydratesPolyolsUnit,
          fiberValue: nutritionValue.fiberValue,
          fiberUnit: nutritionValue.fiberUnit,
          saltValue: nutritionValue.saltValue,
          saltUnit: nutritionValue.saltUnit,
          ironValue: nutritionValue.ironValue,
          ironUnit: nutritionValue.ironUnit,
          zincValue: nutritionValue.zincValue,
          zincUnit: nutritionValue.zincUnit,
          magnesiumValue: nutritionValue.magnesiumValue,
          magnesiumUnit: nutritionValue.magnesiumUnit,
          chlorideValue: nutritionValue.chlorideValue,
          chlorideUnit: nutritionValue.chlorideUnit,
          manganeseValue: nutritionValue.manganeseValue,
          manganeseUnit: nutritionValue.manganeseUnit,
          sulfurValue: nutritionValue.sulfurValue,
          sulfurUnit: nutritionValue.sulfurUnit,
          potassiumValue: nutritionValue.potassiumValue,
          potassiumUnit: nutritionValue.potassiumUnit,
          calciumValue: nutritionValue.calciumValue,
          calciumUnit: nutritionValue.calciumUnit,
          phosphorusValue: nutritionValue.phosphorusValue,
          phosphorusUnit: nutritionValue.phosphorusUnit,
          copperValue: nutritionValue.copperValue,
          copperUnit: nutritionValue.copperUnit,
          fluorideValue: nutritionValue.fluorideValue,
          fluorideUnit: nutritionValue.fluorideUnit,
          iodineValue: nutritionValue.iodineValue,
          iodineUnit: nutritionValue.iodineUnit,
          caffeineValue: nutritionValue.caffeineValue,
          caffeineUnit: nutritionValue.caffeineUnit,
        }
        : undefined,
    };
    this.foodEditorService
      .updateFoodComplete(this.foodId, updateDto)
      .subscribe({
        next: () => this.handleSubmitSuccess('Food data updated successfully'),
        error: (error) =>
          this.handleSubmitError('Failed to update food data', error),
      });
  }

  goBack(): void {
    this.router.navigate(['/food/search']);
  }

  private convertKilojoulesToCalories(kilojoules: number): number {
    return (
      Math.round(
        kilojoules *
        FoodDbEditorComponent.KILOJOULE_TO_CALORIE_FACTOR *
        FoodDbEditorComponent.DECIMAL_PRECISION,
      ) / FoodDbEditorComponent.DECIMAL_PRECISION
    );
  }

  private convertCaloriesToKilojoules(calories: number): number {
    return (
      Math.round(
        calories *
        FoodDbEditorComponent.CALORIE_TO_KILOJOULE_FACTOR *
        FoodDbEditorComponent.DECIMAL_PRECISION,
      ) / FoodDbEditorComponent.DECIMAL_PRECISION
    );
  }

  private loadFood(): void {
    if (!this.foodId) return;

    this.isLoading = true;
    this.foodEditorService.getFoodById(this.foodId).subscribe({
      next: (food) => {
        this.currentFood = food;
        this.populateForms(food);
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.error(
          'Failed to load food data',
          error.message || 'Unknown error occurred',
        );
        this.isLoading = false;
        this.router.navigate(['/food/search']);
      },
    });
  }

  private populateForms(food: FoodSearchDto): void {
    this.foodInfoForm.patchValue({
      name: food.name,
      url: food.url,
      description: food.description,
      imageUrl: food.imageUrl,
      brand: food.brand,
      ean: food.ean,
      tags: food.tags.join(', '),
    });

    const nutrition = food.nutrition;
    if (nutrition) {
      this.nutritionForm.patchValue({
        kilojoulesValue: nutrition.kilojoules?.value,
        kilojoulesUnit: nutrition.kilojoules?.unit || 'kJ',
        caloriesValue: nutrition.calories?.value,
        caloriesUnit: nutrition.calories?.unit || 'kcal',
        proteinValue: nutrition.protein?.value,
        proteinUnit: nutrition.protein?.unit || 'g',
        fatValue: nutrition.fat?.value,
        fatUnit: nutrition.fat?.unit || 'g',
        carbohydratesTotalValue: nutrition.carbohydrates?.total?.value,
        carbohydratesTotalUnit: nutrition.carbohydrates?.total?.unit || 'g',
        carbohydratesSugarValue: nutrition.carbohydrates?.sugar?.value,
        carbohydratesSugarUnit: nutrition.carbohydrates?.sugar?.unit || 'g',
        carbohydratesPolyolsValue: nutrition.carbohydrates?.polyols?.value,
        carbohydratesPolyolsUnit: nutrition.carbohydrates?.polyols?.unit || 'g',
        fiberValue: nutrition.fiber?.value,
        fiberUnit: nutrition.fiber?.unit || 'g',
        caffeineValue: nutrition.caffeine?.value,
        caffeineUnit: nutrition.caffeine?.unit || 'mg',
        saltValue: nutrition.minerals?.salt?.value,
        saltUnit: nutrition.minerals?.salt?.unit || 'g',
        ironValue: nutrition.minerals?.iron?.value,
        ironUnit: nutrition.minerals?.iron?.unit || 'mg',
        zincValue: nutrition.minerals?.zinc?.value,
        zincUnit: nutrition.minerals?.zinc?.unit || 'mg',
        magnesiumValue: nutrition.minerals?.magnesium?.value,
        magnesiumUnit: nutrition.minerals?.magnesium?.unit || 'mg',
        chlorideValue: nutrition.minerals?.chloride?.value,
        chlorideUnit: nutrition.minerals?.chloride?.unit || 'mg',
        manganeseValue: nutrition.minerals?.manganese?.value,
        manganeseUnit: nutrition.minerals?.manganese?.unit || 'mg',
        sulfurValue: nutrition.minerals?.sulfur?.value,
        sulfurUnit: nutrition.minerals?.sulfur?.unit || 'mg',
        potassiumValue: nutrition.minerals?.potassium?.value,
        potassiumUnit: nutrition.minerals?.potassium?.unit || 'mg',
        calciumValue: nutrition.minerals?.calcium?.value,
        calciumUnit: nutrition.minerals?.calcium?.unit || 'mg',
        phosphorusValue: nutrition.minerals?.phosphorus?.value,
        phosphorusUnit: nutrition.minerals?.phosphorus?.unit || 'mg',
        copperValue: nutrition.minerals?.copper?.value,
        copperUnit: nutrition.minerals?.copper?.unit || 'mg',
        fluorideValue: nutrition.minerals?.fluoride?.value,
        fluorideUnit: nutrition.minerals?.fluoride?.unit || 'mg',
        iodineValue: nutrition.minerals?.iodine?.value,
        iodineUnit: nutrition.minerals?.iodine?.unit || 'μg',
      });
    }
  }

  private buildFoodInfoDto(formValue: any): FddbFoodUpdateDTO {
    return {
      name: formValue.name,
      url: formValue.url || undefined,
      description: formValue.description || undefined,
      imageUrl: formValue.imageUrl || undefined,
      brand: formValue.brand || undefined,
      ean: formValue.ean || undefined,
      tags: formValue.tags
        ? formValue.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
        : undefined,
    };
  }

  private handleSubmitSuccess(message: string): void {
    this.alertService.success(message);
    this.isSaving = false;
    this.loadFood();
  }

  private handleSubmitError(errorMessage: string, error: any): void {
    this.alertService.error(
      errorMessage,
      error.message || 'Unknown error occurred',
    );
    this.isSaving = false;
  }
}
