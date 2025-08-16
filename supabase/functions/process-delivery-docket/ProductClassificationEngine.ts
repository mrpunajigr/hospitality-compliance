// Enhanced Product Classification Engine for Google Document AI
// Classifies extracted products by temperature requirements and business categories

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
      'ice cream', 'gelato', 'sorbet', 'frozen yogurt',
      'frozen vegetables', 'frozen peas', 'frozen corn', 'frozen beans',
      'frozen meat', 'frozen beef', 'frozen chicken', 'frozen pork',
      'frozen fish', 'frozen salmon', 'frozen prawns', 'frozen seafood',
      'frozen fruit', 'frozen berries', 'frozen mango',
      'ice', 'frozen', 'freezer', 'frozen goods'
    ],
    secondary: [
      'gelato', 'sorbet', 'ice blocks', 'frozen pizza',
      'frozen pastry', 'frozen bread', 'frozen chips'
    ],
    temperature: { min: -25, max: -15, unit: 'C' as const, critical: true }
  },
  
  chilled: {
    primary: [
      // Dairy products
      'milk', 'dairy', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream',
      'sour cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan',
      
      // Fresh meat & poultry  
      'fresh meat', 'chicken', 'beef', 'pork', 'lamb', 'sausage',
      'bacon', 'ham', 'turkey', 'duck', 'mince', 'steak',
      
      // Seafood
      'fresh fish', 'salmon', 'tuna', 'prawns', 'oysters', 'mussels',
      'seafood', 'fresh seafood', 'fish fillet',
      
      // Fresh produce
      'fresh produce', 'salad', 'lettuce', 'spinach', 'herbs',
      'fresh vegetables', 'tomatoes', 'cucumber', 'capsicum',
      
      // Prepared foods
      'sandwich', 'fresh pasta', 'prepared meal', 'deli'
    ],
    secondary: [
      'refrigerated', 'chilled', 'cold', 'fresh', 'deli meat'
    ],
    temperature: { min: 0, max: 5, unit: 'C' as const, critical: true }
  },
  
  ambient: {
    primary: [
      // Bakery & grains
      'bread', 'flour', 'rice', 'pasta', 'noodles', 'cereal',
      'oats', 'quinoa', 'barley', 'biscuits', 'crackers',
      
      // Pantry staples
      'oil', 'olive oil', 'vinegar', 'sauce', 'tomato sauce',
      'spices', 'herbs', 'salt', 'pepper', 'sugar',
      
      // Canned goods
      'canned', 'tinned', 'canned tomatoes', 'canned beans',
      'canned fish', 'canned fruit',
      
      // Dry goods
      'nuts', 'almonds', 'cashews', 'dried fruit', 'raisins',
      'chocolate', 'coffee', 'tea', 'honey', 'jam'
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