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

    // Build the main recipes query
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

    // Apply basic sorting (cost sorting will be done post-query)
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
          console.error('Error fetching ingredients for recipe:', recipe.recipe_id, ingredientsError)
          continue
        }

        // Calculate total recipe cost
        let totalCost = 0
        let ingredientCount = ingredients?.length || 0

        for (const ingredient of ingredients || []) {
          try {
            if (ingredient.ingredient_type === 'inventory') {
              const inventoryItem = (ingredient as any).inventory_items
              if (inventoryItem && inventoryItem.unit_cost) {
                // Get conversion factor from unit_conversions table
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
            console.error(`Error calculating cost for ingredient in recipe ${recipe.recipe_id}:`, error)
            // Continue with other ingredients
          }
        }

        // Calculate derived costs
        const costPerPortion = recipe.number_of_portions > 0 ? totalCost / recipe.number_of_portions : 0
        const foodCostPercentage = recipe.menu_price > 0 ? (costPerPortion / recipe.menu_price) * 100 : 0

        // Build recipe with details
        const recipeWithDetails: RecipeWithDetails = {
          recipe_id: recipe.recipe_id,
          client_id: user.id,
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
          ingredient_count: ingredientCount
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
      // For count query, we need to join properly
      countQuery = supabase
        .from('recipes')
        .select(`
          *,
          recipe_categories!inner(category_name)
        `, { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('is_active', true)
        .eq('recipe_categories.category_name', category)
    }

    const { count: totalItems, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting recipes:', countError)
    }

    // Get recipe categories for filter dropdown
    const { data: categories, error: categoriesError } = await supabase
      .from('recipe_categories')
      .select('category_id, client_id, category_name, description, is_active')
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