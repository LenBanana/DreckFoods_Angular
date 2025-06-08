import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealResponseDTO } from '../../../../core/models/meal.models';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-meal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-card.component.html',
  styleUrls: ['./meal-card.component.scss']
})
export class MealCardComponent {
  private alertService = inject(AlertService);

  @Input() meal!: MealResponseDTO;
  @Input() isDeleting = false;

  @Output() edit = new EventEmitter<MealResponseDTO>();
  @Output() delete = new EventEmitter<MealResponseDTO>();
  @Output() logPortion = new EventEmitter<MealResponseDTO>();

  onEdit() {
    this.edit.emit(this.meal);
  }

  async onDelete() {
    const confirmed = await this.alertService.confirm({
      title: 'Delete Meal',
      message: `Are you sure you want to delete the meal "${this.meal.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmButtonType: 'danger',
      cancelLabel: 'Cancel',
    });

    if (confirmed) {
      this.delete.emit(this.meal);
    }
  }

  onLogPortion() {
    this.logPortion.emit(this.meal);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
