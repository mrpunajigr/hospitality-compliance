/**
 * FoodCostBadge Component
 * 
 * Displays food cost percentage with industry-standard color coding
 * 🟢 Green: 20-32% (ideal profitability)
 * 🟡 Yellow: 32-40% (acceptable but high)
 * 🟠 Orange: 40-50% (concerning)
 * 🔴 Red: >50% (losing money) or <20% (underpriced)
 */

import React from 'react'
import { FoodCostBadgeProps, FoodCostStatus, FoodCostAnalysis } from '../../types/RecipeTypes'

export function FoodCostBadge({ 
  percentage, 
  showPercentage = true, 
  size = 'md', 
  className = '' 
}: FoodCostBadgeProps) {
  
  const getFoodCostAnalysis = (percentage: number): FoodCostAnalysis => {
    if (percentage < 20) {
      return {
        percentage,
        status: 'critical',
        color: 'red',
        message: 'Underpriced - Consider raising menu price'
      }
    } else if (percentage >= 20 && percentage <= 32) {
      return {
        percentage,
        status: 'excellent',
        color: 'green',
        message: 'Excellent profit margin'
      }
    } else if (percentage > 32 && percentage <= 40) {
      return {
        percentage,
        status: 'good',
        color: 'yellow',
        message: 'Acceptable but high food cost'
      }
    } else if (percentage > 40 && percentage <= 50) {
      return {
        percentage,
        status: 'high',
        color: 'orange',
        message: 'High food cost - Review pricing'
      }
    } else {
      return {
        percentage,
        status: 'critical',
        color: 'red',
        message: 'Losing money - Urgent review needed'
      }
    }
  }

  const analysis = getFoodCostAnalysis(percentage)
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-4 py-2 text-base'
      default: // 'md'
        return 'px-3 py-1.5 text-sm'
    }
  }
  
  const getColorClasses = () => {
    switch (analysis.color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEmoji = () => {
    switch (analysis.color) {
      case 'green':
        return '🟢'
      case 'yellow':
        return '🟡'
      case 'orange':
        return '🟠'
      case 'red':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div 
      className={`
        inline-flex items-center rounded-full border font-medium
        ${getSizeClasses()} 
        ${getColorClasses()} 
        ${className}
      `}
      title={analysis.message}
    >
      <span className="mr-1" aria-hidden="true">
        {getEmoji()}
      </span>
      {showPercentage && (
        <span>
          {formatPercentage(analysis.percentage)}
        </span>
      )}
      {!showPercentage && (
        <span className="capitalize">
          {analysis.status}
        </span>
      )}
    </div>
  )
}

/**
 * Helper function to get food cost analysis
 * Useful for conditional logic based on food cost status
 */
export function getFoodCostAnalysis(percentage: number): FoodCostAnalysis {
  if (percentage < 20) {
    return {
      percentage,
      status: 'critical',
      color: 'red',
      message: 'Underpriced - Consider raising menu price'
    }
  } else if (percentage >= 20 && percentage <= 32) {
    return {
      percentage,
      status: 'excellent',
      color: 'green',
      message: 'Excellent profit margin'
    }
  } else if (percentage > 32 && percentage <= 40) {
    return {
      percentage,
      status: 'good',
      color: 'yellow',
      message: 'Acceptable but high food cost'
    }
  } else if (percentage > 40 && percentage <= 50) {
    return {
      percentage,
      status: 'high',
      color: 'orange',
      message: 'High food cost - Review pricing'
    }
  } else {
    return {
      percentage,
      status: 'critical',
      color: 'red',
      message: 'Losing money - Urgent review needed'
    }
  }
}

/**
 * Get food cost status without full analysis
 */
export function getFoodCostStatus(percentage: number): FoodCostStatus {
  return getFoodCostAnalysis(percentage).status
}

/**
 * Check if food cost percentage is within target range
 */
export function isFoodCostHealthy(percentage: number): boolean {
  return percentage >= 20 && percentage <= 32
}