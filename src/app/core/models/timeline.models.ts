import {FoodEntryDto, NutritionTotals} from './food.models';
import {WeightEntryDto} from './weight.models';

export interface DailyTimelineDto extends NutritionTotals {
  date: string;
  foodEntries: FoodEntryDto[];
  weightEntry?: WeightEntryDto;
}

export interface TimelineResponse {
  days: DailyTimelineDto[];
  totalDays: number;
}
