# JiGR Inventory & Recipe Management - Database Schema Design

**Based on**: EZchef v4.25 Standard Analysis  
**Target**: JiGR Bolt-On Modules (Inventory Management + Recipe Costing)  
**Architecture**: Multi-tenant, Supabase PostgreSQL  
**Date**: November 11, 2025

---

## 🎯 Overview

This schema design extracts the core data structures from EZchef and normalizes them for a modern, multi-tenant SaaS database architecture compatible with the JiGR platform.

### Design Principles:
✅ **Multi-tenant isolation** - All tables include `client_id`  
✅ **Vendor-agnostic** - Portable across database providers  
✅ **Normalized structure** - Reduces redundancy, maintains integrity  
✅ **Formula-free** - Business logic in application layer  
✅ **Audit-ready** - Created/updated timestamps on all tables  

---

## 📊 Database Architecture

### Module Structure:

```
JiGR Core Tables
├── Clients (existing)
├── Users (existing)
└── ClientUsers (existing)

Inventory Management Module
├── InventoryCategories
├── InventoryItems
├── VendorCompanies
├── VendorItems
├── InventoryLocations
├── InventoryCount
└── ItemPriceHistory

Recipe Management Module
├── RecipeCategories
├── Recipes
├── RecipeIngredients
├── SubRecipes
├── SubRecipeIngredients
└── MenuPricing

Shared Reference Tables
├── UnitsOfMeasure
├── UnitConversions
└── OrderGuides
```

---

## 🗃️ TABLE DEFINITIONS

### 1️⃣ **INVENTORY MANAGEMENT MODULE**

#### `InventoryCategories`
```sql
CREATE TABLE InventoryCategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, category_name)
);

-- Example Categories: Produce, Dairy, Meat & Poultry, Seafood, Frozen, 
--                     Grocery & Dry, Beer, Wine, Liquor, Paper & Disposables

CREATE INDEX idx_inventory_categories_client ON InventoryCategories(client_id);
```

**Purpose**: Organizes inventory items into manageable categories  
**EZchef Source**: 14 inventory sheets (IProduce, IDairy, etc.)

---

#### `InventoryItems`
```sql
CREATE TABLE InventoryItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES InventoryCategories(id) ON DELETE CASCADE,
  
  -- Item Identification
  item_name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  item_code VARCHAR(50),
  
  -- Recipe Unit Information
  recipe_unit VARCHAR(50) NOT NULL, -- oz-wt, oz-fl, lb, each, gal, etc.
  recipe_unit_yield DECIMAL(10,4) DEFAULT 1.0, -- How much usable product
  
  -- Count Unit Information  
  count_unit VARCHAR(50), -- Case, pack, lb, etc.
  count_unit_conversion DECIMAL(10,4), -- How many recipe units per count unit
  
  -- Location & Status
  storage_location VARCHAR(100), -- Freezer, Walk-in, Dry Storage, etc.
  par_level_low INTEGER DEFAULT 0,
  par_level_high INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, item_name, brand)
);

CREATE INDEX idx_inventory_items_client ON InventoryItems(client_id);
CREATE INDEX idx_inventory_items_category ON InventoryItems(category_id);
CREATE INDEX idx_inventory_items_name ON InventoryItems(item_name);
```

**Purpose**: Core inventory item master list  
**EZchef Source**: Row data from inventory category sheets  
**Key Formula**: Unit Cost = (Pack Price / Convert to RU) / Yield

---

#### `VendorCompanies`
```sql
CREATE TABLE VendorCompanies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  
  vendor_name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(150),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  
  delivery_schedule VARCHAR(255), -- e.g., "Mon, Wed, Fri"
  minimum_order_amount DECIMAL(10,2),
  payment_terms VARCHAR(100),
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, vendor_name)
);

CREATE INDEX idx_vendor_companies_client ON VendorCompanies(client_id);
```

**Purpose**: Vendor contact and relationship management  
**EZchef Source**: Vendor columns in inventory sheets

---

#### `VendorItems`
```sql
CREATE TABLE VendorItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES InventoryItems(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES VendorCompanies(id) ON DELETE CASCADE,
  
  -- Vendor-specific Information
  vendor_item_code VARCHAR(100),
  pack_size VARCHAR(100) NOT NULL, -- "12 / 750ml", "50 lb bag", etc.
  pack_price DECIMAL(10,2) NOT NULL,
  
  -- Pricing & History
  last_price_update DATE,
  price_change_percentage DECIMAL(5,2),
  
  -- Status
  is_preferred_vendor BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, inventory_item_id, vendor_id)
);

CREATE INDEX idx_vendor_items_client ON VendorItems(client_id);
CREATE INDEX idx_vendor_items_inventory ON VendorItems(inventory_item_id);
CREATE INDEX idx_vendor_items_vendor ON VendorItems(vendor_id);
```

**Purpose**: Links inventory items to vendor pricing  
**EZchef Source**: Vendor, Item Code, Pack Size, Pack Price columns  
**Business Logic**: Supports multiple vendors per item for price comparison

---

#### `InventoryLocations`
```sql
CREATE TABLE InventoryLocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  
  location_name VARCHAR(100) NOT NULL, -- Walk-in, Freezer, Dry Storage, Bar, etc.
  location_type VARCHAR(50), -- COLD, FROZEN, DRY, BAR
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, location_name)
);

CREATE INDEX idx_inventory_locations_client ON InventoryLocations(client_id);
```

**Purpose**: Define storage locations for inventory counts  
**EZchef Source**: InvPrintLOC sheet, Location columns

---

#### `InventoryCount`
```sql
CREATE TABLE InventoryCount (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES InventoryItems(id) ON DELETE CASCADE,
  location_id UUID REFERENCES InventoryLocations(id),
  
  -- Count Information
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_on_hand DECIMAL(10,3) NOT NULL DEFAULT 0,
  count_unit VARCHAR(50), -- Unit used for counting
  
  -- Value Calculation (stored for historical record)
  unit_cost_at_count DECIMAL(10,4),
  total_value DECIMAL(10,2),
  
  -- Audit Trail
  counted_by_user_id UUID REFERENCES Users(id),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_inventory_count_client ON InventoryCount(client_id);
CREATE INDEX idx_inventory_count_item ON InventoryCount(inventory_item_id);
CREATE INDEX idx_inventory_count_date ON InventoryCount(count_date DESC);
```

**Purpose**: Track physical inventory counts over time  
**EZchef Source**: InvPrintCAT, InvPrintLOC sheets  
**Business Logic**: Stores snapshot of unit cost for historical accuracy

---

#### `ItemPriceHistory`
```sql
CREATE TABLE ItemPriceHistory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  vendor_item_id UUID NOT NULL REFERENCES VendorItems(id) ON DELETE CASCADE,
  
  effective_date DATE NOT NULL,
  pack_price DECIMAL(10,2) NOT NULL,
  price_change_percentage DECIMAL(5,2),
  price_change_reason VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_item_price_history_vendor_item ON ItemPriceHistory(vendor_item_id);
CREATE INDEX idx_item_price_history_date ON ItemPriceHistory(effective_date DESC);
```

**Purpose**: Track vendor price changes over time  
**EZchef Source**: InvItemPriceHist sheet  
**Business Logic**: Enables price trend analysis and vendor comparison

---

### 2️⃣ **RECIPE MANAGEMENT MODULE**

#### `RecipeCategories`
```sql
CREATE TABLE RecipeCategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  
  category_name VARCHAR(100) NOT NULL, -- Appetizers, Salads, Entrees, etc.
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, category_name)
);

CREATE INDEX idx_recipe_categories_client ON RecipeCategories(client_id);
```

**Purpose**: Organize recipes by menu category  
**EZchef Source**: 9 recipe sheets (Appetizers, Salads, Entrees, etc.)

---

#### `Recipes`
```sql
CREATE TABLE Recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES RecipeCategories(id) ON DELETE CASCADE,
  
  -- Recipe Identification
  recipe_name VARCHAR(255) NOT NULL,
  recipe_number VARCHAR(50),
  
  -- Yield Information
  number_of_portions INTEGER NOT NULL DEFAULT 1,
  portion_size VARCHAR(100), -- "8 oz", "1 sandwich", etc.
  portion_unit VARCHAR(50),
  
  -- Costing (calculated values stored for performance)
  total_ingredient_cost DECIMAL(10,4) DEFAULT 0,
  cost_per_portion DECIMAL(10,4) DEFAULT 0,
  
  -- Menu Pricing
  menu_price DECIMAL(10,2),
  food_cost_percentage DECIMAL(5,2),
  
  -- Recipe Details
  preparation_instructions TEXT,
  cooking_time_minutes INTEGER,
  prep_time_minutes INTEGER,
  
  -- Status & Tracking
  is_active BOOLEAN DEFAULT true,
  last_updated DATE,
  version_number INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, recipe_name)
);

CREATE INDEX idx_recipes_client ON Recipes(client_id);
CREATE INDEX idx_recipes_category ON Recipes(category_id);
CREATE INDEX idx_recipes_name ON Recipes(recipe_name);
```

**Purpose**: Master recipe list with costing and pricing  
**EZchef Source**: Recipe sheets, rows 1-4 (header section)  
**Key Calculations**:
- Total Ingredient Cost = SUM(ingredient extended costs)
- Cost Per Portion = Total Cost / Number of Portions
- Food Cost % = (Cost Per Portion / Menu Price) × 100

---

#### `RecipeIngredients`
```sql
CREATE TABLE RecipeIngredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES Recipes(id) ON DELETE CASCADE,
  
  -- Ingredient Reference (either inventory item OR sub-recipe)
  inventory_item_id UUID REFERENCES InventoryItems(id) ON DELETE CASCADE,
  sub_recipe_id UUID REFERENCES SubRecipes(id) ON DELETE CASCADE,
  
  -- Quantity Information
  recipe_unit VARCHAR(50) NOT NULL, -- Unit type (oz, lb, each, etc.)
  recipe_quantity DECIMAL(10,4) NOT NULL, -- How many units
  
  -- Cost Tracking (stored for historical accuracy)
  unit_cost_at_recipe_creation DECIMAL(10,4),
  extended_cost DECIMAL(10,4),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  ingredient_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint: Must reference either inventory item OR sub-recipe, not both
  CHECK (
    (inventory_item_id IS NOT NULL AND sub_recipe_id IS NULL) OR
    (inventory_item_id IS NULL AND sub_recipe_id IS NOT NULL)
  )
);

CREATE INDEX idx_recipe_ingredients_recipe ON RecipeIngredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_inventory ON RecipeIngredients(inventory_item_id);
CREATE INDEX idx_recipe_ingredients_subrecipe ON RecipeIngredients(sub_recipe_id);
```

**Purpose**: Links recipes to their ingredients  
**EZchef Source**: Recipe sheets, rows 8+ (ingredient section)  
**Key Formula**: Extended Cost = Recipe Unit Cost × Recipe Quantity  
**Business Logic**: Supports both inventory items and sub-recipes as ingredients

---

#### `SubRecipes`
```sql
CREATE TABLE SubRecipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  
  -- Sub-Recipe Identification
  sub_recipe_name VARCHAR(255) NOT NULL,
  sub_recipe_number VARCHAR(50),
  
  -- Yield Information
  batch_yield_quantity DECIMAL(10,3) NOT NULL,
  batch_yield_unit VARCHAR(50) NOT NULL, -- "cups", "gallons", "portions"
  recipe_unit VARCHAR(50), -- Unit type for usage in recipes
  number_of_recipe_units INTEGER DEFAULT 1,
  
  -- Costing
  total_ingredient_cost DECIMAL(10,4) DEFAULT 0,
  cost_per_recipe_unit DECIMAL(10,4) DEFAULT 0,
  
  -- Details
  preparation_instructions TEXT,
  shelf_life_days INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_updated DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, sub_recipe_name)
);

CREATE INDEX idx_sub_recipes_client ON SubRecipes(client_id);
CREATE INDEX idx_sub_recipes_name ON SubRecipes(sub_recipe_name);
```

**Purpose**: Component recipes used within main recipes  
**EZchef Source**: Sub Recipes sheet  
**Examples**: Sauces, dressings, marinades, stocks  
**Key Calculation**: Cost Per Unit = Total Cost / (Batch Yield / Recipe Units)

---

#### `SubRecipeIngredients`
```sql
CREATE TABLE SubRecipeIngredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  sub_recipe_id UUID NOT NULL REFERENCES SubRecipes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES InventoryItems(id) ON DELETE CASCADE,
  
  -- Quantity Information
  recipe_unit VARCHAR(50) NOT NULL,
  recipe_quantity DECIMAL(10,4) NOT NULL,
  
  -- Cost Tracking
  unit_cost_at_creation DECIMAL(10,4),
  extended_cost DECIMAL(10,4),
  
  -- Display
  display_order INTEGER DEFAULT 0,
  ingredient_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sub_recipe_ingredients_subrecipe ON SubRecipeIngredients(sub_recipe_id);
CREATE INDEX idx_sub_recipe_ingredients_inventory ON SubRecipeIngredients(inventory_item_id);
```

**Purpose**: Links sub-recipes to their inventory ingredients  
**EZchef Source**: Sub Recipes sheet, ingredient rows  
**Business Logic**: Sub-recipes can ONLY contain inventory items (not other sub-recipes)

---

#### `MenuPricing`
```sql
CREATE TABLE MenuPricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES Recipes(id) ON DELETE CASCADE,
  
  -- Pricing Information
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  menu_price DECIMAL(10,2) NOT NULL,
  
  -- Cost Snapshot (for historical record)
  cost_per_portion DECIMAL(10,4),
  food_cost_percentage DECIMAL(5,2),
  
  -- Pricing Metadata
  pricing_reason VARCHAR(255), -- "Menu Update", "Cost Increase", etc.
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(client_id, recipe_id, effective_date)
);

CREATE INDEX idx_menu_pricing_recipe ON MenuPricing(recipe_id);
CREATE INDEX idx_menu_pricing_date ON MenuPricing(effective_date DESC);
```

**Purpose**: Track menu price changes over time  
**EZchef Source**: Recipe sheets, Menu Price column  
**Business Logic**: Enables price history analysis and margin tracking

---

### 3️⃣ **SHARED REFERENCE TABLES**

#### `UnitsOfMeasure`
```sql
CREATE TABLE UnitsOfMeasure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  unit_name VARCHAR(50) NOT NULL UNIQUE, -- oz-wt, oz-fl, lb, gal, etc.
  unit_type VARCHAR(20) NOT NULL, -- WEIGHT, VOLUME, COUNT, TASTE
  display_name VARCHAR(50),
  abbreviation VARCHAR(20),
  
  is_system_unit BOOLEAN DEFAULT true, -- System vs. client-specific
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pre-populate with standard units
INSERT INTO UnitsOfMeasure (unit_name, unit_type, display_name, abbreviation) VALUES
  ('oz-wt', 'WEIGHT', 'Ounce (Weight)', 'oz'),
  ('oz-fl', 'VOLUME', 'Ounce (Fluid)', 'fl oz'),
  ('lb', 'WEIGHT', 'Pound', 'lb'),
  ('gal', 'VOLUME', 'Gallon', 'gal'),
  ('tbl', 'VOLUME', 'Tablespoon', 'tbsp'),
  ('tsp', 'VOLUME', 'Teaspoon', 'tsp'),
  ('each', 'COUNT', 'Each', 'ea'),
  ('to taste', 'TASTE', 'To Taste', 'TT');
```

**Purpose**: Standardized unit of measure reference  
**EZchef Source**: Units sheet, Recipe Units column  
**Business Logic**: Ensures consistent unit usage across system

---

#### `UnitConversions`
```sql
CREATE TABLE UnitConversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  from_unit_id UUID NOT NULL REFERENCES UnitsOfMeasure(id),
  to_unit_id UUID NOT NULL REFERENCES UnitsOfMeasure(id),
  
  conversion_multiplier DECIMAL(15,10) NOT NULL,
  
  -- Example: 1 gallon = 128 fl oz
  -- from_unit = 'gal', to_unit = 'oz-fl', multiplier = 128
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(from_unit_id, to_unit_id)
);

-- Pre-populate with standard conversions from EZchef ConvTables
-- Volume conversions
-- Weight conversions
-- etc.
```

**Purpose**: Automatic unit conversion calculations  
**EZchef Source**: ConvTables sheet  
**Business Logic**: Enables recipe scaling and cost calculations across different units

---

#### `OrderGuides`
```sql
CREATE TABLE OrderGuides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES VendorCompanies(id) ON DELETE CASCADE,
  
  guide_name VARCHAR(200) NOT NULL,
  week_beginning DATE,
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE OrderGuideItems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_guide_id UUID NOT NULL REFERENCES OrderGuides(id) ON DELETE CASCADE,
  vendor_item_id UUID NOT NULL REFERENCES VendorItems(id) ON DELETE CASCADE,
  
  par_level INTEGER,
  on_hand_quantity DECIMAL(10,3),
  order_quantity DECIMAL(10,3),
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Purpose**: Vendor-specific ordering templates  
**EZchef Source**: Vendor Order Guide sheet, Order Guides sheets  
**Business Logic**: Pre-configured ordering lists per vendor

---

## 🔄 Row Level Security (RLS) Policies

### Template RLS Policy (Apply to ALL tables):

```sql
-- Example for InventoryItems table
ALTER TABLE InventoryItems ENABLE ROW LEVEL SECURITY;

-- SELECT Policy
CREATE POLICY "Users can view their client's inventory items"
ON InventoryItems FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM ClientUsers 
    WHERE user_id = auth.uid()
  )
);

-- INSERT Policy  
CREATE POLICY "Users can insert inventory items for their client"
ON InventoryItems FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT client_id FROM ClientUsers 
    WHERE user_id = auth.uid()
  )
);

-- UPDATE Policy
CREATE POLICY "Users can update their client's inventory items"
ON InventoryItems FOR UPDATE
USING (
  client_id IN (
    SELECT client_id FROM ClientUsers 
    WHERE user_id = auth.uid()
  )
);

-- DELETE Policy (typically admin only)
CREATE POLICY "Admins can delete their client's inventory items"
ON InventoryItems FOR DELETE
USING (
  client_id IN (
    SELECT client_id FROM ClientUsers 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

**Apply similar policies to all client-specific tables.**

---

## 🔢 Business Logic & Calculations

### Core Formulas (Implement in Application Layer):

#### 1. **Inventory Unit Cost**
```typescript
function calculateUnitCost(
  packPrice: number,
  convertToRecipeUnit: number,
  yield: number
): number {
  if (convertToRecipeUnit > 0 && yield > 0) {
    return (packPrice / convertToRecipeUnit) / yield;
  }
  return 0;
}

// Example: $24 pack / 50 oz conversion / 0.95 yield = $0.505 per oz
```

#### 2. **Recipe Extended Cost**
```typescript
function calculateExtendedCost(
  unitCost: number,
  recipeQuantity: number
): number {
  return unitCost * recipeQuantity;
}

// Example: $0.505/oz × 8 oz = $4.04
```

#### 3. **Recipe Total Cost**
```typescript
function calculateRecipeTotalCost(ingredients: RecipeIngredient[]): number {
  return ingredients.reduce((total, ingredient) => {
    return total + ingredient.extended_cost;
  }, 0);
}
```

#### 4. **Cost Per Portion**
```typescript
function calculateCostPerPortion(
  totalCost: number,
  portions: number
): number {
  if (portions > 0) {
    return totalCost / portions;
  }
  return 0;
}

// Example: $12.50 total / 4 portions = $3.13 per portion
```

#### 5. **Food Cost Percentage**
```typescript
function calculateFoodCostPercentage(
  costPerPortion: number,
  menuPrice: number
): number {
  if (menuPrice > 0) {
    return (costPerPortion / menuPrice) * 100;
  }
  return 0;
}

// Example: $3.13 cost / $12.95 price = 24.2%
```

#### 6. **Unit Conversion**
```typescript
function convertUnits(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  conversions: UnitConversion[]
): number {
  const conversion = conversions.find(
    c => c.from_unit === fromUnit && c.to_unit === toUnit
  );
  
  if (conversion) {
    return quantity * conversion.multiplier;
  }
  
  return quantity; // Same unit or no conversion available
}

// Example: 2 gallons → fl oz = 2 × 128 = 256 fl oz
```

---

## 📈 Query Patterns & Indexes

### Common Queries to Optimize:

#### 1. **Get Recipe with Full Costing**
```sql
SELECT 
  r.recipe_name,
  r.number_of_portions,
  r.menu_price,
  ri.recipe_quantity,
  ri.recipe_unit,
  ii.item_name,
  ri.extended_cost,
  r.total_ingredient_cost,
  r.cost_per_portion,
  r.food_cost_percentage
FROM Recipes r
JOIN RecipeIngredients ri ON r.id = ri.recipe_id
LEFT JOIN InventoryItems ii ON ri.inventory_item_id = ii.id
WHERE r.client_id = $1 AND r.id = $2
ORDER BY ri.display_order;
```

#### 2. **Get Inventory Value by Category**
```sql
SELECT 
  ic.category_name,
  SUM(inv.quantity_on_hand * inv.unit_cost_at_count) as total_value
FROM InventoryCount inv
JOIN InventoryItems ii ON inv.inventory_item_id = ii.id
JOIN InventoryCategories ic ON ii.category_id = ic.id
WHERE inv.client_id = $1 
  AND inv.count_date = (
    SELECT MAX(count_date) 
    FROM InventoryCount 
    WHERE client_id = $1
  )
GROUP BY ic.category_name
ORDER BY ic.display_order;
```

#### 3. **Compare Vendor Pricing**
```sql
SELECT 
  ii.item_name,
  vc.vendor_name,
  vi.pack_size,
  vi.pack_price,
  vi.last_price_update,
  RANK() OVER (
    PARTITION BY vi.inventory_item_id 
    ORDER BY vi.pack_price ASC
  ) as price_rank
FROM VendorItems vi
JOIN InventoryItems ii ON vi.inventory_item_id = ii.id
JOIN VendorCompanies vc ON vi.vendor_id = vc.id
WHERE vi.client_id = $1 
  AND vi.is_active = true
  AND ii.item_name ILIKE $2;
```

---

## 🚀 Migration Strategy

### Phase 1: Core Inventory (Week 1-2)
1. Create `InventoryCategories` table
2. Create `InventoryItems` table
3. Create `InventoryLocations` table
4. Import sample data for testing
5. Build basic inventory management UI

### Phase 2: Vendor Management (Week 3)
1. Create `VendorCompanies` table
2. Create `VendorItems` table
3. Create `ItemPriceHistory` table
4. Implement vendor pricing UI

### Phase 3: Inventory Counts (Week 4)
1. Create `InventoryCount` table
2. Implement count entry UI
3. Build inventory valuation reports

### Phase 4: Recipe Foundation (Week 5)
1. Create `RecipeCategories` table
2. Create `Recipes` table
3. Create `RecipeIngredients` table
4. Basic recipe entry UI

### Phase 5: Sub-Recipes (Week 6)
1. Create `SubRecipes` table
2. Create `SubRecipeIngredients` table
3. Implement sub-recipe functionality

### Phase 6: Menu Pricing & Analysis (Week 7)
1. Create `MenuPricing` table
2. Implement costing calculations
3. Build food cost reports
4. Create menu engineering analysis

### Phase 7: Units & Conversions (Week 8)
1. Create `UnitsOfMeasure` table
2. Create `UnitConversions` table
3. Populate standard conversions
4. Implement conversion utilities

### Phase 8: Order Guides (Week 9)
1. Create `OrderGuides` tables
2. Build order guide UI
3. Implement vendor ordering workflow

---

## 📊 Data Volume Estimates

Based on typical restaurant operations:

| Table | Estimated Rows per Client |
|-------|--------------------------|
| InventoryCategories | 10-15 |
| InventoryItems | 500-2,000 |
| VendorCompanies | 5-20 |
| VendorItems | 1,000-4,000 |
| InventoryCount | 500-2,000 per month |
| RecipeCategories | 5-10 |
| Recipes | 50-500 |
| RecipeIngredients | 500-5,000 |
| SubRecipes | 20-100 |
| MenuPricing | 200-2,000 (historical) |

**Total estimated rows per client**: ~10,000-20,000  
**100 clients**: ~1-2 million rows  
**1,000 clients**: ~10-20 million rows

---

## ⚡ Performance Considerations

### Optimization Strategies:

1. **Materialized Views** for complex reports
2. **Partitioning** for historical tables (InventoryCount, ItemPriceHistory)
3. **Computed Columns** for frequently accessed calculations
4. **Caching** recipe costs at recipe level (updated on ingredient changes)
5. **Batch Updates** for cost recalculations across multiple recipes

---

## 🔐 Security Considerations

### Data Protection:
✅ All tables include RLS policies  
✅ Client data completely isolated  
✅ Audit trails with created_at/updated_at  
✅ Soft deletes with is_active flags  
✅ Foreign key constraints prevent orphaned records  

### Role-Based Access:
- **Staff**: View recipes, enter inventory counts
- **Manager**: Manage inventory, recipes, vendor pricing
- **Admin**: Full access including vendor relationships
- **Owner**: All permissions plus financial data

---

## 📝 Next Steps

1. ✅ Review schema design with development team
2. ⬜ Create Supabase migration files
3. ⬜ Set up test database with sample data
4. ⬜ Implement core business logic functions
5. ⬜ Build API endpoints for each module
6. ⬜ Create UI components following iPad Air compatibility
7. ⬜ Write unit tests for calculations
8. ⬜ Load testing with realistic data volumes

---

**Schema Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: Ready for Implementation
