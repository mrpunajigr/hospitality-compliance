import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ProductionRequest, ProductionResponse } from '../../../../types/RecipeTypes'

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

    const productionData: ProductionRequest = await request.json()

    // Validate required fields
    if (!productionData.sub_recipe_id || !productionData.quantity_produced || !productionData.shelf_life_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get sub-recipe details
    const { data: subRecipe, error: subRecipeError } = await supabase
      .from('sub_recipes')
      .select('*')
      .eq('sub_recipe_id', productionData.sub_recipe_id)
      .eq('client_id', user.id)
      .single()

    if (subRecipeError || !subRecipe) {
      return NextResponse.json({ error: 'Sub-recipe not found' }, { status: 404 })
    }

    // Calculate yield percentage
    const yieldPercentage = subRecipe.batch_yield_quantity > 0 
      ? (productionData.quantity_produced / subRecipe.batch_yield_quantity) * 100 
      : 0

    // Generate unique identifiers
    const productionId = crypto.randomUUID()
    const batchNumber = `PROD-${Date.now()}-${subRecipe.sub_recipe_name.replace(/\s+/g, '').substring(0, 8)}`
    const inventoryItemName = `${subRecipe.sub_recipe_name} (In-House)`

    // Start transaction-like operations
    let inventoryItemId: string | null = null
    let batchId: string | null = null
    let productionRecorded = false
    let countUpdated = false

    try {
      // 1. Create production batch record
      const { data: production, error: productionError } = await supabase
        .from('production_batches')
        .insert({
          production_id: productionId,
          client_id: user.id,
          sub_recipe_id: productionData.sub_recipe_id,
          quantity_produced: productionData.quantity_produced,
          batch_yield_unit: subRecipe.batch_yield_unit,
          production_time_minutes: productionData.production_time_minutes,
          yield_percentage: yieldPercentage,
          quality_notes: productionData.quality_notes,
          shelf_life_date: productionData.shelf_life_date,
          produced_by: user.id,
          production_date: new Date().toISOString()
        })
        .select()
        .single()

      if (productionError) {
        throw new Error(`Failed to record production: ${productionError.message}`)
      }
      productionRecorded = true

      // 2. Create or update inventory item
      // First check if item already exists
      const { data: existingItem } = await supabase
        .from('inventory_items')
        .select('item_id')
        .eq('client_id', user.id)
        .eq('item_name', inventoryItemName)
        .maybeSingle()

      if (existingItem) {
        // Update existing item cost
        inventoryItemId = existingItem.item_id
        
        const newUnitCost = productionData.quantity_produced > 0 
          ? subRecipe.cost_per_unit * (subRecipe.batch_yield_quantity / productionData.quantity_produced)
          : subRecipe.cost_per_unit

        await supabase
          .from('inventory_items')
          .update({
            unit_cost: newUnitCost,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('item_id', inventoryItemId)

      } else {
        // Create new inventory item
        // First get or create "In-House" category
        let categoryId: string
        const { data: category } = await supabase
          .from('inventory_categories')
          .select('category_id')
          .eq('client_id', user.id)
          .eq('category_name', 'In-House')
          .maybeSingle()

        if (category) {
          categoryId = category.category_id
        } else {
          const { data: newCategory } = await supabase
            .from('inventory_categories')
            .insert({
              client_id: user.id,
              category_name: 'In-House',
              description: 'Items produced in-house from sub-recipes'
            })
            .select('category_id')
            .single()
          
          categoryId = newCategory!.category_id
        }

        const { data: newItem } = await supabase
          .from('inventory_items')
          .insert({
            client_id: user.id,
            category_id: categoryId,
            item_name: inventoryItemName,
            recipe_unit: subRecipe.batch_yield_unit,
            count_unit: subRecipe.batch_yield_unit,
            source_type: 'produced',
            unit_cost: subRecipe.cost_per_unit,
            par_level_low: 1, // Default par level
            created_by: user.id
          })
          .select('item_id')
          .single()

        inventoryItemId = newItem!.item_id
      }

      // 3. Create inventory batch for expiration tracking
      const { data: batch, error: batchError } = await supabase
        .from('inventory_batches')
        .insert({
          client_id: user.id,
          item_id: inventoryItemId,
          batch_number: batchNumber,
          quantity_received: productionData.quantity_produced,
          quantity_remaining: productionData.quantity_produced,
          received_date: new Date().toISOString(),
          expiration_date: productionData.shelf_life_date,
          source_type: 'produced',
          status: 'active',
          vendor_id: null, // In-house production
          created_by: user.id
        })
        .select('batch_id')
        .single()

      if (batchError) {
        throw new Error(`Failed to create batch: ${batchError.message}`)
      }
      batchId = batch.batch_id

      // 4. Update inventory count
      // Get current count
      const { data: currentCount } = await supabase
        .from('inventory_count')
        .select('quantity_on_hand')
        .eq('client_id', user.id)
        .eq('item_id', inventoryItemId)
        .order('count_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      const currentQuantity = currentCount?.quantity_on_hand || 0
      const newQuantity = currentQuantity + productionData.quantity_produced

      const { error: countError } = await supabase
        .from('inventory_count')
        .insert({
          client_id: user.id,
          item_id: inventoryItemId,
          quantity_on_hand: newQuantity,
          count_unit: subRecipe.batch_yield_unit,
          count_date: new Date().toISOString(),
          counted_by: user.id,
          notes: `Production batch: ${batchNumber}`,
          count_type: 'production'
        })

      if (countError) {
        throw new Error(`Failed to update inventory count: ${countError.message}`)
      }
      countUpdated = true

      // Success! All operations completed
      const response: ProductionResponse = {
        success: true,
        production: {
          production_id: productionId,
          client_id: user.id,
          sub_recipe_id: productionData.sub_recipe_id,
          quantity_produced: productionData.quantity_produced,
          batch_yield_unit: subRecipe.batch_yield_unit,
          production_time_minutes: productionData.production_time_minutes,
          yield_percentage: yieldPercentage,
          quality_notes: productionData.quality_notes,
          shelf_life_date: productionData.shelf_life_date,
          produced_by: user.id,
          production_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          sub_recipe_name: subRecipe.sub_recipe_name,
          expected_yield: subRecipe.batch_yield_quantity,
          expected_cost: subRecipe.cost_per_unit * subRecipe.batch_yield_quantity,
          actual_cost_per_unit: subRecipe.cost_per_unit,
          inventory_item_id: inventoryItemId || undefined,
          batch_number: batchNumber
        },
        inventoryItemCreated: !existingItem,
        batchCreated: true,
        countUpdated: true,
        message: `Production recorded successfully. ${inventoryItemName} is now available in inventory.`
      }

      return NextResponse.json(response)

    } catch (error) {
      console.error('Production recording error:', error)

      // Attempt cleanup of partial operations (best effort)
      try {
        if (productionRecorded) {
          await supabase
            .from('production_batches')
            .delete()
            .eq('production_id', productionId)
        }
        
        if (batchId) {
          await supabase
            .from('inventory_batches')
            .delete()
            .eq('batch_id', batchId)
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }

      return NextResponse.json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to record production',
        production: null,
        inventoryItemCreated: false,
        batchCreated: false,
        countUpdated: false
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Production API error:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      production: null,
      inventoryItemCreated: false,
      batchCreated: false,
      countUpdated: false
    }, { status: 500 })
  }
}