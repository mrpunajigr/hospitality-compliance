import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  RecipeDetailResponse, 
  RecipeWithDetails, 
  RecipeIngredientWithDetails,
  CostBreakdown, 
  IngredientCost 
} from '../../../../types/RecipeTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const recipeId = resolvedParams.id
    
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
        recipe_id,
        client_id,
        recipe_name,
        category_id,
        number_of_portions,
        portion_size,
        portion_size_unit,
        prep_time_minutes,
        cook_time_minutes,
        instructions,
        cooking_notes,
        plating_notes,
        menu_price,
        photo_url,
        is_active,
        created_at,
        updated_at,
        created_by,
        updated_by,
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
        ingredient_id,
        recipe_id,
        client_id,
        ingredient_type,
        item_id,
        sub_recipe_id,
        quantity,
        unit,
        ingredient_order,
        prep_notes,
        is_optional,
        created_at,
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

    // Process each ingredient and calculate costs
    for (const ingredient of ingredients || []) {
      let ingredientCost = 0
      let unitCost = 0
      let ingredientName = ''
      let conversionFactor = 1

      try {
        if (ingredient.ingredient_type === 'inventory') {
          const inventoryItem = (ingredient as any).inventory_items
          if (inventoryItem) {
            ingredientName = inventoryItem.item_name
            unitCost = inventoryItem.unit_cost || 0

            // Get conversion factor if units differ
            if (inventoryItem.recipe_unit !== ingredient.unit) {
              const { data: conversion } = await supabase
                .from('unit_conversions')
                .select('conversion_factor')
                .eq('from_unit', inventoryItem.recipe_unit || 'unit')
                .eq('to_unit', ingredient.unit)
                .maybeSingle()

              conversionFactor = conversion?.conversion_factor || 1
            }

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

      } catch (error) {
        console.error(`Error calculating cost for ingredient ${ingredient.ingredient_id}:`, error)
        // Add ingredient with zero cost to maintain list completeness
        ingredientCosts.push({
          ingredient_id: ingredient.ingredient_id,
          ingredient_name: ingredientName || 'Unknown',
          ingredient_type: ingredient.ingredient_type,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          unit_cost: 0,
          extended_cost: 0,
          percentage_of_total: 0
        })
      }
    }

    // Calculate percentages now that we have total cost
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

    // Format recipe with calculated details
    const recipeWithDetails: RecipeWithDetails = {
      recipe_id: recipe.recipe_id,
      client_id: recipe.client_id,
      recipe_name: recipe.recipe_name,
      category_id: recipe.category_id,
      number_of_portions: recipe.number_of_portions,
      portion_size: recipe.portion_size,
      portion_size_unit: recipe.portion_size_unit,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      instructions: recipe.instructions,
      cooking_notes: recipe.cooking_notes,
      plating_notes: recipe.plating_notes,
      menu_price: recipe.menu_price,
      photo_url: recipe.photo_url,
      is_active: recipe.is_active,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      created_by: recipe.created_by,
      updated_by: recipe.updated_by,
      category_name: (recipe as any).recipe_categories.category_name,
      total_cost: totalCost,
      cost_per_portion: costPerPortion,
      food_cost_percentage: foodCostPercentage,
      ingredient_count: ingredients?.length || 0
    }

    // Format ingredients with details
    const ingredientsWithDetails: RecipeIngredientWithDetails[] = (ingredients || []).map(ingredient => {
      const costData = ingredientCosts.find(cost => cost.ingredient_id === ingredient.ingredient_id)
      
      return {
        ingredient_id: ingredient.ingredient_id,
        recipe_id: ingredient.recipe_id,
        client_id: ingredient.client_id,
        ingredient_type: ingredient.ingredient_type,
        item_id: ingredient.item_id,
        sub_recipe_id: ingredient.sub_recipe_id,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        ingredient_order: ingredient.ingredient_order,
        prep_notes: ingredient.prep_notes,
        is_optional: ingredient.is_optional,
        created_at: ingredient.created_at,
        ingredient_name: costData?.ingredient_name || '',
        unit_cost: costData?.unit_cost,
        cost_per_unit: costData?.unit_cost,
        extended_cost: costData?.extended_cost || 0,
        conversion_factor: 1 // This could be stored if needed for display
      }
    })

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