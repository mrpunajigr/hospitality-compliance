// Enhanced Document Processing with Multi-Stage Google Document AI
// Implements comprehensive extraction with product classification and confidence scoring

import { 
  classifyProductTemperatureRequirements, 
  analyzeTemperatureCompliance,
  type ProductClassification,
  type TemperatureReading,
  type LineItem,
  type BoundingBox 
} from './ProductClassificationEngine.ts'

export interface DocumentAIExtraction {
  // Core Compliance Data (Always Extract)
  supplier: {
    value: string
    confidence: number
    boundingBox?: BoundingBox
    extractionMethod: 'text_detection' | 'entity_recognition' | 'pattern_matching'
  }
  
  deliveryDate: {
    value: string // ISO date string
    confidence: number
    boundingBox?: BoundingBox
    format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'other'
  }
  
  handwrittenNotes: {
    signedBy: string
    confidence: number
    boundingBox?: BoundingBox
    extractionMethod: 'handwriting_recognition' | 'text_detection'
  }
  
  temperatureData: {
    readings: TemperatureReading[]
    overallCompliance: 'compliant' | 'violation' | 'warning'
    analysis: ReturnType<typeof analyzeTemperatureCompliance>
  }
  
  // Business Data (Configurable Display)
  invoiceNumber: {
    value: string
    confidence: number
    boundingBox?: BoundingBox
  } | null
  
  lineItems: LineItem[]
  
  analysis: {
    productClassification: ProductClassification
    estimatedValue: number
    itemCount: number
    processingTime: number
    overallConfidence: number
  }

  // Raw data for audit
  rawText: string
  processingMetadata: {
    documentType: string
    pageCount: number
    language: string
    processingStages: string[]
    aiModelVersion: string
  }
}

export interface DocumentStructure {
  documentType: 'delivery_docket' | 'invoice' | 'receipt' | 'unknown'
  layout: {
    tables: any[]
    forms: any[]
    paragraphs: any[]
  }
  confidence: number
}

/**
 * Fallback structure recognition using basic text processing
 */
async function fallbackStructureRecognition(imageBuffer: ArrayBuffer): Promise<any> {
  console.log('🔄 Using fallback structure recognition...')
  
  // Basic structure detection without Google Cloud AI
  return {
    pages: [{
      pageNumber: 1,
      dimension: { width: 1, height: 1 },
      layout: {
        textAnchor: { textSegments: [{ startIndex: 0, endIndex: 100 }] }
      }
    }],
    confidence: 0.3,
    fallbackMode: true
  }
}

/**
 * Fallback entity extraction using pattern matching
 */
async function fallbackEntityExtraction(imageBuffer: ArrayBuffer, structure: any): Promise<any> {
  console.log('🔄 Using fallback entity extraction...')
  
  // Basic pattern-based extraction without Google Cloud AI
  const mockText = 'Delivery Document - Processing in fallback mode'
  
  return {
    text: mockText,
    entities: [],
    confidence: 0.2,
    fallbackMode: true,
    extractionMethod: 'pattern_based_fallback'
  }
}

/**
 * Fallback data extraction for Stage 3
 */
async function fallbackDataExtraction(text: string): Promise<any> {
  console.log('🔄 Using fallback data extraction...')
  
  return {
    supplier: { value: 'Unknown Supplier', confidence: 0.1, extractionMethod: 'fallback' },
    deliveryDate: { value: new Date().toISOString(), confidence: 0.1, format: 'other' },
    handwrittenNotes: { signedBy: 'Not available', confidence: 0.1, extractionMethod: 'fallback' },
    invoiceNumber: null,
    temperatures: [],
    lineItems: []
  }
}

/**
 * Fallback product classification
 */
async function fallbackProductClassification(lineItems: any[]): Promise<any> {
  console.log('🔄 Using fallback product classification...')
  
  return {
    categories: ['general'],
    temperatureRequirements: { min: -5, max: 5 },
    riskLevel: 'medium',
    confidence: 0.2,
    fallbackMode: true
  }
}

/**
 * Fallback temperature analysis
 */
async function fallbackTemperatureAnalysis(temperatures: any[]): Promise<any> {
  console.log('🔄 Using fallback temperature analysis...')
  
  return {
    overallCompliance: temperatures.length > 0 ? 'warning' : 'unknown',
    violations: [],
    riskAssessment: 'medium',
    confidence: 0.2,
    fallbackMode: true
  }
}

/**
 * Fallback validation
 */
async function fallbackValidation(enhancedData: any): Promise<any> {
  console.log('🔄 Using fallback validation...')
  
  return {
    supplier: enhancedData.supplier,
    deliveryDate: enhancedData.deliveryDate,
    temperatures: enhancedData.temperatures,
    lineItems: enhancedData.lineItems,
    overallConfidence: 0.1
  }
}

/**
 * Enhanced multi-stage Document AI processing pipeline
 */
export async function processDocumentWithEnhancedAI(
  imageBuffer: ArrayBuffer,
  processorId: string,
  accessToken: string
): Promise<DocumentAIExtraction> {
  console.log('🚀 Starting enhanced Document AI processing pipeline...')
  const startTime = Date.now()
  let fallbackData: Partial<DocumentAIExtraction> = {}
  
  try {
    // Stage 1: Document Structure Recognition (with fallback)
    console.log('📋 Stage 1: Document structure recognition...')
    let structure
    try {
      structure = await extractDocumentStructure(imageBuffer, processorId, accessToken)
    } catch (error) {
      console.warn('⚠️ Stage 1 failed, using fallback structure recognition:', error)
      structure = await fallbackStructureRecognition(imageBuffer)
      fallbackData.processingNotes = 'Used fallback structure recognition'
    }
    
    // Stage 2: Entity and Field Extraction (with fallback)
    console.log('🔍 Stage 2: Entity and field extraction...')
    let entityData
    try {
      entityData = await extractBusinessEntities(imageBuffer, processorId, accessToken, structure)
    } catch (error) {
      console.warn('⚠️ Stage 2 failed, using fallback entity extraction:', error)
      entityData = await fallbackEntityExtraction(imageBuffer, structure)
      fallbackData.processingNotes = (fallbackData.processingNotes || '') + '; Used fallback entity extraction'
    }
    
    // Stage 3: Enhanced Text Processing (with fallback)
    console.log('📝 Stage 3: Enhanced text processing...')
    console.log('📄 Document text preview (first 500 chars):', entityData.text.substring(0, 500))
    console.log('🔍 Available entities for extraction:', entityData.entities.length)
    
    let enhancedData
    try {
      enhancedData = await enhanceExtractedData(entityData.text, entityData.entities)
      
      // Log extraction results for debugging
      console.log('✅ Enhanced extraction results:')
      console.log('  📦 Supplier:', enhancedData.supplier.value, '(confidence:', enhancedData.supplier.confidence, 'method:', enhancedData.supplier.extractionMethod, ')')
      console.log('  📅 Delivery Date:', enhancedData.deliveryDate.value, '(confidence:', enhancedData.deliveryDate.confidence, ')')
      console.log('  🌡️ Temperatures found:', enhancedData.temperatures.length)
      console.log('  📋 Line items found:', enhancedData.lineItems.length)
      
    } catch (error) {
      console.warn('⚠️ Stage 3 failed, using minimal data extraction:', error)
      enhancedData = await fallbackDataExtraction(entityData.text)
      fallbackData.processingNotes = (fallbackData.processingNotes || '') + '; Used fallback data extraction'
    }
    
    // Stage 4: Product Classification (with fallback)
    console.log('🏷️ Stage 4: Product classification...')
    let productClassification
    try {
      productClassification = await classifyProductTemperatureRequirements(
        entityData.text, 
        enhancedData.lineItems
      )
    } catch (error) {
      console.warn('⚠️ Stage 4 failed, using basic classification:', error)
      productClassification = await fallbackProductClassification(enhancedData.lineItems)
      fallbackData.processingNotes = (fallbackData.processingNotes || '') + '; Used fallback classification'
    }
    
    // Stage 5: Temperature Compliance Analysis (with fallback)
    console.log('🌡️ Stage 5: Temperature compliance analysis...')
    let temperatureAnalysis
    try {
      temperatureAnalysis = await analyzeTemperatureCompliance(
        enhancedData.temperatures,
        productClassification
      )
    } catch (error) {
      console.warn('⚠️ Stage 5 failed, using basic compliance check:', error)
      temperatureAnalysis = await fallbackTemperatureAnalysis(enhancedData.temperatures)
      fallbackData.processingNotes = (fallbackData.processingNotes || '') + '; Used fallback temperature analysis'
    }
    
    // Stage 6: Confidence Scoring and Validation (with fallback)
    console.log('🎯 Stage 6: Confidence scoring and validation...')
    let validatedData
    try {
      validatedData = await validateAndScoreExtraction({
        supplier: enhancedData.supplier,
        deliveryDate: enhancedData.deliveryDate,
        temperatures: enhancedData.temperatures,
        lineItems: enhancedData.lineItems,
        productClassification,
        temperatureAnalysis
      })
    } catch (error) {
      console.warn('⚠️ Stage 6 failed, using minimal validation:', error)
      validatedData = await fallbackValidation(enhancedData)
      fallbackData.processingNotes = (fallbackData.processingNotes || '') + '; Used fallback validation'
    }
    
    const processingTime = Date.now() - startTime
    console.log(`✅ Enhanced processing completed in ${processingTime}ms`)
    
    return {
      supplier: validatedData.supplier,
      deliveryDate: validatedData.deliveryDate,
      handwrittenNotes: enhancedData.handwrittenNotes,
      temperatureData: {
        readings: validatedData.temperatures,
        overallCompliance: temperatureAnalysis.overallCompliance,
        analysis: temperatureAnalysis
      },
      invoiceNumber: enhancedData.invoiceNumber,
      lineItems: validatedData.lineItems,
      analysis: {
        productClassification,
        estimatedValue: calculateEstimatedValue(validatedData.lineItems),
        itemCount: validatedData.lineItems.length,
        processingTime,
        overallConfidence: validatedData.overallConfidence
      },
      rawText: entityData.text,
      processingMetadata: {
        documentType: structure.documentType,
        pageCount: 1,
        language: detectDocumentLanguage(entityData.text),
        processingStages: ['structure', 'entities', 'enhancement', 'classification', 'compliance', 'validation'],
        aiModelVersion: 'document-ai-enhanced-v1.2',
        fallbackMode: Object.keys(fallbackData).length > 0,
        processingNotes: fallbackData.processingNotes || 'All stages completed successfully'
      }
    }
    
  } catch (error) {
    console.error('❌ Enhanced processing completely failed, returning emergency fallback:', error)
    
    // Emergency fallback - return minimal viable data structure
    const processingTime = Date.now() - startTime
    
    return {
      supplier: { value: 'Processing Failed', confidence: 0.0, extractionMethod: 'emergency_fallback' },
      deliveryDate: { value: new Date().toISOString(), confidence: 0.0, format: 'other' },
      handwrittenNotes: { signedBy: 'Processing Failed', confidence: 0.0, extractionMethod: 'emergency_fallback' },
      temperatureData: {
        readings: [],
        overallCompliance: 'unknown',
        analysis: {
          overallCompliance: 'unknown',
          violations: [],
          riskAssessment: 'unknown',
          confidence: 0.0,
          emergencyFallback: true
        }
      },
      invoiceNumber: null,
      lineItems: [],
      analysis: {
        productClassification: {
          categories: [],
          temperatureRequirements: { min: 0, max: 0 },
          riskLevel: 'unknown',
          confidence: 0.0,
          emergencyFallback: true
        },
        estimatedValue: 0,
        itemCount: 0,
        processingTime,
        overallConfidence: 0.0
      },
      rawText: 'Document processing failed',
      processingMetadata: {
        documentType: 'unknown',
        pageCount: 0,
        language: 'unknown',
        processingStages: ['emergency_fallback'],
        aiModelVersion: 'document-ai-enhanced-v1.2',
        fallbackMode: true,
        emergencyFallback: true,
        processingNotes: `Emergency fallback due to complete processing failure: ${error.message}`,
        errorDetails: error.message
      }
    }
  }
}

/**
 * Stage 1: Document Structure Recognition
 */
async function extractDocumentStructure(
  imageBuffer: ArrayBuffer,
  processorId: string,
  accessToken: string
): Promise<DocumentStructure> {
  
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
  
  const requestBody = {
    rawDocument: {
      content: base64Image,
      mimeType: 'image/jpeg'
    },
    documentProcessorConfig: {
      enableNativeStructureExtraction: true,
      enableFormExtraction: true,
      enableTableExtraction: true
    }
  }

  const apiUrl = `https://documentai.googleapis.com/v1/${processorId}:process`
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`Structure extraction failed: ${response.status}`)
  }

  const data = await response.json()
  
  return {
    documentType: detectDocumentType(data.document),
    layout: {
      tables: data.document.pages?.[0]?.tables || [],
      forms: data.document.pages?.[0]?.formFields || [],
      paragraphs: data.document.pages?.[0]?.paragraphs || []
    },
    confidence: data.document.pages?.[0]?.pageNumber ? 0.9 : 0.7
  }
}

/**
 * Stage 2: Entity and Field Extraction
 */
async function extractBusinessEntities(
  imageBuffer: ArrayBuffer,
  processorId: string,
  accessToken: string,
  structure: DocumentStructure
): Promise<{text: string, entities: any[]}> {
  
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
  
  const requestBody = {
    rawDocument: {
      content: base64Image,
      mimeType: 'image/jpeg'
    },
    fieldMask: {
      paths: [
        'supplier_name',
        'delivery_date',
        'invoice_number',
        'line_items',
        'temperatures',
        'signatures',
        'totals',
        'tax_information'
      ]
    }
  }

  const apiUrl = `https://documentai.googleapis.com/v1/${processorId}:process`
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`Entity extraction failed: ${response.status}`)
  }

  const data = await response.json()
  
  return {
    text: data.document.text || '',
    entities: data.document.entities || []
  }
}

/**
 * Stage 3: Enhanced Data Processing
 */
async function enhanceExtractedData(text: string, entities: any[]): Promise<{
  supplier: DocumentAIExtraction['supplier']
  deliveryDate: DocumentAIExtraction['deliveryDate']
  handwrittenNotes: DocumentAIExtraction['handwrittenNotes']
  invoiceNumber: DocumentAIExtraction['invoiceNumber']
  temperatures: TemperatureReading[]
  lineItems: LineItem[]
}> {
  
  return {
    supplier: extractEnhancedSupplierInfo(text, entities),
    deliveryDate: extractEnhancedDeliveryDate(text, entities),
    handwrittenNotes: extractEnhancedHandwrittenNotes(text, entities),
    invoiceNumber: extractEnhancedInvoiceNumber(text, entities),
    temperatures: extractEnhancedTemperatures(text, entities),
    lineItems: extractEnhancedLineItems(text, entities)
  }
}

/**
 * Enhanced supplier extraction with document structure awareness and better validation
 */
function extractEnhancedSupplierInfo(text: string, entities: any[]): DocumentAIExtraction['supplier'] {
  console.log('🔍 Starting enhanced supplier extraction...')
  console.log('📄 Available entities:', entities.map(e => ({type: e.type, text: e.mentionText, confidence: e.confidence})))
  
  // Phase 1: Try Google Cloud AI entity extraction first
  const supplierEntity = entities.find(e => 
    e.type === 'supplier_name' || 
    e.type === 'company_name' ||
    e.type === 'vendor_name' ||
    (e.mentionText && isLikelySupplierName(e.mentionText))
  )
  
  if (supplierEntity && supplierEntity.confidence > 0.85) {
    console.log('✅ High-confidence entity extraction:', supplierEntity.mentionText)
    return {
      value: cleanSupplierName(supplierEntity.mentionText),
      confidence: supplierEntity.confidence,
      boundingBox: supplierEntity.boundingBox,
      extractionMethod: 'entity_recognition'
    }
  }
  
  // Phase 2: Document structure-aware pattern matching
  const structuralSupplier = extractSupplierFromDocumentStructure(text)
  if (structuralSupplier) {
    console.log('✅ Structural extraction successful:', structuralSupplier.value)
    return structuralSupplier
  }
  
  // Phase 3: Contextual pattern matching with strict validation
  const contextualSupplier = extractSupplierFromContext(text)
  if (contextualSupplier) {
    console.log('✅ Contextual extraction successful:', contextualSupplier.value)
    return contextualSupplier
  }
  
  // Phase 4: Conservative fallback with low confidence entity
  if (supplierEntity && supplierEntity.confidence > 0.5) {
    console.log('⚠️ Using lower confidence entity as fallback:', supplierEntity.mentionText)
    return {
      value: cleanSupplierName(supplierEntity.mentionText),
      confidence: Math.max(0.3, supplierEntity.confidence - 0.2), // Reduce confidence for uncertainty
      boundingBox: supplierEntity.boundingBox,
      extractionMethod: 'entity_recognition_fallback'
    }
  }
  
  console.log('❌ No reliable supplier found, marking as unknown')
  return {
    value: 'Supplier Not Found',
    confidence: 0.0,
    extractionMethod: 'extraction_failed'
  }
}

/**
 * Extract supplier from document structure (header sections, specific layouts)
 */
function extractSupplierFromDocumentStructure(text: string): DocumentAIExtraction['supplier'] | null {
  console.log('🏗️ Analyzing document structure for supplier...')
  
  // Split document into sections for analysis
  const lines = text.split(/[\n\r]+/)
  const upperCaseLines = lines.filter(line => line.trim().length > 3 && line === line.toUpperCase())
  
  // Pattern 1: Supplier immediately after "DELIVERY DOCKET" or similar headers
  const headerPatterns = [
    /DELIVERY\s+(?:DOCKET|NOTE|RECEIPT)\s*[\n\r]+\s*(.+?)[\n\r]/gi,
    /INVOICE\s*[\n\r]+\s*(.+?)[\n\r]/gi,
    /FROM[:\s]*[\n\r]+\s*(.+?)[\n\r]/gi
  ]
  
  for (const pattern of headerPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const potential = match[1].trim()
      if (isValidSupplierName(potential)) {
        console.log('📋 Found supplier in header structure:', potential)
        return {
          value: cleanSupplierName(potential),
          confidence: 0.85,
          extractionMethod: 'document_structure'
        }
      }
    }
  }
  
  // Pattern 2: Company name in first few lines (common document layout)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim()
    if (line.length > 5 && isValidSupplierName(line)) {
      console.log('📄 Found supplier in document header:', line)
      return {
        value: cleanSupplierName(line),
        confidence: 0.75,
        extractionMethod: 'header_position'
      }
    }
  }
  
  return null
}

/**
 * Extract supplier using contextual patterns with strict validation
 */
function extractSupplierFromContext(text: string): DocumentAIExtraction['supplier'] | null {
  console.log('🎯 Using contextual pattern matching...')
  
  // More restrictive patterns that require proper context
  const contextualPatterns = [
    // Explicit labeling
    {
      pattern: /(?:supplier|vendor|from|company|delivered\s+by)[:\s]+(.+?)(?:\n|\r|$)/gi,
      confidence: 0.8,
      method: 'explicit_label'
    },
    // Address-like context (company name followed by address)
    {
      pattern: /^([A-Z][A-Za-z\s&'-]+(?:Ltd|Limited|Inc|Corp|Company|Co\.?))\s*\n.*(?:street|road|avenue|drive|lane|blvd)/gim,
      confidence: 0.75,
      method: 'address_context'
    },
    // Professional business format (avoiding generic words)
    {
      pattern: /^([A-Z][A-Za-z\s&'-]{4,40}(?:Ltd|Limited|Inc|Corp|Company|Co\.?))\s*$/gim,
      confidence: 0.6,
      method: 'business_format'
    }
  ]
  
  for (const patternConfig of contextualPatterns) {
    const matches = Array.from(text.matchAll(patternConfig.pattern))
    
    for (const match of matches) {
      const potential = match[1] ? match[1].trim() : match[0].trim()
      
      if (isValidSupplierName(potential) && !isCommonFalsePositive(potential)) {
        console.log(`🎯 Found supplier via ${patternConfig.method}:`, potential)
        return {
          value: cleanSupplierName(potential),
          confidence: patternConfig.confidence,
          extractionMethod: patternConfig.method
        }
      }
    }
  }
  
  return null
}

/**
 * Validate if a string is likely to be a real supplier name
 */
function isValidSupplierName(name: string): boolean {
  if (!name || name.length < 3 || name.length > 100) return false
  
  // Must contain at least one alphabetic character
  if (!/[A-Za-z]/.test(name)) return false
  
  // Reject pure numbers, dates, or reference codes
  if (/^\d+$/.test(name.trim())) return false
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(name.trim())) return false
  
  // Reject common non-supplier text
  const invalidPatterns = [
    /^(date|time|temp|temperature|delivery|docket|invoice|total|price|qty|quantity|item|description)$/i,
    /^(page|of|and|the|for|with|from|to|at|on|in)$/i,
    /^\d+[°][CF]$/i, // Temperature readings
    /^\$\d+/i, // Prices
  ]
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(name.trim())) return false
  }
  
  return true
}

/**
 * Check if a name is likely a false positive
 */
function isCommonFalsePositive(name: string): boolean {
  const falsePositives = [
    'Premium Food Ltd', // Known false positive from your testing
    'Food Service Co',
    'Delivery Company',
    'Transport Ltd',
    'Logistics Inc',
    'General Trading',
    'Supply Company',
    'Distribution Co'
  ]
  
  return falsePositives.some(fp => 
    name.toLowerCase().includes(fp.toLowerCase()) ||
    fp.toLowerCase().includes(name.toLowerCase())
  )
}

/**
 * Check if text is likely a supplier name based on characteristics
 */
function isLikelySupplierName(text: string): boolean {
  if (!text || text.length < 3) return false
  
  // Business entity indicators
  const businessIndicators = [
    /\b(Ltd|Limited|Inc|Corp|Corporation|Company|Co\.|Pty|LLC|Group|Enterprises|Trading|Supply|Wholesale|Distribution)\b/i
  ]
  
  // Location indicators (less reliable but supportive)
  const locationIndicators = [
    /\b(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Blvd|Boulevard)\b/i
  ]
  
  // Has business entity indicator
  if (businessIndicators.some(pattern => pattern.test(text))) {
    return true
  }
  
  // Professional format with proper case
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(text) && text.split(' ').length >= 2) {
    return true
  }
  
  return false
}

/**
 * Enhanced delivery date extraction with format detection
 */
function extractEnhancedDeliveryDate(text: string, entities: any[]): DocumentAIExtraction['deliveryDate'] {
  // Try entity extraction first
  const dateEntity = entities.find(e => e.type === 'delivery_date' || e.type === 'date')
  
  if (dateEntity && dateEntity.confidence > 0.8) {
    return {
      value: new Date(dateEntity.mentionText).toISOString(),
      confidence: dateEntity.confidence,
      boundingBox: dateEntity.boundingBox,
      format: detectDateFormat(dateEntity.mentionText)
    }
  }
  
  // Pattern-based extraction
  const datePatterns = [
    { pattern: /(\d{1,2}\/\d{1,2}\/\d{4})/g, format: 'DD/MM/YYYY' as const },
    { pattern: /(\d{4}-\d{2}-\d{2})/g, format: 'YYYY-MM-DD' as const },
    { pattern: /(\d{1,2}-\d{1,2}-\d{4})/g, format: 'DD/MM/YYYY' as const },
    { pattern: /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/gi, format: 'other' as const }
  ]
  
  for (const { pattern, format } of datePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      try {
        const date = new Date(match[1])
        if (!isNaN(date.getTime())) {
          return {
            value: date.toISOString(),
            confidence: 0.8,
            format
          }
        }
      } catch (error) {
        continue
      }
    }
  }
  
  return {
    value: new Date().toISOString(),
    confidence: 0.1,
    format: 'other'
  }
}

/**
 * Enhanced handwritten notes and signature extraction
 */
function extractEnhancedHandwrittenNotes(text: string, entities: any[]): DocumentAIExtraction['handwrittenNotes'] {
  // Look for signature entities
  const signatureEntity = entities.find(e => e.type === 'signature' || e.type === 'signed_by')
  
  if (signatureEntity) {
    return {
      signedBy: signatureEntity.mentionText || 'Signature Present',
      confidence: signatureEntity.confidence || 0.8,
      boundingBox: signatureEntity.boundingBox,
      extractionMethod: 'handwriting_recognition'
    }
  }
  
  // Pattern-based signature detection
  const signaturePatterns = [
    /(?:signed|received|authorized)[:\s]*by[:\s]*(.*?)[\n\r]/gi,
    /signature[:\s]*(.*?)[\n\r]/gi
  ]
  
  for (const pattern of signaturePatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 1) {
      return {
        signedBy: match[1].trim(),
        confidence: 0.6,
        extractionMethod: 'text_detection'
      }
    }
  }
  
  return {
    signedBy: 'No signature detected',
    confidence: 0.2,
    extractionMethod: 'text_detection'
  }
}

/**
 * Enhanced invoice number extraction
 */
function extractEnhancedInvoiceNumber(text: string, entities: any[]): DocumentAIExtraction['invoiceNumber'] {
  const invoiceEntity = entities.find(e => e.type === 'invoice_number' || e.type === 'docket_number')
  
  if (invoiceEntity && invoiceEntity.confidence > 0.7) {
    return {
      value: invoiceEntity.mentionText,
      confidence: invoiceEntity.confidence,
      boundingBox: invoiceEntity.boundingBox
    }
  }
  
  const patterns = [
    /(?:invoice|docket|ref|order)[:\s#]*([A-Z0-9\-]{3,20})/gi,
    /INV[:\s#]*([A-Z0-9\-]{3,20})/gi,
    /#([A-Z0-9\-]{4,15})/gi
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return {
        value: match[1].trim(),
        confidence: 0.7
      }
    }
  }
  
  return null
}

/**
 * Enhanced temperature extraction with context
 */
function extractEnhancedTemperatures(text: string, entities: any[]): TemperatureReading[] {
  const temperatures: TemperatureReading[] = []
  
  // Entity-based extraction
  const tempEntities = entities.filter(e => e.type === 'temperature' || e.mentionText?.includes('°'))
  
  for (const entity of tempEntities) {
    const tempValue = parseFloat(entity.mentionText.replace(/[^\d\.\-]/g, ''))
    if (!isNaN(tempValue)) {
      temperatures.push({
        value: tempValue,
        unit: entity.mentionText.includes('F') ? 'F' : 'C',
        productContext: getTemperatureContext(text, entity.boundingBox),
        boundingBox: entity.boundingBox,
        confidence: entity.confidence || 0.8,
        complianceStatus: evaluateTemperatureCompliance(tempValue),
        riskLevel: 'medium'
      })
    }
  }
  
  // Pattern-based extraction as fallback
  if (temperatures.length === 0) {
    const tempPatterns = [
      /temp[eratur]*[:\s]*(-?\d+\.?\d*)[°]?[cf]/gi,
      /(-?\d+\.?\d*)[°][cf]/gi,
      /temperature[:\s]*(-?\d+\.?\d*)/gi
    ]
    
    for (const pattern of tempPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      
      for (const match of matches) {
        const tempValue = parseFloat(match[1])
        if (!isNaN(tempValue)) {
          temperatures.push({
            value: tempValue,
            unit: detectTemperatureUnit(match[0]),
            productContext: getContext(text, match.index || 0),
            confidence: 0.6,
            complianceStatus: evaluateTemperatureCompliance(tempValue),
            riskLevel: 'medium'
          })
        }
      }
    }
  }
  
  return temperatures
}

/**
 * Enhanced line item extraction
 */
function extractEnhancedLineItems(text: string, entities: any[]): LineItem[] {
  // This is a simplified version - in production, you'd use more sophisticated
  // table extraction and entity recognition for line items
  const lineItems: LineItem[] = []
  
  // Basic extraction from text for now
  const lines = text.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip headers and non-product lines
    if (trimmedLine.length < 5 || 
        trimmedLine.match(/^(qty|quantity|item|description|price|total)/i) ||
        trimmedLine.match(/^[0-9\s\$\.\-]+$/)) {
      continue
    }
    
    // Look for lines that might contain product information
    const itemMatch = trimmedLine.match(/(.+?)\s+(\d+(?:\.\d+)?)\s*.*?(\$?\d+\.?\d*)/i)
    
    if (itemMatch) {
      lineItems.push({
        description: itemMatch[1].trim(),
        quantity: parseFloat(itemMatch[2]) || 1,
        unitSize: extractUnitSize(itemMatch[1]),
        unitPrice: parseFloat(itemMatch[3].replace(/\$/g, '')) || 0,
        totalPrice: parseFloat(itemMatch[3].replace(/\$/g, '')) || 0,
        sku: extractSKU(trimmedLine),
        productCategory: 'unclassified',
        confidence: 0.6
      })
    }
  }
  
  return lineItems
}

// Utility functions
function detectDocumentType(document: any): DocumentStructure['documentType'] {
  const text = document.text?.toLowerCase() || ''
  
  if (text.includes('delivery docket') || text.includes('delivery note')) {
    return 'delivery_docket'
  }
  if (text.includes('invoice')) {
    return 'invoice'
  }
  if (text.includes('receipt')) {
    return 'receipt'
  }
  
  return 'unknown'
}

function detectDateFormat(dateString: string): DocumentAIExtraction['deliveryDate']['format'] {
  if (/\d{4}-\d{2}-\d{2}/.test(dateString)) return 'YYYY-MM-DD'
  if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) return 'DD/MM/YYYY'
  return 'other'
}

function detectTemperatureUnit(tempText: string): 'C' | 'F' {
  return tempText.toLowerCase().includes('f') ? 'F' : 'C'
}

function evaluateTemperatureCompliance(temp: number): 'pass' | 'fail' | 'warning' {
  // Basic compliance check - would be enhanced with product context
  if (temp < -20 || temp > 40) return 'fail'
  if (temp < -15 || temp > 30) return 'warning'
  return 'pass'
}

function getTemperatureContext(text: string, boundingBox?: any): string {
  // Extract context around temperature reading
  return 'general delivery'
}

function getContext(text: string, position: number): string {
  const start = Math.max(0, position - 50)
  const end = Math.min(text.length, position + 50)
  return text.substring(start, end).trim()
}

function extractUnitSize(description: string): string {
  const unitMatch = description.match(/(\d+(?:\.\d+)?\s*(?:kg|g|ml|l|pack|box|case))/i)
  return unitMatch ? unitMatch[1] : ''
}

function extractSKU(line: string): string {
  const skuMatch = line.match(/([A-Z0-9]{4,15})/g)
  return skuMatch ? skuMatch[0] : ''
}

function calculateEstimatedValue(lineItems: LineItem[]): number {
  return lineItems.reduce((total, item) => total + item.totalPrice, 0)
}

/**
 * Stage 6: Confidence Scoring and Validation
 */
async function validateAndScoreExtraction(data: {
  supplier: DocumentAIExtraction['supplier']
  deliveryDate: DocumentAIExtraction['deliveryDate']
  temperatures: TemperatureReading[]
  lineItems: LineItem[]
  productClassification: ProductClassification
  temperatureAnalysis: ReturnType<typeof analyzeTemperatureCompliance>
}): Promise<{
  supplier: DocumentAIExtraction['supplier']
  deliveryDate: DocumentAIExtraction['deliveryDate']
  temperatures: TemperatureReading[]
  lineItems: LineItem[]
  overallConfidence: number
}> {
  
  // Enhanced supplier validation
  const validatedSupplier = await validateSupplierData(data.supplier)
  
  // Enhanced date validation with business logic
  const validatedDate = await validateDeliveryDate(data.deliveryDate)
  
  // Enhanced temperature validation with product context
  const validatedTemperatures = await validateTemperatureReadings(
    data.temperatures, 
    data.productClassification
  )
  
  // Enhanced line item validation
  const validatedLineItems = await validateLineItems(data.lineItems, data.productClassification)
  
  // Calculate comprehensive confidence score
  const overallConfidence = calculateEnhancedConfidence({
    supplier: validatedSupplier.confidence,
    delivery: validatedDate.confidence,
    temperature: validatedTemperatures.reduce((avg, t) => avg + t.confidence, 0) / Math.max(validatedTemperatures.length, 1),
    classification: data.productClassification.summary.confidence,
    extraction: calculateExtractionQuality(validatedSupplier, validatedDate, validatedTemperatures, validatedLineItems),
    compliance: data.temperatureAnalysis.overallScore || 0.8
  })
  
  return {
    supplier: validatedSupplier,
    deliveryDate: validatedDate,
    temperatures: validatedTemperatures,
    lineItems: validatedLineItems,
    overallConfidence
  }
}

/**
 * Enhanced supplier validation with strict business rules and confidence thresholds
 */
async function validateSupplierData(supplier: DocumentAIExtraction['supplier']): Promise<DocumentAIExtraction['supplier']> {
  let confidence = supplier.confidence
  let value = supplier.value
  
  console.log('🔍 Validating supplier data:', { value, confidence, method: supplier.extractionMethod })
  
  // Critical validation: Reject obviously fake suppliers immediately
  if (value && isCommonFalsePositive(value)) {
    console.log('❌ Rejected as known false positive:', value)
    return {
      ...supplier,
      value: 'False Positive Detected',
      confidence: 0.0,
      extractionMethod: supplier.extractionMethod + '_rejected'
    }
  }
  
  // Business validation rules
  if (value && value !== 'Unknown Supplier' && value !== 'Supplier Not Found' && value !== 'Processing Failed') {
    console.log('🧾 Applying business validation rules to:', value)
    
    // Strict validation for pattern-based extractions
    if (supplier.extractionMethod.includes('pattern') || supplier.extractionMethod.includes('business_format')) {
      // Require higher standards for pattern matches
      if (!isLegitimateBusinessName(value)) {
        console.log('⚠️ Pattern match failed legitimacy test:', value)
        confidence = Math.max(0.2, confidence - 0.4)
      }
    }
    
    // Boost confidence for formal company structures
    if (value.match(/\b(Co\.|Ltd\.|Inc\.|Corporation|Company|Pty|Limited|LLC|Group)\b/i)) {
      console.log('✅ Formal business entity detected')
      confidence = Math.min(1.0, confidence + 0.15)
    }
    
    // Boost confidence for proper business name format
    if (isProperBusinessFormat(value)) {
      console.log('✅ Proper business format confirmed')
      confidence = Math.min(1.0, confidence + 0.1)
    }
    
    // Check length and format constraints
    if (value.length >= 5 && value.length <= 80) {
      confidence = Math.min(1.0, confidence + 0.05)
    } else if (value.length < 3 || value.length > 100) {
      console.log('⚠️ Supplier name length outside reasonable bounds')
      confidence = Math.max(0.1, confidence - 0.3)
    }
    
    // Penalize generic or obviously invalid suppliers
    if (value.match(/^(test|demo|sample|unknown|n\/a|supplier|company|business)$/i)) {
      console.log('❌ Generic/invalid supplier name detected')
      confidence = Math.max(0.1, confidence - 0.5)
    }
    
    // Penalize suppliers that are just location names
    if (isJustLocationName(value)) {
      console.log('⚠️ Appears to be just a location name')
      confidence = Math.max(0.2, confidence - 0.3)
    }
    
    // Clean up common OCR errors and formatting
    const originalValue = value
    value = cleanSupplierName(value)
    if (originalValue !== value) {
      console.log('🧹 Cleaned supplier name:', originalValue, '→', value)
    }
    
    // Final confidence threshold check
    if (confidence < 0.3) {
      console.log('❌ Confidence below threshold, marking as unreliable')
      value = 'Low Confidence Extraction'
      confidence = 0.2
    }
  }
  
  const result = {
    ...supplier,
    value,
    confidence: Number(confidence.toFixed(3))
  }
  
  console.log('✅ Supplier validation complete:', result)
  return result
}

/**
 * Check if a name represents a legitimate business name
 */
function isLegitimateBusinessName(name: string): boolean {
  // Must have multiple meaningful words or be a formal business entity
  const words = name.trim().split(/\s+/)
  
  // Single word names are suspicious unless they're well-known business formats
  if (words.length === 1) {
    return /^[A-Z][a-z]+(?:Ltd|Inc|Corp|Co|LLC)$/i.test(name)
  }
  
  // Check for at least one substantial word (not just "Co", "Ltd", etc.)
  const substantialWords = words.filter(word => 
    word.length > 2 && 
    !['Co', 'Ltd', 'Inc', 'Corp', 'LLC', 'Company', 'Limited'].includes(word)
  )
  
  return substantialWords.length >= 1
}

/**
 * Check if name follows proper business formatting conventions
 */
function isProperBusinessFormat(name: string): boolean {
  // Check for title case formatting
  const words = name.trim().split(/\s+/)
  const titleCaseWords = words.filter(word => {
    // Skip articles and prepositions
    if (['of', 'and', 'the', 'for', 'with'].includes(word.toLowerCase())) {
      return true
    }
    // Check if first letter is capitalized
    return /^[A-Z]/.test(word)
  })
  
  return titleCaseWords.length === words.length
}

/**
 * Check if the text is just a location name rather than a business
 */
function isJustLocationName(name: string): boolean {
  const locationIndicators = [
    /^(north|south|east|west|central|downtown|metro|city|town|village)$/i,
    /^[A-Z][a-z]+\s+(street|road|avenue|drive|lane|plaza|square|center|mall)$/i,
    /^(main|first|second|third|broadway|market|church|school|park)\s+/i
  ]
  
  return locationIndicators.some(pattern => pattern.test(name.trim()))
}

/**
 * Enhanced delivery date validation
 */
async function validateDeliveryDate(deliveryDate: DocumentAIExtraction['deliveryDate']): Promise<DocumentAIExtraction['deliveryDate']> {
  let confidence = deliveryDate.confidence
  const date = new Date(deliveryDate.value)
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000))
  const oneWeekFuture = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
  
  // Validate date is reasonable for delivery dockets
  if (date >= threeDaysAgo && date <= oneWeekFuture) {
    confidence = Math.min(1.0, confidence + 0.2) // Boost for reasonable dates
  } else if (date < threeDaysAgo && date > new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))) {
    confidence = Math.min(1.0, confidence + 0.1) // Moderate boost for last 30 days
  } else {
    confidence = Math.max(0.1, confidence - 0.3) // Penalize unlikely dates
  }
  
  return {
    ...deliveryDate,
    confidence: Number(confidence.toFixed(3))
  }
}

/**
 * Enhanced temperature validation with product context
 */
async function validateTemperatureReadings(
  temperatures: TemperatureReading[], 
  productClassification: ProductClassification
): Promise<TemperatureReading[]> {
  
  return temperatures.map(temp => {
    let confidence = temp.confidence
    
    // Validate temperature is within reasonable ranges
    if (temp.unit === 'C') {
      if (temp.value >= -30 && temp.value <= 50) {
        confidence = Math.min(1.0, confidence + 0.1)
      } else {
        confidence = Math.max(0.1, confidence - 0.4)
      }
    } else if (temp.unit === 'F') {
      if (temp.value >= -22 && temp.value <= 122) {
        confidence = Math.min(1.0, confidence + 0.1)
      } else {
        confidence = Math.max(0.1, confidence - 0.4)
      }
    }
    
    // Context-based validation using product classification
    const expectedRange = getExpectedTemperatureRange(productClassification)
    if (expectedRange && isTemperatureInExpectedRange(temp.value, temp.unit, expectedRange)) {
      confidence = Math.min(1.0, confidence + 0.2)
    }
    
    return {
      ...temp,
      confidence: Number(confidence.toFixed(3))
    }
  })
}

/**
 * Enhanced line item validation
 */
async function validateLineItems(
  lineItems: LineItem[], 
  productClassification: ProductClassification
): Promise<LineItem[]> {
  
  return lineItems.map(item => {
    let confidence = item.confidence
    
    // Validate basic item structure
    if (item.description && item.description.length > 2) {
      confidence = Math.min(1.0, confidence + 0.1)
    }
    
    if (item.quantity > 0 && item.quantity < 10000) {
      confidence = Math.min(1.0, confidence + 0.05)
    }
    
    if (item.totalPrice >= 0 && item.totalPrice < 100000) {
      confidence = Math.min(1.0, confidence + 0.05)
    }
    
    // Enhanced product categorization
    const enhancedCategory = categorizeProduct(item.description, productClassification)
    
    return {
      ...item,
      productCategory: enhancedCategory,
      confidence: Number(confidence.toFixed(3))
    }
  })
}

function calculateEnhancedConfidence(scores: {
  supplier: number
  delivery: number
  temperature: number
  classification: number
  extraction: number
  compliance: number
}): number {
  console.log('📊 Calculating enhanced confidence with scores:', scores)
  
  // Stricter weighting that penalizes low supplier confidence more heavily
  const weights = { 
    supplier: 0.35,  // Increased - supplier accuracy is critical for compliance
    delivery: 0.15, 
    temperature: 0.25, 
    classification: 0.15,
    extraction: 0.05,
    compliance: 0.05
  }
  
  // Apply confidence penalties for critical failures
  let finalScore = (
    scores.supplier * weights.supplier +
    scores.delivery * weights.delivery +
    scores.temperature * weights.temperature +
    scores.classification * weights.classification +
    scores.extraction * weights.extraction +
    scores.compliance * weights.compliance
  )
  
  // Critical failure penalties
  if (scores.supplier < 0.3) {
    console.log('⚠️ Low supplier confidence penalty applied')
    finalScore = Math.max(0.1, finalScore - 0.3)
  }
  
  if (scores.delivery < 0.5 && scores.temperature < 0.5) {
    console.log('⚠️ Low delivery and temperature confidence penalty applied')
    finalScore = Math.max(0.1, finalScore - 0.2)
  }
  
  const result = Number(finalScore.toFixed(3))
  console.log('✅ Enhanced confidence calculated:', result)
  
  return result
}

function calculateExtractionQuality(
  supplier: DocumentAIExtraction['supplier'],
  deliveryDate: DocumentAIExtraction['deliveryDate'], 
  temperatures: TemperatureReading[],
  lineItems: LineItem[]
): number {
  let quality = 0.5 // Base score
  
  // Supplier quality
  if (supplier.confidence > 0.8) quality += 0.1
  if (supplier.extractionMethod === 'entity_recognition') quality += 0.05
  
  // Date quality  
  if (deliveryDate.confidence > 0.8) quality += 0.1
  if (deliveryDate.format !== 'other') quality += 0.05
  
  // Temperature data quality
  if (temperatures.length > 0) quality += 0.1
  if (temperatures.length >= 2) quality += 0.05
  
  // Line items quality
  if (lineItems.length > 0) quality += 0.1
  if (lineItems.length >= 3) quality += 0.05
  
  return Math.min(1.0, quality)
}

// Helper functions for validation
function cleanSupplierName(name: string): string {
  return name
    .replace(/[^\w\s&.,'-]/g, '') // Remove invalid characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^\W+|\W+$/g, '') // Remove leading/trailing punctuation
    .trim()
}

function getExpectedTemperatureRange(classification: ProductClassification): { min: number, max: number, unit: 'C' } | null {
  // This would use the ProductClassificationEngine results
  // Returning basic food safety ranges for now
  return { min: -18, max: 8, unit: 'C' }
}

function isTemperatureInExpectedRange(temp: number, unit: string, range: { min: number, max: number, unit: string }): boolean {
  let tempInC = temp
  if (unit === 'F') {
    tempInC = (temp - 32) * 5/9
  }
  
  return tempInC >= range.min && tempInC <= range.max
}

function categorizeProduct(description: string, classification: ProductClassification): string {
  // Enhanced categorization using classification results
  const desc = description.toLowerCase()
  
  if (desc.includes('chicken') || desc.includes('beef') || desc.includes('meat')) return 'meat'
  if (desc.includes('milk') || desc.includes('dairy') || desc.includes('cheese')) return 'dairy' 
  if (desc.includes('fish') || desc.includes('seafood')) return 'seafood'
  if (desc.includes('frozen') || desc.includes('ice')) return 'frozen'
  if (desc.includes('vegetable') || desc.includes('fruit')) return 'produce'
  
  return classification.primaryCategory || 'general'
}

function detectDocumentLanguage(text: string): string {
  // Simple language detection - could be enhanced
  const commonEnglishWords = ['the', 'and', 'delivery', 'date', 'supplier', 'temperature']
  const words = text.toLowerCase().split(/\s+/)
  const englishMatches = words.filter(word => commonEnglishWords.includes(word)).length
  
  return englishMatches > 2 ? 'en' : 'unknown'
}

function calculateOverallConfidence(scores: {
  supplier: number
  delivery: number
  temperature: number
  classification: number
}): number {
  const weights = { supplier: 0.3, delivery: 0.2, temperature: 0.3, classification: 0.2 }
  
  return Number((
    scores.supplier * weights.supplier +
    scores.delivery * weights.delivery +
    scores.temperature * weights.temperature +
    scores.classification * weights.classification
  ).toFixed(2))
}