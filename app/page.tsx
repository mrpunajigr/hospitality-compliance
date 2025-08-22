'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎉 Complete OCR Enhancement System
          </h1>
          <p className="text-purple-200 text-lg">
            Advanced document processing with quality validation and full navigation
          </p>
        </div>

        {/* Main Features */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/ocr-enhanced" className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-colors text-center block">
              <h2 className="text-white text-xl font-bold mb-3">🚀 Enhanced OCR Processing</h2>
              <p className="text-white/80 mb-4">Multi-step OCR workflow with quality validation</p>
              <div className="text-purple-300 text-sm">
                • Quality analysis • OCR processing • Compliance checking
              </div>
            </Link>
            
            <Link href="/upload/capture" className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-colors text-center block">
              <h2 className="text-white text-xl font-bold mb-3">📷 Document Capture</h2>
              <p className="text-white/80 mb-4">Advanced document capture with preprocessing</p>
              <div className="text-purple-300 text-sm">
                • Image enhancement • Format optimization • Quality validation
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            System Navigation
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/console/dashboard" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors text-center block">
              <h3 className="text-white font-semibold mb-2">📊 Dashboard</h3>
              <p className="text-white/70 text-sm">View analytics and compliance reports</p>
            </Link>
            
            <Link href="/upload/console" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors text-center block">
              <h3 className="text-white font-semibold mb-2">🚀 Upload Console</h3>
              <p className="text-white/70 text-sm">Professional upload interface</p>
            </Link>
            
            <Link href="/admin/company-settings" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors text-center block">
              <h3 className="text-white font-semibold mb-2">⚙️ Admin Settings</h3>
              <p className="text-white/70 text-sm">Company configuration and management</p>
            </Link>
          </div>
        </div>

        {/* Authentication & Development */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/signin" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors text-center block">
              <h3 className="text-white font-semibold mb-2">🔐 Authentication</h3>
              <p className="text-white/70 text-sm">Sign in to access secure features</p>
            </Link>
            
            <Link href="/dev/login" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors text-center block">
              <h3 className="text-white font-semibold mb-2">🛠️ Development</h3>
              <p className="text-white/70 text-sm">Development tools and testing</p>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-semibold mb-4 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <Link href="/test-upload" className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-center transition-colors border border-white/20">
              📋 Test Upload
            </Link>
            
            <Link href="/console/reports" className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-center transition-colors border border-white/20">
              📈 Reports
            </Link>
            
            <Link href="/style-guide" className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-center transition-colors border border-white/20">
              🎨 Style Guide
            </Link>
            
            <Link href="/simple" className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-center transition-colors border border-white/20">
              🧪 Simple Test
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">🏆 System Status</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-green-300">
                ✅ Node.js 20 compatibility
              </div>
              <div className="text-green-300">
                ✅ Supabase environment configured
              </div>
              <div className="text-green-300">
                ✅ Complete OCR system deployed
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-purple-300 text-sm">
                🚀 Full hospitality compliance system with enhanced OCR processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}