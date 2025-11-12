# Unit Conversion Helper Implementation

**Critical Component**: Handles unit conversions for accurate recipe costing

## TypeScript Implementation

```typescript
// lib/unit-conversions.ts

import { createClient } from '@supabase/supabase-js'
import { UnitConversion } from '../types/RecipeTypes'

// Cache for unit conversions (rarely change)
const conversionCache = new Map<string, number>()

/**
 * Get conversion factor from database with caching
 */
export async function getConversionFactor(
  fromUnit: string,
  toUnit: string,
  supabase: any
): Promise<number> {
  // Same unit, no conversion needed
  if (fromUnit === toUnit) {
    return 1
  }

  // Check cache first
  const cacheKey = `${fromUnit}-${toUnit}`
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)!
  }

  try {
    // Query database
    const { data, error } = await supabase
      .from('unit_conversions')
      .select('conversion_factor')
      .eq('from_unit', fromUnit)
      .eq('to_unit', toUnit)
      .single()

    if (error || !data) {
      // Try reverse conversion
      const { data: reverseData, error: reverseError } = await supabase
        .from('unit_conversions')
        .select('conversion_factor')
        .eq('from_unit', toUnit)
        .eq('to_unit', fromUnit)
        .single()

      if (reverseError || !reverseData) {
        throw new Error(`No conversion found: ${fromUnit} → ${toUnit}`)
      }

      // Use reciprocal of reverse conversion
      const factor = 1 / reverseData.conversion_factor
      conversionCache.set(cacheKey, factor)
      return factor
    }

    // Cache result
    conversionCache.set(cacheKey, data.conversion_factor)
    return data.conversion_factor
    
  } catch (error) {
    console.error('Unit conversion error:', error)
    throw new Error(`Failed to convert ${fromUnit} to ${toUnit}`)
  }
}

/**
 * Convert quantity from one unit to another
 */
export async function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  supabase: any
): Promise<number> {
  const conversionFactor = await getConversionFactor(fromUnit, toUnit, supabase)
  return quantity * conversionFactor
}

/**
 * Get cached conversion factor (sync, returns null if not cached)
 */
export function getCachedConversionFactor(
  fromUnit: string,
  toUnit: string
): number | null {
  if (fromUnit === toUnit) return 1
  
  const cacheKey = `${fromUnit}-${toUnit}`
  return conversionCache.get(cacheKey) || null
}

/**
 * Pre-populate common conversions into cache
 */
export async function preloadCommonConversions(supabase: any): Promise<void> {
  const commonConversions = [
    // Weight conversions
    ['kg', 'g'], ['g', 'kg'],
    ['lb', 'oz-wt'], ['oz-wt', 'lb'],
    ['kg', 'lb'], ['lb', 'kg'],
    
    // Volume conversions
    ['L', 'ml'], ['ml', 'L'],
    ['gal', 'oz-fl'], ['oz-fl', 'gal'],
    ['L', 'gal'], ['gal', 'L'],
    
    // Common recipe conversions
    ['cup', 'ml'], ['ml', 'cup'],
    ['tbsp', 'ml'], ['ml', 'tbsp'],
    ['tsp', 'ml'], ['ml', 'tsp']
  ]

  for (const [fromUnit, toUnit] of commonConversions) {
    try {
      await getConversionFactor(fromUnit, toUnit, supabase)
    } catch (error) {
      console.warn(`Failed to preload conversion: ${fromUnit} → ${toUnit}`)
    }
  }
}

/**
 * Clear conversion cache (useful for testing or if conversions are updated)
 */
export function clearConversionCache(): void {
  conversionCache.clear()
}

/**
 * Get all cached conversions (useful for debugging)
 */
export function getCachedConversions(): Record<string, number> {
  return Object.fromEntries(conversionCache.entries())
}
```

## Recipe Costing Calculator

```typescript
// lib/recipe-costing.ts

import { getConversionFactor } from './unit-conversions'
import { 
  RecipeIngredientWithDetails, 
  CostBreakdown, 
  IngredientCost 
} from '../types/RecipeTypes'

/**
 * Calculate total cost for a recipe
 */
export async function calculateRecipeCost(
  ingredients: RecipeIngredientWithDetails[],
  numberOfPortions: number,
  menuPrice: number,
  supabase: any
): Promise<CostBreakdown> {
  const ingredientCosts: IngredientCost[] = []
  let totalCost = 0

  for (const ingredient of ingredients) {
    try {
      let ingredientCost = 0

      if (ingredient.ingredient_type === 'inventory') {
        // Calculate cost for inventory item
        if (ingredient.unit_cost) {
          const conversionFactor = ingredient.conversion_factor || 
            await getConversionFactor(
              ingredient.stock_unit || 'unit', 
              ingredient.unit, 
              supabase
            )
          
          ingredientCost = ingredient.quantity * ingredient.unit_cost * conversionFactor
        }
      } else if (ingredient.ingredient_type === 'sub_recipe') {
        // Calculate cost for sub-recipe
        if (ingredient.cost_per_unit) {
          ingredientCost = ingredient.quantity * ingredient.cost_per_unit
        }
      }

      totalCost += ingredientCost

      ingredientCosts.push({
        ingredient_id: ingredient.ingredient_id,
        ingredient_name: ingredient.ingredient_name,
        ingredient_type: ingredient.ingredient_type,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unit_cost: ingredient.unit_cost || ingredient.cost_per_unit || 0,
        extended_cost: ingredientCost,
        percentage_of_total: 0 // Will be calculated after total is known
      })

    } catch (error) {
      console.error(`Error calculating cost for ingredient ${ingredient.ingredient_name}:`, error)
      // Continue with other ingredients
    }
  }

  // Calculate percentages
  ingredientCosts.forEach(cost => {
    cost.percentage_of_total = totalCost > 0 ? (cost.extended_cost / totalCost) * 100 : 0
  })

  const costPerPortion = numberOfPortions > 0 ? totalCost / numberOfPortions : 0
  const foodCostPercentage = menuPrice > 0 ? (costPerPortion / menuPrice) * 100 : 0

  return {
    recipe_id: '', // Will be set by caller
    total_cost: totalCost,
    cost_per_portion: costPerPortion,
    food_cost_percentage: foodCostPercentage,
    ingredient_costs: ingredientCosts,
    last_calculated: new Date().toISOString()
  }
}

/**
 * Calculate cost for a single ingredient
 */
export async function calculateIngredientCost(
  ingredient: RecipeIngredientWithDetails,
  supabase: any
): Promise<number> {
  try {
    if (ingredient.ingredient_type === 'inventory') {
      if (!ingredient.unit_cost) return 0
      
      const conversionFactor = ingredient.conversion_factor || 
        await getConversionFactor(
          ingredient.stock_unit || 'unit', 
          ingredient.unit, 
          supabase
        )
      
      return ingredient.quantity * ingredient.unit_cost * conversionFactor
      
    } else if (ingredient.ingredient_type === 'sub_recipe') {
      if (!ingredient.cost_per_unit) return 0
      
      return ingredient.quantity * ingredient.cost_per_unit
    }
    
    return 0
    
  } catch (error) {
    console.error(`Error calculating ingredient cost:`, error)
    return 0
  }
}

/**
 * Calculate cost per unit for a sub-recipe
 */
export async function calculateSubRecipeCost(
  subRecipeIngredients: any[],
  batchYieldQuantity: number,
  supabase: any
): Promise<number> {
  let totalIngredientCost = 0

  for (const ingredient of subRecipeIngredients) {
    try {
      const conversionFactor = await getConversionFactor(
        ingredient.stock_unit || 'unit',
        ingredient.unit,
        supabase
      )
      
      const ingredientCost = ingredient.quantity * ingredient.unit_cost * conversionFactor
      totalIngredientCost += ingredientCost
      
    } catch (error) {
      console.error(`Error calculating sub-recipe ingredient cost:`, error)
    }
  }

  return batchYieldQuantity > 0 ? totalIngredientCost / batchYieldQuantity : 0
}
```

## Usage Example

```typescript
// In API endpoint or component
import { calculateRecipeCost, preloadCommonConversions } from '../lib/recipe-costing'
import { createClient } from '@supabase/supabase-js'

// Initialize and preload conversions
const supabase = createClient(...)
await preloadCommonConversions(supabase)

// Calculate recipe cost
const costBreakdown = await calculateRecipeCost(
  recipeIngredients,
  recipe.number_of_portions,
  recipe.menu_price,
  supabase
)

console.log(`Recipe costs $${costBreakdown.cost_per_portion.toFixed(2)} per portion`)
console.log(`Food cost: ${costBreakdown.food_cost_percentage.toFixed(1)}%`)
```

## Error Handling

- Returns 0 cost if conversion fails
- Logs errors but continues with other ingredients
- Handles missing unit cost data gracefully
- Caches successful conversions to avoid repeated queries

## Performance Notes

- Conversion cache eliminates redundant database queries
- Preloading common conversions improves initial load time
- Batch ingredient queries where possible
- Consider database functions for complex calculations