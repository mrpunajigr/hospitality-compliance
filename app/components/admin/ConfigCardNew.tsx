// components/admin/ConfigCardNew.tsx

'use client'

import React from 'react';
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system';
import type { 
  FieldKey, 
  DisplayFieldConfig, 
  ToggleEvent,
  ConfigCardProps 
} from '@/app/types/Configuration';

/**
 * Enhanced Toggle Component with 2-state positive feedback
 */
interface EnhancedToggleProps {
  enabled: boolean;
  toggleState: DisplayFieldConfig['toggleState'];
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function EnhancedToggle({ 
  enabled, 
  toggleState, 
  onToggle, 
  disabled = false,
  size = 'md' 
}: EnhancedToggleProps) {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-10 h-6', 
    lg: 'w-12 h-7'
  };

  const toggleClass = sizeClasses[size];
  const indicatorClass = enabled 
    ? 'bg-green-500 translate-x-4' 
    : 'bg-gray-300 translate-x-0';

  return (
    <div className="flex items-center gap-3">
      {/* Toggle Switch */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          ${toggleClass} relative inline-flex items-center rounded-full 
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${enabled ? toggleState.indicator.background : 'bg-gray-200 border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
        `}
        title={enabled ? toggleState.enabledMessage : toggleState.disabledMessage}
      >
        <span 
          className={`
            ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}
            inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200
            ${indicatorClass}
          `}
        >
          <span className="flex items-center justify-center h-full text-xs">
            {toggleState.indicator.icon}
          </span>
        </span>
      </button>

      {/* Status Message */}
      <div className="flex-1">
        <p className={`text-xs ${enabled ? 'text-green-600' : 'text-gray-500'} font-medium`}>
          {enabled ? toggleState.enabledMessage : toggleState.disabledMessage}
        </p>
      </div>
    </div>
  );
}

/**
 * Pure Display ConfigCard Component
 * Receives all data via props, emits events via callbacks
 */
export function ConfigCardNew({ 
  fieldKey, 
  fieldConfig, 
  onToggle,
  disabled = false,
  showPositiveFeedback = true 
}: ConfigCardProps) {
  console.log('🎨 [ConfigCardNew] Rendering field:', { 
    fieldKey, 
    enabled: fieldConfig.enabled,
    category: fieldConfig.category 
  });

  const handleToggle = () => {
    console.log('🎨 [ConfigCardNew] Toggle clicked:', fieldKey, !fieldConfig.enabled);
    
    // Create toggle event
    const toggleEvent: ToggleEvent = {
      fieldKey,
      previousState: fieldConfig.enabled,
      newState: !fieldConfig.enabled,
      timestamp: new Date(),
      userMessage: !fieldConfig.enabled 
        ? `${fieldConfig.label} enabled ✓` 
        : `${fieldConfig.label} disabled`
    };

    onToggle(toggleEvent);
  };

  // Apply security level gradient from existing security system
  const getSecurityGradient = (category: 'mandatory' | 'optional') => {
    return category === 'mandatory' 
      ? 'bg-gradient-to-br from-green-400/[0.092] via-green-400/[0.035] via-transparent via-transparent to-transparent'
      : 'bg-gradient-to-br from-blue-400/[0.06] via-blue-400/[0.025] via-transparent via-transparent to-transparent';
  };

  const isMandatory = fieldConfig.category === 'mandatory';
  const isToggleDisabled = disabled || isMandatory;

  return (
    <div className={`
      ${getCardStyle('secondary', 'light')} 
      ${getSecurityGradient(fieldConfig.category)} 
      relative transition-all duration-200 hover:shadow-lg
    `}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`${getTextStyle('cardTitle', 'light')} flex-1`}>
              {fieldConfig.label}
            </h3>
            
            {/* Category Badge */}
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${isMandatory 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-blue-100 text-blue-700 border border-blue-200'
              }
            `}>
              {isMandatory ? 'Required' : 'Optional'}
            </div>
          </div>
          
          <p className={`${getTextStyle('body', 'light')} text-gray-600 text-sm mb-4`}>
            {fieldConfig.description}
          </p>

          {/* Enhanced Toggle with Positive Feedback */}
          {showPositiveFeedback && (
            <EnhancedToggle
              enabled={fieldConfig.enabled}
              toggleState={fieldConfig.toggleState}
              onToggle={handleToggle}
              disabled={isToggleDisabled}
              size="md"
            />
          )}

          {/* Mandatory Field Notice */}
          {isMandatory && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🔒</span>
                <p className="text-xs text-green-700 font-medium">
                  This field is required and cannot be disabled
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Metadata */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Display Order:</span>
          <span>#{fieldConfig.order}</span>
        </div>
        {fieldConfig.defaultValue !== undefined && (
          <div className="flex justify-between">
            <span>Default Value:</span>
            <span className="font-mono">
              {String(fieldConfig.defaultValue) || 'none'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ConfigCard Section Component for grouping related fields
 */
interface ConfigCardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ConfigCardSection({ 
  title, 
  description, 
  children, 
  className = '' 
}: ConfigCardSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-white/20 pb-3">
        <h2 className={`${getTextStyle('sectionTitle', 'light')} mb-1`}>
          {title}
        </h2>
        {description && (
          <p className={`${getTextStyle('body', 'light')} text-gray-600 text-sm`}>
            {description}
          </p>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

/**
 * Loading State Component
 */
export function ConfigCardSkeleton() {
  return (
    <div className={`${getCardStyle('secondary', 'light')} animate-pulse`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-gray-300 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
interface ConfigCardErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function ConfigCardError({ error, onRetry }: ConfigCardErrorProps) {
  return (
    <div className={`${getCardStyle('secondary', 'light')} border-red-300 bg-red-50`}>
      <div className="text-center py-6">
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <h3 className="text-red-700 font-medium mb-2">Configuration Error</h3>
        <p className="text-red-600 text-sm mb-4">
          {error.message || 'Failed to load field configuration'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`${getButtonStyle('outline')} text-red-600 border-red-300 hover:bg-red-50`}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Export for backward compatibility
 */
export default ConfigCardNew;