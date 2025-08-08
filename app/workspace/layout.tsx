'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/workspace/dashboard' },
    { name: 'Upload', href: '/workspace/upload' },
    { name: 'Reports', href: '/workspace/reports' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Home-Chef-Chicago-8.webp')`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header - Exact Admin Portal Style */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <img 
                    src="/jgr_logo_full.png" 
                    alt="JGR Logo" 
                    className="w-7 h-7 object-contain filter brightness-0 invert"
                  />
                </div>
                <div>
                  <span className="text-white font-bold text-2xl">Workspace</span>
                  <p className="text-white/60 text-xs">v1.8.6</p>
                </div>
              </div>

              {/* Navigation Pills - Exact Admin Style */}
              <div className="hidden md:flex items-center">
                <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-white/20 text-gray-900 backdrop-blur-sm shadow-sm'
                          : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Avatar & Actions */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/admin/company" 
                  className="bg-white/10 hover:bg-white/20 text-gray-900 hover:text-gray-800 font-medium py-2 px-4 rounded-xl transition-all duration-200 border border-white/20 backdrop-blur-sm"
                >
                  Admin Portal
                </Link>
                
                {/* User Avatar */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden md:block">
                    <div className="text-white font-semibold text-sm">Demo User</div>
                    <div className="text-white/60 text-xs">Workspace</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                    <span className="text-white text-sm">👤</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Mobile Navigation - Exact Admin Style */}
          <div className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex space-x-1 py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-white/20 text-gray-900 backdrop-blur-sm'
                        : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}