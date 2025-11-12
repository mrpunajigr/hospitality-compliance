import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
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

    // This endpoint triggers a recalculation of all recipe costs
    // based on current inventory prices and sub-recipe costs
    
    // In a real implementation, this would:
    // 1. Update all sub-recipe cost_per_unit values based on current ingredient costs
    // 2. Trigger a background job to recalculate all recipe costs
    // 3. Update any cached cost data

    // For now, we'll return a success response since the cost calculation
    // happens dynamically in the GET /api/menu/pricing endpoint

    let updatedCount = 0

    try {
      // Get all sub-recipes to update their costs
      const { data: subRecipes, error: subRecipesError } = await supabase
        .from('sub_recipes')
        .select('sub_recipe_id, batch_yield_quantity')
        .eq('client_id', user.id)
        .eq('is_active', true)

      if (subRecipesError) {
        console.error('Error fetching sub-recipes:', subRecipesError)
      } else {
        // Update each sub-recipe's cost based on current ingredient costs
        for (const subRecipe of subRecipes || []) {
          try {
            // Get sub-recipe ingredients with current costs
            const { data: ingredients, error: ingredientsError } = await supabase
              .from('sub_recipe_ingredients')
              .select(`
                quantity,
                unit,
                inventory_items!inner(
                  unit_cost,
                  recipe_unit
                )
              `)
              .eq('sub_recipe_id', subRecipe.sub_recipe_id)
              .eq('client_id', user.id)

            if (ingredientsError) {
              console.error(`Error fetching ingredients for sub-recipe ${subRecipe.sub_recipe_id}:`, ingredientsError)
              continue
            }

            // Calculate total ingredient cost
            let totalIngredientCost = 0

            for (const ingredient of ingredients || []) {
              try {
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
                  totalIngredientCost += ingredientCost
                }
              } catch (error) {
                console.error(`Error calculating ingredient cost in sub-recipe ${subRecipe.sub_recipe_id}:`, error)
              }
            }

            // Calculate cost per unit
            const costPerUnit = subRecipe.batch_yield_quantity > 0 
              ? totalIngredientCost / subRecipe.batch_yield_quantity 
              : 0

            // Update sub-recipe cost
            const { error: updateError } = await supabase
              .from('sub_recipes')
              .update({
                cost_per_unit: costPerUnit,
                updated_at: new Date().toISOString(),
                updated_by: user.id
              })
              .eq('sub_recipe_id', subRecipe.sub_recipe_id)

            if (!updateError) {
              updatedCount++
            }

          } catch (error) {
            console.error(`Error updating sub-recipe ${subRecipe.sub_recipe_id}:`, error)
          }
        }
      }

      // Log the recalculation event
      try {
        await supabase
          .from('system_logs')
          .insert({
            client_id: user.id,
            log_type: 'cost_recalculation',
            message: `Menu costs recalculated. Updated ${updatedCount} sub-recipes.`,
            performed_by: user.id,
            created_at: new Date().toISOString()
          })
      } catch (logError) {
        // Logging is optional
        console.warn('Could not log recalculation event:', logError)
      }

      return NextResponse.json({
        success: true,
        message: `Costs recalculated successfully. Updated ${updatedCount} sub-recipes.`,
        updated_count: updatedCount,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Cost recalculation error:', error)
      return NextResponse.json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to recalculate costs',
        updated_count: updatedCount
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Cost recalculation API error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      updated_count: 0
    }, { status: 500 })
  }
}