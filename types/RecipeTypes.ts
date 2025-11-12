/**
 * Recipe Management System Type Definitions
 * 
 * Comprehensive type definitions for the RECIPES module including
 * recipe management, costing calculations, sub-recipes, and production
 */

// ============================================================================
// CORE RECIPE TYPES
// ============================================================================

export interface Recipe {
  recipe_id: string
  client_id: string
  recipe_name: string
  category_id: string
  number_of_portions: number
  portion_size?: number
  portion_size_unit?: string
  prep_time_minutes?: number
  cook_time_minutes?: number
  instructions?: string
  cooking_notes?: string
  plating_notes?: string
  menu_price: number
  photo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
}

export interface RecipeWithDetails extends Recipe {
  category_name: string
  total_cost: number
  cost_per_portion: number
  food_cost_percentage: number
  ingredient_count: number
}

export interface RecipeCategory {
  category_id: string
  client_id: string
  category_name: string
  description?: string
  is_active: boolean
}

// ============================================================================
// RECIPE INGREDIENTS TYPES
// ============================================================================

export interface RecipeIngredient {
  ingredient_id: string
  recipe_id: string
  client_id: string
  ingredient_type: 'inventory' | 'sub_recipe'
  item_id?: string // For inventory items
  sub_recipe_id?: string // For sub-recipes
  quantity: number
  unit: string
  ingredient_order: number
  prep_notes?: string
  is_optional: boolean
  created_at: string
}

export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient_name: string
  unit_cost?: number // For inventory items
  cost_per_unit?: number // For sub-recipes
  extended_cost: number
  conversion_factor?: number
  current_stock?: number
  stock_unit?: string
}

// ============================================================================
// SUB-RECIPE TYPES
// ============================================================================

export interface SubRecipe {
  sub_recipe_id: string
  client_id: string
  sub_recipe_name: string
  sub_recipe_type: 'sauce' | 'stock' | 'marinade' | 'garnish' | 'other'
  batch_yield_quantity: number
  batch_yield_unit: string
  prep_time_minutes?: number
  instructions?: string
  notes?: string
  shelf_life_days?: number
  cost_per_unit: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
}

export interface SubRecipeWithDetails extends SubRecipe {
  total_ingredient_cost: number
  ingredient_count: number
  usage_count: number // How many recipes use this sub-recipe
  last_produced?: string
}

export interface SubRecipeIngredient {
  sub_ingredient_id: string
  sub_recipe_id: string
  client_id: string
  item_id: string // Always inventory items (sub-recipes can't contain other sub-recipes)
  quantity: number
  unit: string
  ingredient_order: number
  prep_notes?: string
  is_optional: boolean
  created_at: string
}

export interface SubRecipeIngredientWithDetails extends SubRecipeIngredient {
  item_name: string
  unit_cost: number
  extended_cost: number
  conversion_factor: number
  current_stock?: number
  stock_unit?: string
}

// ============================================================================
// PRODUCTION TYPES
// ============================================================================

export interface ProductionBatch {
  production_id: string
  client_id: string
  sub_recipe_id: string
  quantity_produced: number
  batch_yield_unit: string
  production_time_minutes?: number
  yield_percentage: number
  quality_notes?: string
  shelf_life_date?: string
  produced_by: string
  production_date: string
  created_at: string
}

export interface ProductionBatchWithDetails extends ProductionBatch {
  sub_recipe_name: string
  expected_yield: number
  expected_cost: number
  actual_cost_per_unit: number
  inventory_item_id?: string // Created inventory item ID
  batch_number?: string // Created batch number
}

export interface ProductionRequest {
  sub_recipe_id: string
  quantity_produced: number
  production_time_minutes?: number
  quality_notes?: string
  shelf_life_date?: string
}

// ============================================================================
// COSTING TYPES
// ============================================================================

export interface CostBreakdown {
  recipe_id: string
  total_cost: number
  cost_per_portion: number
  food_cost_percentage: number
  ingredient_costs: IngredientCost[]
  last_calculated: string
}

export interface IngredientCost {
  ingredient_id: string
  ingredient_name: string
  ingredient_type: 'inventory' | 'sub_recipe'
  quantity: number
  unit: string
  unit_cost: number
  extended_cost: number
  percentage_of_total: number
}

export interface UnitConversion {
  conversion_id: string
  from_unit: string
  to_unit: string
  conversion_factor: number
  conversion_type: 'weight' | 'volume' | 'count'
}

// ============================================================================
// FOOD COST ANALYSIS TYPES
// ============================================================================

export type FoodCostStatus = 'excellent' | 'good' | 'high' | 'critical'

export interface FoodCostAnalysis {
  percentage: number
  status: FoodCostStatus
  color: 'green' | 'yellow' | 'orange' | 'red'
  message: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface RecipesResponse {
  success: boolean
  recipes: RecipeWithDetails[]
  categories: RecipeCategory[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  lastUpdated: string
}

export interface RecipeDetailResponse {
  success: boolean
  recipe: RecipeWithDetails
  ingredients: RecipeIngredientWithDetails[]
  costBreakdown: CostBreakdown
  lastUpdated: string
}

export interface SubRecipesResponse {
  success: boolean
  subRecipes: SubRecipeWithDetails[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  lastUpdated: string
}

export interface SubRecipeDetailResponse {
  success: boolean
  subRecipe: SubRecipeWithDetails
  ingredients: SubRecipeIngredientWithDetails[]
  lastUpdated: string
}

export interface ProductionResponse {
  success: boolean
  production: ProductionBatchWithDetails
  inventoryItemCreated?: boolean
  batchCreated?: boolean
  countUpdated?: boolean
  message: string
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface RecipeFilters {
  search?: string
  category?: string
  sortBy?: 'name' | 'cost_low' | 'cost_high' | 'food_cost_percent'
  minCost?: number
  maxCost?: number
  foodCostStatus?: FoodCostStatus[]
}

export interface SubRecipeFilters {
  search?: string
  type?: string
  sortBy?: 'name' | 'cost_per_unit' | 'usage_count' | 'last_produced'
}

// ============================================================================
// HELPER FUNCTION TYPES
// ============================================================================

export interface ConversionHelper {
  getConversionFactor: (fromUnit: string, toUnit: string) => Promise<number>
  convertQuantity: (quantity: number, fromUnit: string, toUnit: string) => Promise<number>
  getCachedConversion: (fromUnit: string, toUnit: string) => number | null
}

export interface CostCalculator {
  calculateRecipeCost: (recipeId: string) => Promise<CostBreakdown>
  calculateSubRecipeCost: (subRecipeId: string) => Promise<number>
  calculateIngredientCost: (ingredient: RecipeIngredient) => Promise<number>
  refreshRecipeCosts: (recipeIds: string[]) => Promise<void>
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface RecipeCardProps {
  recipe: RecipeWithDetails
  onClick?: (recipeId: string) => void
  showCost?: boolean
  theme?: 'light' | 'dark'
  className?: string
}

export interface FoodCostBadgeProps {
  percentage: number
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface SubRecipeCardProps {
  subRecipe: SubRecipeWithDetails
  onClick?: (subRecipeId: string) => void
  onProduce?: (subRecipeId: string) => void
  theme?: 'light' | 'dark'
  className?: string
}

export interface IngredientTableProps {
  ingredients: RecipeIngredientWithDetails[]
  onIngredientClick?: (ingredient: RecipeIngredientWithDetails) => void
  showCosts?: boolean
  className?: string
}

export interface ProductionFormProps {
  subRecipes: SubRecipeWithDetails[]
  onSubmit: (production: ProductionRequest) => Promise<void>
  loading?: boolean
  className?: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface RecipeError {
  code: string
  message: string
  field?: string
}

export type RecipeErrorType = 
  | 'RECIPE_NOT_FOUND'
  | 'INVALID_INGREDIENTS'
  | 'COST_CALCULATION_FAILED'
  | 'UNIT_CONVERSION_FAILED'
  | 'PRODUCTION_FAILED'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_YIELD'

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface RecipeValidation {
  isValid: boolean
  errors: RecipeError[]
  warnings: string[]
}

export interface ProductionValidation {
  isValid: boolean
  yieldPercentage: number
  warnings: string[]
  errors: RecipeError[]
}

// ============================================================================
// EXPORT ALL TYPES
// All types are exported as interfaces above