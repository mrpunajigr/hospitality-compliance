# EZchef Business Logic & Formula Reference

**Source**: EZchef v4.25 Standard.xlsm  
**Purpose**: Document all calculation formulas for JiGR implementation  
**Target**: Development team implementing inventory & recipe costing

---

## 🎯 Overview

This document extracts and explains all core business formulas from EZchef to ensure accurate implementation in the JiGR platform.

### Formula Categories:
1. **Inventory Costing** - Calculate cost per recipe unit
2. **Recipe Costing** - Calculate recipe ingredient costs
3. **Menu Pricing** - Calculate food cost percentages
4. **Unit Conversions** - Convert between different measurement units
5. **Order Calculations** - Calculate order quantities

---

## 📊 INVENTORY COSTING FORMULAS

### 1. Unit Cost Calculation

**Excel Formula** (Column P, Row 6 in Inventory sheets):
```excel
=IF(N6>0,(I6/N6)/O6,0)
```

**Breakdown**:
- `I6` = Pack Price (cost from vendor)
- `N6` = Convert to RU (how many recipe units in a pack)
- `O6` = Yield (percentage of usable product)

**Logic**:
```
IF Convert to RU > 0 THEN
  Unit Cost = (Pack Price ÷ Convert to RU) ÷ Yield
ELSE
  Unit Cost = 0
END IF
```

**TypeScript Implementation**:
```typescript
interface InventoryUnitCost {
  packPrice: number;
  convertToRecipeUnit: number;
  yield: number;
}

function calculateInventoryUnitCost(params: InventoryUnitCost): number {
  const { packPrice, convertToRecipeUnit, yield: yieldPercent } = params;
  
  if (convertToRecipeUnit > 0 && yieldPercent > 0) {
    return (packPrice / convertToRecipeUnit) / yieldPercent;
  }
  
  return 0;
}

// Example Usage:
const unitCost = calculateInventoryUnitCost({
  packPrice: 24.00,        // $24 per pack
  convertToRecipeUnit: 50,  // 50 oz per pack
  yield: 0.95              // 95% yield (5% waste)
});
// Result: $0.505 per oz
```

**Real-World Example**:
```
Item: Fresh Salmon Fillet
Pack Price: $125.00
Pack Size: 10 lb (160 oz)
Yield: 85% (15% waste from bones, skin, trimming)

Calculation:
Step 1: Cost per oz = $125 ÷ 160 oz = $0.78125/oz
Step 2: Adjusted for yield = $0.78125 ÷ 0.85 = $0.919/oz

Recipe Unit Cost = $0.92 per oz
```

**Edge Cases**:
- If `convertToRecipeUnit` is 0 or negative → return 0
- If `yield` is 0 or negative → return 0
- If `yield` > 1.0 → treat as 1.0 (100% yield)

---

### 2. Alternative Count Unit Cost

**Excel Formula** (Column T, Row 6 in Inventory sheets):
```excel
=IF(S6>0,(I6/S6),0)
```

**Breakdown**:
- `I6` = Pack Price
- `S6` = Convert (conversion factor for count units)

**TypeScript Implementation**:
```typescript
function calculateCountUnitCost(
  packPrice: number,
  countUnitConversion: number
): number {
  if (countUnitConversion > 0) {
    return packPrice / countUnitConversion;
  }
  
  return 0;
}

// Example:
const countCost = calculateCountUnitCost(
  48.00,  // $48 per case
  12      // 12 units per case
);
// Result: $4.00 per unit
```

---

## 🍽️ RECIPE COSTING FORMULAS

### 3. Recipe Ingredient Extended Cost

**Excel Formula** (Column H, Row 8 in Recipe sheets):
```excel
=IF(G8="Link changed",0,IF(F8="",0,IF(ISERROR(SEARCH("/",F8,2)),F8*G8,fractodec(F8)*G8)))
```

**Breakdown**:
- `G8` = Recipe Unit Cost (cost per oz, lb, etc.)
- `F8` = Recipe Units (quantity needed)
- Special handling for fractions (e.g., "1/2", "2 1/4")

**Logic Flow**:
```
IF Recipe Unit Cost = "Link changed" THEN
  Return 0 (broken link)
ELSE IF Recipe Units is empty THEN
  Return 0 (no quantity specified)
ELSE IF Recipe Units contains "/" (is a fraction) THEN
  Convert fraction to decimal, then multiply by Unit Cost
ELSE
  Multiply Recipe Units × Recipe Unit Cost
END IF
```

**TypeScript Implementation**:
```typescript
function calculateRecipeExtendedCost(
  recipeUnits: string | number,
  recipeUnitCost: number
): number {
  // Check for broken link
  if (recipeUnitCost === null || recipeUnits === 'Link changed') {
    return 0;
  }
  
  // Check for empty quantity
  if (!recipeUnits || recipeUnits === '') {
    return 0;
  }
  
  // Convert to number if string
  let quantity: number;
  
  if (typeof recipeUnits === 'string') {
    // Check if it's a fraction
    if (recipeUnits.includes('/')) {
      quantity = convertFractionToDecimal(recipeUnits);
    } else {
      quantity = parseFloat(recipeUnits);
    }
  } else {
    quantity = recipeUnits;
  }
  
  // Calculate extended cost
  if (isNaN(quantity)) {
    return 0;
  }
  
  return quantity * recipeUnitCost;
}

function convertFractionToDecimal(fraction: string): number {
  // Handle mixed numbers: "2 1/4" → 2.25
  const mixedMatch = fraction.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + (numerator / denominator);
  }
  
  // Handle simple fractions: "3/4" → 0.75
  const simpleMatch = fraction.match(/^(\d+)\/(\d+)$/);
  if (simpleMatch) {
    const numerator = parseInt(simpleMatch[1]);
    const denominator = parseInt(simpleMatch[2]);
    return numerator / denominator;
  }
  
  // Try to parse as regular number
  return parseFloat(fraction);
}

// Example Usage:
const cost1 = calculateRecipeExtendedCost('8', 0.505);
// Result: 8 × $0.505 = $4.04

const cost2 = calculateRecipeExtendedCost('1/2', 3.20);
// Result: 0.5 × $3.20 = $1.60

const cost3 = calculateRecipeExtendedCost('2 1/4', 1.80);
// Result: 2.25 × $1.80 = $4.05
```

**Edge Cases**:
- Invalid fractions (e.g., "3//4") → return 0
- Division by zero in fraction → return 0
- Negative quantities → treat as 0
- Very large quantities → validate against reasonable limits

---

### 4. Recipe Total Cost

**Excel Formula** (Summary row in Recipe sheets):
```excel
=SUM(H8:H27)
```

**TypeScript Implementation**:
```typescript
interface RecipeIngredient {
  extended_cost: number;
}

function calculateRecipeTotalCost(
  ingredients: RecipeIngredient[]
): number {
  return ingredients.reduce((total, ingredient) => {
    return total + (ingredient.extended_cost || 0);
  }, 0);
}

// Example:
const ingredients = [
  { extended_cost: 4.04 },
  { extended_cost: 1.60 },
  { extended_cost: 2.35 },
  { extended_cost: 0.89 }
];

const totalCost = calculateRecipeTotalCost(ingredients);
// Result: $8.88
```

---

### 5. Cost Per Portion

**Formula** (Implied from EZchef):
```
Cost Per Portion = Total Recipe Cost ÷ Number of Portions
```

**TypeScript Implementation**:
```typescript
function calculateCostPerPortion(
  totalCost: number,
  numberOfPortions: number
): number {
  if (numberOfPortions <= 0) {
    return 0;
  }
  
  return totalCost / numberOfPortions;
}

// Example:
const costPerPortion = calculateCostPerPortion(8.88, 4);
// Result: $2.22 per portion
```

**Validation**:
- Number of portions must be > 0
- Round to 4 decimal places for currency precision

---

### 6. Food Cost Percentage

**Formula** (Used throughout EZchef):
```
Food Cost % = (Cost Per Portion ÷ Menu Price) × 100
```

**TypeScript Implementation**:
```typescript
function calculateFoodCostPercentage(
  costPerPortion: number,
  menuPrice: number
): number {
  if (menuPrice <= 0) {
    return 0;
  }
  
  const percentage = (costPerPortion / menuPrice) * 100;
  
  // Round to 1 decimal place
  return Math.round(percentage * 10) / 10;
}

// Example:
const foodCost = calculateFoodCostPercentage(2.22, 12.95);
// Result: 17.1%
```

**Industry Benchmarks**:
- **Target Food Cost**: 25-35% for most restaurants
- **High-end**: 20-25%
- **Casual dining**: 28-35%
- **Fast casual**: 30-40%
- **Alert thresholds**: 
  - Green: < 30%
  - Yellow: 30-35%
  - Red: > 35%

---

## 🔄 UNIT CONVERSION FORMULAS

### 7. Volume Conversions

**Conversion Table** (From ConvTables sheet):

| From | To | Multiplier |
|------|-----|-----------|
| Gallon | Quart | 4 |
| Gallon | Pint | 8 |
| Gallon | Cup | 16 |
| Gallon | Fl Oz | 128 |
| Gallon | Tablespoon | 256 |
| Gallon | Teaspoon | 768 |
| Quart | Fl Oz | 32 |
| Pint | Fl Oz | 16 |
| Cup | Fl Oz | 8 |
| Cup | Tablespoon | 16 |
| Tablespoon | Teaspoon | 3 |

**TypeScript Implementation**:
```typescript
interface UnitConversion {
  from_unit: string;
  to_unit: string;
  multiplier: number;
}

const VOLUME_CONVERSIONS: UnitConversion[] = [
  { from_unit: 'gal', to_unit: 'oz-fl', multiplier: 128 },
  { from_unit: 'gal', to_unit: 'qt', multiplier: 4 },
  { from_unit: 'gal', to_unit: 'pt', multiplier: 8 },
  { from_unit: 'gal', to_unit: 'cup', multiplier: 16 },
  { from_unit: 'gal', to_unit: 'tbl', multiplier: 256 },
  { from_unit: 'gal', to_unit: 'tsp', multiplier: 768 },
  { from_unit: 'qt', to_unit: 'oz-fl', multiplier: 32 },
  { from_unit: 'pt', to_unit: 'oz-fl', multiplier: 16 },
  { from_unit: 'cup', to_unit: 'oz-fl', multiplier: 8 },
  { from_unit: 'cup', to_unit: 'tbl', multiplier: 16 },
  { from_unit: 'tbl', to_unit: 'tsp', multiplier: 3 },
  { from_unit: 'oz-fl', to_unit: 'tbl', multiplier: 2 }
];

function convertVolume(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number {
  // Same unit - no conversion needed
  if (fromUnit === toUnit) {
    return quantity;
  }
  
  // Find direct conversion
  const directConversion = VOLUME_CONVERSIONS.find(
    c => c.from_unit === fromUnit && c.to_unit === toUnit
  );
  
  if (directConversion) {
    return quantity * directConversion.multiplier;
  }
  
  // Find reverse conversion
  const reverseConversion = VOLUME_CONVERSIONS.find(
    c => c.from_unit === toUnit && c.to_unit === fromUnit
  );
  
  if (reverseConversion) {
    return quantity / reverseConversion.multiplier;
  }
  
  // No conversion found - return original quantity
  console.warn(`No conversion found: ${fromUnit} to ${toUnit}`);
  return quantity;
}

// Examples:
const result1 = convertVolume(2, 'gal', 'oz-fl');
// Result: 256 fl oz

const result2 = convertVolume(8, 'tbl', 'tsp');
// Result: 24 tsp

const result3 = convertVolume(32, 'oz-fl', 'qt');
// Result: 1 qt
```

---

### 8. Weight Conversions

**Conversion Table** (From ConvTables sheet):

| From | To | Multiplier |
|------|-----|-----------|
| Pound | Ounce (weight) | 16 |
| Pound | Kilogram | 0.453592 |
| Pound | Gram | 453.592 |
| Ounce | Gram | 28.3495 |
| Kilogram | Gram | 1000 |

**TypeScript Implementation**:
```typescript
const WEIGHT_CONVERSIONS: UnitConversion[] = [
  { from_unit: 'lb', to_unit: 'oz-wt', multiplier: 16 },
  { from_unit: 'lb', to_unit: 'kg', multiplier: 0.453592 },
  { from_unit: 'lb', to_unit: 'g', multiplier: 453.592 },
  { from_unit: 'oz-wt', to_unit: 'g', multiplier: 28.3495 },
  { from_unit: 'kg', to_unit: 'g', multiplier: 1000 }
];

function convertWeight(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number {
  // Same logic as convertVolume above
  // Implementation identical, just using WEIGHT_CONVERSIONS
  
  if (fromUnit === toUnit) {
    return quantity;
  }
  
  const conversion = WEIGHT_CONVERSIONS.find(
    c => c.from_unit === fromUnit && c.to_unit === toUnit
  ) || WEIGHT_CONVERSIONS.find(
    c => c.from_unit === toUnit && c.to_unit === fromUnit
  );
  
  if (!conversion) {
    return quantity;
  }
  
  if (conversion.from_unit === fromUnit) {
    return quantity * conversion.multiplier;
  } else {
    return quantity / conversion.multiplier;
  }
}

// Examples:
const result1 = convertWeight(5, 'lb', 'oz-wt');
// Result: 80 oz

const result2 = convertWeight(1, 'lb', 'g');
// Result: 453.592 g

const result3 = convertWeight(100, 'g', 'oz-wt');
// Result: 3.527 oz
```

---

## 📦 ORDER GUIDE CALCULATIONS

### 9. Order Quantity Calculation

**Logic** (From Vendor Order Guide sheet):
```
Order Quantity = Par Level - On Hand
```

**With minimum order adjustments**:
```
IF (Par Level - On Hand) < Minimum Order THEN
  Order = 0 or Minimum Order (user choice)
ELSE
  Order = Par Level - On Hand
END IF
```

**TypeScript Implementation**:
```typescript
interface OrderCalculation {
  parLevel: number;
  onHand: number;
  minimumOrder?: number;
  orderMultiple?: number; // Order in multiples (e.g., cases only)
}

function calculateOrderQuantity(params: OrderCalculation): number {
  const { parLevel, onHand, minimumOrder = 0, orderMultiple = 1 } = params;
  
  // Basic calculation
  let orderQty = parLevel - onHand;
  
  // Don't order if we're at or above par
  if (orderQty <= 0) {
    return 0;
  }
  
  // Check minimum order
  if (minimumOrder > 0 && orderQty < minimumOrder) {
    return 0; // Or return minimumOrder based on user preference
  }
  
  // Round up to order multiple
  if (orderMultiple > 1) {
    orderQty = Math.ceil(orderQty / orderMultiple) * orderMultiple;
  }
  
  return orderQty;
}

// Examples:
const order1 = calculateOrderQuantity({
  parLevel: 20,
  onHand: 8,
  minimumOrder: 5
});
// Result: 12 units

const order2 = calculateOrderQuantity({
  parLevel: 10,
  onHand: 8,
  minimumOrder: 5
});
// Result: 0 (below minimum)

const order3 = calculateOrderQuantity({
  parLevel: 25,
  onHand: 10,
  orderMultiple: 6  // Order in half-cases
});
// Result: 18 (rounded up from 15)
```

---

## 🔢 SUB-RECIPE COSTING FORMULAS

### 10. Sub-Recipe Cost Per Unit

**Formula**:
```
Cost Per Recipe Unit = Total Ingredient Cost ÷ (Batch Yield ÷ Number of Recipe Units)
```

**Example**:
```
Sub-Recipe: BBQ Sauce
Batch Yield: 1 gallon
Number of Recipe Units: 8 (1 cup each)
Total Ingredient Cost: $12.50

Calculation:
Units per batch = 1 gallon ÷ (1 cup / 8 units) = 8 cups
Cost per cup = $12.50 ÷ 8 = $1.5625 per cup
```

**TypeScript Implementation**:
```typescript
interface SubRecipeCosting {
  totalIngredientCost: number;
  batchYieldQuantity: number;
  batchYieldUnit: string;
  recipeUnit: string;
  numberOfRecipeUnits: number;
}

function calculateSubRecipeCostPerUnit(
  params: SubRecipeCosting,
  conversions: UnitConversion[]
): number {
  const {
    totalIngredientCost,
    batchYieldQuantity,
    batchYieldUnit,
    recipeUnit,
    numberOfRecipeUnits
  } = params;
  
  // If batch yield and recipe units are same, simple division
  if (batchYieldUnit === recipeUnit) {
    const unitsPerBatch = batchYieldQuantity / numberOfRecipeUnits;
    return totalIngredientCost / unitsPerBatch;
  }
  
  // Need to convert units
  const convertedYield = convertVolume(
    batchYieldQuantity,
    batchYieldUnit,
    recipeUnit
  );
  
  const unitsPerBatch = convertedYield / numberOfRecipeUnits;
  return totalIngredientCost / unitsPerBatch;
}

// Example:
const subRecipeCost = calculateSubRecipeCostPerUnit(
  {
    totalIngredientCost: 12.50,
    batchYieldQuantity: 1,
    batchYieldUnit: 'gal',
    recipeUnit: 'cup',
    numberOfRecipeUnits: 1
  },
  VOLUME_CONVERSIONS
);
// Result: $0.78 per cup (16 cups in a gallon)
```

---

## 📊 INVENTORY VALUATION FORMULAS

### 11. Total Inventory Value

**Formula**:
```
Total Value = SUM(On Hand Quantity × Unit Cost) for all items
```

**TypeScript Implementation**:
```typescript
interface InventoryItem {
  quantity_on_hand: number;
  unit_cost: number;
}

function calculateInventoryValue(
  items: InventoryItem[]
): number {
  return items.reduce((total, item) => {
    return total + (item.quantity_on_hand * item.unit_cost);
  }, 0);
}

// Example:
const inventory = [
  { quantity_on_hand: 50, unit_cost: 0.50 },
  { quantity_on_hand: 25, unit_cost: 2.40 },
  { quantity_on_hand: 100, unit_cost: 0.15 }
];

const totalValue = calculateInventoryValue(inventory);
// Result: $100 total inventory value
```

---

### 12. Inventory Turnover

**Formula** (Not explicitly in EZchef, but standard calculation):
```
Inventory Turnover = Cost of Goods Sold ÷ Average Inventory Value
```

**TypeScript Implementation**:
```typescript
function calculateInventoryTurnover(
  costOfGoodsSold: number,
  beginningInventory: number,
  endingInventory: number
): number {
  const averageInventory = (beginningInventory + endingInventory) / 2;
  
  if (averageInventory === 0) {
    return 0;
  }
  
  return costOfGoodsSold / averageInventory;
}

// Example:
const turnover = calculateInventoryTurnover(
  50000,  // COGS for period
  5000,   // Beginning inventory
  4500    // Ending inventory
);
// Result: 10.5 turns per period
```

---

## 🎯 VALIDATION RULES

### Critical Validations:

#### 1. **Price Validation**
```typescript
function validatePrice(price: number): boolean {
  return price >= 0 && price <= 999999.99;
}
```

#### 2. **Quantity Validation**
```typescript
function validateQuantity(quantity: number): boolean {
  return quantity >= 0 && quantity <= 999999.999;
}
```

#### 3. **Percentage Validation**
```typescript
function validatePercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100;
}
```

#### 4. **Yield Validation**
```typescript
function validateYield(yield: number): boolean {
  return yield > 0 && yield <= 1.0;
}
```

---

## 🚨 ERROR HANDLING

### Common Error Scenarios:

#### 1. **Division by Zero**
```typescript
function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator)) {
    console.error('Division by zero attempted');
    return 0;
  }
  return numerator / denominator;
}
```

#### 2. **Invalid Conversions**
```typescript
function safeConvert(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  try {
    const result = convertVolume(quantity, fromUnit, toUnit);
    if (isNaN(result)) {
      throw new Error('Conversion resulted in NaN');
    }
    return result;
  } catch (error) {
    console.error(`Conversion error: ${fromUnit} to ${toUnit}`, error);
    return null;
  }
}
```

#### 3. **Negative Values**
```typescript
function ensurePositive(value: number, fieldName: string): number {
  if (value < 0) {
    console.warn(`${fieldName} cannot be negative. Using 0 instead.`);
    return 0;
  }
  return value;
}
```

---

## 📈 ROUNDING STANDARDS

### Precision Guidelines:

```typescript
// Currency: 2 decimal places
function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// Unit Costs: 4 decimal places
function roundUnitCost(cost: number): number {
  return Math.round(cost * 10000) / 10000;
}

// Quantities: 3 decimal places
function roundQuantity(qty: number): number {
  return Math.round(qty * 1000) / 1000;
}

// Percentages: 1 decimal place
function roundPercentage(pct: number): number {
  return Math.round(pct * 10) / 10;
}

// Examples:
roundCurrency(12.3456);     // 12.35
roundUnitCost(0.505123);    // 0.5051
roundQuantity(2.3333);      // 2.333
roundPercentage(24.25);     // 24.3
```

---

## 🧪 TESTING EXAMPLES

### Unit Test Scenarios:

```typescript
describe('Recipe Costing', () => {
  it('should calculate extended cost correctly', () => {
    const cost = calculateRecipeExtendedCost('8', 0.505);
    expect(cost).toBe(4.04);
  });
  
  it('should handle fractions correctly', () => {
    const cost = calculateRecipeExtendedCost('1/2', 3.20);
    expect(cost).toBe(1.60);
  });
  
  it('should handle mixed fractions', () => {
    const cost = calculateRecipeExtendedCost('2 1/4', 1.80);
    expect(cost).toBeCloseTo(4.05, 2);
  });
  
  it('should return 0 for empty quantity', () => {
    const cost = calculateRecipeExtendedCost('', 5.00);
    expect(cost).toBe(0);
  });
  
  it('should calculate food cost percentage', () => {
    const pct = calculateFoodCostPercentage(2.22, 12.95);
    expect(pct).toBeCloseTo(17.1, 1);
  });
});
```

---

## 📚 REFERENCE SUMMARY

### Quick Formula Lookup:

| Calculation | Formula | Page |
|-------------|---------|------|
| Inventory Unit Cost | `(Pack Price / Convert to RU) / Yield` | 1 |
| Recipe Extended Cost | `Recipe Units × Unit Cost` | 3 |
| Recipe Total Cost | `SUM(Extended Costs)` | 4 |
| Cost Per Portion | `Total Cost / Portions` | 4 |
| Food Cost % | `(Cost / Menu Price) × 100` | 5 |
| Volume Conversion | `Quantity × Multiplier` | 6 |
| Weight Conversion | `Quantity × Multiplier` | 7 |
| Order Quantity | `Par Level - On Hand` | 8 |
| Sub-Recipe Cost | `Total Cost / Units per Batch` | 9 |
| Inventory Value | `SUM(Quantity × Unit Cost)` | 10 |

---

**Document Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: Reference Complete  
**Next Review**: During implementation testing
