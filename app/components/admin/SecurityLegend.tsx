'use client'

import { useState } from 'react'
import { SECURITY_LEVELS } from '@/app/types/config-card'

export default function SecurityLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  const levels = [
    { key: 'low', ...SECURITY_LEVELS.low },
    { key: 'medium', ...SECURITY_LEVELS.medium },
    { key: 'high', ...SECURITY_LEVELS.high },
    { key: 'critical', ...SECURITY_LEVELS.critical }
  ]

  return (
    <div className="relative">
      {/* Legend Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
        title="Security Level Guide"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-purple-400 to-red-400"></div>
        <span className="text-sm font-medium text-white">Security Levels</span>
        <img 
          src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/expand.png"
          alt="Toggle"
          className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Legend */}
      {isExpanded && (
        <div className="absolute right-0 top-12 bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-xl z-10 min-w-72">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Security Level Guide</h4>
          
          <div className="space-y-2">
            {levels.map((level) => (
              <div key={level.key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-3 h-3 rounded-full mt-0.5 ${level.color.replace('text-', 'bg-')}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${level.color.replace('text-', 'text-')}`}>
                      {level.label}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">({level.level})</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {level.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Usage Note */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Higher security levels require more careful consideration before making changes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}