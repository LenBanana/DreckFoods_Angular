export interface NutritionalValue {
  value: number;
  unit: string;
}

export interface CarbohydrateInfo {
  total: NutritionalValue;
  sugar: NutritionalValue;
  polyols: NutritionalValue;
}

export interface MineralInfo {
  salt: NutritionalValue;
  iron: NutritionalValue;
  zinc: NutritionalValue;
  magnesium: NutritionalValue;
  chloride: NutritionalValue;
  manganese: NutritionalValue;
  sulfur: NutritionalValue;
  potassium: NutritionalValue;
  calcium: NutritionalValue;
  phosphorus: NutritionalValue;
  copper: NutritionalValue;
  fluoride: NutritionalValue;
  iodine: NutritionalValue;
}

export interface NutritionInfo {
  kilojoules: NutritionalValue;
  calories: NutritionalValue;
  protein: NutritionalValue;
  fat: NutritionalValue;
  carbohydrates: CarbohydrateInfo;
  minerals: MineralInfo;
  fiber: NutritionalValue;
}

export interface FoodSearchDto {
  id: number;
  name: string;
  url: string;
  description: string;
  imageUrl: string;
  brand: string;
  tags: string[];
  nutrition: NutritionInfo;
}

export interface FoodSearchResponse {
  foods: FoodSearchDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateFoodEntryRequest {
  fddbFoodId: number;
  gramsConsumed: number;
  consumedAt: string;
}

export interface EditFoodEntryRequest {
  fddbFoodId: number;
  gramsConsumed: number;
}

export interface FoodEntryDto {
  id: number;
  foodName: string;
  foodUrl?: string;
  brand?: string;
  imageUrl?: string;
  gramsConsumed: number;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
  consumedAt: string;
  createdAt: string;
  editing?: boolean;
}
