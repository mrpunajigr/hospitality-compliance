import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SubRecipesResponse, SubRecipeWithDetails } from '../../../../types/RecipeTypes'

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
    const type = searchParams.get('type') || ''
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

    // Build the main sub-recipes query
    let subRecipesQuery = supabase
      .from('sub_recipes')
      .select(`
        sub_recipe_id,
        client_id,
        sub_recipe_name,
        sub_recipe_type,
        batch_yield_quantity,
        batch_yield_unit,
        prep_time_minutes,
        instructions,
        notes,
        shelf_life_days,
        cost_per_unit,
        is_active,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .eq('client_id', user.id)
      .eq('is_active', true)

    // Apply search filter
    if (search) {
      subRecipesQuery = subRecipesQuery.ilike('sub_recipe_name', `%${search}%`)
    }

    // Apply type filter
    if (type && type !== 'all') {
      subRecipesQuery = subRecipesQuery.eq('sub_recipe_type', type)
    }

    // Apply pagination
    const offset = (page - 1) * pageSize
    subRecipesQuery = subRecipesQuery
      .range(offset, offset + pageSize - 1)

    // Apply basic sorting (cost sorting will be done post-query)
    if (sortBy === 'name') {
      subRecipesQuery = subRecipesQuery.order('sub_recipe_name', { ascending: true })
    } else {
      subRecipesQuery = subRecipesQuery.order('sub_recipe_name', { ascending: true })
    }

    const { data: subRecipes, error: subRecipesError } = await subRecipesQuery

    if (subRecipesError) {
      console.error('Error fetching sub-recipes:', subRecipesError)
      return NextResponse.json({ error: 'Failed to fetch sub-recipes' }, { status: 500 })
    }

    // Calculate additional details for each sub-recipe
    const subRecipesWithDetails: SubRecipeWithDetails[] = []

    for (const subRecipe of subRecipes || []) {
      try {
        // Get ingredient count and total cost
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('sub_recipe_ingredients')
          .select(`
            sub_ingredient_id,
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
          console.error('Error fetching ingredients for sub-recipe:', subRecipe.sub_recipe_id, ingredientsError)
        }

        // Calculate total ingredient cost
        let totalIngredientCost = 0
        const ingredientCount = ingredients?.length || 0

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
            console.error(`Error calculating cost for ingredient in sub-recipe ${subRecipe.sub_recipe_id}:`, error)
          }
        }

        // Calculate cost per unit
        const costPerUnit = subRecipe.batch_yield_quantity > 0 
          ? totalIngredientCost / subRecipe.batch_yield_quantity 
          : 0

        // Get usage count (how many recipes use this sub-recipe)
        const { count: usageCount } = await supabase
          .from('recipe_ingredients')
          .select('*', { count: 'exact', head: true })
          .eq('sub_recipe_id', subRecipe.sub_recipe_id)
          .eq('client_id', user.id)
          .eq('ingredient_type', 'sub_recipe')

        // Get last production date
        const { data: lastProduction } = await supabase
          .from('production_batches')
          .select('production_date')
          .eq('sub_recipe_id', subRecipe.sub_recipe_id)
          .eq('client_id', user.id)
          .order('production_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Build sub-recipe with details
        const subRecipeWithDetails: SubRecipeWithDetails = {
          ...subRecipe,
          total_ingredient_cost: totalIngredientCost,
          ingredient_count: ingredientCount,
          usage_count: usageCount || 0,
          last_produced: lastProduction?.production_date || undefined
        }

        // Update cost_per_unit if calculated differently than stored
        subRecipeWithDetails.cost_per_unit = costPerUnit

        subRecipesWithDetails.push(subRecipeWithDetails)

      } catch (error) {
        console.error(`Error calculating details for sub-recipe ${subRecipe.sub_recipe_id}:`, error)
        // Continue with other sub-recipes
      }
    }

    // Apply sorting based on calculated fields
    if (sortBy === 'cost_per_unit') {
      subRecipesWithDetails.sort((a, b) => a.cost_per_unit - b.cost_per_unit)
    } else if (sortBy === 'usage_count') {
      subRecipesWithDetails.sort((a, b) => b.usage_count - a.usage_count)
    } else if (sortBy === 'last_produced') {
      subRecipesWithDetails.sort((a, b) => {
        if (!a.last_produced) return 1
        if (!b.last_produced) return -1
        return new Date(b.last_produced).getTime() - new Date(a.last_produced).getTime()
      })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('sub_recipes')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('is_active', true)

    if (search) {
      countQuery = countQuery.ilike('sub_recipe_name', `%${search}%`)
    }

    if (type && type !== 'all') {
      countQuery = countQuery.eq('sub_recipe_type', type)
    }

    const { count: totalItems, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting sub-recipes:', countError)
    }

    const totalPages = Math.ceil((totalItems || 0) / pageSize)

    const response: SubRecipesResponse = {
      success: true,
      subRecipes: subRecipesWithDetails,
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
    console.error('Sub-recipes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}