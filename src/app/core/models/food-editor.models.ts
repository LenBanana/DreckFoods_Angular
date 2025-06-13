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
  kilojoulesValue?: number;
  kilojoulesUnit?: string;

  caloriesValue?: number;
  caloriesUnit?: string;

  proteinValue?: number;
  proteinUnit?: string;

  fatValue?: number;
  fatUnit?: string;

  carbohydratesTotalValue?: number;
  carbohydratesTotalUnit?: string;
  carbohydratesSugarValue?: number;
  carbohydratesSugarUnit?: string;
  carbohydratesPolyolsValue?: number;
  carbohydratesPolyolsUnit?: string;

  fiberValue?: number;
  fiberUnit?: string;

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
  copperUnit?: string;
  fluorideValue?: number;
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
