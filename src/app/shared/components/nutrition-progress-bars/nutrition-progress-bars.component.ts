import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  NutritionProgressBarComponent,
  NutritionProgressConfig,
} from '../nutrition-progress-bar/nutrition-progress-bar.component';
import {NutritionData, NutritionTotals,} from '../../../core/models/food.models';

@Component({
  selector: 'app-nutrition-progress-bars',
  standalone: true,
  imports: [CommonModule, NutritionProgressBarComponent],
  templateUrl: './nutrition-progress-bars.component.html',
  styleUrls: ['./nutrition-progress-bars.component.scss'],
})
export class NutritionProgressBarsComponent {
  @Input() nutritionData!: NutritionData;
  @Input() totals!: NutritionTotals;
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() height: string = '6px';
  @Input() showValues: boolean = true;
  @Input() showLabels: boolean = true;

  get progressConfigs(): NutritionProgressConfig[] {
    const configs: NutritionProgressConfig[] = [
      {
        label: 'Calories',
        value: this.nutritionData.calories,
        total: this.totals.calories,
        unit: '',
        color: 'danger',
        show: this.nutritionData.calories > 0,
      },
      {
        label: 'Protein',
        value: this.nutritionData.protein,
        total: this.totals.protein,
        unit: 'g',
        color: 'success',
        show: this.nutritionData.protein > 0,
      },
      {
        label: 'Carbs',
        value: this.nutritionData.carbohydrates,
        total: this.totals.carbohydrates,
        unit: 'g',
        color: 'info',
        show: this.nutritionData.carbohydrates > 0,
      },
      {
        label: 'Fat',
        value: this.nutritionData.fat,
        total: this.totals.fat,
        unit: 'g',
        color: 'warning',
        show: this.nutritionData.fat > 0,
      },
      {
        label: 'Fiber',
        value: this.nutritionData.fiber,
        total: this.totals.fiber,
        unit: 'g',
        color: 'secondary',
        show: this.nutritionData.fiber > 0,
      },
      {
        label: 'Caffeine',
        value: this.nutritionData.caffeine,
        total: this.totals.caffeine,
        unit: 'mg',
        color: 'dark',
        show: this.nutritionData.caffeine > 0,
      },
      {
        label: 'Salt',
        value: this.nutritionData.salt,
        total: this.totals.salt,
        unit: 'g',
        color: 'light',
        show: this.nutritionData.salt > 0,
      },
    ];

    return configs;
  }

  get visibleConfigs(): NutritionProgressConfig[] {
    return this.progressConfigs.filter(
      (config) => config.show !== false && config.value > 0,
    );
  }

  hasAnyNutrients(): boolean {
    return this.visibleConfigs.length > 0;
  }
}
