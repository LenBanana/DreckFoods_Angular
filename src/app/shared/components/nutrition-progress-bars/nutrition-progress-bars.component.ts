import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionProgressBarComponent, NutritionProgressConfig } from '../nutrition-progress-bar/nutrition-progress-bar.component';
import { NutritionData, NutritionTotals } from '../../../core/models/food.models';


@Component({
  selector: 'app-nutrition-progress-bars',
  standalone: true,
  imports: [CommonModule, NutritionProgressBarComponent],
  templateUrl: './nutrition-progress-bars.component.html',
  styleUrls: ['./nutrition-progress-bars.component.scss']
})
export class NutritionProgressBarsComponent {
  @Input() nutritionData!: NutritionData;
  @Input() totals!: NutritionTotals;
  @Input() showSugar: boolean = false;
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() height: string = '6px';
  @Input() showValues: boolean = true;
  @Input() showLabels: boolean = true;

  get progressConfigs(): NutritionProgressConfig[] {
    const configs: NutritionProgressConfig[] = [
      {
        label: 'Calories',
        value: this.nutritionData.calories,
        total: this.totals.totalCalories,
        unit: '',
        color: 'danger',
        show: this.nutritionData.calories > 0
      },
      {
        label: 'Protein',
        value: this.nutritionData.protein,
        total: this.totals.totalProtein,
        unit: 'g',
        color: 'success',
        show: this.nutritionData.protein > 0
      },
      {
        label: 'Carbs',
        value: this.nutritionData.carbohydrates,
        total: this.totals.totalCarbohydrates,
        unit: 'g',
        color: 'info',
        show: this.nutritionData.carbohydrates > 0
      },
      {
        label: 'Fat',
        value: this.nutritionData.fat,
        total: this.totals.totalFat,
        unit: 'g',
        color: 'warning',
        show: this.nutritionData.fat > 0
      },
      {
        label: 'Fiber',
        value: this.nutritionData.fiber,
        total: this.totals.totalFiber,
        unit: 'g',
        color: 'secondary',
        show: this.nutritionData.fiber > 0
      }, {
        label: 'Caffeine',
        value: this.nutritionData.caffeine,
        total: this.totals.totalCaffeine,
        unit: 'mg',
        color: 'dark',
        show: this.nutritionData.caffeine > 0
      }
    ];

    if (this.showSugar && this.nutritionData.sugar !== undefined && this.totals.totalSugar !== undefined) {
      configs.push({
        label: 'Sugar',
        value: this.nutritionData.sugar,
        total: this.totals.totalSugar,
        unit: 'g',
        color: 'primary',
        show: this.nutritionData.sugar > 0
      });
    }

    return configs;
  }

  get visibleConfigs(): NutritionProgressConfig[] {
    return this.progressConfigs.filter(config => config.show !== false && config.value > 0);
  }

  hasAnyNutrients(): boolean {
    return this.visibleConfigs.length > 0;
  }
}
