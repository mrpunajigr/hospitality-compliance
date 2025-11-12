/**
 * Menu Management System Type Definitions
 * 
 * Comprehensive type definitions for the MENU module including
 * menu pricing, engineering analytics, and performance analysis
 */

import { RecipeWithDetails } from './RecipeTypes'

// ============================================================================
// MENU PRICING TYPES
// ============================================================================

export interface MenuPricingItem {
  recipe_id: string
  recipe_name: string
  category_name: string
  cost_per_portion: number
  menu_price: number
  food_cost_percentage: number
  contribution_margin: number
  status: 'excellent' | 'good' | 'high' | 'critical' | 'underpriced'
  last_updated: string
}

export interface PricingUpdateRequest {
  recipe_id: string
  new_price: number
  reason?: string
}

export interface PricingSummary {
  total_items: number
  average_food_cost_percentage: number
  weighted_average_food_cost_percentage?: number
  items_in_target_range: number
  items_needing_attention: number
  target_range: {
    min: number
    max: number
  }
}

// ============================================================================
// MENU ENGINEERING TYPES
// ============================================================================

export type MenuQuadrant = 'star' | 'plowhorse' | 'puzzle' | 'dog'

export interface MenuEngineering {
  recipe_id: string
  recipe_name: string
  category_name: string
  contribution_margin: number
  sales_count: number
  quadrant: MenuQuadrant
  profitability_rank: number
  popularity_rank: number
  recommendation: string
}

export interface QuadrantSummary {
  quadrant: MenuQuadrant
  count: number
  items: MenuEngineering[]
  average_margin: number
  total_contribution: number
  description: string
  action_priority: 'high' | 'medium' | 'low'
}

export interface MenuEngineeringMatrix {
  stars: QuadrantSummary
  plowhorses: QuadrantSummary
  puzzles: QuadrantSummary
  dogs: QuadrantSummary
  median_margin: number
  median_sales: number
  total_items: number
  last_calculated: string
}

// ============================================================================
// MENU ANALYSIS TYPES
// ============================================================================

export interface MenuAnalytics {
  period: string
  total_revenue?: number
  total_cost?: number
  overall_food_cost_percentage: number
  target_food_cost_percentage: number
  variance_from_target: number
  top_performers: TopPerformer[]
  category_performance: CategoryPerformance[]
  items_needing_attention: AttentionItem[]
}

export interface TopPerformer {
  recipe_id: string
  recipe_name: string
  sales_count: number
  contribution_margin: number
  total_contribution: number
  revenue_percentage: number
}

export interface CategoryPerformance {
  category_name: string
  item_count: number
  average_food_cost_percentage: number
  total_sales: number
  total_contribution: number
  contribution_percentage: number
}

export interface AttentionItem {
  recipe_id: string
  recipe_name: string
  issue_type: 'high_food_cost' | 'no_sales' | 'dog_quadrant' | 'declining_trend'
  food_cost_percentage?: number
  sales_count?: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

// ============================================================================
// PRICING SCENARIOS TYPES
// ============================================================================

export interface PricingScenario {
  price: number
  food_cost_percentage: number
  contribution_margin: number
  is_optimal: boolean
  is_current: boolean
  change_percentage: number
}

export interface ItemDetailAnalysis {
  recipe_id: string
  current_pricing: MenuPricingItem
  pricing_scenarios: PricingScenario[]
  price_history: PriceHistoryEntry[]
  sales_performance?: SalesPerformance
}

export interface PriceHistoryEntry {
  price_id: string
  old_price: number
  new_price: number
  changed_at: string
  changed_by: string
  reason?: string
}

export interface SalesPerformance {
  this_week: number
  last_week: number
  average_per_day: number
  popularity_rank: number
  total_items: number
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface MenuPricingResponse {
  success: boolean
  items: MenuPricingItem[]
  summary: PricingSummary
  lastUpdated: string
}

export interface MenuEngineeringResponse {
  success: boolean
  matrix: MenuEngineeringMatrix
  lastUpdated: string
}

export interface MenuAnalyticsResponse {
  success: boolean
  analytics: MenuAnalytics
  period: string
  lastUpdated: string
}

export interface ItemAnalysisResponse {
  success: boolean
  analysis: ItemDetailAnalysis
  lastUpdated: string
}

export interface PricingUpdateResponse {
  success: boolean
  updated_item: MenuPricingItem
  message: string
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface MenuFilters {
  search?: string
  category?: string
  status?: string
  quadrant?: MenuQuadrant
  sortBy?: 'name' | 'food_cost_low' | 'food_cost_high' | 'margin_high' | 'margin_low' | 'sales_high'
}

export interface AnalyticsFilters {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  start_date?: string
  end_date?: string
  category?: string
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface PricingTableProps {
  items: MenuPricingItem[]
  onPriceUpdate: (recipeId: string, newPrice: number) => void
  loading?: boolean
  className?: string
}

export interface MenuEngineeringMatrixProps {
  matrix: MenuEngineeringMatrix
  onItemClick?: (recipeId: string) => void
  className?: string
}

export interface QuadrantCardProps {
  quadrant: QuadrantSummary
  onItemClick?: (recipeId: string) => void
  className?: string
}

export interface PricingSummaryCardProps {
  summary: PricingSummary
  className?: string
}

export interface PriceEditorProps {
  item: MenuPricingItem
  onUpdate: (newPrice: number) => void
  onCancel: () => void
  className?: string
}

export interface PricingScenarioProps {
  scenarios: PricingScenario[]
  currentPrice: number
  onPriceSelect?: (price: number) => void
  className?: string
}

export interface TopPerformersTableProps {
  performers: TopPerformer[]
  onItemClick?: (recipeId: string) => void
  className?: string
}

export interface AttentionItemsProps {
  items: AttentionItem[]
  onItemClick?: (recipeId: string) => void
  onDismiss?: (recipeId: string) => void
  className?: string
}

// ============================================================================
// MENU ENGINEERING CALCULATIONS
// ============================================================================

export interface MenuEngineeringCalculation {
  calculateQuadrant: (margin: number, sales: number, medianMargin: number, medianSales: number) => MenuQuadrant
  calculateMedians: (items: MenuEngineering[]) => { medianMargin: number, medianSales: number }
  generateRecommendations: (quadrant: MenuQuadrant, item: MenuEngineering) => string
  calculateProfitabilityRank: (items: MenuEngineering[]) => MenuEngineering[]
  calculatePopularityRank: (items: MenuEngineering[]) => MenuEngineering[]
}

// ============================================================================
// BUSINESS LOGIC TYPES
// ============================================================================

export interface FoodCostTargets {
  excellent: { min: number, max: number }
  good: { min: number, max: number }
  high: { min: number, max: number }
  critical: { min: number }
  underpriced: { max: number }
}

export interface MenuEngineeringRules {
  star: {
    description: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }
  plowhorse: {
    description: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }
  puzzle: {
    description: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }
  dog: {
    description: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface MenuError {
  code: string
  message: string
  field?: string
}

export type MenuErrorType = 
  | 'ITEM_NOT_FOUND'
  | 'INVALID_PRICE'
  | 'CALCULATION_FAILED'
  | 'INSUFFICIENT_DATA'
  | 'UPDATE_FAILED'

// ============================================================================
// CONSTANTS
// ============================================================================

export const FOOD_COST_TARGETS: FoodCostTargets = {
  excellent: { min: 20, max: 32 },
  good: { min: 15, max: 40 },
  high: { min: 40, max: 50 },
  critical: { min: 50 },
  underpriced: { max: 15 }
}

export const MENU_ENGINEERING_RULES: MenuEngineeringRules = {
  star: {
    description: 'High profit, high sales - your winners',
    action: 'Feature prominently, maintain quality, monitor closely',
    priority: 'high'
  },
  plowhorse: {
    description: 'High profit, low sales - hidden gems',
    action: 'Promote more, improve presentation, reduce portions',
    priority: 'medium'
  },
  puzzle: {
    description: 'Low profit, high sales - popular but unprofitable',
    action: 'Increase price, reduce costs, or reposition',
    priority: 'high'
  },
  dog: {
    description: 'Low profit, low sales - dead weight',
    action: 'Remove from menu or completely rework',
    priority: 'low'
  }
}

// All types are exported as interfaces above