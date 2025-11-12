# 🚀 JiGR Phase 4: MENU Module (FINAL PHASE!)

**Date**: November 13, 2025  
**Phase**: 4 of 4 (FINAL!)  
**Previous Phases**: ✅ All Complete (12 pages)  
**Target**: Menu Pricing & Engineering Analytics  
**Timeline**: 2-3 weeks

---

## ✅ PHASES 1-3 RECAP - WHAT'S DONE

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

**RECIPES Module (Complete):**
- ✅ Recipe list with costing
- ✅ Recipe detail
- ✅ Sub-recipes
- ✅ Production recording
- ✅ 4 pages total

**Status**: 🟢 12 pages live! Now finishing with MENU analytics!

---

## 🎯 PHASE 4 OBJECTIVES

Build the **MENU module** (4 pages) - the final piece:

### 1. MENU Pricing (`/menu/pricing/page.tsx`)
### 2. MENU Engineering (`/menu/engineering/page.tsx`)
### 3. MENU Item Detail (`/menu/items/[id]/page.tsx`)
### 4. MENU Analysis Dashboard (`/menu/analysis/page.tsx`)

---

## 💰 MODULE OVERVIEW: MENU Module Purpose

### The Complete Flow:
```
STOCK Items → Recipe Ingredients → Recipe Cost
                                        ↓
                                   Cost/Portion
                                        ↓
                                   Menu Price ← MENU MODULE
                                        ↓
                                  Food Cost %
                                        ↓
                            Menu Engineering Analysis
                        (Stars, Plowhorses, Puzzles, Dogs)
```

### What MENU Module Does:
1. **Set menu prices** for recipes
2. **Track food cost %** (cost vs price)
3. **Menu engineering** (profitability + popularity matrix)
4. **Price optimization** recommendations
5. **Performance analysis** by category

---

## 💵 PAGE 1: MENU Pricing

**Route**: `/menu/pricing/page.tsx`  
**Purpose**: Set and manage menu prices for recipes  
**Reference**: Module_Architecture_Schematics.md → Page 4.1

### Features:

**Search & Filters:**
- [ ] Search bar (filter by recipe name)
- [ ] Category filter (All, Appetizers, Mains, etc.)
- [ ] Sort options: Name, Food Cost % (High-Low), Price

**Pricing Table:**
- [ ] Recipe name
- [ ] Cost per portion (from recipe calculation)
- [ ] Current menu price
- [ ] Food cost % (cost/price × 100)
- [ ] Status indicator (🟢🟡🔴)
- [ ] **[Edit Price]** button → Inline edit or modal

**Status Color Coding:**
- 🟢 Green: 20-32% food cost (ideal range)
- 🟡 Yellow: <20% (underpriced) OR 32-40% (high but acceptable)
- 🔴 Red: >40% (losing money on this item)

**Summary Card:**
- [ ] Average food cost % (across all items)
- [ ] Target range: 25-30%
- [ ] Items out of range: Count with %
- [ ] Weighted average by sales (future: requires sales data)

**Actions:**
- [ ] **[Update All Costs]** → Recalculates all recipe costs from current inventory prices
- [ ] **[Export]** → Download pricing spreadsheet

### Data Sources:

**Menu Items with Pricing:**
```sql
SELECT 
  r.recipe_id,
  r.recipe_name,
  rc.category_name,
  r.menu_price,
  (
    -- Calculate current recipe cost
    SELECT SUM(
      ri.quantity * 
      CASE 
        WHEN ri.ingredient_type = 'inventory'
        THEN ii.unit_cost * uc.conversion_factor
        WHEN ri.ingredient_type = 'sub_recipe'
        THEN sr.cost_per_unit
        ELSE 0
      END
    ) / r.number_of_portions
    FROM recipe_ingredients ri
    LEFT JOIN inventory_items ii ON ri.item_id = ii.item_id
    LEFT JOIN sub_recipes sr ON ri.sub_recipe_id = sr.sub_recipe_id
    LEFT JOIN unit_conversions uc ON (
      uc.from_unit = ii.recipe_unit 
      AND uc.to_unit = ri.unit
    )
    WHERE ri.recipe_id = r.recipe_id
  ) as cost_per_portion,
  (
    SELECT (cost_per_portion / r.menu_price * 100)
  ) as food_cost_percentage,
  CASE
    WHEN food_cost_percentage BETWEEN 20 AND 32 THEN 'good'
    WHEN food_cost_percentage < 20 THEN 'underpriced'
    WHEN food_cost_percentage BETWEEN 32 AND 40 THEN 'high'
    WHEN food_cost_percentage > 40 THEN 'too_high'
    ELSE 'unknown'
  END as status
FROM recipes r
JOIN recipe_categories rc ON r.category_id = rc.category_id
WHERE r.client_id = auth.uid()::uuid
ORDER BY r.recipe_name;
```

**Update Menu Price:**
```sql
UPDATE recipes
SET 
  menu_price = $2,
  updated_at = NOW()
WHERE recipe_id = $1
AND client_id = auth.uid()::uuid;
```

### UI Components Needed:
- [ ] `<PricingTable>` - Sortable pricing table
- [ ] `<FoodCostStatusBadge>` - Color-coded status
- [ ] `<PriceEditor>` - Inline price edit or modal
- [ ] `<PricingSummary>` - Summary stats card

### Success Criteria:
- [ ] All items display with accurate costs
- [ ] Food cost % calculates correctly
- [ ] Color coding matches thresholds
- [ ] Price editing works (inline or modal)
- [ ] [Update All Costs] recalculates everything
- [ ] Summary stats accurate
- [ ] Sort/filter responsive

---

## 📊 PAGE 2: MENU Engineering

**Route**: `/menu/engineering/page.tsx`  
**Purpose**: Analyze menu performance (profitability + popularity)  
**Reference**: Module_Architecture_Schematics.md → Page 4.2

### Features:

**The Menu Engineering Matrix:**
```
           HIGH PROFITABILITY
    ┌────────────────┬────────────────┐
    │ ⭐ STARS       │ 🐴 PLOWHORSES  │
    │ High Profit    │ High Profit    │
    │ High Popular   │ Low Popular    │
    ├────────────────┼────────────────┤  HIGH
    │ ❓ PUZZLES     │ 🐕 DOGS        │  POP
    │ Low Profit     │ Low Profit     │   ↕
    │ High Popular   │ Low Popular    │  LOW
    └────────────────┴────────────────┘
           LOW PROFITABILITY
```

**Four Quadrants:**
- [ ] **⭐ STARS**: High profit + High sales
  - Action: Feature prominently, maintain quality
  - These are your winners!
  
- [ ] **🐴 PLOWHORSES**: High profit + Low sales
  - Action: Promote more, reduce portion sizes
  - Hidden gems that need marketing
  
- [ ] **❓ PUZZLES**: Low profit + High sales
  - Action: Increase price or reduce cost
  - Popular but not profitable
  
- [ ] **🐕 DOGS**: Low profit + Low sales
  - Action: Remove or completely rework
  - Taking up menu space for nothing

**Metrics:**
- [ ] **Profitability**: Contribution Margin (Price - Cost)
- [ ] **Popularity**: Sales count or % of total sales

**Display:**
- [ ] Visual 2x2 matrix with items placed in quadrants
- [ ] List view grouped by quadrant
- [ ] Item count per quadrant
- [ ] Click item → Item detail page

**Recommendations Section:**
- [ ] Auto-generated suggestions per quadrant
- [ ] Priority actions
- [ ] Estimated revenue impact

### Data Sources:

**Menu Engineering Analysis:**
```sql
WITH item_performance AS (
  SELECT 
    r.recipe_id,
    r.recipe_name,
    rc.category_name,
    -- Contribution Margin (profitability)
    (r.menu_price - (
      SELECT SUM(
        ri.quantity * 
        CASE 
          WHEN ri.ingredient_type = 'inventory'
          THEN ii.unit_cost * uc.conversion_factor
          WHEN ri.ingredient_type = 'sub_recipe'
          THEN sr.cost_per_unit
          ELSE 0
        END
      ) / r.number_of_portions
      FROM recipe_ingredients ri
      LEFT JOIN inventory_items ii ON ri.item_id = ii.item_id
      LEFT JOIN sub_recipes sr ON ri.sub_recipe_id = sr.sub_recipe_id
      LEFT JOIN unit_conversions uc ON (
        uc.from_unit = ii.recipe_unit 
        AND uc.to_unit = ri.unit
      )
      WHERE ri.recipe_id = r.recipe_id
    )) as contribution_margin,
    -- Popularity (requires sales data - future integration)
    -- For now, use a placeholder or manual entry
    COALESCE(r.monthly_sales_count, 0) as sales_count,
    -- Calculate median values for thresholds
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY contribution_margin) 
      OVER () as median_margin,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sales_count) 
      OVER () as median_sales
  FROM recipes r
  JOIN recipe_categories rc ON r.category_id = rc.category_id
  WHERE r.client_id = auth.uid()::uuid
)
SELECT 
  *,
  CASE
    WHEN contribution_margin >= median_margin 
      AND sales_count >= median_sales 
      THEN 'star'
    WHEN contribution_margin >= median_margin 
      AND sales_count < median_sales 
      THEN 'plowhorse'
    WHEN contribution_margin < median_margin 
      AND sales_count >= median_sales 
      THEN 'puzzle'
    WHEN contribution_margin < median_margin 
      AND sales_count < median_sales 
      THEN 'dog'
    ELSE 'unknown'
  END as quadrant
FROM item_performance
ORDER BY contribution_margin DESC, sales_count DESC;
```

**Note**: This requires **sales data**. Options:
1. **Manual entry**: Add `monthly_sales_count` field to recipes
2. **POS integration**: Future Phase 5+
3. **Estimated sales**: Placeholder with ability to update

### UI Components Needed:
- [ ] `<MenuEngineeringMatrix>` - Visual 2x2 grid
- [ ] `<QuadrantSection>` - Collapsible quadrant display
- [ ] `<MenuItemCard>` - Item in matrix/list
- [ ] `<RecommendationsPanel>` - Action suggestions

### Important Notes:
**Sales Data Required:**
This feature requires sales/popularity data. For Phase 4:
- [ ] Add `monthly_sales_count` field to recipes table (optional)
- [ ] Allow manual entry of sales counts
- [ ] Build the interface with placeholder data
- [ ] Add clear messaging: "Connect POS for automatic sales tracking"
- [ ] Plan for future POS integration (Phase 5+)

### Success Criteria:
- [ ] Matrix displays correctly
- [ ] Items categorized into correct quadrants
- [ ] Contribution margin calculates accurately
- [ ] Manual sales entry works (if implemented)
- [ ] Recommendations generate appropriately
- [ ] Clear messaging about sales data requirement

---

## 📈 PAGE 3: MENU Item Detail

**Route**: `/menu/items/[id]/page.tsx`  
**Purpose**: Detailed analysis of single menu item  
**Reference**: Module_Architecture_Schematics.md → Page 4.3

### Features:

**Current Pricing Card:**
- [ ] Menu price
- [ ] Food cost (per portion)
- [ ] Food cost %
- [ ] Contribution margin (price - cost)
- [ ] Status indicator (🟢🟡🔴)

**Pricing Scenarios:**
- [ ] "What if price was..." calculator
- [ ] Show 3-5 price points with resulting:
  - Food cost %
  - Contribution margin
  - Recommendations (⭐ for optimal)

**Price History Chart:**
- [ ] Line chart showing price changes over time
- [ ] Show when prices were changed
- [ ] Display food cost % at each price point

**Sales Performance (if data available):**
- [ ] This week sales count
- [ ] Last week sales count
- [ ] Average per day
- [ ] Popularity ranking (#X out of Y items)
- [ ] Trend indicator (📈📉)

**Quick Actions:**
- [ ] **[Edit Price]** → Update menu price
- [ ] **[View Recipe]** → Link to recipe detail
- [ ] **[Edit Recipe]** → Link to recipe editor
- [ ] **[Print]** → Print item card

### Data Sources:

**Menu Item Analysis:**
```sql
-- Current pricing
SELECT 
  r.*,
  (
    SELECT SUM(...) / r.number_of_portions
    FROM recipe_ingredients ri ...
  ) as cost_per_portion,
  (cost_per_portion / r.menu_price * 100) as food_cost_percentage,
  (r.menu_price - cost_per_portion) as contribution_margin
FROM recipes r
WHERE r.recipe_id = $1
AND r.client_id = auth.uid()::uuid;

-- Price history
SELECT 
  old_price,
  new_price,
  changed_at,
  changed_by
FROM menu_price_history
WHERE recipe_id = $1
ORDER BY changed_at DESC
LIMIT 12; -- Last 12 changes
```

**Pricing Scenarios Calculation:**
```typescript
function calculatePricingScenarios(
  currentPrice: number,
  costPerPortion: number
) {
  const scenarios = [];
  
  // Generate 5 price points around current price
  const pricePoints = [
    currentPrice * 0.9,  // -10%
    currentPrice * 0.95, // -5%
    currentPrice,        // Current
    currentPrice * 1.05, // +5%
    currentPrice * 1.1   // +10%
  ];
  
  pricePoints.forEach(price => {
    const foodCostPct = (costPerPortion / price) * 100;
    const margin = price - costPerPortion;
    
    scenarios.push({
      price: price.toFixed(2),
      foodCostPct: foodCostPct.toFixed(1),
      margin: margin.toFixed(2),
      optimal: foodCostPct >= 20 && foodCostPct <= 32
    });
  });
  
  return scenarios;
}
```

### UI Components Needed:
- [ ] `<CurrentPricingCard>` - Current status
- [ ] `<PricingScenarios>` - What-if calculator
- [ ] `<PriceHistoryChart>` - Line chart (Chart.js or Recharts)
- [ ] `<SalesPerformanceCard>` - Sales stats (if available)

### Success Criteria:
- [ ] All data displays correctly
- [ ] Pricing scenarios calculate accurately
- [ ] Price history chart renders
- [ ] Links to recipe work
- [ ] Sales data displays (if available)
- [ ] Empty states for missing data

---

## 📊 PAGE 4: MENU Analysis Dashboard

**Route**: `/menu/analysis/page.tsx`  
**Purpose**: High-level menu performance overview  
**Reference**: Module_Architecture_Schematics.md → Page 4.4

### Features:

**Summary Metrics (Top Row):**
- [ ] **Avg Food Cost %**: Weighted average across all items
- [ ] **Theoretical FC %**: Target (27% industry standard)
- [ ] **Variance**: Difference from target
- [ ] **Total Contribution**: Sum of all contribution margins

**Top Performers Section:**
- [ ] List of top 10 items by contribution margin
- [ ] Show: Item name, Sold (count), Margin, Total contribution
- [ ] Sort by total contribution (sales × margin)

**Category Performance:**
- [ ] Breakdown by recipe category
- [ ] Show: Category, Avg FC%, Sales, Total Contribution
- [ ] Bar chart visualization (optional)
- [ ] Contribution % of total revenue

**Items Needing Attention:**
- [ ] Flag items with issues:
  - 🔴 Food cost >40% (losing money)
  - 🐕 Dogs quadrant items (low profit, low sales)
  - 📉 Declining sales trend (if data available)
- [ ] Quick action links

**Date Range Filter:**
- [ ] Select period: Last 7/30/90 days, Custom
- [ ] Affects sales-based metrics only
- [ ] Defaults to last 30 days

### Data Sources:

**Dashboard Metrics:**
```sql
-- Average Food Cost %
WITH recipe_costs AS (
  SELECT 
    r.recipe_id,
    r.menu_price,
    (
      SELECT SUM(...) / r.number_of_portions
      FROM recipe_ingredients ri ...
    ) as cost_per_portion,
    (cost_per_portion / r.menu_price * 100) as food_cost_pct,
    COALESCE(r.monthly_sales_count, 0) as sales_count
  FROM recipes r
  WHERE r.client_id = auth.uid()::uuid
)
SELECT 
  -- Simple average
  AVG(food_cost_pct) as avg_food_cost_pct,
  
  -- Weighted average by sales (if data available)
  SUM(food_cost_pct * sales_count) / NULLIF(SUM(sales_count), 0) 
    as weighted_avg_food_cost_pct,
  
  -- Total contribution
  SUM((menu_price - cost_per_portion) * sales_count) 
    as total_contribution
FROM recipe_costs;

-- Category Performance
SELECT 
  rc.category_name,
  AVG((cost_per_portion / r.menu_price * 100)) as avg_food_cost_pct,
  SUM(COALESCE(r.monthly_sales_count, 0)) as total_sales,
  SUM(
    (r.menu_price - cost_per_portion) * 
    COALESCE(r.monthly_sales_count, 0)
  ) as total_contribution
FROM recipes r
JOIN recipe_categories rc ON r.category_id = rc.category_id
WHERE r.client_id = auth.uid()::uuid
GROUP BY rc.category_name
ORDER BY total_contribution DESC;

-- Items Needing Attention
SELECT 
  r.recipe_id,
  r.recipe_name,
  food_cost_pct,
  sales_count,
  CASE
    WHEN food_cost_pct > 40 THEN 'high_food_cost'
    WHEN sales_count = 0 THEN 'no_sales'
    WHEN quadrant = 'dog' THEN 'dog_quadrant'
    ELSE 'other'
  END as issue_type
FROM recipe_costs
WHERE 
  food_cost_pct > 40 
  OR sales_count = 0 
  OR quadrant = 'dog'
ORDER BY issue_type, food_cost_pct DESC;
```

### UI Components Needed:
- [ ] `<MetricCard>` - Summary stat cards (reuse from Phase 2)
- [ ] `<TopPerformersTable>` - Top items list
- [ ] `<CategoryBreakdown>` - Category analysis (reuse from Phase 2)
- [ ] `<AttentionItems>` - Flagged items list
- [ ] `<PerformanceChart>` - Bar chart (optional)

### Important Note:
**Sales Data Requirement:**
Many metrics require sales data. For Phase 4:
- Build interface with mock/manual sales data
- Show "0" or "N/A" where sales data missing
- Add prominent banner: "📊 Connect your POS for full analytics"
- Everything should work without sales data (just limited insights)

### Success Criteria:
- [ ] All metrics calculate correctly
- [ ] Top performers display accurately
- [ ] Category breakdown works
- [ ] Attention items flagged correctly
- [ ] Date range filter works (when sales data exists)
- [ ] Graceful handling of missing sales data
- [ ] Clear messaging about POS integration

---

## 🗄️ DATABASE TABLES USED

**Existing Tables:**
```
✅ recipes
✅ recipe_ingredients
✅ recipe_categories
✅ inventory_items
✅ sub_recipes
✅ unit_conversions
```

**May Need to Add:**
```
? menu_price_history (for price tracking)
? recipes.monthly_sales_count (for manual sales entry)
```

**Check if these exist, if not, create migrations.**

---

## 🔌 API ENDPOINTS TO CREATE

### `/api/menu/pricing`
- **GET**: List all items with pricing and food cost %
- **PUT**: Bulk update prices (future)

### `/api/menu/pricing/[id]`
- **PUT**: Update single menu price
- **POST**: Record price change in history

### `/api/menu/pricing/recalculate`
- **POST**: Recalculate all recipe costs from current inventory prices

### `/api/menu/engineering`
- **GET**: Menu engineering matrix data
- Returns items categorized into quadrants

### `/api/menu/items/[id]/analysis`
- **GET**: Detailed item analysis
- Includes pricing scenarios, history, performance

### `/api/menu/items/[id]/scenarios`
- **POST**: Generate pricing scenarios
- Input: item_id, price_range
- Output: Array of scenarios with FC% and margins

### `/api/menu/analysis`
- **GET**: Dashboard metrics and performance data
- Params: date_range (optional)

### `/api/menu/categories/performance`
- **GET**: Performance by category

---

## 🎨 UI COMPONENTS TO CREATE

### Pricing Components:
- [ ] `<PricingTable>` - Main pricing table
- [ ] `<FoodCostStatusBadge>` - Color-coded FC% badge (reuse from Phase 3)
- [ ] `<PriceEditor>` - Inline or modal price editor
- [ ] `<PricingSummary>` - Summary stats

### Engineering Components:
- [ ] `<MenuEngineeringMatrix>` - Visual 2x2 grid
- [ ] `<QuadrantSection>` - Collapsible quadrant
- [ ] `<MenuItemCard>` - Item in matrix
- [ ] `<RecommendationsPanel>` - Action suggestions

### Analysis Components:
- [ ] `<CurrentPricingCard>` - Current pricing status
- [ ] `<PricingScenarios>` - What-if calculator
- [ ] `<PriceHistoryChart>` - Line chart
- [ ] `<SalesPerformanceCard>` - Sales stats
- [ ] `<TopPerformersTable>` - Top items
- [ ] `<AttentionItems>` - Flagged items

### Reuse from Previous Phases:
- ✅ `<MetricCard>` (Phase 2)
- ✅ `<DataTable>` (Phase 1)
- ✅ `<SearchInput>` (Phase 1)
- ✅ `<PageHeader>` (Phase 1)
- ✅ `<EmptyState>` (Phase 1)
- ✅ `<CategoryBreakdown>` (Phase 2)

---

## 📊 CHARTING LIBRARY

**Recommended**: Use **Recharts** (already available in your stack)

**Price History Chart Example:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={600} height={300} data={priceHistory}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="price" 
    stroke="#8884d8" 
    name="Menu Price"
  />
  <Line 
    type="monotone" 
    dataKey="foodCostPct" 
    stroke="#82ca9d" 
    name="Food Cost %"
  />
</LineChart>
```

---

## ✅ TESTING REQUIREMENTS

### Unit Tests:
- [ ] Food cost % calculation
- [ ] Contribution margin calculation
- [ ] Menu engineering quadrant logic
- [ ] Pricing scenario generation
- [ ] Weighted average calculation

### Integration Tests:
- [ ] Price update workflow
- [ ] Recalculate all costs
- [ ] Menu engineering matrix
- [ ] Dashboard metrics
- [ ] Price history tracking

### Manual Testing:
- [ ] Change menu price → Verify FC% updates
- [ ] Recalculate costs → Verify all recipes update
- [ ] Menu engineering → Verify correct quadrants
- [ ] Pricing scenarios → Verify accuracy
- [ ] Dashboard → Verify all metrics
- [ ] Works without sales data
- [ ] Works with sales data (if implemented)

---

## 🚦 TRAFFIC LIGHT PROGRESS

**Pages:**
```
🔴 /menu/pricing/page.tsx
🔴 /menu/engineering/page.tsx
🔴 /menu/items/[id]/page.tsx
🔴 /menu/analysis/page.tsx
```

**Components:**
```
🔴 <PricingTable>
🔴 <PriceEditor>
🔴 <PricingSummary>
🔴 <MenuEngineeringMatrix>
🔴 <QuadrantSection>
🔴 <RecommendationsPanel>
🔴 <CurrentPricingCard>
🔴 <PricingScenarios>
🔴 <PriceHistoryChart>
🔴 <SalesPerformanceCard>
🔴 <TopPerformersTable>
🔴 <AttentionItems>
```

**APIs:**
```
🔴 GET /api/menu/pricing
🔴 PUT /api/menu/pricing/[id]
🔴 POST /api/menu/pricing/recalculate
🔴 GET /api/menu/engineering
🔴 GET /api/menu/items/[id]/analysis
🔴 POST /api/menu/items/[id]/scenarios
🔴 GET /api/menu/analysis
🔴 GET /api/menu/categories/performance
```

**Update as you work!**

---

## 🎯 DEFINITION OF DONE

A page is **DONE** when:

**Functional:**
- [ ] All features work
- [ ] Calculations accurate
- [ ] Price updates save correctly
- [ ] Charts render properly
- [ ] Links between pages work
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

**Business Logic:**
- [ ] Food cost % targets correct (20-32%)
- [ ] Contribution margin accurate
- [ ] Menu engineering logic sound
- [ ] Pricing scenarios helpful

---

## 📝 DEVELOPMENT WORKFLOW

### Build Order (Recommended):

**Week 1:**
1. **MENU Pricing** - Start here (foundation)
   - Build pricing table
   - Implement price editor
   - Add food cost % badges
   - Test recalculate function
   
2. **MENU Item Detail** - Individual item analysis
   - Build pricing card
   - Implement scenarios calculator
   - Add price history chart
   - Test with various items

**Week 2:**
3. **MENU Analysis Dashboard** - Overview metrics
   - Build metric cards
   - Implement category breakdown
   - Add top performers
   - Flag attention items
   - Test with/without sales data

4. **MENU Engineering** - Most complex, do last
   - Build 2x2 matrix visualization
   - Implement quadrant logic
   - Add recommendations
   - Handle missing sales data gracefully

**Week 3:**
5. **Polish, Integration & Testing**
   - Test all 4 pages thoroughly
   - Verify calculations across modules
   - Test price changes → recipe updates
   - Test inventory price changes → menu updates
   - Write comprehensive tests
   - Document sales data requirement
   - Prepare for demo

---

## 🚨 IMPORTANT NOTES

### Sales Data Requirement:
**Critical**: Many features work better with sales data:
- Menu engineering (popularity metric)
- Top performers (sales × margin)
- Weighted averages
- Performance trends

**For Phase 4:**
- Build everything to work WITHOUT sales data
- Add field `monthly_sales_count` to recipes (nullable)
- Allow manual entry if needed
- Show clear messaging: "Connect POS for full analytics"
- Plan POS integration for future phases

### Food Cost % Targets:
Industry standards (confirmed):
- 🟢 **20-32%**: Ideal range (sweet spot: 25-30%)
- 🟡 **32-40%**: Acceptable but high
- 🔴 **>40%**: Losing money
- 🟡 **<20%**: Potentially underpriced (leaving money on table)

### Menu Engineering Logic:
Using **median** as threshold (not average):
- More robust to outliers
- Better for small menus (<20 items)
- Standard industry practice

### Price History:
Track all price changes:
- When changed
- Who changed it
- Old price → New price
- Reason (optional)

---

## 💬 QUESTIONS BEFORE STARTING?

**Confirm you understand:**
- [ ] Food cost % calculation and targets
- [ ] Menu engineering quadrant logic
- [ ] Sales data requirement and workarounds
- [ ] Price history tracking
- [ ] Integration with RECIPES module

**Ask if unclear about:**
- Menu engineering algorithms
- Pricing scenario calculations
- Sales data handling
- Chart implementation
- POS integration planning

---

## 🎉 FINAL PHASE!

**After Phase 4 is complete:**
- ✅ **16 pages total built!**
- ✅ **Complete restaurant management system**
- ✅ **STOCK + COUNT + RECIPES + MENU modules**
- ✅ **MVP ready for launch!**

---

## 🚀 READY TO BUILD!

**Start with:**
1. **Read Module_Architecture_Schematics.md** (Pages 4.1-4.4)
2. **Understand food cost % targets**
3. **Build MENU Pricing** (foundation)
4. **Test pricing updates thoroughly**
5. **Move to analysis features**

**Remember:**
- 📖 Reference the schematic wireframes
- 🔒 Don't break Phases 1-3
- ✅ Test calculations extensively
- 🎯 Mark progress (🔴→🟠→🟢)
- ❓ Ask before assuming
- 🎉 This is the final phase!

---

**Phase 4 Success** = Complete menu analytics + Price optimization + Menu engineering + LAUNCH READY! 🎯

Let's finish this! You're building the complete JiGR restaurant management platform! 🍽️💰🚀
