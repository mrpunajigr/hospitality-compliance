'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TrainingNavigation = () => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/upload/training', label: 'Training' },
    { href: '/upload/training-analytics', label: 'Analytics' },
    { href: '/upload/debug-training', label: 'Debug' },
    { href: '/upload/bulk-training', label: 'Bulk Training' }
  ]

  return (
    <nav className="mb-6">
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 border-b-2 transition-colors ${
              pathname === item.href
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default TrainingNavigation