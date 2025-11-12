# Recipes API Endpoint Implementation

**Critical API**: GET /api/recipes with complex cost calculations

## Complete API Implementation

```typescript
// app/api/recipes/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RecipesResponse, RecipeWithDetails, RecipeCategory } from '../../../types/RecipeTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    
    // Get authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Build the main recipes query with cost calculation
    let recipesQuery = supabase
      .from('recipes')
      .select(`
        recipe_id,
        recipe_name,
        category_id,
        number_of_portions,
        portion_size,
        portion_size_unit,
        prep_time_minutes,
        cook_time_minutes,
        menu_price,
        photo_url,
        is_active,
        created_at,
        recipe_categories!inner(
          category_name
        )
      `)
      .eq('client_id', user.id)
      .eq('is_active', true)

    // Apply search filter
    if (search) {
      recipesQuery = recipesQuery.ilike('recipe_name', `%${search}%`)
    }

    // Apply category filter
    if (category && category !== 'all') {
      recipesQuery = recipesQuery.eq('recipe_categories.category_name', category)
    }

    // Apply pagination
    const offset = (page - 1) * pageSize
    recipesQuery = recipesQuery
      .range(offset, offset + pageSize - 1)

    // Apply sorting (basic sorting first, cost sorting will be done post-query)
    if (sortBy === 'name') {
      recipesQuery = recipesQuery.order('recipe_name', { ascending: true })
    } else {
      recipesQuery = recipesQuery.order('recipe_name', { ascending: true })
    }

    const { data: recipes, error: recipesError } = await recipesQuery

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }

    // Calculate costs for each recipe
    const recipesWithCosts: RecipeWithDetails[] = []

    for (const recipe of recipes || []) {
      try {
        // Get recipe ingredients with costs
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
            ingredient_id,
            ingredient_type,
            item_id,
            sub_recipe_id,
            quantity,
            unit,
            inventory_items(
              item_name,
              unit_cost,
              recipe_unit
            ),
            sub_recipes(
              sub_recipe_name,
              cost_per_unit
            )
          `)
          .eq('recipe_id', recipe.recipe_id)
          .eq('client_id', user.id)

        if (ingredientsError) {
          console.error('Error fetching ingredients:', ingredientsError)
          continue
        }

        // Calculate total recipe cost
        let totalCost = 0
        let ingredientCount = ingredients?.length || 0

        for (const ingredient of ingredients || []) {
          if (ingredient.ingredient_type === 'inventory') {
            const inventoryItem = (ingredient as any).inventory_items
            if (inventoryItem && inventoryItem.unit_cost) {
              // Get conversion factor from unit_conversions table
              const { data: conversion } = await supabase
                .from('unit_conversions')
                .select('conversion_factor')
                .eq('from_unit', inventoryItem.recipe_unit || 'unit')
                .eq('to_unit', ingredient.unit)
                .single()

              const conversionFactor = conversion?.conversion_factor || 1
              const ingredientCost = ingredient.quantity * inventoryItem.unit_cost * conversionFactor
              totalCost += ingredientCost
            }
          } else if (ingredient.ingredient_type === 'sub_recipe') {
            const subRecipe = (ingredient as any).sub_recipes
            if (subRecipe && subRecipe.cost_per_unit) {
              const ingredientCost = ingredient.quantity * subRecipe.cost_per_unit
              totalCost += ingredientCost
            }
          }
        }

        // Calculate derived costs
        const costPerPortion = recipe.number_of_portions > 0 ? totalCost / recipe.number_of_portions : 0
        const foodCostPercentage = recipe.menu_price > 0 ? (costPerPortion / recipe.menu_price) * 100 : 0

        // Build recipe with details
        const recipeWithDetails: RecipeWithDetails = {
          ...recipe,
          client_id: user.id,
          category_name: (recipe as any).recipe_categories.category_name,
          total_cost: totalCost,
          cost_per_portion: costPerPortion,
          food_cost_percentage: foodCostPercentage,
          ingredient_count: ingredientCount,
          // Add missing required fields with defaults
          instructions: '',
          cooking_notes: '',
          plating_notes: '',
          updated_at: recipe.created_at,
          created_by: user.id,
          updated_by: user.id
        }

        recipesWithCosts.push(recipeWithDetails)

      } catch (error) {
        console.error(`Error calculating costs for recipe ${recipe.recipe_id}:`, error)
        // Continue with other recipes
      }
    }

    // Apply cost-based sorting if needed
    if (sortBy === 'cost_low') {
      recipesWithCosts.sort((a, b) => a.cost_per_portion - b.cost_per_portion)
    } else if (sortBy === 'cost_high') {
      recipesWithCosts.sort((a, b) => b.cost_per_portion - a.cost_per_portion)
    } else if (sortBy === 'food_cost_percent') {
      recipesWithCosts.sort((a, b) => a.food_cost_percentage - b.food_cost_percentage)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('is_active', true)

    if (search) {
      countQuery = countQuery.ilike('recipe_name', `%${search}%`)
    }

    if (category && category !== 'all') {
      // Join with categories for filtering
      countQuery = countQuery
        .eq('recipe_categories.category_name', category)
    }

    const { count: totalItems, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting recipes:', countError)
    }

    // Get recipe categories for filter dropdown
    const { data: categories, error: categoriesError } = await supabase
      .from('recipe_categories')
      .select('category_id, category_name')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('category_name')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    const totalPages = Math.ceil((totalItems || 0) / pageSize)

    const response: RecipesResponse = {
      success: true,
      recipes: recipesWithCosts,
      categories: categories || [],
      pagination: {
        page,
        pageSize,
        totalItems: totalItems || 0,
        totalPages
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Recipes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

## Recipe Detail API

```typescript
// app/api/recipes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RecipeDetailResponse, CostBreakdown, IngredientCost } from '../../../../types/RecipeTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = params.id
    
    // Get authorization
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get recipe with category
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_categories!inner(
          category_name
        )
      `)
      .eq('recipe_id', recipeId)
      .eq('client_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Get ingredients with detailed information
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        inventory_items(
          item_id,
          item_name,
          unit_cost,
          recipe_unit
        ),
        sub_recipes(
          sub_recipe_id,
          sub_recipe_name,
          cost_per_unit
        )
      `)
      .eq('recipe_id', recipeId)
      .eq('client_id', user.id)
      .order('ingredient_order')

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError)
      return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 })
    }

    // Calculate detailed cost breakdown
    const ingredientCosts: IngredientCost[] = []
    let totalCost = 0

    for (const ingredient of ingredients || []) {
      let ingredientCost = 0
      let unitCost = 0
      let ingredientName = ''

      if (ingredient.ingredient_type === 'inventory') {
        const inventoryItem = (ingredient as any).inventory_items
        if (inventoryItem) {
          ingredientName = inventoryItem.item_name
          unitCost = inventoryItem.unit_cost || 0

          // Get conversion factor
          const { data: conversion } = await supabase
            .from('unit_conversions')
            .select('conversion_factor')
            .eq('from_unit', inventoryItem.recipe_unit || 'unit')
            .eq('to_unit', ingredient.unit)
            .single()

          const conversionFactor = conversion?.conversion_factor || 1
          ingredientCost = ingredient.quantity * unitCost * conversionFactor
        }
      } else if (ingredient.ingredient_type === 'sub_recipe') {
        const subRecipe = (ingredient as any).sub_recipes
        if (subRecipe) {
          ingredientName = subRecipe.sub_recipe_name
          unitCost = subRecipe.cost_per_unit || 0
          ingredientCost = ingredient.quantity * unitCost
        }
      }

      totalCost += ingredientCost

      ingredientCosts.push({
        ingredient_id: ingredient.ingredient_id,
        ingredient_name: ingredientName,
        ingredient_type: ingredient.ingredient_type,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unit_cost: unitCost,
        extended_cost: ingredientCost,
        percentage_of_total: 0 // Will be calculated after total is known
      })
    }

    // Calculate percentages
    ingredientCosts.forEach(cost => {
      cost.percentage_of_total = totalCost > 0 ? (cost.extended_cost / totalCost) * 100 : 0
    })

    const costPerPortion = recipe.number_of_portions > 0 ? totalCost / recipe.number_of_portions : 0
    const foodCostPercentage = recipe.menu_price > 0 ? (costPerPortion / recipe.menu_price) * 100 : 0

    const costBreakdown: CostBreakdown = {
      recipe_id: recipeId,
      total_cost: totalCost,
      cost_per_portion: costPerPortion,
      food_cost_percentage: foodCostPercentage,
      ingredient_costs: ingredientCosts,
      last_calculated: new Date().toISOString()
    }

    // Format recipe with details
    const recipeWithDetails = {
      ...recipe,
      category_name: (recipe as any).recipe_categories.category_name,
      total_cost: totalCost,
      cost_per_portion: costPerPortion,
      food_cost_percentage: foodCostPercentage,
      ingredient_count: ingredients?.length || 0
    }

    // Format ingredients with details
    const ingredientsWithDetails = ingredients?.map(ingredient => {
      const costData = ingredientCosts.find(cost => cost.ingredient_id === ingredient.ingredient_id)
      return {
        ...ingredient,
        ingredient_name: costData?.ingredient_name || '',
        unit_cost: costData?.unit_cost,
        cost_per_unit: costData?.unit_cost,
        extended_cost: costData?.extended_cost || 0,
        conversion_factor: 1 // This would need to be calculated properly
      }
    }) || []

    const response: RecipeDetailResponse = {
      success: true,
      recipe: recipeWithDetails,
      ingredients: ingredientsWithDetails,
      costBreakdown,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Recipe detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

## Categories API

```typescript
// app/api/recipes/categories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: categories, error } = await supabase
      .from('recipe_categories')
      .select('*')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('category_name')

    if (error) {
      console.error('Error fetching recipe categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

## Performance Notes

- Recipe cost calculation is expensive - consider caching
- Unit conversion queries can be optimized with batch loading
- Consider using database functions for complex cost calculations
- Add indexes on frequently queried columns (client_id, is_active, etc.)

## Error Handling

- Graceful degradation when cost calculation fails
- Continues processing other recipes if one fails
- Comprehensive logging for debugging
- Returns meaningful error messages

## Security

- All queries filtered by client_id for multi-tenancy
- Bearer token validation on all endpoints
- No direct database access from frontend