import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {catchError, of} from 'rxjs';

import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';
import {MealCardComponent} from './meal-card/meal-card.component';
import {MealFormModalComponent} from './meal-form-modal/meal-form-modal.component';
import {MealPortionModalComponent} from './meal-portion-modal/meal-portion-modal.component';
import {AddMealPortionDTO, CreateMealDTO, MealResponseDTO,} from '../../../core/models/meal.models';
import {MealService} from '../../../core/services/meal.service';
import {AlertService} from '../../../core/services/alert.service';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    MealCardComponent,
    MealFormModalComponent,
    MealPortionModalComponent,
  ],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
})
export class MealsComponent implements OnInit {
  meals: MealResponseDTO[] = [];
  isLoading = true;
  errorMessage = '';
  showCreateModal = false;
  showEditModal = false;
  showPortionModal = false;
  selectedMeal: MealResponseDTO | null = null;
  isCreating = false;
  isUpdating = false;
  isLoggingPortion = false;
  deletingMealId: number | null = null;
  private mealService = inject(MealService);
  private alertService = inject(AlertService);

  ngOnInit() {
    this.loadMeals();
  }

  loadMeals() {
    this.isLoading = true;
    this.errorMessage = '';

    this.mealService
      .getMeals()
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load meals. Please try again.';
          this.isLoading = false;
          return of([]);
        }),
      )
      .subscribe((meals) => {
        this.meals = meals;
        this.isLoading = false;
      });
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  openEditModal(meal: MealResponseDTO) {
    this.selectedMeal = meal;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedMeal = null;
  }

  openPortionModal(meal: MealResponseDTO) {
    this.selectedMeal = meal;
    this.showPortionModal = true;
  }

  closePortionModal() {
    this.showPortionModal = false;
    this.selectedMeal = null;
  }

  createMeal(mealData: CreateMealDTO) {
    if (!mealData || !mealData.name || !mealData.items) {
      return;
    }

    this.isCreating = true;
    this.mealService
      .createMeal(mealData)
      .pipe(
        catchError((error) => {
          this.alertService.error('Failed to create meal. Please try again.');
          this.isCreating = false;
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.loadMeals();
          this.closeCreateModal();
        }
        this.isCreating = false;
      });
  }

  updateMeal(mealData: CreateMealDTO) {
    if (!this.selectedMeal) return;

    this.isUpdating = true;
    this.mealService
      .updateMeal(this.selectedMeal.id, mealData)
      .pipe(
        catchError((error) => {
          this.alertService.error('Failed to update meal. Please try again.');
          this.isUpdating = false;
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.loadMeals();
          this.closeEditModal();
        }
        this.isUpdating = false;
      });
  }

  shareMeal(meal: MealResponseDTO) {
    this.mealService
      .getMealShareId(meal.id)
      .pipe(
        catchError((error) => {
          console.error('Error getting share ID:', error);
          this.alertService.error('Failed to get share ID. Please try again.');
          return of(null);
        }),
      )
      .subscribe((shareId) => {
        if (shareId) {
          this.alertService.successExtraLarge(
            `Meal "${meal.name}" can be shared using ID:\n${shareId}`,
            'Share ID',
            {
              autoDismiss: false,
              centered: true,
            },
          );
        }
      });
  }

  async addMealByShareId() {
    const shareId = await this.alertService.prompt({
      title: 'Add Meal by Share ID',
      message: 'Please enter the share ID of the meal you want to add:',
      placeholder: 'Enter share ID',
      required: true,
      confirmLabel: 'Add Meal',
      cancelLabel: 'Cancel',
      inputType: 'text',
      validation: (value: string) => {
        if (!value.trim()) {
          return 'Share ID cannot be empty.';
        }
        return null;
      },
    });

    if (!shareId) {
      this.alertService.error('Share ID cannot be empty.');
      return;
    }
    this.isCreating = true;

    this.mealService
      .addMealByShareId(shareId)
      .pipe(
        catchError((error) => {
          console.error('Error adding meal by share ID:', error);
          this.alertService.error(
            'Failed to add meal by share ID. Please try again.',
          );
          this.isCreating = false;
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.loadMeals();
          this.closeCreateModal();
        }
        this.isCreating = false;
      });
  }

  deleteMeal(meal: MealResponseDTO) {
    this.deletingMealId = meal.id;
    this.mealService
      .deleteMeal(meal.id)
      .pipe(
        catchError((error) => {
          this.alertService.error('Failed to delete meal. Please try again.');
          this.deletingMealId = null;
          return of(null);
        }),
      )
      .subscribe((response) => {
        this.meals = this.meals.filter((m) => m.id !== meal.id);
        this.deletingMealId = null;
      });
  }

  addMealPortion(portionData: AddMealPortionDTO) {
    if (!portionData || !portionData.mealId) {
      return;
    }

    this.isLoggingPortion = true;
    this.mealService
      .addMealPortion(portionData)
      .pipe(
        catchError((error) => {
          console.error('Error adding meal portion:', error);
          this.alertService.error(
            'Failed to add meal portion. Please try again.',
          );
          this.isLoggingPortion = false;
          return of([]);
        }),
      )
      .subscribe((entries) => {
        if (entries.length > 0) {
          this.closePortionModal();
          this.alertService.success(
            `Successfully added ${entries.length} food entries from this meal!`,
          );
        }
        this.isLoggingPortion = false;
      });
  }

  trackByMealId(index: number, meal: MealResponseDTO): number {
    return meal.id;
  }

  clearError() {
    this.errorMessage = '';
  }
}
