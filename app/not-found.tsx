import Link from 'next/link'
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

export default function NotFound() {
  return (
    <PublicPageBackgroundWithGradient
      backgroundImage="restaurant.jpg"
      gradientStart="rgba(0,0,0,0.7)"
      gradientEnd="rgba(0,0,0,0.8)"
      additionalOverlay="rgba(0,0,0,0.3)"
    >
      <div className="min-h-screen flex items-center justify-center px-4">
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
            <div className="text-6xl font-bold text-white mb-4">404</div>
            <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-white/80 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Go Home
              </Link>
              <Link
                href="/login"
                className="block w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Login to Account
              </Link>
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-white/60 text-sm">
                Need help? Contact our{' '}
                <a 
                  href="mailto:support@jigr.app" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  support team
                </a>
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
    </PublicPageBackgroundWithGradient>
  )
}