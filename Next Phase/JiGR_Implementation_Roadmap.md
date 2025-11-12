# JiGR Inventory & Recipe Management - Implementation Roadmap

**Project**: JiGR Bolt-On Modules (Inventory Management + Recipe Costing)  
**Timeline**: 12-16 Weeks (Phased Rollout)  
**Target**: Small NZ Hospitality Businesses  
**Platform**: iPad Air (2013), Safari 12 Compatible

---

## 🎯 Project Overview

Transform EZchef Excel functionality into modern, mobile-first web applications using the JiGR modular architecture.

### Success Criteria:
✅ **Functional Parity**: Match EZchef core capabilities  
✅ **User Experience**: Dramatically simpler than Excel  
✅ **Performance**: Fast on iPad Air (2013) hardware  
✅ **Integration**: Seamless with existing JiGR Compliance module  
✅ **Scalability**: Multi-tenant SaaS architecture  

---

## 📅 PHASE-BY-PHASE IMPLEMENTATION

### ⏱️ Timeline Overview

```
Phase 1: Foundation & Core Inventory     [Weeks 1-3]
Phase 2: Vendor Management              [Weeks 4-5]
Phase 3: Inventory Counting             [Week 6]
Phase 4: Recipe Management              [Weeks 7-9]
Phase 5: Sub-Recipes & Costing          [Weeks 10-11]
Phase 6: Menu Engineering & Reports     [Weeks 12-13]
Phase 7: Order Guides & Integration     [Week 14]
Phase 8: Testing & Polish               [Weeks 15-16]
```

---

## 🔧 PHASE 1: FOUNDATION & CORE INVENTORY (Weeks 1-3)

### Week 1: Database Foundation

#### Day 1-2: Database Schema Creation
**Tasks**:
- [ ] Create migration files for core inventory tables
- [ ] Set up `InventoryCategories` table with RLS
- [ ] Set up `InventoryItems` table with RLS
- [ ] Set up `InventoryLocations` table with RLS
- [ ] Populate default categories (Produce, Dairy, Meat, etc.)
- [ ] Populate default locations (Walk-in, Freezer, Dry Storage, etc.)

**Files to Create**:
```bash
migrations/
├── 001_create_inventory_categories.sql
├── 002_create_inventory_items.sql
├── 003_create_inventory_locations.sql
└── 004_insert_default_data.sql
```

**Deliverable**: Working database with RLS policies

---

#### Day 3-5: Inventory API Endpoints
**Tasks**:
- [ ] Create API routes for inventory categories (CRUD)
- [ ] Create API routes for inventory items (CRUD)
- [ ] Create API routes for inventory locations (CRUD)
- [ ] Implement search/filter for inventory items
- [ ] Add pagination for large item lists

**Files to Create**:
```bash
/app/api/inventory/
├── categories/
│   └── route.ts
├── items/
│   └── route.ts
├── items/[id]/
│   └── route.ts
├── locations/
│   └── route.ts
└── search/
    └── route.ts
```

**Deliverable**: Complete inventory management API

---

### Week 2: Inventory UI Components

#### Day 1-3: Core UI Components
**Tasks**:
- [ ] Create `InventoryCategoryList` component
- [ ] Create `InventoryItemForm` component (add/edit)
- [ ] Create `InventoryItemCard` component (display)
- [ ] Create `InventoryItemSearch` component
- [ ] Create `LocationSelector` component

**Component Specifications**:
```typescript
// InventoryItemForm.tsx
interface InventoryItemFormProps {
  item?: InventoryItem;
  categories: InventoryCategory[];
  onSave: (item: InventoryItem) => Promise<void>;
  onCancel: () => void;
}

// Key fields:
// - Item Name (required)
// - Category (dropdown)
// - Brand
// - Recipe Unit (dropdown)
// - Yield (decimal, default 1.0)
// - Storage Location (dropdown)
// - Par Levels (low/high)
```

**iPad Air Compatibility**:
- Touch-friendly 44px minimum buttons
- Simple dropdowns (no fancy selects)
- Clear visual feedback
- Progressive loading for large lists

**Deliverable**: Functional inventory item management UI

---

#### Day 4-5: Inventory Dashboard
**Tasks**:
- [ ] Create inventory dashboard page
- [ ] Implement category filtering
- [ ] Add item count badges per category
- [ ] Build "Quick Add" floating button
- [ ] Create bulk actions (activate/deactivate)

**Page Structure**:
```
/app/inventory/
├── page.tsx              # Dashboard
├── items/
│   ├── page.tsx         # Item list
│   ├── new/
│   │   └── page.tsx     # Add new item
│   └── [id]/
│       └── page.tsx     # Edit item
└── components/
    └── [UI components]
```

**Deliverable**: Complete inventory management interface

---

### Week 3: Testing & Refinement

#### Day 1-2: Unit Testing
**Tasks**:
- [ ] Write tests for inventory API routes
- [ ] Test RLS policies with different user roles
- [ ] Test pagination and search functionality
- [ ] Validate data constraints (uniqueness, required fields)

#### Day 3-4: User Acceptance Testing
**Tasks**:
- [ ] Load test with 1,000+ inventory items
- [ ] Test on actual iPad Air (2013)
- [ ] Measure page load times (target: <2 seconds)
- [ ] Test with slow 3G connection
- [ ] Gather feedback from test users

#### Day 5: Documentation & Polish
**Tasks**:
- [ ] Write API documentation
- [ ] Create user guide for inventory management
- [ ] Record demo video
- [ ] Fix any bugs identified in testing

**Deliverable**: Production-ready core inventory module

---

## 💰 PHASE 2: VENDOR MANAGEMENT (Weeks 4-5)

### Week 4: Vendor Database & API

#### Day 1-2: Database Setup
**Tasks**:
- [ ] Create `VendorCompanies` table with RLS
- [ ] Create `VendorItems` table with RLS
- [ ] Create `ItemPriceHistory` table with RLS
- [ ] Set up foreign key relationships

**Migration Files**:
```bash
migrations/
├── 005_create_vendor_companies.sql
├── 006_create_vendor_items.sql
└── 007_create_item_price_history.sql
```

---

#### Day 3-5: Vendor API
**Tasks**:
- [ ] Create vendor CRUD endpoints
- [ ] Create vendor items CRUD endpoints
- [ ] Implement price history tracking
- [ ] Build vendor comparison query
- [ ] Add "preferred vendor" toggle

**API Routes**:
```bash
/app/api/vendors/
├── route.ts                    # List/create vendors
├── [id]/
│   └── route.ts               # Get/update/delete vendor
├── [id]/items/
│   └── route.ts               # Vendor's items
└── compare/
    └── route.ts               # Price comparison
```

**Deliverable**: Complete vendor management API

---

### Week 5: Vendor UI

#### Day 1-3: Vendor Components
**Tasks**:
- [ ] Create `VendorList` component
- [ ] Create `VendorForm` component
- [ ] Create `VendorItemPricing` component
- [ ] Create `PriceComparisonTable` component

**Key Features**:
- Link inventory items to vendors
- Track pack sizes and pricing
- Price history visualization
- Multi-vendor comparison

---

#### Day 4-5: Vendor Pages
**Tasks**:
- [ ] Create vendor management dashboard
- [ ] Build price comparison tool
- [ ] Implement price change alerts
- [ ] Add price history charts

**Page Structure**:
```
/app/vendors/
├── page.tsx                   # Vendor list
├── new/
│   └── page.tsx              # Add vendor
├── [id]/
│   └── page.tsx              # Vendor details
└── compare/
    └── page.tsx              # Price comparison
```

**Deliverable**: Complete vendor management interface

---

## 📊 PHASE 3: INVENTORY COUNTING (Week 6)

### Week 6: Count Entry & Valuation

#### Day 1-2: Count Database
**Tasks**:
- [ ] Create `InventoryCount` table with RLS
- [ ] Set up count entry API endpoints
- [ ] Implement historical count retrieval
- [ ] Build inventory valuation calculations

---

#### Day 3-5: Count UI
**Tasks**:
- [ ] Create `InventoryCountForm` component
- [ ] Build mobile-optimized count entry
- [ ] Implement barcode scanning (if available)
- [ ] Create count summary report
- [ ] Build inventory valuation dashboard

**Key Features**:
- Location-based counting
- Quick entry mode (number pad)
- Previous count reference
- Real-time valuation
- Count variance alerts

**Page Structure**:
```
/app/inventory/count/
├── page.tsx                   # Count entry
├── history/
│   └── page.tsx              # Historical counts
└── valuation/
    └── page.tsx              # Inventory value reports
```

**Deliverable**: Complete inventory counting system

---

## 🍽️ PHASE 4: RECIPE MANAGEMENT (Weeks 7-9)

### Week 7: Recipe Database & API

#### Day 1-2: Recipe Tables
**Tasks**:
- [ ] Create `RecipeCategories` table with RLS
- [ ] Create `Recipes` table with RLS
- [ ] Create `RecipeIngredients` table with RLS
- [ ] Set up recipe costing calculations

**Migration Files**:
```bash
migrations/
├── 008_create_recipe_categories.sql
├── 009_create_recipes.sql
└── 010_create_recipe_ingredients.sql
```

---

#### Day 3-5: Recipe API
**Tasks**:
- [ ] Create recipe CRUD endpoints
- [ ] Implement recipe ingredient management
- [ ] Build cost calculation functions
- [ ] Create recipe duplication endpoint
- [ ] Add recipe search/filter

**API Routes**:
```bash
/app/api/recipes/
├── route.ts                   # List/create recipes
├── [id]/
│   ├── route.ts              # Get/update/delete recipe
│   └── ingredients/
│       └── route.ts          # Manage ingredients
├── categories/
│   └── route.ts              # Recipe categories
└── calculate-cost/
    └── route.ts              # Recalculate recipe costs
```

**Business Logic Functions**:
```typescript
// app/lib/RecipeCostCalculations.ts
export function calculateRecipeCost(recipe: Recipe): RecipeCostResult {
  const ingredientCosts = recipe.ingredients.map(ing => {
    return calculateExtendedCost(ing.unit_cost, ing.quantity);
  });
  
  const totalCost = ingredientCosts.reduce((sum, cost) => sum + cost, 0);
  const costPerPortion = totalCost / recipe.number_of_portions;
  const foodCostPercentage = (costPerPortion / recipe.menu_price) * 100;
  
  return {
    totalCost,
    costPerPortion,
    foodCostPercentage
  };
}
```

**Deliverable**: Complete recipe management API

---

### Week 8: Recipe UI Components

#### Day 1-3: Recipe Components
**Tasks**:
- [ ] Create `RecipeList` component
- [ ] Create `RecipeForm` component
- [ ] Create `RecipeIngredientList` component
- [ ] Create `RecipeIngredientEntry` component
- [ ] Create `RecipeCostSummary` component

**Component Features**:
- Drag-and-drop ingredient ordering
- Inline ingredient editing
- Real-time cost calculations
- Visual cost breakdown
- Food cost % indicator (red/yellow/green)

---

#### Day 4-5: Recipe Pages
**Tasks**:
- [ ] Create recipe dashboard
- [ ] Build recipe editor
- [ ] Implement recipe duplication
- [ ] Add recipe print view
- [ ] Create recipe export

**Page Structure**:
```
/app/recipes/
├── page.tsx                   # Recipe list
├── categories/
│   └── page.tsx              # Category management
├── new/
│   └── page.tsx              # Create recipe
└── [id]/
    ├── page.tsx              # Recipe details/edit
    └── print/
        └── page.tsx          # Printable recipe
```

**Deliverable**: Complete recipe management interface

---

### Week 9: Recipe Testing & Polish

#### Day 1-2: Recipe Testing
**Tasks**:
- [ ] Test recipe cost calculations
- [ ] Test ingredient addition/removal
- [ ] Test recipe duplication
- [ ] Validate cost updates when ingredient prices change

#### Day 3-5: Recipe Features
**Tasks**:
- [ ] Add recipe version history
- [ ] Implement recipe notes/instructions
- [ ] Create recipe photo upload
- [ ] Build recipe sharing
- [ ] Add recipe templates

**Deliverable**: Production-ready recipe module

---

## 🔄 PHASE 5: SUB-RECIPES & COSTING (Weeks 10-11)

### Week 10: Sub-Recipe Implementation

#### Day 1-2: Sub-Recipe Database
**Tasks**:
- [ ] Create `SubRecipes` table with RLS
- [ ] Create `SubRecipeIngredients` table with RLS
- [ ] Update `RecipeIngredients` to support sub-recipes
- [ ] Implement sub-recipe cost calculations

---

#### Day 3-5: Sub-Recipe UI
**Tasks**:
- [ ] Create `SubRecipeForm` component
- [ ] Build sub-recipe selector in recipe editor
- [ ] Implement sub-recipe cost inheritance
- [ ] Create sub-recipe management page

**Key Features**:
- Sub-recipes contain only inventory items (no nested sub-recipes)
- Batch yield calculations
- Cost per recipe unit
- Usage tracking (which recipes use this sub-recipe)

**Page Structure**:
```
/app/recipes/sub-recipes/
├── page.tsx                   # Sub-recipe list
├── new/
│   └── page.tsx              # Create sub-recipe
└── [id]/
    └── page.tsx              # Edit sub-recipe
```

**Deliverable**: Complete sub-recipe system

---

### Week 11: Cost Management & Updates

#### Day 1-3: Cost Update System
**Tasks**:
- [ ] Build ingredient price change detection
- [ ] Implement bulk recipe cost recalculation
- [ ] Create cost change notification system
- [ ] Add cost history tracking

**Features**:
- Detect when ingredient prices change
- Flag affected recipes
- Batch recalculation of recipe costs
- Price change impact reports

---

#### Day 4-5: Cost Optimization Tools
**Tasks**:
- [ ] Create ingredient substitution suggestions
- [ ] Build cost variance reports
- [ ] Implement margin analysis tools
- [ ] Add target food cost % calculator

**Deliverable**: Advanced costing tools

---

## 📈 PHASE 6: MENU ENGINEERING & REPORTS (Weeks 12-13)

### Week 12: Menu Pricing

#### Day 1-2: Menu Pricing Database
**Tasks**:
- [ ] Create `MenuPricing` table with RLS
- [ ] Implement price history tracking
- [ ] Build pricing recommendation engine

---

#### Day 3-5: Menu Engineering UI
**Tasks**:
- [ ] Create menu pricing dashboard
- [ ] Build food cost % analysis
- [ ] Implement menu matrix (Stars/Plowhorses/Puzzles/Dogs)
- [ ] Create pricing optimization tools

**Key Reports**:
1. **Menu Engineering Matrix**
   - Plot profitability vs. popularity
   - Identify pricing opportunities

2. **Food Cost Analysis**
   - Compare actual vs. theoretical food cost
   - Identify cost outliers

3. **Pricing Recommendations**
   - Suggest menu prices for target margins
   - What-if scenario modeling

**Deliverable**: Menu engineering tools

---

### Week 13: Reporting Suite

#### Day 1-5: Report Creation
**Tasks**:
- [ ] Create inventory valuation report
- [ ] Build vendor price comparison report
- [ ] Create recipe cost summary report
- [ ] Build food cost trend report
- [ ] Implement custom report builder

**Report Features**:
- PDF export
- Email scheduling
- Date range filtering
- Category filtering
- Export to CSV/Excel

**Page Structure**:
```
/app/reports/
├── inventory-valuation/
│   └── page.tsx
├── vendor-comparison/
│   └── page.tsx
├── recipe-costs/
│   └── page.tsx
├── food-cost-trends/
│   └── page.tsx
└── custom/
    └── page.tsx
```

**Deliverable**: Comprehensive reporting system

---

## 📦 PHASE 7: ORDER GUIDES & INTEGRATION (Week 14)

### Week 14: Order Guides

#### Day 1-2: Order Guide Database
**Tasks**:
- [ ] Create `OrderGuides` table with RLS
- [ ] Create `OrderGuideItems` table with RLS
- [ ] Implement order calculation logic

---

#### Day 3-5: Order Guide UI
**Tasks**:
- [ ] Create order guide templates
- [ ] Build par level management
- [ ] Implement order quantity suggestions
- [ ] Create order guide printing
- [ ] Add vendor order export

**Features**:
- Weekly order guides per vendor
- Par level calculations (On Hand + Order = Par)
- Customizable order templates
- Email order to vendor
- Order history tracking

**Page Structure**:
```
/app/ordering/
├── guides/
│   └── page.tsx              # Order guide management
├── vendor/[id]/
│   └── page.tsx              # Vendor-specific ordering
└── history/
    └── page.tsx              # Order history
```

**Deliverable**: Complete order management system

---

## ✅ PHASE 8: TESTING & POLISH (Weeks 15-16)

### Week 15: Comprehensive Testing

#### Day 1-2: Integration Testing
**Tasks**:
- [ ] Test complete workflow: Inventory → Recipe → Costing → Ordering
- [ ] Test multi-client data isolation
- [ ] Verify RLS policies across all tables
- [ ] Test concurrent user access

---

#### Day 3-4: Performance Testing
**Tasks**:
- [ ] Load test with realistic data volumes
- [ ] Test on iPad Air (2013) across all modules
- [ ] Measure and optimize page load times
- [ ] Test with slow network conditions
- [ ] Optimize database queries

**Performance Targets**:
- Page load: <2 seconds on iPad Air
- API response: <500ms for most queries
- Concurrent users: 50+ without degradation

---

#### Day 5: Security Audit
**Tasks**:
- [ ] Review all RLS policies
- [ ] Test role-based access controls
- [ ] Verify input validation
- [ ] Check for SQL injection vulnerabilities
- [ ] Test authentication edge cases

**Deliverable**: Security assessment report

---

### Week 16: Polish & Launch Prep

#### Day 1-2: UI/UX Polish
**Tasks**:
- [ ] Fix any visual inconsistencies
- [ ] Improve error messages
- [ ] Add loading states everywhere
- [ ] Enhance mobile responsiveness
- [ ] Add helpful tooltips and hints

---

#### Day 3-4: Documentation
**Tasks**:
- [ ] Write user guides for each module
- [ ] Create video tutorials
- [ ] Document API endpoints
- [ ] Write admin setup guide
- [ ] Create troubleshooting guide

---

#### Day 5: Soft Launch
**Tasks**:
- [ ] Deploy to production
- [ ] Onboard beta test clients
- [ ] Monitor error logs
- [ ] Gather initial feedback
- [ ] Plan iteration priorities

**Deliverable**: Production launch! 🚀

---

## 👥 TEAM STRUCTURE

### Recommended Team Composition:

**Option 1: Small Team (2-3 people)**
- **Full-Stack Developer** (Lead) - Database, API, UI
- **Frontend Developer** - UI components, UX
- **Part-time QA/Testing** - Testing, documentation

**Option 2: Solo with AI Assist (Your Current Approach)**
- **You + Claude Code** - All development
- Focus on one phase at a time
- Leverage templates and code generation
- Prioritize ruthlessly

---

## 📊 EFFORT ESTIMATES

### Time Breakdown by Phase:

| Phase | Weeks | Development Hours | Complexity |
|-------|-------|------------------|------------|
| Phase 1: Core Inventory | 3 | 120 | Medium |
| Phase 2: Vendor Management | 2 | 80 | Low-Medium |
| Phase 3: Inventory Counting | 1 | 40 | Low |
| Phase 4: Recipe Management | 3 | 120 | Medium-High |
| Phase 5: Sub-Recipes | 2 | 80 | High |
| Phase 6: Menu Engineering | 2 | 80 | Medium |
| Phase 7: Order Guides | 1 | 40 | Low |
| Phase 8: Testing & Polish | 2 | 80 | Medium |
| **TOTAL** | **16** | **640 hours** | |

**Solo with AI**: Estimated 12-16 weeks (part-time)  
**2-person team**: Estimated 8-10 weeks (full-time)  
**3-person team**: Estimated 6-8 weeks (full-time)

---

## 🎯 CRITICAL SUCCESS FACTORS

### Must-Haves:
1. ✅ **Multi-tenant data isolation** - Security is paramount
2. ✅ **iPad Air compatibility** - Hardware target is non-negotiable
3. ✅ **Cost calculation accuracy** - Core business value
4. ✅ **Intuitive UX** - Simpler than Excel or it's not worth building
5. ✅ **Performance** - Fast enough to use daily

### Nice-to-Haves (Phase 2):
- Recipe photo uploads
- Barcode scanning
- Mobile app (native)
- Offline mode
- AI-powered recipe suggestions

---

## 🚨 RISK MITIGATION

### Identified Risks & Mitigation:

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| iPad Air performance issues | High | Medium | Aggressive optimization, lazy loading |
| Complex cost calculations | Medium | Low | Unit test every formula, compare to EZchef |
| User adoption resistance | High | Medium | Excellent UX, training materials, support |
| Data migration complexity | Medium | High | Build import tools, validate thoroughly |
| Scope creep | High | High | Strict phase adherence, defer features |

---

## 💰 BUSINESS MODEL INTEGRATION

### Bolt-On Module Pricing:

**Inventory Management Module**: $29 NZD/month  
**Recipe & Costing Module**: $39 NZD/month  
**Bundle (Both Modules)**: $59 NZD/month (save $9)

**Value Proposition**:
- Replaces $500+ Excel system
- Mobile accessibility
- Real-time costing
- Multi-user access
- Automated calculations
- Professional reports

---

## 📈 SUCCESS METRICS

### Track These KPIs:

**Adoption Metrics**:
- Module activation rate
- Daily active users per module
- Time spent in each module
- Feature usage breakdown

**Business Metrics**:
- Module MRR growth
- Bundle conversion rate
- Customer lifetime value
- Churn rate per module

**Performance Metrics**:
- Average page load time
- API response times
- Error rates
- Uptime percentage

---

## 🎓 NEXT STEPS

### Immediate Actions:

1. **Review & Approve** this roadmap
2. **Prioritize** which phase to start with
3. **Set up** development environment
4. **Create** first database migration
5. **Build** first API endpoint
6. **Test** on iPad Air immediately

### Ready to Start?

Choose your starting phase based on:
- **Business Priority**: What adds most value first?
- **Technical Dependencies**: What unlocks other features?
- **Customer Demand**: What are users asking for?

**Recommendation**: Start with **Phase 1 (Core Inventory)** - it's foundational, standalone value, and unlocks everything else.

---

**Document Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion
