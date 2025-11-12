# 🚀 JiGR Phase 2: Complete STOCK & COUNT Modules

**Date**: November 11, 2025  
**Phase**: 2 of 4  
**Previous Phase**: ✅ STOCK Items + COUNT Entry (COMPLETE)  
**Target**: Complete STOCK Dashboard, Batches, Vendors + COUNT History/Variance  
**Timeline**: 2-3 weeks

---

## ✅ PHASE 1 RECAP - WHAT'S DONE

**Completed Pages:**
- ✅ `/stock/items/page.tsx` - Items list with search/filter
- ✅ `/stock/items/[id]/page.tsx` - Item detail with history
- ✅ `/count/new/page.tsx` - Offline-capable stocktake interface

**Completed Components:**
- ✅ `<DataTable>` - Reusable data table
- ✅ `<StockLevelIndicator>` - Status badges
- ✅ `<SearchInput>` - Debounced search
- ✅ `<NumberInput>` - Large touch-friendly input

**Completed APIs:**
- ✅ GET `/api/stock/items`
- ✅ GET `/api/stock/items/[id]`
- ✅ POST `/api/count/submit`
- ✅ POST `/api/count/sync`

**Status**: 🟢 Foundation is solid. Ready to build on top!

---

## 🎯 PHASE 2 OBJECTIVES

Build these **5 pages** to complete STOCK and COUNT modules:

### 1. STOCK Dashboard (`/stock/page.tsx`)
### 2. STOCK Batches (`/stock/batches/page.tsx`)
### 3. STOCK Vendors (`/stock/vendors/page.tsx`)
### 4. COUNT History (`/count/history/page.tsx`)
### 5. COUNT Variance (`/count/variance/page.tsx`)

---

## 📦 PAGE 1: STOCK Dashboard

**Route**: `/stock/page.tsx`  
**Purpose**: Overview of inventory health with quick actions  
**Reference**: Module_Architecture_Schematics.md → Page 1.1

### Features:

**Metric Cards (Top Row):**
- [ ] **Total Value**: Sum of (quantity × unit_cost) across all items
  - Query: Latest `inventory_count` × `inventory_items.unit_cost`
  - Format: Currency with commas ($12,450)
- [ ] **Items Below Par**: Count where current stock < par_level_low
  - Query: `inventory_count` JOIN `inventory_items`
  - Filter: `quantity_on_hand < par_level_low`
- [ ] **Expiring Soon**: Count batches expiring in next 3 days
  - Query: `inventory_batches` WHERE `expiration_date <= CURRENT_DATE + 3`
  - Include only active batches

**Quick Actions Row:**
- [ ] **[📋 START COUNT]** → `/count/new`
- [ ] **[📸 SCAN BARCODE]** → `/stock/items?scan=true` (future: barcode scanner)
- [ ] **[📦 RECEIVE]** → `/stock/batches/new` (future: receive delivery)

**Items Below Par Table:**
- [ ] Show items where current stock < par_level_low
- [ ] Columns: Item, Current, Par Low, Action
- [ ] **[Order]** button → Adds to draft order guide (future)
- [ ] Limit to 10 items, link to full list

**Expiring Soon Table:**
- [ ] Show batches expiring in next 3 days
- [ ] Columns: Item, Batch #, Expires, Qty, Action
- [ ] **[Use Now]** → Records usage (future)
- [ ] **[Waste]** → `/stock/waste/new?batch_id=X` (future)
- [ ] Color coding: Today=🔴, Tomorrow=🟠, 2-3 days=🟡

### Data Sources:

**Total Value:**
```sql
SELECT SUM(
  ic.quantity_on_hand * ii.unit_cost
) as total_value
FROM inventory_items ii
JOIN LATERAL (
  SELECT quantity_on_hand
  FROM inventory_count
  WHERE item_id = ii.item_id
  AND client_id = ii.client_id
  ORDER BY count_date DESC
  LIMIT 1
) ic ON true
WHERE ii.client_id = auth.uid()::uuid;
```

**Items Below Par:**
```sql
SELECT 
  ii.item_name,
  ic.quantity_on_hand,
  ii.par_level_low,
  ii.count_unit
FROM inventory_items ii
JOIN LATERAL (
  SELECT quantity_on_hand
  FROM inventory_count
  WHERE item_id = ii.item_id
  ORDER BY count_date DESC
  LIMIT 1
) ic ON true
WHERE ii.client_id = auth.uid()::uuid
AND ic.quantity_on_hand < ii.par_level_low
LIMIT 10;
```

**Expiring Soon:**
```sql
SELECT 
  ib.*,
  ii.item_name
FROM inventory_batches ib
JOIN inventory_items ii ON ib.item_id = ii.item_id
WHERE ib.client_id = auth.uid()::uuid
AND ib.status = 'active'
AND ib.expiration_date IS NOT NULL
AND ib.expiration_date <= CURRENT_DATE + 3
ORDER BY ib.expiration_date ASC;
```

### Success Criteria:
- [ ] All metrics calculate correctly
- [ ] Tables load and display data
- [ ] Quick actions navigate correctly
- [ ] Responsive (portrait/landscape)
- [ ] Loads < 2 seconds
- [ ] Empty states handled gracefully

---

## 📦 PAGE 2: STOCK Batches

**Route**: `/stock/batches/page.tsx`  
**Purpose**: Manage batch/lot tracking and expiration dates  
**Reference**: Module_Architecture_Schematics.md → Page 1.4

### Features:

**Tab Navigation:**
- [ ] **[All]** - All batches
- [ ] **[Expiring Soon]** - Next 7 days
- [ ] **[Expired]** - Past expiration date
- [ ] **[Active]** - Not expired, status='active'

**Critical Section (Red Alert):**
- [ ] Show batches expiring TODAY
- [ ] 🔴 Red background, prominent display
- [ ] Actions: [Use] [Waste]

**Warning Section (Orange Alert):**
- [ ] Show batches expiring in 2-3 days
- [ ] 🟠 Orange background
- [ ] Actions: [Use]

**Good Section (Green):**
- [ ] Show batches expiring in 4-7 days
- [ ] 🟢 Green/neutral display
- [ ] Actions: [View]
- [ ] Collapsible, show count with expand button

**Batch Table Columns:**
- [ ] Item name
- [ ] Batch # (unique identifier)
- [ ] Expiration date (formatted, relative)
- [ ] Quantity remaining
- [ ] Actions

**Auto-refresh:**
- [ ] Update every 5 minutes when page is active
- [ ] Show "Last updated: X minutes ago"

### Data Sources:

**Expiring Batches (use existing function):**
```sql
-- Use Supabase function
SELECT * FROM get_expiring_batches(
  auth.uid()::uuid,  -- client_id
  7                   -- days_ahead
);
```

**All Batches:**
```sql
SELECT 
  ib.*,
  ii.item_name,
  ii.count_unit,
  CASE
    WHEN ib.expiration_date < CURRENT_DATE THEN 'expired'
    WHEN ib.expiration_date = CURRENT_DATE THEN 'critical'
    WHEN ib.expiration_date <= CURRENT_DATE + 3 THEN 'warning'
    ELSE 'good'
  END as urgency_level
FROM inventory_batches ib
JOIN inventory_items ii ON ib.item_id = ii.item_id
WHERE ib.client_id = auth.uid()::uuid
AND ib.status = 'active'
ORDER BY ib.expiration_date ASC NULLS LAST;
```

### UI Components Needed:
- [ ] `<ExpirationBadge>` - Shows days until expiration with color
- [ ] `<BatchTable>` - Specialized table with urgency colors
- [ ] `<UrgencySection>` - Collapsible section for each urgency level

### Success Criteria:
- [ ] Color coding matches urgency
- [ ] Tabs filter correctly
- [ ] Auto-refresh works
- [ ] Touch targets ≥ 44px
- [ ] Empty states per tab
- [ ] Batch clicks → detail view (future)

---

## 📦 PAGE 3: STOCK Vendors

**Route**: `/stock/vendors/page.tsx`  
**Purpose**: Manage supplier relationships and pricing  
**Reference**: Module_Architecture_Schematics.md → Page 1.5

### Features:

**Search & Filters:**
- [ ] Search bar (filter by vendor_name, contact_name)
- [ ] Type filter (by category: All, Produce, Meat, Seafood, etc.)
- [ ] Status filter (Active / Inactive)

**Vendor List/Cards:**
- [ ] Vendor name (primary)
- [ ] Category tags (Produce, Dairy, etc.)
- [ ] Contact info (phone, email) - truncated
- [ ] Item count (number of items supplied)
- [ ] Last delivery date (most recent batch)
- [ ] **[View]** button → `/stock/vendors/[id]` (detail page)
- [ ] **[⋮]** menu → Edit, Create Order, View Orders, Deactivate

**In-House Production Section:**
- [ ] Special "vendor" for produced items (sub-recipes)
- [ ] Show count of sub-recipes
- [ ] Link to production module
- [ ] Separate visual treatment

**[+ New Vendor] Button:**
- [ ] Opens `/stock/vendors/new` (future)

### Data Sources:

**Vendor List:**
```sql
SELECT 
  vc.*,
  COUNT(DISTINCT vi.item_id) as item_count,
  MAX(ib.received_date) as last_delivery_date
FROM vendor_companies vc
LEFT JOIN vendor_items vi ON vc.vendor_id = vi.vendor_id
LEFT JOIN inventory_batches ib ON vi.item_id = ib.item_id AND ib.vendor_id = vc.vendor_id
WHERE vc.client_id = auth.uid()::uuid
GROUP BY vc.vendor_id
ORDER BY vc.vendor_name;
```

**Vendor Categories (for Type filter):**
```sql
SELECT DISTINCT 
  unnest(string_to_array(vendor_categories, ',')) as category
FROM vendor_companies
WHERE client_id = auth.uid()::uuid
ORDER BY category;
```

### UI Components Needed:
- [ ] `<VendorCard>` - Vendor display card
- [ ] `<ContactInfo>` - Formatted phone/email
- [ ] `<CategoryTags>` - Multiple category badges

### Success Criteria:
- [ ] Search filters name/contact
- [ ] Type filter works
- [ ] Item count accurate
- [ ] Last delivery displays correctly
- [ ] In-House section separate
- [ ] Responsive layout
- [ ] Empty state handled

---

## 📋 PAGE 4: COUNT History

**Route**: `/count/history/page.tsx`  
**Purpose**: View past counts and stocktake sessions  
**Reference**: Module_Architecture_Schematics.md → Page 3.2

### Features:

**Filters:**
- [ ] Date range selector (Last 7/30/90 days, Custom)
- [ ] Item filter (dropdown, all items)
- [ ] User filter (who counted)

**Stocktake Sessions Section:**
- [ ] Group counts by date (assumes same-day counts = session)
- [ ] Show: Date, Items counted, User, Total value
- [ ] **[View]** → `/count/sessions/[date]` (detail view, future)
- [ ] Calculate total value from count × unit_cost

**Individual Counts Section:**
- [ ] Show last 20 individual counts
- [ ] Columns: Date/time, Item, Quantity, User
- [ ] Pagination or infinite scroll
- [ ] Click row → Item detail

**Actions:**
- [ ] **[Export]** → Download CSV of count data
- [ ] **[📊 Stats]** → `/count/variance` (variance analysis)

### Data Sources:

**Stocktake Sessions:**
```sql
SELECT 
  DATE(count_date) as session_date,
  COUNT(DISTINCT item_id) as items_counted,
  counted_by,
  SUM(quantity_on_hand * ii.unit_cost) as total_value
FROM inventory_count ic
JOIN inventory_items ii ON ic.item_id = ii.item_id
WHERE ic.client_id = auth.uid()::uuid
AND count_date >= $1  -- date_range_start
AND count_date <= $2  -- date_range_end
GROUP BY DATE(count_date), counted_by
ORDER BY session_date DESC;
```

**Individual Counts:**
```sql
SELECT 
  ic.*,
  ii.item_name,
  u.full_name as counter_name
FROM inventory_count ic
JOIN inventory_items ii ON ic.item_id = ii.item_id
LEFT JOIN profiles u ON ic.counted_by = u.id
WHERE ic.client_id = auth.uid()::uuid
ORDER BY ic.count_date DESC
LIMIT 20
OFFSET $1;  -- for pagination
```

### UI Components Needed:
- [ ] `<DateRangePicker>` - Date range selection
- [ ] `<SessionCard>` - Stocktake session summary
- [ ] `<CountTable>` - Individual counts table

### Success Criteria:
- [ ] Filters work correctly
- [ ] Sessions group by date
- [ ] Total value calculates correctly
- [ ] Export generates CSV
- [ ] Pagination works
- [ ] Empty states handled

---

## 📋 PAGE 5: COUNT Variance

**Route**: `/count/variance/page.tsx`  
**Purpose**: Compare theoretical vs actual inventory  
**Reference**: Module_Architecture_Schematics.md → Page 3.3

### Features:

**Summary Metrics:**
- [ ] **Variance $**: Total dollar difference (Actual - Expected)
- [ ] **Variance %**: Percentage difference
- [ ] **Items with Variance**: Count of items with >10% variance
- [ ] Color coding: Green (±5%), Yellow (5-10%), Red (>10%)

**Significant Variance Table:**
- [ ] Show items with >10% variance
- [ ] Columns: Item, Expected, Actual, Variance (qty & %)
- [ ] Sort by variance % (descending)
- [ ] Color code rows by severity

**Variance by Category:**
- [ ] Roll up variance by inventory category
- [ ] Columns: Category, Expected $, Actual $, Variance ($ & %)
- [ ] Bar chart visualization (optional)

**Date Range Filter:**
- [ ] Select period for analysis (Last 7/30/90 days)
- [ ] Defaults to last 30 days

### Data Sources:

**Note**: This feature requires either:
- Sales/usage data from POS
- Manual estimated usage
- Recipe production tracking

**Simplified Variance (without sales data):**
```sql
-- Compare last count to previous count
WITH current_count AS (
  SELECT 
    item_id,
    quantity_on_hand as actual_qty,
    count_date as current_date,
    ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY count_date DESC) as rn
  FROM inventory_count
  WHERE client_id = auth.uid()::uuid
),
previous_count AS (
  SELECT 
    item_id,
    quantity_on_hand as expected_qty,
    count_date as previous_date,
    ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY count_date DESC) as rn
  FROM inventory_count
  WHERE client_id = auth.uid()::uuid
)
SELECT 
  ii.item_name,
  pc.expected_qty,
  cc.actual_qty,
  (cc.actual_qty - pc.expected_qty) as variance_qty,
  CASE 
    WHEN pc.expected_qty = 0 THEN 0
    ELSE ((cc.actual_qty - pc.expected_qty) / pc.expected_qty * 100)
  END as variance_pct
FROM current_count cc
JOIN previous_count pc ON cc.item_id = pc.item_id AND pc.rn = 2
JOIN inventory_items ii ON cc.item_id = ii.item_id
WHERE cc.rn = 1
AND ABS((cc.actual_qty - pc.expected_qty) / NULLIF(pc.expected_qty, 0)) > 0.10
ORDER BY ABS(variance_pct) DESC;
```

### Important Note:
**Variance analysis is an "advanced" feature.** For Phase 2:
- [ ] Build the page structure
- [ ] Show simplified variance (last count vs previous count)
- [ ] Add placeholder for "Expected with usage" calculation
- [ ] Document that full variance requires sales/production data
- [ ] Plan for Phase 4 (Recipe integration) enhancement

### Success Criteria:
- [ ] Variance calculates between counts
- [ ] Color coding matches thresholds
- [ ] Category rollup works
- [ ] Date range filter works
- [ ] Empty state explains requirements
- [ ] Placeholder for future POS integration

---

## 🗄️ DATABASE REMINDER

**All tables exist!** You should only:
- ✅ Query existing tables
- ✅ Insert/update data
- ❌ NOT create new tables (unless absolutely necessary)

**Existing Tables You'll Use:**
```
✅ inventory_items
✅ inventory_count
✅ inventory_batches
✅ inventory_categories
✅ inventory_locations
✅ vendor_companies
✅ vendor_items
✅ profiles (for user names)
✅ clients (for multi-tenant)
```

**Existing Functions:**
```
✅ get_expiring_batches(client_id, days)
✅ calculate_recipe_cost(recipe_id)
✅ get_latest_inventory_count(item_id)
```

---

## 🔌 API ENDPOINTS TO CREATE

### `/api/stock/dashboard`
- **GET**: Dashboard metrics and data
  - total_value
  - items_below_par
  - expiring_soon
  - Returns structured data for cards

### `/api/stock/batches`
- **GET**: List batches (with filters: status, expiration)
- **POST**: Create new batch (future)

### `/api/stock/batches/expiring`
- **GET**: Expiring batches (uses `get_expiring_batches` function)
- Params: days (default 7)

### `/api/stock/vendors`
- **GET**: List vendors (with filters, search)
- **POST**: Create vendor (future)

### `/api/stock/vendors/[id]`
- **GET**: Single vendor detail (future)
- **PUT**: Update vendor (future)

### `/api/count/history`
- **GET**: Count history (sessions and individual)
- Params: date_range, item_id, user_id

### `/api/count/sessions/[date]`
- **GET**: Detailed session view (future)

### `/api/count/variance`
- **GET**: Variance analysis data
- Params: date_range

### `/api/export/counts`
- **GET**: Export count data as CSV

---

## 🎨 UI COMPONENTS TO CREATE

### New Components:

**Dashboard:**
- [ ] `<MetricCard>` - Summary stat card
- [ ] `<QuickActionButton>` - Large action buttons
- [ ] `<AlertTable>` - Table with urgency colors

**Batches:**
- [ ] `<ExpirationBadge>` - Days until expiration with color
- [ ] `<BatchTable>` - Table with color-coded rows
- [ ] `<UrgencySection>` - Collapsible urgent/warning sections

**Vendors:**
- [ ] `<VendorCard>` - Vendor display card
- [ ] `<ContactInfo>` - Formatted contact display
- [ ] `<CategoryTag>` - Category badge

**History:**
- [ ] `<DateRangePicker>` - Date range selector
- [ ] `<SessionCard>` - Session summary card
- [ ] `<ExportButton>` - CSV export

**Variance:**
- [ ] `<VarianceMetric>` - Variance stat with color
- [ ] `<VarianceTable>` - Table with +/- indicators
- [ ] `<CategoryBreakdown>` - Category analysis

### Reuse from Phase 1:
- ✅ `<DataTable>`
- ✅ `<SearchInput>`
- ✅ `<PageHeader>`
- ✅ `<EmptyState>`
- ✅ `<LoadingSpinner>`

---

## ✅ TESTING REQUIREMENTS

### Unit Tests:
- [ ] Dashboard metric calculations
- [ ] Batch expiration logic
- [ ] Vendor search/filter
- [ ] Variance calculations
- [ ] CSV export functionality

### Integration Tests:
- [ ] API endpoints
- [ ] Database queries
- [ ] RLS policies
- [ ] Date range filtering

### Manual Testing:
- [ ] Dashboard loads in <2 seconds
- [ ] All tables paginate correctly
- [ ] Filters work in combination
- [ ] Responsive (768px, 1024px)
- [ ] Touch targets ≥ 44px
- [ ] Empty states display correctly
- [ ] Color coding matches specs

---

## 🚦 TRAFFIC LIGHT PROGRESS

Mark each component as you complete it:

**Pages:**
```
🔴 /stock/page.tsx (Dashboard)
🔴 /stock/batches/page.tsx
🔴 /stock/vendors/page.tsx
🔴 /count/history/page.tsx
🔴 /count/variance/page.tsx
```

**Components:**
```
🔴 <MetricCard>
🔴 <QuickActionButton>
🔴 <ExpirationBadge>
🔴 <BatchTable>
🔴 <UrgencySection>
🔴 <VendorCard>
🔴 <ContactInfo>
🔴 <CategoryTag>
🔴 <DateRangePicker>
🔴 <SessionCard>
🔴 <VarianceMetric>
```

**APIs:**
```
🔴 GET /api/stock/dashboard
🔴 GET /api/stock/batches
🔴 GET /api/stock/batches/expiring
🔴 GET /api/stock/vendors
🔴 GET /api/count/history
🔴 GET /api/count/variance
🔴 GET /api/export/counts
```

**Update this list as you work!**

---

## 🎯 DEFINITION OF DONE

A page is **DONE** when:

**Functional:**
- [ ] All features from schematic work
- [ ] Data loads correctly
- [ ] Filters/search work
- [ ] Actions navigate correctly
- [ ] Error handling works
- [ ] Empty states handled

**UX:**
- [ ] Portrait (768px) works
- [ ] Landscape (1024px) works
- [ ] Touch targets ≥ 44px
- [ ] Loading states visible
- [ ] Color coding correct
- [ ] Tables sortable/filterable

**Technical:**
- [ ] TypeScript types correct
- [ ] Supabase queries optimized
- [ ] RLS policies respected
- [ ] No console errors
- [ ] Accessible (ARIA)

**Performance:**
- [ ] Page loads < 2 seconds
- [ ] Tables paginate at 50+ rows
- [ ] No jank on iPad Air (2013)

---

## 📝 DEVELOPMENT WORKFLOW

### Build Order (Recommended):

**Week 1:**
1. **STOCK Dashboard** - Start here (foundational)
   - Build metric cards
   - Implement quick actions
   - Add alert tables
2. **STOCK Batches** - Related to dashboard
   - Build urgency sections
   - Implement color coding
   - Add batch table

**Week 2:**
3. **STOCK Vendors** - Standalone, simpler
   - Build vendor cards
   - Implement search/filter
   - Add contact display
4. **COUNT History** - Extends COUNT module
   - Build session grouping
   - Implement filters
   - Add export

**Week 3:**
5. **COUNT Variance** - Most complex, do last
   - Build simplified variance
   - Add category breakdown
   - Document future enhancements
6. **Polish & Testing**
   - Fix bugs
   - Optimize performance
   - Write tests

### After Each Page:
- [ ] Test all features
- [ ] Check responsive design
- [ ] Update traffic light status
- [ ] Commit with clear message
- [ ] Document any issues

---

## 🚨 IMPORTANT NOTES

### Variance Analysis Caveat:
The variance page is **partially functional** without sales data:
- ✅ CAN: Compare current count to previous count
- ❌ CAN'T: Calculate theoretical inventory with usage
- 📋 TODO: Full variance requires POS integration (Phase 4+)

**For Phase 2:**
Build the page with simplified variance (count-to-count). Add clear messaging that full variance analysis will come with recipe production tracking.

### Batch Management:
You're building the **viewing/monitoring** interface now. Batch **creation** (receiving deliveries) comes in Phase 3 with full receiving workflow.

### Vendor Detail Pages:
You're building the **list view** now. Individual vendor detail pages (with item pricing, order history) come in Phase 3.

---

## 💬 QUESTIONS BEFORE STARTING?

**Confirm you understand:**
- [ ] Build order and priorities
- [ ] Which features are "future" vs "now"
- [ ] Simplified variance vs full variance
- [ ] Database queries and RLS
- [ ] Responsive requirements

**Ask if unclear about:**
- Feature specifications
- Data calculations
- Component requirements
- API structure
- Testing approach

---

## 🚀 READY TO BUILD!

**Start with:**
1. **Read Module_Architecture_Schematics.md** (Pages 1.1, 1.4, 1.5, 3.2, 3.3)
2. **Plan components** (what can be reused vs new)
3. **Build STOCK Dashboard** (foundational, sets patterns)
4. **Test thoroughly**
5. **Move to next page**

**Remember:**
- 📖 Reference the schematic wireframes
- 🔒 Don't break Phase 1 work
- ✅ Test after each feature
- 🎯 Mark progress (🔴→🟠→🟢)
- ❓ Ask before assuming

---

**Phase 2 Success** = Complete STOCK module + Complete COUNT module + Ready for RECIPES! 🎯

Let's finish these modules! 🚀
