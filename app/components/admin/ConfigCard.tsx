'use client'

import { useState, ReactNode } from 'react'
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system'

interface SecurityLevel {
  level: 'low' | 'medium' | 'high' | 'critical'
  label: string
  description: string
  color: string
}

interface UserPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canViewSecurity?: boolean
}

interface ConfigCardProps {
  title: string
  description: string
  icon?: string
  securityLevel: SecurityLevel
  userPermissions: UserPermissions
  children: ReactNode
  actions?: ReactNode
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
  className?: string
}

const SECURITY_LEVELS: Record<string, SecurityLevel> = {
  low: {
    level: 'low',
    label: 'Standard',
    description: 'Basic configuration changes',
    color: 'text-green-400'
  },
  medium: {
    level: 'medium',
    label: 'Elevated',
    description: 'Changes affect user access',
    color: 'text-yellow-400'
  },
  high: {
    level: 'high',
    label: 'Restricted',
    description: 'Changes affect security permissions',
    color: 'text-purple-400'
  },
  critical: {
    level: 'critical',
    label: 'Critical',
    description: 'Changes affect system security',
    color: 'text-red-400'
  }
}

export default function ConfigCard({
  title,
  description,
  icon = '⚙️',
  securityLevel,
  userPermissions,
  children,
  actions,
  isLoading = false,
  error,
  onRefresh,
  className = ''
}: ConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const securityInfo = SECURITY_LEVELS[securityLevel.level] || SECURITY_LEVELS.low

  // Generate security-based corner gradient background (inspired by screenshot)
  const getSecurityGradient = (level: string) => {
    const gradients = {
      low: 'bg-gradient-to-br from-green-400/[0.092] via-green-400/[0.035] via-transparent via-transparent to-transparent',
      medium: 'bg-gradient-to-br from-yellow-400/[0.092] via-yellow-400/[0.035] via-transparent via-transparent to-transparent', 
      high: 'bg-gradient-to-br from-purple-400/[0.115] via-purple-400/[0.046] via-transparent via-transparent to-transparent',
      critical: 'bg-gradient-to-br from-red-400/[0.138] via-red-400/[0.058] via-transparent via-transparent to-transparent'
    }
    return gradients[level as keyof typeof gradients] || gradients.low
  }

  return (
    <div className={`${getCardStyle('secondary', 'light')} ${getSecurityGradient(securityLevel.level)} relative ${className}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`${getTextStyle('cardTitle', 'light')}`}>{title}</h3>
              {/* Security Warning Icon (for high/critical levels) */}
              {['high', 'critical'].includes(securityLevel.level) && (
                <div className="relative group">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/warning.png"
                    alt="Security Warning"
                    className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity cursor-help"
                  />
                  {/* Hover Tooltip */}
                  <div className="absolute right-0 top-8 bg-orange-500/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    <div className="font-medium">Security Warning</div>
                    <div className="text-orange-100">{securityLevel.description}</div>
                  </div>
                </div>
              )}
            </div>
            <p className={`${getTextStyle('body', 'light')} text-gray-600 text-sm`}>
              {description}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/25 hover:bg-white/20 transition-colors"
          >
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/expand.png"
              alt="Expand"
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>



      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden">
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-300">
                  <span>❌</span>
                  <span className="text-sm font-medium">Error</span>
                </div>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="text-xs text-red-300 hover:text-red-200"
                  >
                    Retry
                  </button>
                )}
              </div>
              <p className="text-xs text-red-200 mt-1">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading configuration...</span>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !error && (
            <div>
              {children}
            </div>
          )}

          {/* Actions Footer */}
          {actions && !isLoading && (
            <div className="pt-4 border-t border-white/20">
              {actions}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

// Security Level Badge Component (standalone)
export function SecurityBadge({ level, size = 'sm' }: { level: SecurityLevel['level'], size?: 'sm' | 'md' }) {
  const securityInfo = SECURITY_LEVELS[level] || SECURITY_LEVELS.low
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full bg-white/25 border border-white/20 cursor-help`}
      title={`${securityInfo.label}: ${securityInfo.description}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${securityInfo.color.replace('text-', 'bg-')}`} />
      <span className={`font-medium ${securityInfo.color}`}>
        {securityInfo.label}
      </span>
    </div>
  )
}

// Permission Check Component
export function PermissionGate({ 
  hasPermission, 
  children, 
  fallback 
}: { 
  hasPermission: boolean
  children: ReactNode
  fallback?: ReactNode 
}) {
  if (!hasPermission) {
    return fallback ? <>{fallback}</> : (
      <div className="text-center py-4 text-white/60">
        <span className="text-lg">🔒</span>
        <p className="text-sm mt-2 text-gray-600">Insufficient permissions</p>
      </div>
    )
  }

  return <>{children}</>
}

// Confirmation Dialog Hook
export function useConfigConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    confirmText: string
    onConfirm: () => void
    isDangerous?: boolean
  } | null>(null)

  const confirm = (options: typeof config) => {
    setConfig(options)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        options?.onConfirm()
        setIsOpen(false)
        setConfig(null)
        resolve(true)
      }
      
      const handleCancel = () => {
        setIsOpen(false)
        setConfig(null)
        resolve(false)
      }

      // Store handlers for dialog
      if (options) {
        ;(options as any)._handleConfirm = handleConfirm
        ;(options as any)._handleCancel = handleCancel
      }
    })
  }

  const ConfirmationDialog = () => {
    if (!isOpen || !config) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`${getCardStyle('primary')} max-w-md w-full mx-4`}>
          <h3 className={`${getTextStyle('cardTitle')} mb-3`}>{config.title}</h3>
          <p className={`${getTextStyle('body')} text-white/80 mb-6`}>{config.message}</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={(config as any)._handleCancel}
              className={`${getButtonStyle('outline')} px-4 py-2`}
            >
              Cancel
            </button>
            <button
              onClick={(config as any)._handleConfirm}
              className={`${getButtonStyle(config.isDangerous ? 'danger' : 'primary')} px-4 py-2`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return { confirm, ConfirmationDialog }
}