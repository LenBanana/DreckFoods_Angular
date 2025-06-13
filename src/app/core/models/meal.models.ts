export interface MealItemDTO {
  fddbFoodId: number;
  weight: number;
}

export interface CreateMealDTO {
  name: string;
  description?: string;
  items: MealItemDTO[];
}

export interface UpdateMealDTO {
  name?: string;
  description?: string;
  items?: MealItemDTO[];
}

export interface MealItemResponseDTO {
  id: number;
  fddbFoodId: number;
  foodName: string;
  weight: number;
  percentage: number;
}

export interface MealNutritionDTO {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
}

export interface MealResponseDTO {
  id: number;
  name: string;
  description?: string;
  items: MealItemResponseDTO[];
  totalWeight: number;
  nutrition: MealNutritionDTO;
  createdAt: string;
  updatedAt: string;
}

export interface AddMealPortionDTO {
  mealId: number;
  weight: number;
  consumedAt?: string;
}
