import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧹 CLEARING STALE DATABASE RECORDS...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Delete all stale test records
    const { data: deletedRecords, error: deleteError } = await supabase
      .from('delivery_records')
      .delete()
      .or(`supplier_name.in.("Unknown Supplier","TEST_DEFAULT","Extraction Failed"),raw_extracted_text.like."%AWS processing attempted%",image_path.like."%test20%",processing_status.eq."processed"`)
      .select('id')

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      throw deleteError
    }

    console.log('✅ Deleted records:', deletedRecords?.length || 0)

    // Count remaining records
    const { count, error: countError } = await supabase
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Count error:', countError)
      throw countError
    }

    console.log('📊 Remaining records:', count)

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deletedRecords?.length || 0,
        remainingCount: count,
        message: 'Stale records cleared successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Cache clear failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})