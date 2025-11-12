# 🚀 JiGR Phase 1: STOCK & COUNT Core Build

**Date**: November 11, 2025  
**Phase**: 1 of 4 (MVP Core)  
**Target**: Working STOCK inventory + COUNT stocktake system  
**Timeline**: 2-3 weeks

---

## 📋 BEFORE YOU START

### ✅ Read These First:
1. **Module_Architecture_Schematics.md** - Your complete blueprint
2. **README_START_HERE.md** - Project overview
3. **JiGR_Suite_Modular_Architecture** - System architecture
4. **workflow.md** - Development protocols

### 🔒 CRITICAL SAFETY RULES:

**DO NOT BREAK:**
- ❌ Authentication flow (`/auth` pages)
- ❌ Database schema (unless explicitly adding new tables)
- ❌ Existing API endpoints
- ❌ Side nav dropdown component (already working)
- ❌ Asset loading system (getMappedIcon, getModuleAsset)
- ❌ Supabase RLS policies (unless adding new)
- ❌ Multi-tenant isolation (client_id filtering)

**SUCCESS MEANS:**
- ✅ Everything that works now KEEPS working
- ✅ New features work as specified in schematics
- ✅ Tests pass
- ✅ iPad Air (2013) Safari 12 compatible

---

## 🎯 PHASE 1 OBJECTIVES

Build these **3 core pages** with full functionality:

### Page 1: STOCK Items List (`/stock/items/page.tsx`)
**Purpose**: Browse, search, and manage all inventory items

**Features**:
- [ ] Search bar (filters item_name, brand)
- [ ] Category filter (dropdown from inventory_categories)
- [ ] Status filter (All / Active / Inactive / Below Par / Out of Stock)
- [ ] Sort options (Name, Category, Stock Level, Last Counted)
- [ ] Stock level indicators (🟢🟡🔴 based on par levels)
- [ ] Quick actions: [📋 Count] [✏️ Edit] [⋮ Menu]
- [ ] Grid/List view toggle
- [ ] Pagination (20 items per page)
- [ ] Responsive (portrait 768px / landscape 1024px)

**Data Source**: `inventory_items` JOIN `inventory_count` (latest)

**Success Criteria**:
- Loads < 2 seconds with 100+ items
- Search responds < 300ms
- All filters work correctly
- Touch targets ≥ 44px
- Works offline (cached, not editable)

---

### Page 2: STOCK Item Detail (`/stock/items/[id]/page.tsx`)
**Purpose**: View complete item information and history

**Features**:
- [ ] Item information card (category, units, conversions, par levels, storage)
- [ ] Current stock display (with last counted date)
- [ ] [📋 Count This Item] button → /count/new?item_id=X
- [ ] Active batches table (with expiration dates)
- [ ] Vendors table (with pricing)
- [ ] Count history table (last 10 counts)
- [ ] [Edit] and [⋮] menu actions
- [ ] Responsive layout

**Data Sources**:
- `inventory_items` - Item info
- `inventory_count` - Current stock (latest)
- `inventory_batches` - Active batches
- `vendor_items` JOIN `vendor_companies` - Vendors
- `inventory_count` - History (ORDER BY count_date DESC)

**Success Criteria**:
- All data displays correctly
- Relationships load properly (batches, vendors)
- History pagination works
- [Count This Item] navigates correctly
- Mobile-friendly layout

---

### Page 3: COUNT New Count (`/count/new/page.tsx`)
**Purpose**: Primary interface for conducting stocktakes

**Features**:
- [ ] **Screen 1**: Item selection
  - Search bar (real-time filter)
  - Category tabs (quick filter)
  - Recent items (localStorage, last 5)
  - Item list with last count info
- [ ] **Screen 2**: Count form (after item selected)
  - Large number input (touch-friendly)
  - Unit selector (defaults to count_unit)
  - Location dropdown (optional)
  - Notes textarea (optional)
  - Photo upload (optional, iPad camera)
  - [Save & Next Item] button
  - [← Change Item] back button
- [ ] **Offline capability**:
  - Save to `offline_sync_queue` if no connection
  - Store photos in IndexedDB
  - Show "⚠️ Offline" banner
  - Auto-sync when online
- [ ] **Barcode scanning** (future enhancement marker)

**Data Sources**:
- `inventory_items` - Item selection
- `inventory_count` - Previous count info
- `inventory_locations` - Location dropdown
- `offline_sync_queue` - Offline storage

**Saves To**:
- `inventory_count` table (when online)
- `offline_sync_queue` (when offline)

**Success Criteria**:
- Works completely offline
- Number input easy to use with gloves
- Photos captured and stored
- Quick workflow (< 15 seconds per item)
- Auto-advances to next item
- Syncs when connection restored
- Recent items remembered

---

## 🗄️ DATABASE SCHEMA REFERENCE

### Tables You'll Use:

```sql
-- Core Tables (already exist)
inventory_items
inventory_count
inventory_batches
inventory_categories
inventory_locations
vendor_items
vendor_companies
offline_sync_queue

-- RLS Policies
All tables have client_id filtering
All queries MUST include: WHERE client_id = auth.uid()::uuid
```

### Sample Queries:

**Get Items with Latest Count:**
```sql
SELECT 
  i.*,
  c.quantity_on_hand,
  c.count_date,
  c.counted_by
FROM inventory_items i
LEFT JOIN LATERAL (
  SELECT * FROM inventory_count
  WHERE item_id = i.item_id
  AND client_id = i.client_id
  ORDER BY count_date DESC
  LIMIT 1
) c ON true
WHERE i.client_id = auth.uid()::uuid
ORDER BY i.item_name;
```

**Get Active Batches:**
```sql
SELECT * FROM inventory_batches
WHERE item_id = $1
AND client_id = auth.uid()::uuid
AND status = 'active'
AND (expiration_date IS NULL OR expiration_date >= CURRENT_DATE)
ORDER BY expiration_date ASC;
```

**Save Count:**
```sql
INSERT INTO inventory_count (
  client_id,
  item_id,
  quantity_on_hand,
  count_unit,
  location_id,
  notes,
  counted_by,
  count_date
) VALUES (
  auth.uid()::uuid,
  $1, $2, $3, $4, $5, auth.uid(), NOW()
);
```

---

## 📐 UI COMPONENT PATTERNS

### Use These Existing Patterns:

**Layout:**
```tsx
// Standard page layout
<div className="min-h-screen bg-gray-50">
  <PageHeader 
    title="Stock Items"
    actions={<Button>+ New Item</Button>}
  />
  <main className="max-w-7xl mx-auto px-4 py-6">
    {/* Content */}
  </main>
</div>
```

**Data Table:**
```tsx
<DataTable
  columns={columns}
  data={items}
  searchable
  filterable
  sortable
  pagination={{ pageSize: 20 }}
/>
```

**Stock Level Indicator:**
```tsx
<StockLevelIndicator
  current={item.quantity_on_hand}
  parLow={item.par_level_low}
  parHigh={item.par_level_high}
  unit={item.count_unit}
/>
// Returns: 🟢 Normal | 🟡 Low | 🔴 Out
```

**Search Input:**
```tsx
<SearchInput
  placeholder="Search items..."
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  debounce={300}
/>
```

---

## 🎨 DESIGN SYSTEM

### Colors (Stock Status):
```css
/* Stock Level Indicators */
.stock-normal: #10B981 (green-500)  /* Above par_level_low */
.stock-low: #F59E0B (amber-500)     /* Below par_level_low */
.stock-out: #EF4444 (red-500)       /* quantity = 0 or NULL */

/* Expiration Warnings (Batches) */
.expiring-critical: #EF4444  /* 0-1 days */
.expiring-warning: #F59E0B   /* 2-3 days */
.expiring-good: #10B981      /* 4+ days */
```

### Touch Targets:
- Minimum: 44px × 44px
- Spacing: 16px between elements
- Buttons: 48px height minimum
- Number inputs (COUNT): 64px height

### Responsive Breakpoints:
```css
/* iPad Air (2013) */
sm: 768px   /* Portrait */
md: 1024px  /* Landscape */
```

---

## 🔌 API ENDPOINTS TO CREATE

### `/api/stock/items`
- **GET**: List items (with filters, search, pagination)
- **POST**: Create new item (future)

### `/api/stock/items/[id]`
- **GET**: Single item details (with batches, vendors, history)
- **PUT**: Update item (future)
- **DELETE**: Soft delete (future)

### `/api/count/submit`
- **POST**: Submit new count
  - Validates data
  - Saves to `inventory_count`
  - Returns success/error

### `/api/count/sync`
- **POST**: Sync offline counts
  - Accepts batch of counts from `offline_sync_queue`
  - Validates each
  - Inserts valid counts
  - Returns sync results

---

## 📱 OFFLINE-FIRST REQUIREMENTS

### For COUNT Module:

**Service Worker:**
```javascript
// Cache strategy
- App shell: Cache first
- API: Network first, fallback to cache
- Images: Cache first
```

**IndexedDB Structure:**
```javascript
// Store offline counts
{
  id: uuid(),
  item_id: string,
  quantity: number,
  unit: string,
  location_id?: string,
  notes?: string,
  photos?: [blob],  // Base64 or blob
  timestamp: Date,
  synced: boolean
}
```

**Sync Logic:**
```javascript
// When online
1. Check for offline counts in IndexedDB
2. POST to /api/count/sync
3. Mark as synced
4. Show success notification
5. Remove from IndexedDB
```

---

## ✅ TESTING REQUIREMENTS

### Unit Tests (Jest):
- [ ] Component rendering
- [ ] Data fetching
- [ ] Filter/search logic
- [ ] Form validation
- [ ] Offline queue management

### Integration Tests:
- [ ] API endpoints
- [ ] Database queries
- [ ] RLS policies
- [ ] Offline sync flow

### Manual Testing Checklist:
- [ ] Works in Safari 12 (iPad Air 2013)
- [ ] Portrait mode (768px)
- [ ] Landscape mode (1024px)
- [ ] Offline mode
- [ ] Touch interactions (44px+ targets)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

---

## 🚦 TRAFFIC LIGHT PROGRESS

### Mark Component Status:

```
🔴 RED: Not started
🟠 ORANGE: In progress
🟢 GREEN: Complete & tested
```

**Phase 1 Components:**
```
🔴 /stock/items/page.tsx
🔴 /stock/items/[id]/page.tsx
🔴 /count/new/page.tsx
🔴 <DataTable> component
🔴 <StockLevelIndicator> component
🔴 <SearchInput> component
🔴 <NumberInput> component (COUNT)
🔴 Offline sync service
🔴 API: GET /api/stock/items
🔴 API: GET /api/stock/items/[id]
🔴 API: POST /api/count/submit
🔴 API: POST /api/count/sync
```

**Update this list as you work!**

---

## 🎯 DEFINITION OF DONE

A page is **DONE** when:

**Functional:**
- [ ] All features from schematic work
- [ ] Data loads correctly from database
- [ ] Forms validate properly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success messages show

**UX:**
- [ ] Works in portrait (768px)
- [ ] Works in landscape (1024px)
- [ ] Touch targets ≥ 44px
- [ ] Loading states visible
- [ ] Empty states handled
- [ ] Navigation flows work

**Technical:**
- [ ] TypeScript types correct
- [ ] Supabase queries optimized
- [ ] RLS policies respected
- [ ] No console errors
- [ ] Accessible (ARIA labels)

**Performance:**
- [ ] Page loads < 2 seconds
- [ ] Search responds < 300ms
- [ ] Tables paginate at 50+ rows
- [ ] No jank on iPad Air (2013)

**Offline (COUNT only):**
- [ ] Works with no WiFi
- [ ] Saves to IndexedDB
- [ ] Syncs when online
- [ ] Shows sync status

---

## 📝 DEVELOPMENT WORKFLOW

### Step-by-Step Process:

1. **Plan**:
   - Read schematic for the page
   - Identify components needed
   - Map database queries
   - Note potential issues

2. **Scaffold**:
   - Create page file
   - Set up basic layout
   - Add placeholder components
   - Test routing

3. **Build**:
   - Implement one feature at a time
   - Test after each feature
   - Mark progress (🔴→🟠→🟢)
   - Commit frequently

4. **Integrate**:
   - Connect to Supabase
   - Test RLS policies
   - Handle loading/error states
   - Add offline support (if COUNT)

5. **Polish**:
   - Responsive testing (768px, 1024px)
   - Touch target validation
   - Loading states
   - Empty states
   - Error messages

6. **Review**:
   - Check against "Definition of Done"
   - Run unit tests
   - Manual testing on iPad specs
   - Code review

---

## 🎨 CODE STYLE CONVENTIONS

### Naming:
- **Files**: PascalCase for components, kebab-case for pages
- **Components**: PascalCase (`StockItemsList.tsx`)
- **Functions**: camelCase (`getInventoryItems()`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_ITEMS_PER_PAGE`)
- **Types**: PascalCase with 'I' prefix (`IInventoryItem`)

### Supabase Queries:
```typescript
// Always include client_id filter
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('client_id', userId)
  .order('item_name');

// Check for errors
if (error) {
  console.error('Failed to fetch items:', error);
  throw error;
}
```

### Error Handling:
```typescript
try {
  const data = await fetchInventoryItems();
  return data;
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed to load items. Please try again.');
  return [];
}
```

---

## 🚨 COMMON PITFALLS TO AVOID

### ❌ DON'T:
1. **Break multi-tenancy** - Always filter by client_id
2. **Skip error handling** - Always catch errors
3. **Ignore loading states** - Always show loading UI
4. **Forget offline** (COUNT) - Must work without WiFi
5. **Overcomplicate** - Simple, clean code
6. **Skip tests** - Write tests as you build
7. **Ignore iPad specs** - Test on 768px/1024px
8. **Touch targets < 44px** - Make buttons big enough

### ✅ DO:
1. **Test incrementally** - After each feature
2. **Commit frequently** - Small, atomic commits
3. **Read the schematic** - It has the answers
4. **Ask questions** - Before making assumptions
5. **Use existing patterns** - Don't reinvent wheels
6. **Mark progress** - Update traffic light status
7. **Test offline** (COUNT) - Disconnect WiFi and test
8. **Validate forms** - User-friendly error messages

---

## 🔍 QUESTIONS TO ASK BEFORE STARTING

Before you write code, confirm:

1. **Architecture**:
   - Does this fit the existing structure?
   - Are there existing components I can reuse?
   - Will this work with the current database schema?

2. **Dependencies**:
   - What needs to be built first?
   - Are there any blockers?
   - Do I need new database tables/functions?

3. **Edge Cases**:
   - What if there's no data (empty state)?
   - What if the API fails (error state)?
   - What if the user is offline (offline state)?
   - What if data is malformed (validation)?

4. **Testing**:
   - How will I test this?
   - What are the success criteria?
   - Can I test offline behavior?

---

## 📦 DELIVERABLES

### At End of Phase 1:

**Pages:**
- ✅ `/stock/items/page.tsx` - Fully functional
- ✅ `/stock/items/[id]/page.tsx` - Fully functional
- ✅ `/count/new/page.tsx` - Fully functional (offline-capable)

**Components:**
- ✅ `<DataTable>` - Reusable data table
- ✅ `<StockLevelIndicator>` - Status badges
- ✅ `<SearchInput>` - Debounced search
- ✅ `<NumberInput>` - Large touch-friendly input

**API Endpoints:**
- ✅ GET `/api/stock/items`
- ✅ GET `/api/stock/items/[id]`
- ✅ POST `/api/count/submit`
- ✅ POST `/api/count/sync`

**Infrastructure:**
- ✅ Offline sync service (Service Worker + IndexedDB)
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests (API + DB)
- ✅ Documentation updates

**Demo:**
- ✅ Video showing: Browse items → View detail → Count item (online & offline) → Sync

---

## 🎬 READY TO START?

### Your First Task:
**Build `/stock/items/page.tsx`** (STOCK Items List)

**Checklist:**
1. [ ] Read the schematic (Page 1.2)
2. [ ] Identify reusable components
3. [ ] Plan database queries
4. [ ] Scaffold page structure
5. [ ] Implement search/filter
6. [ ] Add data table
7. [ ] Test responsiveness
8. [ ] Mark 🟢 GREEN when done

---

## 💬 QUESTIONS?

**Before you start coding, ask:**
- Anything unclear in the schematic?
- Need clarification on existing patterns?
- Unsure about database queries?
- Questions about offline functionality?

**Steve is available for:**
- Architecture decisions
- Business logic validation
- UX/UI feedback
- Database schema questions

---

## 🚀 LET'S BUILD!

**Remember:**
- 📖 Read the schematic first
- 🔒 Don't break existing features
- ✅ Test after each feature
- 🎯 Mark progress regularly
- ❓ Ask before assuming

**Success = Working STOCK + COUNT system that:**
- ✅ Looks professional
- ✅ Works offline
- ✅ Feels fast
- ✅ Is easy to use (even with gloves!)

---

**Ready? Let's start with `/stock/items/page.tsx`!** 🎯
