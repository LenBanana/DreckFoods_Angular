import {Component, EventEmitter, inject, Input, OnInit, Output,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {AddMealPortionDTO, MealResponseDTO,} from '../../../../core/models/meal.models';
import { formatLocalISO } from '../../../../core/extensions/date.extensions';

@Component({
  selector: 'app-meal-portion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meal-portion-modal.component.html',
  styleUrls: ['./meal-portion-modal.component.scss'],
})
export class MealPortionModalComponent implements OnInit {
  @Input() meal: MealResponseDTO | null = null;
  @Input() isSubmitting = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<AddMealPortionDTO>();
  portionForm: FormGroup;
  quickWeights = [50, 100, 150, 200, 250, 300, 500];
  private fb = inject(FormBuilder);

  constructor() {
    this.portionForm = this.fb.group({
      weight: [
        '',
        [Validators.required, Validators.min(1), Validators.max(9999)],
      ],
      consumedAt: [formatLocalISO(new Date()).slice(0, 16)],
    });
  }

  ngOnInit() {
    this.portionForm.patchValue({
      weight: this.meal ? this.meal.totalWeight || 100 : 100,
    });
  }

  setWeight(weight: number) {
    this.portionForm.patchValue({weight});
  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    if (this.portionForm.invalid || !this.meal) {
      return;
    }

    const portionData: AddMealPortionDTO = {
      mealId: this.meal.id,
      weight: this.portionForm.value.weight,
      consumedAt: this.portionForm.value.consumedAt + ':00.000Z',
    };

    this.submit.emit(portionData);
  }

  onClose() {
    this.close.emit();
  }

  getEstimatedCalories(): number {
    if (!this.meal || !this.portionForm.get('weight')?.value) return 0;
    const portionWeight = this.portionForm.get('weight')?.value;
    return Math.round((this.meal.nutrition.calories * portionWeight) / 100);
  }

  getEstimatedProtein(): number {
    if (!this.meal || !this.portionForm.get('weight')?.value) return 0;
    const portionWeight = this.portionForm.get('weight')?.value;
    return (
      Math.round(((this.meal.nutrition.protein * portionWeight) / 100) * 10) /
      10
    );
  }

  getEstimatedCarbs(): number {
    if (!this.meal || !this.portionForm.get('weight')?.value) return 0;
    const portionWeight = this.portionForm.get('weight')?.value;
    return (
      Math.round(
        ((this.meal.nutrition.carbohydrates * portionWeight) / 100) * 10,
      ) / 10
    );
  }

  getEstimatedFat(): number {
    if (!this.meal || !this.portionForm.get('weight')?.value) return 0;
    const portionWeight = this.portionForm.get('weight')?.value;
    return (
      Math.round(((this.meal.nutrition.fat * portionWeight) / 100) * 10) / 10
    );
  }
}
