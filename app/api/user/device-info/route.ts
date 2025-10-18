import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { detectDevice, getDeviceDescription, getDeviceCapabilities, categorizeDeviceForAnalytics, type DeviceInfo } from '@/lib/device-detection'

/**
 * POST /api/user/device-info
 * Capture and store user device information for analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, deviceInfo: clientDeviceInfo } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user agent from request headers for server-side detection
    const userAgent = request.headers.get('user-agent') || ''
    
    // Combine server-side and client-side device detection
    const serverDeviceInfo = detectDevice(userAgent)
    const combinedDeviceInfo: DeviceInfo = {
      ...serverDeviceInfo,
      ...clientDeviceInfo, // Client-side data takes precedence for screen info
      userAgent, // Always use server-side user agent for accuracy
      detectedAt: new Date().toISOString()
    }

    // Generate analytics data
    const deviceDescription = getDeviceDescription(combinedDeviceInfo)
    const capabilities = getDeviceCapabilities(combinedDeviceInfo)
    const analytics = categorizeDeviceForAnalytics(combinedDeviceInfo)

    // Prepare data for storage
    const deviceRecord = {
      user_id: userId,
      device_info: combinedDeviceInfo,
      device_description: deviceDescription,
      device_category: analytics.category,
      device_subcategory: analytics.subcategory,
      screen_size_category: analytics.screenSize,
      is_recommended_device: analytics.isRecommendedDevice,
      supports_advanced_features: capabilities.supportsAdvancedFeatures,
      is_legacy_device: capabilities.isLegacyDevice,
      needs_optimization: capabilities.needsOptimization,
      detected_at: combinedDeviceInfo.detectedAt,
      session_start: new Date().toISOString()
    }

    // Store in user_device_info table
    const { data, error } = await supabase
      .from('user_device_info')
      .upsert(deviceRecord, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Device info storage error:', error)
      return NextResponse.json(
        { error: 'Failed to store device information' },
        { status: 500 }
      )
    }

    // Also update the profiles table with current device summary
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        current_device_info: {
          description: deviceDescription,
          category: analytics.category,
          isRecommended: analytics.isRecommendedDevice,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.warn('Profile device info update failed:', profileError)
      // Don't fail the request for profile update errors
    }

    return NextResponse.json({
      success: true,
      deviceInfo: combinedDeviceInfo,
      analytics: {
        description: deviceDescription,
        capabilities,
        analytics
      }
    })

  } catch (error) {
    console.error('Device detection API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/device-info?userId=xxx
 * Retrieve stored device information for analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get device info from database
    const { data, error } = await supabase
      .from('user_device_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Device info fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch device information' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No device information found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      deviceInfo: data
    })

  } catch (error) {
    console.error('Device info fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}