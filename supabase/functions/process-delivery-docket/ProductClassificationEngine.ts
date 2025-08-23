// Enhanced Product Classification Engine for Google Document AI
// Classifies extracted products by temperature requirements and business categories
// Includes comprehensive NZ grocery product database for accurate categorization

export interface LineItem {
  description: string
  quantity: number
  unitSize: string // "1kg", "500ml", "12 pack"
  unitPrice: number
  totalPrice: number
  sku: string
  productCategory: 'frozen' | 'chilled' | 'ambient' | 'unclassified'
  confidence: number
  boundingBox?: BoundingBox
}

export interface BoundingBox {
  vertices: Array<{x: number, y: number}>
}

export interface ProductClassification {
  frozen: ClassifiedProduct[]
  chilled: ClassifiedProduct[]
  ambient: ClassifiedProduct[]
  unclassified: ClassifiedProduct[]
  summary: {
    totalProducts: number
    frozenCount: number
    chilledCount: number
    ambientCount: number
    unclassifiedCount: number
    confidence: number
  }
}

export interface ClassifiedProduct {
  name: string
  category: 'frozen' | 'chilled' | 'ambient'
  confidence: number
  temperatureRequirement: {
    min: number
    max: number
    unit: 'C' | 'F'
    critical: boolean
  }
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TemperatureReading {
  value: number
  unit: 'C' | 'F'
  productContext: string
  boundingBox?: BoundingBox
  confidence: number
  complianceStatus: 'pass' | 'fail' | 'warning'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// Comprehensive keyword classification system
const PRODUCT_KEYWORDS = {
  frozen: {
    primary: [
      // Ice cream & desserts
      'ice cream', 'gelato', 'sorbet', 'frozen yogurt', 'ice blocks', 'popsicle',
      
      // Frozen vegetables (NZ specific)
      'frozen vegetables', 'frozen peas', 'frozen corn', 'frozen beans',
      'frozen broccoli', 'frozen spinach', 'frozen carrots', 'frozen mixed veg',
      
      // Frozen meat & poultry
      'frozen meat', 'frozen beef', 'frozen chicken', 'frozen pork', 'frozen lamb',
      'frozen mince', 'frozen sausages', 'frozen bacon',
      
      // Frozen seafood (NZ waters)
      'frozen fish', 'frozen salmon', 'frozen prawns', 'frozen seafood',
      'frozen hoki', 'frozen snapper', 'frozen mussels', 'frozen scallops',
      
      // Frozen fruit & berries
      'frozen fruit', 'frozen berries', 'frozen mango', 'frozen strawberries',
      'frozen blueberries', 'frozen kiwifruit', 'frozen feijoas',
      
      // Frozen prepared foods
      'frozen pizza', 'frozen pastry', 'frozen bread', 'frozen chips', 'frozen pies',
      'frozen meals', 'frozen stir fry', 'frozen hash browns',
      
      // General frozen
      'ice', 'frozen', 'freezer', 'frozen goods', '-18°c', '-18c'
    ],
    secondary: [
      'gelato', 'sorbet', 'ice blocks', 'frozen pizza',
      'frozen pastry', 'frozen bread', 'frozen chips'
    ],
    temperature: { min: -25, max: -15, unit: 'C' as const, critical: true }
  },
  
  chilled: {
    primary: [
      // Dairy products (NZ brands common)
      'milk', 'dairy', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream',
      'sour cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan',
      'feta', 'brie', 'camembert', 'blue cheese', 'ricotta', 'mascarpone',
      'anchor', 'mainland', 'meadow fresh', 'lewis road', 'whitestone',
      
      // Fresh meat & poultry (NZ cuts)
      'fresh meat', 'chicken', 'beef', 'pork', 'lamb', 'sausage',
      'bacon', 'ham', 'turkey', 'duck', 'mince', 'steak', 'roast',
      'chicken breast', 'chicken thigh', 'lamb chops', 'beef mince',
      'pork belly', 'venison', 'hogget', 'free range', 'organic meat',
      
      // Seafood (NZ species)
      'fresh fish', 'salmon', 'tuna', 'prawns', 'oysters', 'mussels',
      'seafood', 'fresh seafood', 'fish fillet', 'hoki', 'snapper',
      'john dory', 'kingfish', 'kahawai', 'tarakihi', 'blue cod',
      'green-lipped mussels', 'paua', 'crayfish', 'whitebait',
      
      // Fresh produce (NZ seasonal)
      'fresh produce', 'salad', 'lettuce', 'spinach', 'herbs', 'watercress',
      'fresh vegetables', 'tomatoes', 'cucumber', 'capsicum', 'kumara',
      'courgette', 'silverbeet', 'bok choy', 'fennel', 'leeks',
      
      // Prepared & deli foods
      'sandwich', 'fresh pasta', 'prepared meal', 'deli', 'salami',
      'pastrami', 'prosciutto', 'fresh juice', 'smoothie', 'kombucha',
      
      // Eggs & other
      'eggs', 'free range eggs', 'quail eggs', 'duck eggs'
    ],
    secondary: [
      'refrigerated', 'chilled', 'cold', 'fresh', 'deli meat'
    ],
    temperature: { min: 0, max: 5, unit: 'C' as const, critical: true }
  },
  
  ambient: {
    primary: [
      // Bakery & grains (NZ brands)
      'bread', 'flour', 'rice', 'pasta', 'noodles', 'cereal', 'tip top',
      'oats', 'quinoa', 'barley', 'biscuits', 'crackers', 'vogels',
      'pita bread', 'wraps', 'bagels', 'muffins', 'croissants',
      
      // Pantry staples (NZ common)
      'oil', 'olive oil', 'coconut oil', 'avocado oil', 'vinegar',
      'sauce', 'tomato sauce', 'watties', 'eta', 'heinz',
      'spices', 'herbs', 'salt', 'pepper', 'sugar', 'brown sugar',
      'stock cubes', 'soy sauce', 'fish sauce', 'oyster sauce',
      
      // Canned goods (NZ brands)
      'canned', 'tinned', 'canned tomatoes', 'canned beans', 'watties',
      'canned fish', 'canned fruit', 'canned corn', 'canned peas',
      'tuna', 'salmon tin', 'baked beans', 'chickpeas', 'kidney beans',
      
      // Dry goods & snacks
      'nuts', 'almonds', 'cashews', 'peanuts', 'dried fruit', 'raisins',
      'chocolate', 'lollies', 'chips', 'biscuits', 'tim tams',
      'coffee', 'tea', 'honey', 'jam', 'peanut butter', 'vegemite',
      'marmite', 'muesli bars', 'crackers', 'rice cakes',
      
      // Long-life products
      'long life milk', 'powdered milk', 'coconut milk', 'almond milk',
      'canned coconut cream', 'tomato paste', 'dried pasta',
      
      // Fresh produce (ambient storage)
      'potatoes', 'onions', 'garlic', 'ginger', 'bananas', 'apples',
      'oranges', 'avocados', 'limes', 'lemons', 'carrots', 'pumpkin'
    ],
    secondary: [
      'dry goods', 'pantry', 'shelf stable', 'ambient', 'room temperature'
    ],
    temperature: { min: 10, max: 25, unit: 'C' as const, critical: false }
  }
}

/**
 * Advanced product classification with confidence scoring
 */
export function classifyProductTemperatureRequirements(
  extractedText: string,
  lineItems?: LineItem[]
): ProductClassification {
  const classification: ProductClassification = {
    frozen: [],
    chilled: [],
    ambient: [],
    unclassified: [],
    summary: {
      totalProducts: 0,
      frozenCount: 0,
      chilledCount: 0,
      ambientCount: 0,
      unclassifiedCount: 0,
      confidence: 0
    }
  }

  // Parse line items if provided, otherwise extract from text
  const products = lineItems || extractProductsFromText(extractedText)
  
  products.forEach(product => {
    const classificationResult = classifyProduct(product.description)
    
    const classifiedProduct: ClassifiedProduct = {
      name: product.description,
      category: classificationResult.category,
      confidence: classificationResult.confidence,
      temperatureRequirement: PRODUCT_KEYWORDS[classificationResult.category]?.temperature || 
        PRODUCT_KEYWORDS.ambient.temperature,
      riskLevel: calculateRiskLevel(classificationResult.category, classificationResult.confidence)
    }

    classification[classificationResult.category].push(classifiedProduct)
  })

  // Calculate summary statistics
  classification.summary = {
    totalProducts: products.length,
    frozenCount: classification.frozen.length,
    chilledCount: classification.chilled.length,
    ambientCount: classification.ambient.length,
    unclassifiedCount: classification.unclassified.length,
    confidence: calculateOverallConfidence(classification)
  }

  return classification
}

/**
 * Classify individual product with confidence scoring
 */
function classifyProduct(description: string): {
  category: 'frozen' | 'chilled' | 'ambient' | 'unclassified'
  confidence: number
} {
  const lowercaseDesc = description.toLowerCase()
  let bestMatch = { category: 'unclassified' as const, confidence: 0 }

  // Check each category
  for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    const categoryKey = category as keyof typeof PRODUCT_KEYWORDS
    
    // Primary keyword matches (high confidence)
    for (const keyword of keywords.primary) {
      if (lowercaseDesc.includes(keyword.toLowerCase())) {
        const confidence = calculateKeywordConfidence(keyword, description, 'primary')
        if (confidence > bestMatch.confidence) {
          bestMatch = { category: categoryKey, confidence }
        }
      }
    }
    
    // Secondary keyword matches (medium confidence)
    for (const keyword of keywords.secondary) {
      if (lowercaseDesc.includes(keyword.toLowerCase())) {
        const confidence = calculateKeywordConfidence(keyword, description, 'secondary')
        if (confidence > bestMatch.confidence) {
          bestMatch = { category: categoryKey, confidence }
        }
      }
    }
  }

  // If no match found, try pattern-based classification
  if (bestMatch.confidence < 0.3) {
    const patternResult = classifyByPatterns(description)
    if (patternResult.confidence > bestMatch.confidence) {
      bestMatch = patternResult
    }
  }

  return bestMatch
}

/**
 * Pattern-based classification for edge cases
 */
function classifyByPatterns(description: string): {
  category: 'frozen' | 'chilled' | 'ambient' | 'unclassified'
  confidence: number
} {
  const lowercaseDesc = description.toLowerCase()

  // Frozen patterns
  if (lowercaseDesc.match(/frozen|ice|freezer|-18|minus/)) {
    return { category: 'frozen', confidence: 0.6 }
  }

  // Chilled patterns  
  if (lowercaseDesc.match(/fresh|chilled|cold|refrigerat/)) {
    return { category: 'chilled', confidence: 0.6 }
  }

  // Ambient patterns
  if (lowercaseDesc.match(/dry|canned|bottled|packaged|shelf/)) {
    return { category: 'ambient', confidence: 0.6 }
  }

  return { category: 'unclassified', confidence: 0 }
}

/**
 * Calculate confidence based on keyword match quality
 */
function calculateKeywordConfidence(
  keyword: string, 
  description: string, 
  matchType: 'primary' | 'secondary'
): number {
  const baseConfidence = matchType === 'primary' ? 0.9 : 0.7
  
  // Boost confidence for exact matches
  if (description.toLowerCase() === keyword.toLowerCase()) {
    return Math.min(baseConfidence + 0.1, 1.0)
  }
  
  // Boost confidence for word boundary matches
  const wordBoundaryRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`)
  if (wordBoundaryRegex.test(description.toLowerCase())) {
    return baseConfidence
  }
  
  // Partial matches get reduced confidence
  return baseConfidence * 0.8
}

/**
 * Calculate risk level for compliance monitoring
 */
function calculateRiskLevel(
  category: 'frozen' | 'chilled' | 'ambient' | 'unclassified',
  confidence: number
): 'low' | 'medium' | 'high' {
  // High risk for temperature-critical items with low confidence
  if ((category === 'frozen' || category === 'chilled') && confidence < 0.7) {
    return 'high'
  }
  
  // Medium risk for temperature-critical items with medium confidence
  if ((category === 'frozen' || category === 'chilled') && confidence < 0.9) {
    return 'medium'
  }
  
  // Low risk for all other cases
  return 'low'
}

/**
 * Calculate overall classification confidence
 */
function calculateOverallConfidence(classification: ProductClassification): number {
  const allProducts = [
    ...classification.frozen,
    ...classification.chilled,
    ...classification.ambient,
    ...classification.unclassified
  ]
  
  if (allProducts.length === 0) return 0
  
  const totalConfidence = allProducts.reduce((sum, product) => sum + product.confidence, 0)
  return Number((totalConfidence / allProducts.length).toFixed(2))
}

/**
 * Enhanced line item analysis - count distinct products, not quantities
 */
export function analyzeLineItemsCount(
  extractedText: string,
  lineItems?: LineItem[]
): {
  distinctProductCount: number
  totalLineItems: number
  confidence: number
  analysis: {
    productNames: string[]
    duplicatesFound: number
    extractionMethod: 'structured_data' | 'text_analysis' | 'hybrid'
  }
} {
  let products: Array<{description: string}> = []
  let extractionMethod: 'structured_data' | 'text_analysis' | 'hybrid' = 'text_analysis'
  
  // Use structured line items if available
  if (lineItems && lineItems.length > 0) {
    products = lineItems.map(item => ({ description: item.description }))
    extractionMethod = 'structured_data'
  } else {
    // Fall back to text analysis
    products = extractProductsFromText(extractedText)
    extractionMethod = 'text_analysis'
  }
  
  // Normalize product names for duplicate detection
  const normalizedProducts = products.map(p => ({
    original: p.description,
    normalized: normalizeProductName(p.description)
  }))
  
  // Count distinct products
  const uniqueProducts = new Set(normalizedProducts.map(p => p.normalized))
  const distinctCount = uniqueProducts.size
  const duplicatesFound = normalizedProducts.length - distinctCount
  
  // Calculate confidence based on extraction method and quality
  let confidence = 0.6 // Base confidence
  if (extractionMethod === 'structured_data') confidence += 0.3
  if (distinctCount > 0) confidence += 0.1
  if (duplicatesFound === 0) confidence += 0.1 // No duplicates suggests clean data
  
  return {
    distinctProductCount: distinctCount,
    totalLineItems: normalizedProducts.length,
    confidence: Math.min(confidence, 1.0),
    analysis: {
      productNames: Array.from(uniqueProducts),
      duplicatesFound,
      extractionMethod
    }
  }
}

/**
 * Normalize product names for duplicate detection
 */
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove quantities and sizes
    .replace(/\d+\s?(kg|g|ml|l|pack|box|dozen|each|ea)\b/gi, '')
    // Remove price indicators
    .replace(/\$[\d.,]+/g, '')
    // Remove common prefixes/suffixes
    .replace(/^(fresh|organic|free\s?range|premium|select)\s+/gi, '')
    .replace(/\s+(fresh|organic|free\s?range|premium|select)$/gi, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract products from raw text when line items not available
 */
function extractProductsFromText(text: string): Array<{description: string}> {
  const products: Array<{description: string}> = []
  const lines = text.split('\n')
  
  // Look for product-like patterns
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip obviously non-product lines
    if (trimmedLine.length < 3 || 
        trimmedLine.match(/^[0-9\s\$\.\-]+$/) ||
        trimmedLine.match(/^(total|subtotal|tax|gst|delivery|freight)/i)) {
      continue
    }
    
    // Look for lines that might contain products
    if (trimmedLine.match(/[a-zA-Z]{3,}/) && trimmedLine.length > 3) {
      products.push({ description: trimmedLine })
    }
  }
  
  return products
}

/**
 * Analyze temperature readings against product requirements
 */
export function analyzeTemperatureCompliance(
  temperatures: TemperatureReading[],
  classification: ProductClassification
): {
  overallCompliance: 'compliant' | 'violation' | 'warning'
  violations: Array<{
    product: string
    temperature: number
    requirement: {min: number, max: number}
    severity: 'critical' | 'major' | 'minor'
  }>
  summary: {
    compliantProducts: number
    violatingProducts: number
    warningProducts: number
  }
} {
  const violations: Array<{
    product: string
    temperature: number
    requirement: {min: number, max: number}
    severity: 'critical' | 'major' | 'minor'
  }> = []

  let compliantCount = 0
  let violationCount = 0
  let warningCount = 0

  // Check each product category
  const allProducts = [
    ...classification.frozen,
    ...classification.chilled,
    ...classification.ambient
  ]

  for (const product of allProducts) {
    const relevantTemps = temperatures.filter(temp => 
      temp.productContext.toLowerCase().includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(temp.productContext.toLowerCase())
    )

    // If no specific temperature found, use general temperature readings
    const tempsToCheck = relevantTemps.length > 0 ? relevantTemps : temperatures

    for (const temp of tempsToCheck) {
      const tempValue = temp.unit === 'F' ? fahrenheitToCelsius(temp.value) : temp.value
      const req = product.temperatureRequirement

      if (tempValue < req.min || tempValue > req.max) {
        const severity = req.critical ? 'critical' : 
                        Math.abs(tempValue - ((req.min + req.max) / 2)) > 5 ? 'major' : 'minor'
        
        violations.push({
          product: product.name,
          temperature: tempValue,
          requirement: { min: req.min, max: req.max },
          severity
        })
        
        violationCount++
      } else if (tempValue >= req.min - 2 && tempValue <= req.max + 2) {
        // Warning zone - close to violation
        warningCount++
      } else {
        compliantCount++
      }
    }
  }

  const overallCompliance = violations.some(v => v.severity === 'critical') ? 'violation' :
                           warningCount > 0 ? 'warning' : 'compliant'

  return {
    overallCompliance,
    violations,
    summary: {
      compliantProducts: compliantCount,
      violatingProducts: violationCount,
      warningProducts: warningCount
    }
  }
}

/**
 * Utility function to convert Fahrenheit to Celsius
 */
function fahrenheitToCelsius(fahrenheit: number): number {
  return Number(((fahrenheit - 32) * 5/9).toFixed(1))
}

/**
 * Export temperature ranges for external validation
 */
export const TEMPERATURE_RANGES = {
  frozen: PRODUCT_KEYWORDS.frozen.temperature,
  chilled: PRODUCT_KEYWORDS.chilled.temperature,
  ambient: PRODUCT_KEYWORDS.ambient.temperature
}