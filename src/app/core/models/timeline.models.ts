import { FoodEntryDto } from './food.models';
import { WeightEntryDto } from './weight.models';

export interface DailyTimelineDto {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbohydrates: number;
  totalSugar: number;
  totalFiber: number;
  foodEntries: FoodEntryDto[];
  weightEntry?: WeightEntryDto;
}

export interface TimelineResponse {
  days: DailyTimelineDto[];
  totalDays: number;
}