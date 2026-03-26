// Enums matching Prisma schema

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum MealSlot {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK',
}

export enum Goal {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  MAINTENANCE = 'MAINTENANCE',
  GENERAL_HEALTH = 'GENERAL_HEALTH',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum IngredientCategory {
  PRODUCE = 'PRODUCE',
  PROTEIN = 'PROTEIN',
  DAIRY = 'DAIRY',
  PANTRY = 'PANTRY',
  FROZEN = 'FROZEN',
  SPICES = 'SPICES',
  OTHER = 'OTHER',
}

// Shared types

export type MacroInfo = {
  protein: number
  carbs: number
  fat: number
  calories: number
}

export type RecipeInstruction = {
  step: number
  instruction: string
  timerMinutes?: number
}

export type UserProfile = {
  id: string
  email: string
  name: string | null
  goal: Goal
  dietaryRestrictions: string[]
  allergies: string[]
  foodDislikes: string[]
  servings: number
  cookDay: string
  subscriptionTier: string
}

export type WeeklyPlan = {
  id: string
  userId: string
  weekStartDate: string
  slots: {
    id: string
    day: DayOfWeek
    slot: MealSlot
    recipeId: string
    recipe: {
      id: string
      name: string
      prepTime: number
      cookTime: number
      difficulty: Difficulty
      macros: MacroInfo
      mealType: MealSlot
      batchCookTips: string | null
      tags: string[]
    }
  }[]
}

export type GroceryCategory = {
  category: IngredientCategory
  items: {
    id: string
    ingredientId: string
    name: string
    totalQuantity: number
    unit: string
    isChecked: boolean
  }[]
}
