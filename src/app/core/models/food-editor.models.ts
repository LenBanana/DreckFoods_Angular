export interface FddbFoodUpdateDTO {
  name?: string;
  url?: string;
  description?: string;
  imageUrl?: string;
  brand?: string;
  ean?: string;
  tags?: string[];
}

export interface FddbFoodNutritionUpdateDTO {
  // Kilojoules
  kilojoulesValue?: number;
  kilojoulesUnit?: string;

  // Calories
  caloriesValue?: number;
  caloriesUnit?: string;

  // Protein
  proteinValue?: number;
  proteinUnit?: string;

  // Fat
  fatValue?: number;
  fatUnit?: string;

  // Carbohydrates
  carbohydratesTotalValue?: number;
  carbohydratesTotalUnit?: string;
  carbohydratesSugarValue?: number;
  carbohydratesSugarUnit?: string;
  carbohydratesPolyolsValue?: number;
  carbohydratesPolyolsUnit?: string;

  // Fiber
  fiberValue?: number;
  fiberUnit?: string;

  // Minerals
  saltValue?: number;
  saltUnit?: string;
  ironValue?: number;
  ironUnit?: string;
  zincValue?: number;
  zincUnit?: string;
  magnesiumValue?: number;
  magnesiumUnit?: string;
  chlorideValue?: number;
  chlorideUnit?: string;
  manganeseValue?: number;
  manganeseUnit?: string;
  sulfurValue?: number;
  sulfurUnit?: string;
  potassiumValue?: number;
  potassiumUnit?: string;
  calciumValue?: number;
  calciumUnit?: string;
  phosphorusValue?: number;
  phosphorusUnit?: string;
  copperValue?: number;
  copperUnit?: string;  fluorideValue?: number;
  fluorideUnit?: string;
  iodineValue?: number;
  iodineUnit?: string;
  caffeineValue?: number;
  caffeineUnit?: string;
}

export interface FddbFoodCompleteUpdateDTO {
  foodInfo?: FddbFoodUpdateDTO;
  nutrition?: FddbFoodNutritionUpdateDTO;
}

export interface FoodEditorResponse {
  success: boolean;
  message: string;
}
