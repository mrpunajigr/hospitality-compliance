'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/JigrLogoStackWhite.png" 
            alt="JiGR Logo" 
            className="h-20 w-auto mx-auto object-contain"
          />
        </div>

        {/* Error Content */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-white/80 mb-6">
            An unexpected error occurred. Our team has been notified and is working to fix it.
          </p>
          
          {/* Error ID for support */}
          {error.digest && (
            <div className="mb-6 p-3 bg-white/5 border border-white/20 rounded-lg">
              <p className="text-white/60 text-xs">
                Error ID: <code className="bg-white/10 px-2 py-1 rounded text-xs">{error.digest}</code>
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={reset}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
            >
              Go Home
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm">
              If this persists, contact{' '}
              <a 
                href="mailto:tech@jigr.app" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                technical support
              </a>
              {error.digest && ` with error ID: ${error.digest}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs">
            © 2025 JiGR | Modular Hospitality Solution
          </p>
        </div>

      </div>
    </div>
  )
}