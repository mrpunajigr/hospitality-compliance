# EZchef v4.25 Standard - System Structure Analysis

## 📊 Overview
**File Type**: Excel Macro-Enabled Workbook (.xlsm)  
**Total Sheets**: 57  
**Primary Purpose**: Restaurant management system for inventory, recipe costing, menu pricing, and vendor ordering

---

## 🗂️ System Architecture

### 1️⃣ **Main Navigation & Setup** (3 sheets)
- **MainMenu** - Central navigation dashboard
- **Instructions** - User guide and help documentation
- **ConvTables** - Volume conversion reference tables

### 2️⃣ **Inventory Management - Category Sheets** (14 sheets)
Each inventory category has identical structure (500 rows × 479 columns):

**Food Categories:**
- `IProduce` - Fresh produce inventory
- `IDairy` - Dairy products
- `IMeat & Poultry` - Meat and poultry items
- `ISeafood` - Seafood inventory
- `IFrozen` - Frozen goods
- `IGrocery & Dry` - Dry goods and groceries
- `IOther` - Miscellaneous food items

**Beverage Categories:**
- `INon Alc Bev` - Non-alcoholic beverages
- `IBeer` - Beer inventory
- `IWine` - Wine inventory
- `ILiquor` - Spirits/liquor inventory

**Supplies:**
- `IPaper & Disp` - Paper goods and disposables

**Key Features:**
- Vendor tracking
- Item codes and brands
- Pack sizes and pricing
- ~8,400 formulas per sheet
- Extensive merged cell formatting

### 3️⃣ **Recipe Management - Menu Categories** (9 sheets)
Each category has identical structure (3,424 rows × 57 columns):

**Menu Categories:**
- `Appetizers` - Appetizer recipes
- `Salads` - Salad recipes
- `Entrees` - Main course recipes
- `Sandwiches` - Sandwich recipes
- `Beverage` - Beverage recipes
- `Beer` - Beer menu items
- `Wine` - Wine menu items
- `Liquor` - Liquor/cocktail recipes

**Key Features:**
- Recipe name and version tracking
- Portion counts and pricing
- Cost per portion calculations
- ~28,500 formulas per sheet
- Menu price tracking
- Last update timestamps

### 4️⃣ **Plate/Portion Summaries** (9 sheets)
Prefix: `PS-` (e.g., PS-Appetizers, PS-Salads)

**Structure**: 179 rows × 76 columns each

**Purpose**: Summary views of recipe costs and pricing for menu categories
- ~2,834 formulas per sheet
- Aggregated cost analysis

### 5️⃣ **Sub Recipes System** (2 sheets)

**Sub Recipes** (12,801 rows × 57 columns)
- Component recipes used within main recipes
- Yield calculations
- Recipe unit tracking
- ~121,603 formulas (most complex sheet)
- Extensive merged cells (2,000 ranges)

**Sub recipe lookup** (9,039 rows × 59 columns)
- Lookup table for sub-recipe references
- ~1,401 formulas

### 6️⃣ **Inventory Reporting** (9 sheets)

**Core Inventory Sheets:**
- `InvSUM` - Inventory summary by category
- `InvPrintCAT` - Inventory print by category (6,735 rows, 8,474 formulas)
- `InvPrintLOC` - Inventory print by location (6,092 rows, 12,199 formulas)
- `InvPrint2` - Alternative inventory print format
- `InvList` - Master inventory list (7,124 rows)
- `TempINVCntLookup` - Temporary inventory count lookup (6,043 rows)
- `InvItemPriceHist` - Item price history tracking
- `SortMemory` - Saved sort sequences (6,027 rows, all formula-driven)

**Theoretical Menu Cost:**
- `TheoMCSum` - Theoretical menu cost summary (113 formulas)

### 7️⃣ **Vendor & Ordering** (5 sheets)

- `Vendor Order Guide` - Main vendor ordering interface (7,778 rows)
- `Order Guides` - Alternative order guide formats
- `OrderGuides2` - Additional ordering templates
- `Template` - Import template for vendor data (~1,998 formulas)
- `Import Template` - Data import staging area

### 8️⃣ **Support & Reference** (5 sheets)

- `Search Form` - Recipe/item search interface (403 formulas)
- `Units` - Unit of measure conversions and lookups
- `lists` - Reference lists and dropdowns (178 formulas)
- `WORK` - Hidden working calculations (formula errors present: #REF!)
- `Macro` - VBA macro storage sheet

### 9️⃣ **Reporting & Export** (4 sheets)

- `PrintRecipeSum` - Recipe summary reports (3,000 rows)
- `PrintSubRecipeSum` - Sub-recipe summary reports (3,000 rows)
- `ExportList` - Data export staging (1,006 rows)
- `ExporttoExcel` - Excel export functionality
- `MissingItemCodes` - Data validation warnings

---

## ⚡ Formula Analysis

### Formula Density by Sheet Type:

**Highest Formula Counts:**
1. `Sub Recipes` - **121,603 formulas** (most complex)
2. Recipe categories (9 sheets) - **28,500 formulas each**
3. `InvPrintLOC` - **12,199 formulas**
4. Inventory categories (14 sheets) - **8,404 formulas each**
5. `InvPrintCAT` - **8,474 formulas**

**Total Estimated Formulas**: ~500,000+ across all sheets

---

## 🏗️ System Capabilities

### Core Functions:

1. **Inventory Management**
   - Multi-category inventory tracking
   - Vendor relationship management
   - Pack size and pricing tracking
   - Location-based inventory counts

2. **Recipe Costing**
   - Detailed recipe ingredient tracking
   - Portion cost calculations
   - Sub-recipe integration
   - Menu price vs. cost analysis
   - COGS (Cost of Goods Sold) percentage tracking

3. **Menu Engineering**
   - Category-based menu organization
   - Price optimization
   - Portion control
   - Last update tracking

4. **Vendor Management**
   - Order guide generation
   - Vendor price tracking
   - Item code management
   - Price history analysis

5. **Reporting**
   - Inventory summaries (by category and location)
   - Recipe cost reports
   - Theoretical menu cost analysis
   - Custom print formats

6. **Data Management**
   - Import/export functionality
   - Search capabilities
   - Unit conversions
   - Data validation

---

## 🎯 Design Patterns

### Standardized Structures:

1. **Inventory Sheets** (14 sheets)
   - Identical 500×479 layout
   - Consistent formula patterns
   - Vendor/Item/Pack/Price structure

2. **Recipe Sheets** (9 sheets)
   - Identical 3,424×57 layout
   - Standardized costing formulas
   - Uniform portion tracking

3. **Summary Sheets** (9 PS- sheets)
   - Identical 179×76 layout
   - Aggregation formulas
   - Category-specific reporting

### Data Flow:
```
Inventory Sheets → Recipe Ingredients → Recipe Costs → Menu Pricing
                ↓                                           ↓
         Vendor Orders                              Theoretical Menu Cost
```

---

## ⚠️ Notable Issues

### Current Problems Detected:

1. **WORK Sheet**: Contains `#REF!` errors in formulas
   - Location: Row 5, Column C
   - Indicates broken cell references

2. **Formula Complexity**: Extremely high formula count
   - May cause performance issues
   - Recalculation time could be slow
   - Risk of circular references

3. **File Size**: Large workbook with macro code
   - 57 sheets with extensive formulas
   - May exceed memory on older systems

---

## 📈 Scale & Capacity

### Data Limits:

- **Inventory Items**: 500 items per category × 14 categories = **7,000 potential items**
- **Recipes**: 
  - Main recipes: ~3,424 recipes × 9 categories = **~30,000 recipe capacity**
  - Sub-recipes: **12,800+ sub-recipe capacity**
- **Vendor Items**: **7,778 rows** in vendor order guide

### Performance Characteristics:

- **Heavy formula usage**: May slow down on file open/save
- **Extensive merged cells**: Can impact scrolling performance
- **Large dimensions**: Some sheets extend to column RK (479 columns)

---

## 💡 Key Insights

### System Strengths:
✅ Comprehensive restaurant management solution  
✅ Standardized, repeatable sheet structures  
✅ Integrated inventory → recipe → cost → pricing flow  
✅ Multi-vendor support  
✅ Detailed cost tracking capabilities  

### Design Philosophy:
- **Modular categorization**: Food/beverage separation
- **Scalability**: Large row/column capacity for growth
- **Formula-driven**: Automated calculations throughout
- **Print-ready**: Multiple print format sheets

### Target Users:
- Restaurant operators
- Food service managers
- Catering businesses
- Hospitality venues with complex inventory needs

---

## 🔍 Recommended Next Steps

If adapting this for JiGR platform:

1. **Extract Core Data Structures**:
   - Inventory item schema
   - Recipe ingredient relationships
   - Vendor management model
   - Cost calculation formulas

2. **Database Design**:
   - Normalize the Excel structures into relational tables
   - Create proper foreign key relationships
   - Implement business logic in backend

3. **Formula Migration**:
   - Document key calculation formulas
   - Implement in application logic
   - Maintain formula integrity

4. **Feature Prioritization**:
   - Start with inventory management
   - Add recipe costing next
   - Build vendor ordering features
   - Implement reporting last

---

## 📊 Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Sheets** | 57 |
| **Formula Count** | ~500,000+ |
| **Largest Sheet** | Sub Recipes (12,801 rows) |
| **Widest Sheet** | Multiple sheets (479 columns) |
| **Merged Ranges** | Extensive (2,000+ in Sub Recipes) |
| **System Type** | Restaurant Management ERP |
| **Primary Focus** | Inventory + Recipe Costing |

---

**Analysis Date**: November 11, 2025  
**Analyzed By**: Claude  
**Document Version**: 1.0
