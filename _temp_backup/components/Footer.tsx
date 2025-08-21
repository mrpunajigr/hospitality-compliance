import Link from 'next/link'

interface FooterProps {
  version?: string
  transparent?: boolean
}

export default function Footer({ version = "1.0.0", transparent = false }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20">
      <div className={`flex items-center justify-center gap-4 px-4 py-3 ${transparent ? '' : 'bg-white/30 backdrop-blur-xl border-t border-white/40 shadow-lg'}`}>
        {/* Version Number */}
        <span className={`text-xs typography-paragraph font-source font-medium ${transparent ? 'text-white/80' : 'text-gray-800'}`}>
          v{version}
        </span>
        
        {/* Separator */}
        <span className={transparent ? 'text-white/60' : 'text-gray-600'}>•</span>
        
        {/* Logo with Liquid Glass Effect */}
        <div className="logo-container liquid-glass-logo liquid-glass-small">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="w-12 h-12 object-contain prismatic-glow"
          />
        </div>
        
        {/* Separator */}
        <span className={transparent ? 'text-white/60' : 'text-gray-600'}>•</span>
        
        {/* Dashboard Button - Small and Discrete */}
        <Link 
          href="/admin"
          className={`text-xs transition-colors underline decoration-dotted underline-offset-2 typography-link font-source font-medium ${transparent ? 'text-white/80 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}
        >
          Admin
        </Link>
      </div>
    </footer>
  )
}