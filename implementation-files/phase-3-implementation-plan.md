# 🍳 Phase 3 RECIPES Implementation Plan

**Session Start**: November 12, 2025  
**Phase**: 3 of 4 - Recipe Management with Costing & Production  
**Target**: 4 pages + sophisticated recipe costing system

---

## 🎯 Phase 3 Overview

**Core Challenge**: Build sophisticated recipe costing system that integrates with STOCK module

**Key Features:**
- 🧮 **Recipe Costing**: Complex calculations using inventory prices + unit conversions
- 🔗 **STOCK Integration**: Recipes use inventory items as ingredients
- 🏭 **Production Flow**: Sub-recipes become inventory items when produced  
- 💰 **Food Cost %**: Color-coded profitability indicators (🟢🟡🔴)

---

## 📋 Implementation Tasks

### PHASE 3A: Foundation & Types (First Priority)

**Critical Infrastructure:**
- [ ] **Activate RECIPES module** in module-config.ts
- [ ] **Create RecipeTypes.ts** with all interfaces
- [ ] **Build unit conversion helper** functions
- [ ] **Create FoodCostBadge component** (🟢 20-32%, 🟡 32-40%, 🔴 >40%)

### PHASE 3B: Core Recipe System (Week 1)

**Page 1: RECIPES List** (`/recipes/page.tsx`)
- [ ] **Recipe search & filtering** (category, cost sorting)
- [ ] **RecipeCard component** with photo, cost, food cost %
- [ ] **API: GET /api/recipes** with cost calculations
- [ ] **Cost calculation logic** (inventory + sub-recipes + unit conversions)

**Page 2: RECIPE Detail** (`/recipes/[id]/page.tsx`) 
- [ ] **Recipe information display**
- [ ] **Ingredient table** with individual costs
- [ ] **Cost summary card** with food cost % status
- [ ] **API: GET /api/recipes/[id]** with full ingredient breakdown

### PHASE 3C: Sub-Recipe System (Week 2)

**Page 3: SUB-RECIPES** (`/recipes/sub-recipes/page.tsx`)
- [ ] **Sub-recipe list** with cost per unit
- [ ] **Usage tracking** (how many recipes use each sub-recipe)
- [ ] **SubRecipeCard component** with yield display
- [ ] **API: GET /api/recipes/sub-recipes** with cost calculations

**Page 4: PRODUCTION Recording** (`/recipes/production/page.tsx`)
- [ ] **Production form** (sub-recipe selection, quantity, quality notes)
- [ ] **Yield percentage calculation** with warnings if <95%
- [ ] **Inventory integration** (creates inventory item + batch + count)
- [ ] **API: POST /api/recipes/production** (4 database operations)

---

## 🧮 Critical Recipe Costing Logic

### Cost Calculation Formula:
```typescript
Recipe Cost = Σ(Ingredient Costs)

Where Ingredient Cost = 
  IF ingredient_type = 'inventory':
    quantity × inventory_item.unit_cost × conversion_factor
  IF ingredient_type = 'sub_recipe':
    quantity × sub_recipe.cost_per_unit

Food Cost % = (cost_per_portion ÷ menu_price) × 100
```

### Unit Conversion System:
```typescript
// Example: Recipe needs 500g tomatoes, inventory is $2.50/kg
const cost = quantity × itemUnitCost × conversionFactor
// 500 × 2.50 × (1/1000) = $1.25
```

### Color Coding (Food Cost %):
- 🟢 **Green**: 20-32% (target profitability)
- 🟡 **Yellow**: 32-40% (acceptable but high)  
- 🔴 **Red**: >40% (losing money) or <20% (underpriced)

---

## 🔗 STOCK → RECIPES Integration Points

### Recipe Ingredients:
1. **Query inventory_items** for ingredient prices
2. **Apply unit conversions** from unit_conversions table
3. **Calculate ingredient costs** in real-time
4. **Link to item detail** pages from STOCK module

### Sub-Recipe Production → Inventory:
1. **Production creates inventory_item** with source_type='produced'
2. **Creates inventory_batch** for expiration tracking
3. **Updates inventory_count** for current quantities
4. **Records production_batch** for audit trail

**Transaction Requirements**: All 4 operations must succeed or fail together

---

## 🗄️ Database Schema (Already Exists)

**Recipe Tables:**
```sql
✅ recipes (recipe_id, name, portions, menu_price, etc.)
✅ recipe_ingredients (links to inventory_items OR sub_recipes)
✅ recipe_categories (appetizers, mains, desserts, etc.)
✅ sub_recipes (batch_yield_quantity, cost_per_unit)
✅ sub_recipe_ingredients (links to inventory_items)
✅ production_batches (production tracking)
✅ unit_conversions (kg→g, L→ml, etc.)
```

**Integration Tables:**
```sql
✅ inventory_items (provides ingredient prices)
✅ inventory_batches (expiration tracking for sub-recipes)
✅ inventory_count (stock levels after production)
```

---

## 🎨 UI Components to Build

### Recipe Components:
- **RecipeCard** - Grid view with photo, cost, food cost %
- **RecipeListItem** - Compact table row format
- **FoodCostBadge** - Color-coded percentage display
- **RecipeCostSummary** - Total cost breakdown card
- **IngredientTable** - Ingredients with individual costs
- **IngredientRow** - Clickable ingredient (links to STOCK)

### Sub-Recipe Components:
- **SubRecipeCard** - Display with yield and usage count
- **YieldDisplay** - Batch quantity + unit formatting
- **UsageCount** - "Used in X recipes" indicator
- **ProduceButton** - Quick production recording

### Production Components:
- **SubRecipeSelector** - Searchable dropdown
- **YieldInput** - Quantity + unit selector
- **YieldPercentageDisplay** - Auto-calculated with warning if <95%
- **ShelfLifePicker** - Expiration date selection
- **ProductionSummary** - Preview of what will be created

---

## 🔌 API Endpoints to Create

```typescript
GET  /api/recipes                    // List with costs & filtering
GET  /api/recipes/[id]              // Single recipe with ingredients  
GET  /api/recipes/[id]/cost         // Real-time cost calculation
GET  /api/recipes/categories        // Recipe categories list
GET  /api/recipes/sub-recipes       // Sub-recipes with costs
GET  /api/recipes/sub-recipes/[id]  // Single sub-recipe detail
POST /api/recipes/production        // Record production (4 DB ops)
```

---

## ⚡ Performance Considerations

### Cost Calculation Optimization:
- **Cache unit conversions** (rarely change)
- **Batch ingredient queries** (avoid N+1 problem)
- **Pre-calculate costs** where possible
- **Use database functions** for complex calculations

### Real-Time Updates:
- **Inventory price changes** should update recipe costs
- **Sub-recipe cost changes** should cascade to parent recipes
- **Production batches** should immediately appear in STOCK

---

## 🧪 Testing Strategy

### Unit Tests:
- ✅ Recipe cost calculation accuracy
- ✅ Unit conversion logic
- ✅ Food cost % calculation
- ✅ Yield percentage calculation

### Integration Tests:
- ✅ Recipe → STOCK item linking
- ✅ Sub-recipe production workflow
- ✅ Inventory item creation
- ✅ Batch expiration tracking
- ✅ Cost updates with price changes

### Manual Testing Workflow:
1. Create sub-recipe with ingredients
2. Record production batch
3. Verify inventory item appears in STOCK
4. Create recipe using sub-recipe
5. Verify cost includes sub-recipe cost
6. Change inventory price, verify recipe cost updates

---

## 🚦 Success Criteria

**Functional Requirements:**
- [ ] All recipes display with accurate costs
- [ ] Food cost % color coding works correctly
- [ ] Sub-recipe production creates all required records
- [ ] Integration with STOCK module seamless
- [ ] Unit conversions calculate correctly
- [ ] Performance acceptable (<2s page loads)

**Technical Requirements:**
- [ ] TypeScript interfaces complete and type-safe
- [ ] Supabase RLS policies respected
- [ ] Error handling comprehensive
- [ ] Mobile/iPad compatibility maintained
- [ ] Component reusability maximized

---

## 🎯 Phase 3 Definition of Done

**A page is COMPLETE when:**
✅ All features work correctly  
✅ Costs calculate accurately  
✅ Unit conversions validated  
✅ STOCK integration tested  
✅ iPad Air (768px/1024px) responsive  
✅ Touch targets ≥ 44px  
✅ Loading/empty states handled  
✅ TypeScript compilation clean  
✅ No console errors  
✅ Color coding correct  

---

## 🔄 Implementation Order

**Recommended Build Sequence:**
1. **Foundation** - Types, conversions, FoodCostBadge
2. **RECIPES List** - Core costing logic + recipe cards  
3. **RECIPE Detail** - Full ingredient breakdown
4. **SUB-RECIPES** - Simpler, standalone functionality
5. **PRODUCTION** - Most complex, all integrations
6. **Polish & Testing** - Performance optimization

---

**Next Action**: Activate RECIPES module and begin building foundation components! 🚀