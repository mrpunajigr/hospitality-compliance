import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST API: Started')
    
    const formData = await request.formData()
    console.log('🧪 TEST API: FormData received')
    
    const clientId = formData.get('clientId') as string
    const userId = formData.get('userId') as string
    
    console.log('🧪 TEST API: clientId =', clientId)
    console.log('🧪 TEST API: userId =', userId)
    console.log('🧪 TEST API: Service Role Key =', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING')
    
    // Count files
    let fileCount = 0
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        fileCount++
        console.log(`🧪 TEST API: File ${fileCount}: ${value.name} (${value.size} bytes)`)
      }
    }
    
    console.log('🧪 TEST API: Total files =', fileCount)
    console.log('🧪 TEST API: Completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Test API working',
      clientId,
      userId,
      fileCount,
      serviceRoleKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
  } catch (error) {
    console.error('🧪 TEST API: Error =', error)
    console.error('🧪 TEST API: Stack =', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}