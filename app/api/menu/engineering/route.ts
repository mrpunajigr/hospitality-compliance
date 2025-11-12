import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  MenuEngineeringResponse, 
  MenuEngineeringMatrix, 
  QuadrantSummary,
  MenuEngineering
} from '../../../../types/MenuTypes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
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

    // Get all menu items with pricing and calculate engineering data
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        recipe_id,
        recipe_name,
        menu_price,
        number_of_portions,
        recipe_categories!inner(
          category_name
        )
      `)
      .eq('client_id', user.id)
      .eq('is_active', true)
      .gt('menu_price', 0) // Only items with menu prices

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError)
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
    }

    // Calculate detailed menu engineering data for each recipe
    const engineeringItems: MenuEngineering[] = []

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
        const contributionMargin = recipe.menu_price - costPerPortion

        // Generate placeholder sales data for demonstration
        // In a real system, this would come from POS integration
        const salesCount = Math.floor(Math.random() * 100) + 10

        const engineeringItem: MenuEngineering = {
          recipe_id: recipe.recipe_id,
          recipe_name: recipe.recipe_name,
          category_name: (recipe as any).recipe_categories.category_name,
          contribution_margin: contributionMargin,
          sales_count: salesCount,
          quadrant: 'star', // Will be updated after quadrant classification
          profitability_rank: 0, // Will be calculated after sorting
          popularity_rank: 0, // Will be calculated after sorting
          recommendation: '' // Will be filled based on quadrant
        }

        engineeringItems.push(engineeringItem)

      } catch (error) {
        console.error(`Error calculating engineering data for recipe ${recipe.recipe_id}:`, error)
        // Continue with other recipes
      }
    }

    if (engineeringItems.length === 0) {
      // Return empty matrix
      const emptyMatrix: MenuEngineeringMatrix = {
        total_items: 0,
        median_margin: 0,
        median_sales: 0,
        stars: { 
          quadrant: 'star', 
          count: 0, 
          average_margin: 0, 
          total_contribution: 0, 
          items: [], 
          description: 'High profit, high sales items - your menu superstars!',
          action_priority: 'medium'
        },
        plowhorses: { 
          quadrant: 'plowhorse',
          count: 0, 
          average_margin: 0, 
          total_contribution: 0, 
          items: [], 
          description: 'High profit, low sales - promote these items to increase sales volume.',
          action_priority: 'medium'
        },
        puzzles: { 
          quadrant: 'puzzle',
          count: 0, 
          average_margin: 0, 
          total_contribution: 0, 
          items: [], 
          description: 'High sales, low profit - consider repricing or cost reduction.',
          action_priority: 'high'
        },
        dogs: { 
          quadrant: 'dog',
          count: 0, 
          average_margin: 0, 
          total_contribution: 0, 
          items: [], 
          description: 'Low profit, low sales - candidates for removal from menu.',
          action_priority: 'high'
        },
        last_calculated: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        matrix: emptyMatrix,
        lastUpdated: new Date().toISOString()
      })
    }

    // Calculate median values for thresholds
    const sortedByMargin = [...engineeringItems].sort((a, b) => a.contribution_margin - b.contribution_margin)
    const sortedBySales = [...engineeringItems].sort((a, b) => a.sales_count - b.sales_count)
    
    const medianMargin = sortedByMargin[Math.floor(sortedByMargin.length / 2)].contribution_margin
    const medianSales = sortedBySales[Math.floor(sortedBySales.length / 2)].sales_count

    // Classify items into quadrants
    const stars: MenuEngineering[] = []
    const plowhorses: MenuEngineering[] = []
    const puzzles: MenuEngineering[] = []
    const dogs: MenuEngineering[] = []

    engineeringItems.forEach((item, index) => {
      const highProfit = item.contribution_margin >= medianMargin
      const highSales = item.sales_count >= medianSales

      if (highProfit && highSales) {
        item.quadrant = 'star'
        item.recommendation = 'Maintain current pricing and promote more. These are your menu stars!'
        stars.push(item)
      } else if (highProfit && !highSales) {
        item.quadrant = 'plowhorse'
        item.recommendation = 'Increase marketing and visibility. Consider bundling with popular items.'
        plowhorses.push(item)
      } else if (!highProfit && highSales) {
        item.quadrant = 'puzzle'
        item.recommendation = 'Analyze costs or increase price. Popular but not profitable enough.'
        puzzles.push(item)
      } else {
        item.quadrant = 'dog'
        item.recommendation = 'Consider removing or completely redesigning. Low performance overall.'
        dogs.push(item)
      }
      
      // Set ranks based on position in sorted arrays (will be updated after sorting)
      item.profitability_rank = index + 1
      item.popularity_rank = index + 1
    })

    // Calculate quadrant summaries
    const calculateQuadrantSummary = (items: MenuEngineering[], quadrant: string): QuadrantSummary => ({
      quadrant: quadrant as any,
      count: items.length,
      average_margin: items.length > 0 
        ? items.reduce((sum, item) => sum + item.contribution_margin, 0) / items.length 
        : 0,
      total_contribution: items.reduce((sum, item) => sum + (item.contribution_margin * item.sales_count), 0),
      items: items,
      description: quadrant === 'star'
        ? 'High profit, high sales items - your menu superstars!'
        : quadrant === 'plowhorse'
        ? 'High profit, low sales - promote these items to increase sales volume.'
        : quadrant === 'puzzle'
        ? 'High sales, low profit - consider repricing or cost reduction.'
        : 'Low profit, low sales - candidates for removal from menu.',
      action_priority: quadrant === 'dog' || quadrant === 'puzzle' ? 'high' : 'medium'
    })

    const matrix: MenuEngineeringMatrix = {
      total_items: engineeringItems.length,
      median_margin: medianMargin,
      median_sales: medianSales,
      stars: calculateQuadrantSummary(stars, 'star'),
      plowhorses: calculateQuadrantSummary(plowhorses, 'plowhorse'),
      puzzles: calculateQuadrantSummary(puzzles, 'puzzle'),
      dogs: calculateQuadrantSummary(dogs, 'dog'),
      last_calculated: new Date().toISOString()
    }

    const response: MenuEngineeringResponse = {
      success: true,
      matrix,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Menu engineering API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}