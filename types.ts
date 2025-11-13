export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  image: string; // base64 data URL
  nutrition: NutritionInfo;
}

export interface UserProfile {
  gender?: 'Male' | 'Female';
  workoutsPerWeek?: string;
  goal?: 'Lose weight' | 'Maintain' | 'Gain weight';
  height?: number;
  weight?: number;
  birthDate?: { month: string; day: number; year: number };
  desiredWeight?: number;
  diet?: string;
  [key: string]: any;
}