import { Injectable } from '@angular/core';
import { NutritionCardData } from '../components/nutrition-card/nutrition-card.component';

@Injectable({
  providedIn: 'root',
})
export class NutritionConfigService {
  getNutritionCardConfigs(): {
    [key: string]: Omit<NutritionCardData, 'value'>;
  } {
    return {
      calories: {
        label: 'Calories',
        icon: 'fas fa-fire',
        iconColor: 'text-calories',
        unit: '',
      },
      protein: {
        label: 'Protein',
        icon: 'fas fa-egg',
        iconColor: 'text-protein',
        unit: 'g',
      },
      fat: {
        label: 'Fat',
        icon: 'fas fa-bacon',
        iconColor: 'text-fat',
        unit: 'g',
      },
      carbohydrates: {
        label: 'Carbohydrates',
        icon: 'fas fa-bread-slice',
        iconColor: 'text-carbs',
        unit: 'g',
      },
      carbs: {
        label: 'Carbs',
        icon: 'fas fa-bread-slice',
        iconColor: 'text-carbs',
        unit: 'g',
      },
      fiber: {
        label: 'Fiber',
        icon: 'fas fa-leaf',
        iconColor: 'text-fiber',
        unit: 'g',
      },
      caffeine: {
        label: 'Caffeine',
        icon: 'fas fa-coffee',
        iconColor: 'text-caffeine',
        unit: 'mg',
      },
    };
  }

  createNutritionCard(type: string, value: number): NutritionCardData {
    const config = this.getNutritionCardConfigs()[type];
    if (!config) {
      throw new Error(`Unknown nutrition type: ${type}`);
    }

    return {
      ...config,
      value,
    };
  }
}
