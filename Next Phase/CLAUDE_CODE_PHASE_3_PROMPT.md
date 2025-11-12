# 🚀 JiGR Phase 3: RECIPES Module

**Date**: November 11, 2025  
**Phase**: 3 of 4  
**Previous Phases**: ✅ STOCK Complete (8 pages) | ✅ COUNT Complete  
**Target**: Recipe Management with Costing & Production  
**Timeline**: 2-3 weeks

---

## ✅ PHASES 1 & 2 RECAP - WHAT'S DONE

**STOCK Module (Complete):**
- ✅ Dashboard with metrics
- ✅ Items list & detail
- ✅ Batch tracking (FIFO)
- ✅ Vendor management
- ✅ 5 pages total

**COUNT Module (Complete):**
- ✅ New count (offline-capable)
- ✅ Count history
- ✅ Variance analysis
- ✅ 3 pages total

**Status**: 🟢 8 pages live! Foundation is solid. Ready to build RECIPES!

---

## 🎯 PHASE 3 OBJECTIVES

Build the **RECIPES module** (4 pages) that integrates with STOCK:

### 1. RECIPES List (`/recipes/page.tsx`)
### 2. RECIPE Detail (`/recipes/[id]/page.tsx`)
### 3. SUB-RECIPES (`/recipes/sub-recipes/page.tsx`)
### 4. PRODUCTION Recording (`/recipes/production/page.tsx`)

---

## 🍳 MODULE OVERVIEW: How RECIPES Connects to STOCK

### The Flow:
```
STOCK Inventory Items ─→ Recipe Ingredients ─→ Recipe Cost
         ↓                                          ↓
    Unit Prices                               Food Cost %
                                                    ↓
                                              Menu Pricing
```

### Key Connections:
1. **Recipes use STOCK items** as ingredients
2. **Recipe costs** calculated from inventory item prices
3. **Sub-recipes** become inventory items (produced in-house)
4. **Production** links recipes to inventory batches

---

## 🍽️ PAGE 1: RECIPES List

**Route**: `/recipes/page.tsx`  
**Purpose**: Browse and manage all recipes  
**Reference**: Module_Architecture_Schematics.md → Page 2.1

### Features:

**Search & Filters:**
- [ ] Search bar (filters recipe_name)
- [ ] Category filter (dropdown from recipe_categories)
- [ ] Sort options: Name, Cost (Low-High), Cost (High-Low), Food Cost %

**Recipe Cards/List:**
- [ ] Recipe photo (optional, placeholder if none)
- [ ] Recipe name
- [ ] Category
- [ ] Portions & portion size
- [ ] Cost per portion (calculated)
- [ ] Food cost % (cost/menu_price × 100)
- [ ] Menu price
- [ ] Actions: [View Recipe] [Edit] [Cost] [⋮]

**Grid/List Toggle:**
- [ ] Grid view: Recipe cards with photos
- [ ] List view: Compact table format

**[+ New Recipe] Button:**
- [ ] Opens `/recipes/new` (future)

### Data Sources:

**Recipe List with Costs:**
```sql
SELECT 
  r.*,
  rc.category_name,
  (
    SELECT SUM(
      ri.quantity * 
      CASE 
        WHEN ri.ingredient_type = 'inventory'
        THEN ii.unit_cost * (
          SELECT conversion_factor 
          FROM unit_conversions 
          WHERE from_unit = ii.recipe_unit 
          AND to_unit = ri.unit
        )
        WHEN ri.ingredient_type = 'sub_recipe'
        THEN sr.cost_per_unit
        ELSE 0
      END
    )
    FROM recipe_ingredients ri
    LEFT JOIN inventory_items ii ON ri.item_id = ii.item_id
    LEFT JOIN sub_recipes sr ON ri.sub_recipe_id = sr.sub_recipe_id
    WHERE ri.recipe_id = r.recipe_id
  ) as total_cost,
  (
    SELECT SUM(...) / r.number_of_portions
  ) as cost_per_portion,
  (
    SELECT (SUM(...) / r.number_of_portions) / r.menu_price * 100
  ) as food_cost_percentage
FROM recipes r
JOIN recipe_categories rc ON r.category_id = rc.category_id
WHERE r.client_id = auth.uid()::uuid
ORDER BY r.recipe_name;
```

**Note**: Consider creating a database function `calculate_recipe_cost(recipe_id)` to simplify this query.

### UI Components Needed:
- [ ] `<RecipeCard>` - Recipe display card (grid view)
- [ ] `<RecipeListItem>` - Recipe row (list view)
- [ ] `<FoodCostBadge>` - Color-coded food cost %
  - 🟢 Green: 20-32% (target)
  - 🟡 Yellow: 32-40% (high)
  - 🔴 Red: >40% (too high) or <20% (underpriced)

### Success Criteria:
- [ ] All recipes display correctly
- [ ] Cost calculations accurate
- [ ] Food cost % color coding works
- [ ] Search/filter responsive
- [ ] Grid/list toggle works
- [ ] Responsive layout

---

## 📖 PAGE 2: RECIPE Detail

**Route**: `/recipes/[id]/page.tsx`  
**Purpose**: View complete recipe with ingredients and costing  
**Reference**: Module_Architecture_Schematics.md → Page 2.2

### Features:

**Recipe Information Card:**
- [ ] Recipe name
- [ ] Category
- [ ] Number of portions
- [ ] Portion size (with unit)
- [ ] Prep time (optional)
- [ ] Cook time (optional)
- [ ] Photo (if uploaded)

**Costing Summary Card:**
- [ ] Total recipe cost
- [ ] Cost per portion
- [ ] Current menu price
- [ ] Food cost %
- [ ] Status indicator (🟢🟡🔴 based on food cost %)

**Ingredients Table:**
- [ ] Ingredient name (linked to inventory item OR sub-recipe)
- [ ] Quantity
- [ ] Unit
- [ ] Cost (calculated from current prices)
- [ ] Note if ingredient is a sub-recipe ("Made")
- [ ] Click ingredient → Item detail or Sub-recipe detail

**Instructions Section:**
- [ ] Recipe instructions/steps (text area)
- [ ] Cooking notes
- [ ] Plating/presentation notes

**Actions:**
- [ ] **[Edit]** → `/recipes/[id]/edit` (future)
- [ ] **[Print]** → Print-friendly version
- [ ] **[Duplicate]** → Create copy (future)
- [ ] **[⋮] Menu** → Archive, Delete, Export

### Data Sources:

**Recipe with Full Details:**
```sql
-- Get recipe info
SELECT r.*, rc.category_name
FROM recipes r
JOIN recipe_categories rc ON r.category_id = rc.category_id
WHERE r.recipe_id = $1
AND r.client_id = auth.uid()::uuid;

-- Get ingredients with costs
SELECT 
  ri.*,
  CASE 
    WHEN ri.ingredient_type = 'inventory'
    THEN ii.item_name
    WHEN ri.ingredient_type = 'sub_recipe'
    THEN sr.sub_recipe_name
  END as ingredient_name,
  CASE 
    WHEN ri.ingredient_type = 'inventory'
    THEN ri.quantity * ii.unit_cost * uc.conversion_factor
    WHEN ri.ingredient_type = 'sub_recipe'
    THEN ri.quantity * sr.cost_per_unit
  END as extended_cost,
  ri.ingredient_type
FROM recipe_ingredients ri
LEFT JOIN inventory_items ii ON ri.item_id = ii.item_id
LEFT JOIN sub_recipes sr ON ri.sub_recipe_id = sr.sub_recipe_id
LEFT JOIN unit_conversions uc ON (
  uc.from_unit = ii.recipe_unit 
  AND uc.to_unit = ri.unit
)
WHERE ri.recipe_id = $1
AND ri.client_id = auth.uid()::uuid
ORDER BY ri.ingredient_order;
```

### Cost Calculation Logic:

**TypeScript Implementation:**
```typescript
interface RecipeIngredient {
  ingredient_type: 'inventory' | 'sub_recipe';
  quantity: number;
  unit: string;
  item_id?: string;
  sub_recipe_id?: string;
}

function calculateRecipeCost(
  ingredients: RecipeIngredient[],
  inventoryItems: Map<string, InventoryItem>,
  subRecipes: Map<string, SubRecipe>
): number {
  return ingredients.reduce((total, ing) => {
    if (ing.ingredient_type === 'inventory' && ing.item_id) {
      const item = inventoryItems.get(ing.item_id);
      if (!item) return total;
      
      const conversionFactor = getConversionFactor(
        item.recipe_unit,
        ing.unit
      );
      
      return total + (ing.quantity * item.unit_cost * conversionFactor);
    }
    
    if (ing.ingredient_type === 'sub_recipe' && ing.sub_recipe_id) {
      const subRecipe = subRecipes.get(ing.sub_recipe_id);
      if (!subRecipe) return total;
      
      return total + (ing.quantity * subRecipe.cost_per_unit);
    }
    
    return total;
  }, 0);
}
```

### UI Components Needed:
- [ ] `<RecipeCostSummary>` - Costing card with status
- [ ] `<IngredientTable>` - Ingredients with costs
- [ ] `<IngredientRow>` - Individual ingredient (clickable)
- [ ] `<InstructionsDisplay>` - Recipe instructions

### Success Criteria:
- [ ] All recipe data displays
- [ ] Cost calculations accurate
- [ ] Ingredient links work (to items/sub-recipes)
- [ ] "Made" tag shows for sub-recipes
- [ ] Food cost % colors correctly
- [ ] Print view works

---

## 🥫 PAGE 3: SUB-RECIPES

**Route**: `/recipes/sub-recipes/page.tsx`  
**Purpose**: Manage prep components (sauces, stocks, marinades)  
**Reference**: Module_Architecture_Schematics.md → Page 2.3

### Features:

**Search & Filters:**
- [ ] Search bar (filter by sub_recipe_name)
- [ ] Type filter: All / Sauces / Stocks / Marinades / Other
- [ ] Sort: Name, Cost/Unit, Yield

**Sub-Recipe List:**
- [ ] Sub-recipe name
- [ ] Batch yield (quantity + unit)
- [ ] Cost per unit (total cost ÷ yield)
- [ ] Number of ingredients
- [ ] Usage count (how many recipes use this)
- [ ] Actions: [View] [🏭 Produce]

**[+ New Sub-Recipe] Button:**
- [ ] Opens `/recipes/sub-recipes/new` (future)

### Data Sources:

**Sub-Recipe List with Costs:**
```sql
SELECT 
  sr.*,
  (
    SELECT SUM(
      sri.quantity * ii.unit_cost * uc.conversion_factor
    )
    FROM sub_recipe_ingredients sri
    JOIN inventory_items ii ON sri.item_id = ii.item_id
    LEFT JOIN unit_conversions uc ON (
      uc.from_unit = ii.recipe_unit 
      AND uc.to_unit = sri.unit
    )
    WHERE sri.sub_recipe_id = sr.sub_recipe_id
  ) as total_ingredient_cost,
  (
    SELECT COUNT(*)
    FROM sub_recipe_ingredients
    WHERE sub_recipe_id = sr.sub_recipe_id
  ) as ingredient_count,
  (
    SELECT COUNT(*)
    FROM recipe_ingredients
    WHERE sub_recipe_id = sr.sub_recipe_id
    AND ingredient_type = 'sub_recipe'
  ) as usage_count
FROM sub_recipes sr
WHERE sr.client_id = auth.uid()::uuid
ORDER BY sr.sub_recipe_name;
```

**Cost per Unit Calculation:**
```sql
-- In the query or as a computed column
cost_per_unit = total_ingredient_cost / batch_yield_quantity
```

### The Sub-Recipe Concept:

**What are Sub-Recipes?**
- Pre-made components used in multiple recipes
- Examples: Marinara sauce, chicken stock, Caesar dressing
- Made in batches, then used by recipe unit (e.g., 400ml, 100g)

**Why Track Them?**
- Accurate recipe costing (includes labor/prep time)
- Batch production tracking
- Yield management
- Becomes inventory item after production

### UI Components Needed:
- [ ] `<SubRecipeCard>` - Sub-recipe display
- [ ] `<YieldDisplay>` - Batch yield with unit
- [ ] `<UsageCount>` - How many recipes use this
- [ ] `<ProduceButton>` - Quick production recording

### Success Criteria:
- [ ] All sub-recipes display
- [ ] Cost per unit accurate
- [ ] Usage count correct
- [ ] [🏭 Produce] button works
- [ ] Click row → Sub-recipe detail (future)

---

## 🏭 PAGE 4: PRODUCTION Recording

**Route**: `/recipes/production/page.tsx`  
**Purpose**: Record when sub-recipes are produced  
**Reference**: Module_Architecture_Schematics.md → Page 2.4

### Features:

**Sub-Recipe Selection:**
- [ ] Dropdown: Select which sub-recipe to produce
- [ ] Show expected yield (from sub_recipe.batch_yield_quantity)
- [ ] Show expected cost (from ingredient costs)

**Production Details Form:**
- [ ] **Actual Quantity Produced**: Number input + unit selector
- [ ] **Yield Percentage**: Auto-calculate (actual / expected × 100)
  - Show ⚠️ warning if < 95%
- [ ] **Production Time**: Minutes (optional)
- [ ] **Quality Notes**: Text area (optional)
- [ ] **Shelf Life Date**: Date picker (expiration date)

**Link to Inventory Section:**
- [ ] Explain: "This will create/update:"
  - Inventory item: "{SubRecipeName} (In-House)"
  - Batch with expiration tracking
  - Available for use in recipes immediately

**Actions:**
- [ ] **[Cancel]** → Back to sub-recipes
- [ ] **[Record Production]** → Save and create records

### What Happens When Recording Production:

**Database Operations:**
```sql
-- 1. Insert production record
INSERT INTO production_batches (
  client_id,
  sub_recipe_id,
  quantity_produced,
  batch_yield_unit,
  production_time_minutes,
  quality_notes,
  produced_by,
  production_date
) VALUES (...);

-- 2. Create/update inventory item (if doesn't exist)
INSERT INTO inventory_items (
  client_id,
  category_id, -- "In-House" category
  item_name,   -- "{sub_recipe_name} (In-House)"
  recipe_unit,
  count_unit,
  source_type, -- 'produced'
  unit_cost    -- calculated from sub_recipe
) VALUES (...)
ON CONFLICT (client_id, item_name)
DO UPDATE SET unit_cost = EXCLUDED.unit_cost;

-- 3. Create inventory batch (for expiration tracking)
INSERT INTO inventory_batches (
  client_id,
  item_id,
  batch_number,
  quantity_received,
  received_date,
  expiration_date,
  source_type, -- 'produced'
  status       -- 'active'
) VALUES (...);

-- 4. Update inventory count
INSERT INTO inventory_count (
  client_id,
  item_id,
  quantity_on_hand,
  count_unit,
  count_date,
  counted_by,
  notes -- "Production batch recorded"
) VALUES (...);
```

### Data Sources:

**Sub-Recipe Details:**
```sql
SELECT 
  sr.*,
  (
    SELECT SUM(sri.quantity * ii.unit_cost * uc.conversion_factor)
    FROM sub_recipe_ingredients sri
    JOIN inventory_items ii ON sri.item_id = ii.item_id
    LEFT JOIN unit_conversions uc ON (
      uc.from_unit = ii.recipe_unit 
      AND uc.to_unit = sri.unit
    )
    WHERE sri.sub_recipe_id = sr.sub_recipe_id
  ) as expected_cost
FROM sub_recipes sr
WHERE sr.sub_recipe_id = $1
AND sr.client_id = auth.uid()::uuid;
```

### UI Components Needed:
- [ ] `<SubRecipeSelector>` - Dropdown with search
- [ ] `<YieldInput>` - Quantity + unit selector
- [ ] `<YieldPercentageDisplay>` - Auto-calculated %
- [ ] `<ShelfLifePicker>` - Date picker
- [ ] `<ProductionSummary>` - What will be created

### Success Criteria:
- [ ] Sub-recipe selection works
- [ ] Yield % calculates correctly
- [ ] Warning shows if yield < 95%
- [ ] All 4 database operations succeed
- [ ] Inventory item created/updated
- [ ] Batch tracked with expiration
- [ ] Count updated
- [ ] Success message shows
- [ ] Redirects appropriately

---

## 🗄️ DATABASE TABLES USED

**Existing Tables:**
```
✅ recipes
✅ recipe_ingredients
✅ recipe_categories
✅ sub_recipes
✅ sub_recipe_ingredients
✅ production_batches
✅ inventory_items
✅ inventory_batches
✅ inventory_count
✅ unit_conversions
```

**All tables exist!** No new tables needed for Phase 3.

---

## 🔌 API ENDPOINTS TO CREATE

### `/api/recipes`
- **GET**: List recipes (with filters, search, costs)
- **POST**: Create recipe (future)

### `/api/recipes/[id]`
- **GET**: Single recipe with ingredients and costs
- **PUT**: Update recipe (future)
- **DELETE**: Soft delete (future)

### `/api/recipes/[id]/cost`
- **GET**: Calculate current recipe cost
- Uses latest inventory prices
- Returns breakdown by ingredient

### `/api/recipes/sub-recipes`
- **GET**: List sub-recipes with costs
- **POST**: Create sub-recipe (future)

### `/api/recipes/sub-recipes/[id]`
- **GET**: Single sub-recipe detail
- **PUT**: Update sub-recipe (future)

### `/api/recipes/production`
- **POST**: Record production batch
  - Creates inventory item
  - Creates batch record
  - Updates count
  - Records production

### `/api/recipes/categories`
- **GET**: List recipe categories

---

## 🎨 UI COMPONENTS TO CREATE

### Recipe Components:
- [ ] `<RecipeCard>` - Recipe card (grid view)
- [ ] `<RecipeListItem>` - Recipe row (list view)
- [ ] `<FoodCostBadge>` - Color-coded food cost %
- [ ] `<RecipeCostSummary>` - Costing card
- [ ] `<IngredientTable>` - Ingredients list
- [ ] `<IngredientRow>` - Single ingredient (clickable)
- [ ] `<InstructionsDisplay>` - Recipe instructions

### Sub-Recipe Components:
- [ ] `<SubRecipeCard>` - Sub-recipe card
- [ ] `<YieldDisplay>` - Batch yield
- [ ] `<UsageCount>` - Recipe usage counter
- [ ] `<ProduceButton>` - Production shortcut

### Production Components:
- [ ] `<SubRecipeSelector>` - Dropdown with search
- [ ] `<YieldInput>` - Quantity + unit
- [ ] `<YieldPercentageDisplay>` - Auto-calculated %
- [ ] `<ShelfLifePicker>` - Date picker
- [ ] `<ProductionSummary>` - Preview card

### Reuse from Phase 1 & 2:
- ✅ `<DataTable>`
- ✅ `<SearchInput>`
- ✅ `<PageHeader>`
- ✅ `<EmptyState>`
- ✅ `<LoadingSpinner>`

---

## 🧮 CRITICAL: Unit Conversions

**The Challenge:**
Recipes use different units than inventory items.

**Example:**
- Inventory: Tomatoes in `kg` (kilograms)
- Recipe needs: `g` (grams)
- Conversion: 1 kg = 1000 g

**Solution:**
Use `unit_conversions` table:
```sql
SELECT conversion_factor
FROM unit_conversions
WHERE from_unit = 'kg'
AND to_unit = 'g';
-- Returns: 1000
```

**Cost Calculation:**
```typescript
const ingredientCost = 
  quantity * 
  itemUnitCost * 
  conversionFactor;

// Example:
// 500g tomatoes
// Tomatoes: $2.50/kg
// Conversion: 1000 (1kg = 1000g)
// Cost = 500 * 2.50 * (1/1000) = $1.25
```

**Helper Function Needed:**
```typescript
async function getConversionFactor(
  fromUnit: string,
  toUnit: string
): Promise<number> {
  // Check cache first
  const cacheKey = `${fromUnit}-${toUnit}`;
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey)!;
  }
  
  // Query database
  const { data, error } = await supabase
    .from('unit_conversions')
    .select('conversion_factor')
    .eq('from_unit', fromUnit)
    .eq('to_unit', toUnit)
    .single();
  
  if (error || !data) {
    throw new Error(`No conversion found: ${fromUnit} → ${toUnit}`);
  }
  
  // Cache result
  conversionCache.set(cacheKey, data.conversion_factor);
  
  return data.conversion_factor;
}
```

---

## ✅ TESTING REQUIREMENTS

### Unit Tests:
- [ ] Recipe cost calculation
- [ ] Food cost % calculation
- [ ] Unit conversion logic
- [ ] Yield percentage calculation
- [ ] Sub-recipe cost calculation

### Integration Tests:
- [ ] Recipe list with costs
- [ ] Recipe detail loads correctly
- [ ] Production creates all records
- [ ] Inventory item created
- [ ] Batch tracked properly
- [ ] Count updated

### Manual Testing:
- [ ] Create sub-recipe
- [ ] Record production
- [ ] Verify inventory item exists
- [ ] Verify batch in STOCK module
- [ ] Use sub-recipe in recipe
- [ ] Check recipe cost includes sub-recipe
- [ ] Verify food cost % accurate
- [ ] Test with different units

---

## 🚦 TRAFFIC LIGHT PROGRESS

**Pages:**
```
🔴 /recipes/page.tsx
🔴 /recipes/[id]/page.tsx
🔴 /recipes/sub-recipes/page.tsx
🔴 /recipes/production/page.tsx
```

**Components:**
```
🔴 <RecipeCard>
🔴 <RecipeListItem>
🔴 <FoodCostBadge>
🔴 <RecipeCostSummary>
🔴 <IngredientTable>
🔴 <IngredientRow>
🔴 <SubRecipeCard>
🔴 <YieldDisplay>
🔴 <ProduceButton>
🔴 <SubRecipeSelector>
🔴 <YieldInput>
🔴 <ShelfLifePicker>
🔴 <ProductionSummary>
```

**APIs:**
```
🔴 GET /api/recipes
🔴 GET /api/recipes/[id]
🔴 GET /api/recipes/[id]/cost
🔴 GET /api/recipes/sub-recipes
🔴 GET /api/recipes/sub-recipes/[id]
🔴 POST /api/recipes/production
🔴 GET /api/recipes/categories
```

**Update as you work!**

---

## 🎯 DEFINITION OF DONE

A page is **DONE** when:

**Functional:**
- [ ] All features work
- [ ] Costs calculate accurately
- [ ] Unit conversions correct
- [ ] Production creates all records
- [ ] Links between modules work
- [ ] Error handling robust

**UX:**
- [ ] Portrait (768px) works
- [ ] Landscape (1024px) works
- [ ] Touch targets ≥ 44px
- [ ] Loading states visible
- [ ] Empty states handled
- [ ] Color coding correct

**Technical:**
- [ ] TypeScript types correct
- [ ] Supabase queries optimized
- [ ] RLS policies respected
- [ ] No console errors
- [ ] Unit tests pass

**Integration:**
- [ ] Links to STOCK items work
- [ ] Sub-recipes become inventory
- [ ] Batches tracked properly
- [ ] Costs update with prices

---

## 📝 DEVELOPMENT WORKFLOW

### Build Order (Recommended):

**Week 1:**
1. **RECIPES List** - Start here (shows cost calculations)
   - Build cost calculation logic
   - Create recipe cards
   - Implement search/filter
   - Test food cost % badges

2. **RECIPE Detail** - Shows full costing breakdown
   - Build ingredient table
   - Implement cost summary
   - Add instructions display
   - Link to inventory items

**Week 2:**
3. **SUB-RECIPES List** - Standalone, simpler than recipes
   - Build sub-recipe cards
   - Calculate cost per unit
   - Show usage count
   - Add produce button

4. **PRODUCTION Recording** - Most complex, do last
   - Build production form
   - Implement all 4 database operations
   - Test inventory item creation
   - Verify batch tracking
   - Confirm count updates

**Week 3:**
5. **Polish & Integration Testing**
   - Test RECIPES → STOCK integration
   - Verify sub-recipes work in recipes
   - Test production → inventory flow
   - Optimize cost calculations
   - Write comprehensive tests

---

## 🚨 IMPORTANT NOTES

### Recipe Cost Calculation:
This is the **core feature**. Get it right:
- Must handle inventory items AND sub-recipes
- Must convert units correctly
- Must update when prices change
- Must be fast (<1 second for 20 ingredients)

### Sub-Recipe → Inventory Flow:
When you record production:
1. ✅ Production batch created
2. ✅ Inventory item created (or updated)
3. ✅ Batch with expiration created
4. ✅ Count updated

**All 4 must succeed or all fail (transaction).**

### Unit Conversions:
Critical for accurate costing. If conversions are wrong, all costs are wrong.

**Pre-populate common conversions:**
- kg ↔ g
- L ↔ ml
- oz-wt ↔ lb
- oz-fl ↔ gal

### Food Cost % Targets:
Industry standards (for badge colors):
- 🟢 20-32% (ideal)
- 🟡 32-40% (acceptable but high)
- 🔴 >40% (losing money) or <20% (underpriced)

---

## 💬 QUESTIONS BEFORE STARTING?

**Confirm you understand:**
- [ ] Recipe cost calculation logic
- [ ] Unit conversion requirement
- [ ] Sub-recipe → inventory flow
- [ ] Production recording process
- [ ] Food cost % color coding

**Ask if unclear about:**
- Cost calculation formulas
- Database transaction handling
- Unit conversion implementation
- Integration with STOCK module

---

## 🚀 READY TO BUILD!

**Start with:**
1. **Read Module_Architecture_Schematics.md** (Pages 2.1-2.4)
2. **Study unit conversions table** (critical!)
3. **Build cost calculation function** (foundation)
4. **Build RECIPES List** (shows calculations)
5. **Test thoroughly before next page**

**Remember:**
- 📖 Reference the schematic wireframes
- 🔒 Don't break Phases 1 & 2
- ✅ Test cost calculations extensively
- 🎯 Mark progress (🔴→🟠→🟢)
- ❓ Ask before assuming

---

**Phase 3 Success** = Working recipe costing + Sub-recipe production + Integration with STOCK! 🎯

Let's build the RECIPES module! 🍳🚀
