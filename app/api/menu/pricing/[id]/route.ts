import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PricingUpdateRequest, PricingUpdateResponse, MenuPricingItem } from '../../../../../types/MenuTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
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

    const updateData: PricingUpdateRequest = await request.json()

    // Validate price
    if (!updateData.new_price || updateData.new_price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Get current recipe to verify ownership and get old price
    const { data: currentRecipe, error: recipeError } = await supabase
      .from('recipes')
      .select('recipe_id, recipe_name, menu_price, number_of_portions, recipe_categories(category_name)')
      .eq('recipe_id', recipeId)
      .eq('client_id', user.id)
      .single()

    if (recipeError || !currentRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    try {
      // 1. Update the recipe price
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          menu_price: updateData.new_price,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('recipe_id', recipeId)
        .eq('client_id', user.id)

      if (updateError) {
        throw new Error(`Failed to update recipe price: ${updateError.message}`)
      }

      // 2. Record price history (optional - if table exists)
      try {
        await supabase
          .from('menu_price_history')
          .insert({
            client_id: user.id,
            recipe_id: recipeId,
            old_price: currentRecipe.menu_price,
            new_price: updateData.new_price,
            changed_at: new Date().toISOString(),
            changed_by: user.id,
            reason: updateData.reason || 'Price update'
          })
      } catch (historyError) {
        // History table might not exist yet - this is optional
        console.warn('Could not record price history:', historyError)
      }

      // 3. Recalculate pricing metrics for the updated item
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
        .eq('recipe_id', recipeId)
        .eq('client_id', user.id)

      if (ingredientsError) {
        console.error('Error fetching ingredients for updated recipe:', ingredientsError)
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
          console.error(`Error calculating ingredient cost:`, error)
        }
      }

      // Calculate new derived metrics
      const costPerPortion = currentRecipe.number_of_portions > 0 ? totalCost / currentRecipe.number_of_portions : 0
      const foodCostPercentage = updateData.new_price > 0 ? (costPerPortion / updateData.new_price) * 100 : 0
      const contributionMargin = updateData.new_price - costPerPortion

      // Determine new status based on food cost percentage
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

      // Build updated item response
      const updatedItem: MenuPricingItem = {
        recipe_id: recipeId,
        recipe_name: currentRecipe.recipe_name,
        category_name: (currentRecipe as any).recipe_categories.category_name,
        cost_per_portion: costPerPortion,
        menu_price: updateData.new_price,
        food_cost_percentage: foodCostPercentage,
        contribution_margin: contributionMargin,
        status: status as any,
        last_updated: new Date().toISOString()
      }

      const response: PricingUpdateResponse = {
        success: true,
        updated_item: updatedItem,
        message: `Menu price updated successfully for ${currentRecipe.recipe_name}`
      }

      return NextResponse.json(response)

    } catch (error) {
      console.error('Price update error:', error)
      return NextResponse.json({
        success: false,
        updated_item: {} as MenuPricingItem,
        message: error instanceof Error ? error.message : 'Failed to update price'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Price update API error:', error)
    return NextResponse.json({
      success: false,
      updated_item: {} as MenuPricingItem,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}