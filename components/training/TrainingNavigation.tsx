'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function TrainingNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/upload/bulk-training',
      label: '📁 Bulk Upload',
      description: 'Upload large docket collections'
    },
    {
      href: '/upload/training',
      label: '✏️ Review & Correct',
      description: 'Review AI extractions'
    },
    {
      href: '/upload/training-analytics',
      label: '📊 Analytics & Export',
      description: 'View progress & export training data'
    },
    {
      href: '/upload/debug-training',
      label: '🔧 Debug',
      description: 'Debug database records'
    }
  ]

  return (
    <div className={getCardStyle('primary')}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 px-4 py-3 rounded-lg text-center transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                }`}
              >
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs opacity-75">{item.description}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}