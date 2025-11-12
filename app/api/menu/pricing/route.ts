import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MenuPricingResponse, MenuPricingItem, PricingSummary } from '../../../../types/MenuTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
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

    // Build the main recipes query with detailed cost calculation
    let recipesQuery = supabase
      .from('recipes')
      .select(`
        recipe_id,
        recipe_name,
        menu_price,
        number_of_portions,
        updated_at,
        recipe_categories!inner(
          category_name
        )
      `)
      .eq('client_id', user.id)
      .eq('is_active', true)
      .gt('menu_price', 0) // Only items with menu prices

    // Apply search filter
    if (search) {
      recipesQuery = recipesQuery.ilike('recipe_name', `%${search}%`)
    }

    // Apply category filter
    if (category && category !== 'all') {
      recipesQuery = recipesQuery.eq('recipe_categories.category_name', category)
    }

    const { data: recipes, error: recipesError } = await recipesQuery

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }

    // Calculate detailed pricing information for each recipe
    const pricingItems: MenuPricingItem[] = []

    for (const recipe of recipes || []) {
      try {
        // Get recipe ingredients with costs
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
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
          console.error('Error fetching ingredients for recipe:', recipe.recipe_id, ingredientsError)
          continue
        }

        // Calculate total recipe cost
        let totalCost = 0

        for (const ingredient of ingredients || []) {
          try {
            if (ingredient.ingredient_type === 'inventory') {
              const inventoryItem = (ingredient as any).inventory_items
              if (inventoryItem && inventoryItem.unit_cost) {
                // Get conversion factor
                const { data: conversion } = await supabase
                  .from('unit_conversions')
                  .select('conversion_factor')
                  .eq('from_unit', inventoryItem.recipe_unit || 'unit')
                  .eq('to_unit', ingredient.unit)
                  .maybeSingle()

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
          } catch (error) {
            console.error(`Error calculating ingredient cost in recipe ${recipe.recipe_id}:`, error)
          }
        }

        // Calculate derived metrics
        const costPerPortion = recipe.number_of_portions > 0 ? totalCost / recipe.number_of_portions : 0
        const foodCostPercentage = recipe.menu_price > 0 ? (costPerPortion / recipe.menu_price) * 100 : 0
        const contributionMargin = recipe.menu_price - costPerPortion

        // Determine status based on food cost percentage
        let status: string
        if (foodCostPercentage < 15) {
          status = 'underpriced'
        } else if (foodCostPercentage >= 15 && foodCostPercentage <= 32) {
          status = 'excellent'
        } else if (foodCostPercentage > 32 && foodCostPercentage <= 40) {
          status = 'good'
        } else if (foodCostPercentage > 40 && foodCostPercentage <= 50) {
          status = 'high'
        } else {
          status = 'critical'
        }

        const pricingItem: MenuPricingItem = {
          recipe_id: recipe.recipe_id,
          recipe_name: recipe.recipe_name,
          category_name: (recipe as any).recipe_categories.category_name,
          cost_per_portion: costPerPortion,
          menu_price: recipe.menu_price,
          food_cost_percentage: foodCostPercentage,
          contribution_margin: contributionMargin,
          status: status as any,
          last_updated: recipe.updated_at
        }

        pricingItems.push(pricingItem)

      } catch (error) {
        console.error(`Error calculating pricing for recipe ${recipe.recipe_id}:`, error)
        // Continue with other recipes
      }
    }

    // Filter by status if specified
    let filteredItems = pricingItems
    if (status && status !== 'all') {
      filteredItems = pricingItems.filter(item => item.status === status)
    }

    // Sort items
    switch (sortBy) {
      case 'food_cost_low':
        filteredItems.sort((a, b) => a.food_cost_percentage - b.food_cost_percentage)
        break
      case 'food_cost_high':
        filteredItems.sort((a, b) => b.food_cost_percentage - a.food_cost_percentage)
        break
      case 'margin_high':
        filteredItems.sort((a, b) => b.contribution_margin - a.contribution_margin)
        break
      case 'margin_low':
        filteredItems.sort((a, b) => a.contribution_margin - b.contribution_margin)
        break
      default: // 'name'
        filteredItems.sort((a, b) => a.recipe_name.localeCompare(b.recipe_name))
    }

    // Calculate summary statistics
    const totalItems = pricingItems.length
    const averageFoodCostPercentage = totalItems > 0 
      ? pricingItems.reduce((sum, item) => sum + item.food_cost_percentage, 0) / totalItems 
      : 0

    const targetRange = { min: 15, max: 32 }
    const itemsInTargetRange = pricingItems.filter(
      item => item.food_cost_percentage >= targetRange.min && item.food_cost_percentage <= targetRange.max
    ).length

    const itemsNeedingAttention = pricingItems.filter(
      item => item.status === 'critical' || item.status === 'high' || item.status === 'underpriced'
    ).length

    const summary: PricingSummary = {
      total_items: totalItems,
      average_food_cost_percentage: averageFoodCostPercentage,
      items_in_target_range: itemsInTargetRange,
      items_needing_attention: itemsNeedingAttention,
      target_range: targetRange
    }

    const response: MenuPricingResponse = {
      success: true,
      items: filteredItems,
      summary,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Menu pricing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}