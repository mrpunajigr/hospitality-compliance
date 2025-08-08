'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Company', href: '/admin/company', icon: '🏢' },
    { name: 'Profile', href: '/admin/profile', icon: '👤' },
    { name: 'Settings', href: '/admin/company/settings', icon: '⚙️' },
    { name: 'Team', href: '/admin/company/team', icon: '👥' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero-image.jpg')`,
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Simple Admin Header */}
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
                <span className="text-white font-bold text-2xl">Admin Portal</span>
                <p className="text-white/60 text-xs">v1.8.6</p>
              </div>
            </div>

            {/* Navigation Pills */}
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
                href="/workspace/dashboard" 
                className="bg-white/10 hover:bg-white/20 text-gray-900 hover:text-gray-800 font-medium py-2 px-4 rounded-xl transition-all duration-200 border border-white/20 backdrop-blur-sm"
              >
                Back to Dashboard
              </Link>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <div className="text-white font-semibold text-sm">John Doe</div>
                  <div className="text-white/60 text-xs">Administrator</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                  <img 
                    src="/hero-image.jpg" 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center py-3">
              <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
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
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="relative z-10 pt-6">
        {children}
      </main>
    </div>
  )
}