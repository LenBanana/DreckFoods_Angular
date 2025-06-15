import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MealResponseDTO} from '../../../../core/models/meal.models';
import {AlertService} from '../../../../core/services/alert.service';

@Component({
  selector: 'app-meal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-card.component.html',
  styleUrls: ['./meal-card.component.scss'],
})
export class MealCardComponent {
  @Input() meal!: MealResponseDTO;
  @Input() isDeleting = false;
  @Output() edit = new EventEmitter<MealResponseDTO>();
  @Output() delete = new EventEmitter<MealResponseDTO>();
  @Output() share = new EventEmitter<MealResponseDTO>();
  @Output() duplicate = new EventEmitter<MealResponseDTO>();
  @Output() logPortion = new EventEmitter<MealResponseDTO>();
  private alertService = inject(AlertService);

  onEdit() {
    this.edit.emit(this.meal);
  }

  onShare() {
    this.share.emit(this.meal);
  }

  onDuplicate() {
    this.alertService.confirm({
      title: 'Duplicate Meal',
      message: `Are you sure you want to duplicate the meal "${this.meal.name}"?`,
      confirmLabel: 'Duplicate',
      confirmButtonType: 'primary',
      cancelLabel: 'Cancel',
    }).then((confirmed) => {
      if (confirmed) {
        this.duplicate.emit(this.meal);
      }
    });
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
