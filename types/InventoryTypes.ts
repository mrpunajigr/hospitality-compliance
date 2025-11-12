export interface InventoryItem {
  id: string
  client_id: string
  item_name: string
  description?: string
  brand?: string
  category_id?: string
  category_name?: string
  count_unit: string
  storage_unit?: string
  conversion_factor?: number
  par_level_low?: number
  par_level_high?: number
  reorder_point?: number
  storage_location?: string
  storage_requirements?: string
  allergen_info?: string
  supplier_info?: string
  item_code?: string
  barcode?: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Joined data from latest count
  quantity_on_hand?: number
  count_date?: string
  counted_by?: string
}

export interface InventoryCount {
  id: string
  client_id: string
  item_id: string
  quantity_on_hand: number
  count_unit: string
  location_id?: string
  location_name?: string
  notes?: string
  photo_url?: string
  counted_by: string
  count_date: string
  created_at: string
}

export interface InventoryBatch {
  id: string
  client_id: string
  item_id: string
  batch_number: string
  quantity: number
  unit: string
  received_date: string
  expiration_date?: string
  vendor_id?: string
  vendor_name?: string
  cost_per_unit?: number
  total_cost?: number
  status: 'active' | 'used' | 'expired' | 'disposed'
  created_at: string
  updated_at: string
}

export interface InventoryCategory {
  id: string
  client_id: string
  name: string
  description?: string
  color_code?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface InventoryLocation {
  id: string
  client_id: string
  name: string
  description?: string
  temperature_range?: string
  storage_type: 'ambient' | 'chilled' | 'frozen' | 'other'
  is_active: boolean
  created_at: string
}

export interface VendorItem {
  id: string
  client_id: string
  vendor_id: string
  vendor_name?: string
  item_id: string
  vendor_item_code?: string
  cost_per_unit: number
  unit: string
  minimum_order?: number
  lead_time_days?: number
  is_preferred: boolean
  last_ordered?: string
  created_at: string
  updated_at: string
}

export interface StockFilterOptions {
  search?: string
  category?: string
  status?: 'all' | 'active' | 'inactive' | 'low_stock' | 'out_of_stock'
  location?: string
  sortBy?: 'name' | 'category' | 'stock_level' | 'last_counted'
  sortOrder?: 'asc' | 'desc'
}

export interface StockSummary {
  totalItems: number
  activeItems: number
  lowStockItems: number
  outOfStockItems: number
  lastCountDate?: string
}