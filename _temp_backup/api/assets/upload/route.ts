import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const category = formData.get('category') as string
    const name = formData.get('name') as string
    const altText = formData.get('altText') as string
    const clientId = formData.get('clientId') as string | null

    // Validate required fields
    if (!file || !type || !name) {
      return NextResponse.json({
        error: 'Missing required fields: file, type, and name are required'
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // Validate asset type
    const validTypes = ['background', 'logo', 'icon', 'image']
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        error: `Invalid asset type. Valid types: ${validTypes.join(', ')}`
      }, { status: 400 })
    }

    // Check user permissions for client assets
    if (clientId) {
      const { data: userClient } = await supabase
        .from('client_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single()

      if (!userClient || !['admin', 'manager', 'owner'].includes(userClient.role)) {
        return NextResponse.json({
          error: 'Insufficient permissions to upload assets for this client'
        }, { status: 403 })
      }
    }

    // Generate unique file path
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const filePath = `${type}s/${timestamp}-${sanitizedName}.${fileExtension}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({
        error: 'Failed to upload file to storage'
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)

    // Get image dimensions if it's an image
    let width: number | null = null
    let height: number | null = null
    
    if (file.type.startsWith('image/')) {
      try {
        // Create image to get dimensions
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // For a more robust solution, you'd use a library like 'sharp' here
        // For now, we'll set dimensions to null and let the client handle it
        width = null
        height = null
      } catch (error) {
        console.warn('Could not determine image dimensions:', error)
      }
    }

    // Save asset metadata to database
    const { data: assetData, error: dbError } = await supabase
      .from('assets')
      .insert({
        name,
        type,
        category: category || null,
        file_url: urlData.publicUrl,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        client_id: clientId || null,
        uploaded_by: user.id,
        alt_text: altText || null,
        tags: []
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('assets')
        .remove([filePath])

      return NextResponse.json({
        error: 'Failed to save asset metadata'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      asset: assetData
    }, { status: 201 })

  } catch (error) {
    console.error('Asset upload error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Get assets endpoint
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const clientId = searchParams.get('clientId')

    let query = supabase
      .from('assets')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Filter by type if provided
    if (type) {
      query = query.eq('type', type)
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Handle client-specific vs global assets
    if (clientId) {
      // Get user's access to this client
      const { data: userClient } = await supabase
        .from('client_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single()

      if (!userClient) {
        return NextResponse.json({
          error: 'No access to this client'
        }, { status: 403 })
      }

      // Include both global assets and client-specific assets
      query = query.or(`client_id.is.null,client_id.eq.${clientId}`)
    } else {
      // Only global assets
      query = query.is('client_id', null)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({
        error: 'Failed to fetch assets'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      assets: assets || []
    })

  } catch (error) {
    console.error('Assets fetch error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}