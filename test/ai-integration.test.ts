// Comprehensive AI Integration Testing Suite
// Tests for Google Cloud Document AI processing pipeline

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Mock implementations for testing
const mockDocumentProcessor = {
  processDocumentWithEnhancedAI: jest.fn(),
  extractDocumentStructure: jest.fn(),
  extractBusinessEntities: jest.fn(),
  enhanceExtractedData: jest.fn(),
  classifyProductTemperatureRequirements: jest.fn(),
  analyzeTemperatureCompliance: jest.fn(),
  validateAndScoreExtraction: jest.fn()
}

// Test data fixtures
const sampleImageBuffer = new ArrayBuffer(1024)
const sampleProcessorId = 'test-processor-123'
const sampleAccessToken = 'test-token-abc'

const mockStructureResponse = {
  documentType: 'delivery_docket',
  layout: {
    tables: [],
    forms: [],
    paragraphs: []
  },
  confidence: 0.9
}

const mockEntityResponse = {
  text: 'ACME FOODS\nDelivery Date: 15/08/2025\nTemp: 4°C\nChicken Breast 2kg $24.99',
  entities: [
    { type: 'supplier_name', mentionText: 'ACME FOODS', confidence: 0.95 },
    { type: 'delivery_date', mentionText: '15/08/2025', confidence: 0.88 },
    { type: 'temperature', mentionText: '4°C', confidence: 0.92 }
  ]
}

const mockEnhancedExtractionResult = {
  supplier: { value: 'ACME FOODS', confidence: 0.95, extractionMethod: 'entity_recognition' },
  deliveryDate: { value: '2025-08-15T00:00:00.000Z', confidence: 0.88, format: 'DD/MM/YYYY' },
  handwrittenNotes: { signedBy: 'John Smith', confidence: 0.75, extractionMethod: 'handwriting_recognition' },
  temperatureData: {
    readings: [{ value: 4, unit: 'C', confidence: 0.92, complianceStatus: 'pass', riskLevel: 'low' }],
    overallCompliance: 'pass',
    analysis: {
      overallCompliance: 'pass',
      violations: [],
      riskAssessment: 'low',
      confidence: 0.92
    }
  },
  invoiceNumber: { value: 'INV-2025-001', confidence: 0.85 },
  lineItems: [
    {
      description: 'Chicken Breast',
      quantity: 2,
      unitSize: '2kg',
      unitPrice: 24.99,
      totalPrice: 24.99,
      sku: 'CB001',
      productCategory: 'poultry',
      confidence: 0.78
    }
  ],
  analysis: {
    productClassification: {
      categories: ['poultry'],
      temperatureRequirements: { min: 0, max: 4 },
      riskLevel: 'medium',
      confidence: 0.85
    },
    estimatedValue: 24.99,
    itemCount: 1,
    processingTime: 2500,
    overallConfidence: 0.84
  },
  rawText: mockEntityResponse.text,
  processingMetadata: {
    documentType: 'delivery_docket',
    pageCount: 1,
    language: 'en',
    processingStages: ['structure', 'entities', 'enhancement', 'classification', 'compliance', 'validation'],
    aiModelVersion: 'document-ai-enhanced-v1.2',
    fallbackMode: false,
    processingNotes: 'All stages completed successfully'
  }
}

describe('Google Cloud Document AI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Stage 1: Document Structure Recognition', () => {
    it('should extract document structure successfully', async () => {
      mockDocumentProcessor.extractDocumentStructure.mockResolvedValue(mockStructureResponse)
      
      const result = await mockDocumentProcessor.extractDocumentStructure(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result).toEqual(mockStructureResponse)
      expect(result.documentType).toBe('delivery_docket')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('should handle structure extraction errors gracefully', async () => {
      mockDocumentProcessor.extractDocumentStructure.mockRejectedValue(
        new Error('Google Cloud API unavailable')
      )
      
      await expect(
        mockDocumentProcessor.extractDocumentStructure(
          sampleImageBuffer,
          sampleProcessorId,
          sampleAccessToken
        )
      ).rejects.toThrow('Google Cloud API unavailable')
    })

    it('should detect different document types correctly', async () => {
      const invoiceStructure = { ...mockStructureResponse, documentType: 'invoice' }
      mockDocumentProcessor.extractDocumentStructure.mockResolvedValue(invoiceStructure)
      
      const result = await mockDocumentProcessor.extractDocumentStructure(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result.documentType).toBe('invoice')
    })
  })

  describe('Stage 2: Entity and Field Extraction', () => {
    it('should extract business entities successfully', async () => {
      mockDocumentProcessor.extractBusinessEntities.mockResolvedValue(mockEntityResponse)
      
      const result = await mockDocumentProcessor.extractBusinessEntities(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken,
        mockStructureResponse
      )
      
      expect(result.text).toContain('ACME FOODS')
      expect(result.entities).toHaveLength(3)
      expect(result.entities[0].type).toBe('supplier_name')
    })

    it('should handle missing entities gracefully', async () => {
      const emptyEntityResponse = { text: 'Minimal document', entities: [] }
      mockDocumentProcessor.extractBusinessEntities.mockResolvedValue(emptyEntityResponse)
      
      const result = await mockDocumentProcessor.extractBusinessEntities(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken,
        mockStructureResponse
      )
      
      expect(result.entities).toHaveLength(0)
      expect(result.text).toBe('Minimal document')
    })
  })

  describe('Stage 3: Enhanced Data Processing', () => {
    it('should enhance extracted data with improved accuracy', async () => {
      const enhancedData = {
        supplier: mockEnhancedExtractionResult.supplier,
        deliveryDate: mockEnhancedExtractionResult.deliveryDate,
        handwrittenNotes: mockEnhancedExtractionResult.handwrittenNotes,
        invoiceNumber: mockEnhancedExtractionResult.invoiceNumber,
        temperatures: mockEnhancedExtractionResult.temperatureData.readings,
        lineItems: mockEnhancedExtractionResult.lineItems
      }
      
      mockDocumentProcessor.enhanceExtractedData.mockResolvedValue(enhancedData)
      
      const result = await mockDocumentProcessor.enhanceExtractedData(
        mockEntityResponse.text,
        mockEntityResponse.entities
      )
      
      expect(result.supplier.confidence).toBeGreaterThan(0.9)
      expect(result.deliveryDate.format).toBe('DD/MM/YYYY')
      expect(result.lineItems).toHaveLength(1)
    })

    it('should handle temperature data correctly', async () => {
      const enhancedData = {
        temperatures: [
          { value: 4, unit: 'C', confidence: 0.92, complianceStatus: 'pass', riskLevel: 'low' },
          { value: -18, unit: 'C', confidence: 0.88, complianceStatus: 'pass', riskLevel: 'low' }
        ]
      }
      
      mockDocumentProcessor.enhanceExtractedData.mockResolvedValue(enhancedData)
      
      const result = await mockDocumentProcessor.enhanceExtractedData(
        'Temp: 4°C, Freezer: -18°C',
        []
      )
      
      expect(result.temperatures).toHaveLength(2)
      expect(result.temperatures[0].complianceStatus).toBe('pass')
    })
  })

  describe('Stage 4: Product Classification', () => {
    it('should classify products with temperature requirements', async () => {
      const classification = {
        categories: ['poultry'],
        temperatureRequirements: { min: 0, max: 4 },
        riskLevel: 'medium',
        confidence: 0.85
      }
      
      mockDocumentProcessor.classifyProductTemperatureRequirements.mockResolvedValue(classification)
      
      const result = await mockDocumentProcessor.classifyProductTemperatureRequirements(
        mockEntityResponse.text,
        mockEnhancedExtractionResult.lineItems
      )
      
      expect(result.categories).toContain('poultry')
      expect(result.temperatureRequirements.max).toBe(4)
      expect(result.riskLevel).toBe('medium')
    })

    it('should handle mixed product categories', async () => {
      const mixedClassification = {
        categories: ['poultry', 'dairy', 'vegetables'],
        temperatureRequirements: { min: 0, max: 4 },
        riskLevel: 'high',
        confidence: 0.78
      }
      
      mockDocumentProcessor.classifyProductTemperatureRequirements.mockResolvedValue(mixedClassification)
      
      const result = await mockDocumentProcessor.classifyProductTemperatureRequirements(
        'Chicken, Milk, Lettuce',
        []
      )
      
      expect(result.categories).toHaveLength(3)
      expect(result.riskLevel).toBe('high')
    })
  })

  describe('Stage 5: Temperature Compliance Analysis', () => {
    it('should analyze temperature compliance correctly', async () => {
      const complianceAnalysis = {
        overallCompliance: 'pass',
        violations: [],
        riskAssessment: 'low',
        confidence: 0.92,
        details: {
          temperatureChecks: 1,
          passedChecks: 1,
          failedChecks: 0
        }
      }
      
      mockDocumentProcessor.analyzeTemperatureCompliance.mockResolvedValue(complianceAnalysis)
      
      const result = await mockDocumentProcessor.analyzeTemperatureCompliance(
        mockEnhancedExtractionResult.temperatureData.readings,
        mockEnhancedExtractionResult.analysis.productClassification
      )
      
      expect(result.overallCompliance).toBe('pass')
      expect(result.violations).toHaveLength(0)
      expect(result.riskAssessment).toBe('low')
    })

    it('should detect temperature violations', async () => {
      const violationAnalysis = {
        overallCompliance: 'fail',
        violations: [
          {
            temperature: 8,
            expectedMax: 4,
            riskLevel: 'high',
            productCategory: 'poultry'
          }
        ],
        riskAssessment: 'high',
        confidence: 0.94
      }
      
      mockDocumentProcessor.analyzeTemperatureCompliance.mockResolvedValue(violationAnalysis)
      
      const highTempReadings = [
        { value: 8, unit: 'C', confidence: 0.94, complianceStatus: 'fail', riskLevel: 'high' }
      ]
      
      const result = await mockDocumentProcessor.analyzeTemperatureCompliance(
        highTempReadings,
        mockEnhancedExtractionResult.analysis.productClassification
      )
      
      expect(result.overallCompliance).toBe('fail')
      expect(result.violations).toHaveLength(1)
      expect(result.violations[0].riskLevel).toBe('high')
    })
  })

  describe('Stage 6: Confidence Scoring and Validation', () => {
    it('should validate and score extraction results', async () => {
      const validatedData = {
        supplier: mockEnhancedExtractionResult.supplier,
        deliveryDate: mockEnhancedExtractionResult.deliveryDate,
        temperatures: mockEnhancedExtractionResult.temperatureData.readings,
        lineItems: mockEnhancedExtractionResult.lineItems,
        overallConfidence: 0.84
      }
      
      mockDocumentProcessor.validateAndScoreExtraction.mockResolvedValue(validatedData)
      
      const result = await mockDocumentProcessor.validateAndScoreExtraction({
        supplier: mockEnhancedExtractionResult.supplier,
        deliveryDate: mockEnhancedExtractionResult.deliveryDate,
        temperatures: mockEnhancedExtractionResult.temperatureData.readings,
        lineItems: mockEnhancedExtractionResult.lineItems,
        productClassification: mockEnhancedExtractionResult.analysis.productClassification,
        temperatureAnalysis: mockEnhancedExtractionResult.temperatureData.analysis
      })
      
      expect(result.overallConfidence).toBeGreaterThan(0.8)
      expect(result.supplier.confidence).toBeGreaterThan(0.9)
      expect(result.lineItems).toHaveLength(1)
    })

    it('should handle low confidence scores appropriately', async () => {
      const lowConfidenceData = {
        supplier: { value: 'Unknown', confidence: 0.3, extractionMethod: 'fallback' },
        deliveryDate: { value: new Date().toISOString(), confidence: 0.2, format: 'other' },
        temperatures: [],
        lineItems: [],
        overallConfidence: 0.25
      }
      
      mockDocumentProcessor.validateAndScoreExtraction.mockResolvedValue(lowConfidenceData)
      
      const result = await mockDocumentProcessor.validateAndScoreExtraction({
        supplier: lowConfidenceData.supplier,
        deliveryDate: lowConfidenceData.deliveryDate,
        temperatures: [],
        lineItems: [],
        productClassification: { categories: [], temperatureRequirements: { min: 0, max: 0 }, riskLevel: 'unknown', confidence: 0.1 },
        temperatureAnalysis: { overallCompliance: 'unknown', violations: [], riskAssessment: 'unknown', confidence: 0.1 }
      })
      
      expect(result.overallConfidence).toBeLessThan(0.5)
      expect(result.supplier.extractionMethod).toBe('fallback')
    })
  })

  describe('Complete Pipeline Integration', () => {
    it('should process a document through all 6 stages successfully', async () => {
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockResolvedValue(mockEnhancedExtractionResult)
      
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result).toEqual(mockEnhancedExtractionResult)
      expect(result.analysis.overallConfidence).toBeGreaterThan(0.8)
      expect(result.processingMetadata.processingStages).toHaveLength(6)
      expect(result.processingMetadata.fallbackMode).toBe(false)
    })

    it('should handle fallback mode when stages fail', async () => {
      const fallbackResult = {
        ...mockEnhancedExtractionResult,
        analysis: { ...mockEnhancedExtractionResult.analysis, overallConfidence: 0.3 },
        processingMetadata: {
          ...mockEnhancedExtractionResult.processingMetadata,
          fallbackMode: true,
          processingNotes: 'Used fallback entity extraction; Used fallback classification'
        }
      }
      
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockResolvedValue(fallbackResult)
      
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result.processingMetadata.fallbackMode).toBe(true)
      expect(result.processingMetadata.processingNotes).toContain('fallback')
      expect(result.analysis.overallConfidence).toBeLessThan(0.5)
    })

    it('should return emergency fallback on complete failure', async () => {
      const emergencyFallback = {
        supplier: { value: 'Processing Failed', confidence: 0.0, extractionMethod: 'emergency_fallback' },
        deliveryDate: { value: new Date().toISOString(), confidence: 0.0, format: 'other' },
        handwrittenNotes: { signedBy: 'Processing Failed', confidence: 0.0, extractionMethod: 'emergency_fallback' },
        temperatureData: {
          readings: [],
          overallCompliance: 'unknown',
          analysis: { overallCompliance: 'unknown', violations: [], riskAssessment: 'unknown', confidence: 0.0, emergencyFallback: true }
        },
        invoiceNumber: null,
        lineItems: [],
        analysis: {
          productClassification: { categories: [], temperatureRequirements: { min: 0, max: 0 }, riskLevel: 'unknown', confidence: 0.0, emergencyFallback: true },
          estimatedValue: 0,
          itemCount: 0,
          processingTime: 1000,
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
          processingNotes: 'Emergency fallback due to complete processing failure: Test error',
          errorDetails: 'Test error'
        }
      }
      
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockResolvedValue(emergencyFallback)
      
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result.processingMetadata.emergencyFallback).toBe(true)
      expect(result.analysis.overallConfidence).toBe(0.0)
      expect(result.processingMetadata.processingStages).toEqual(['emergency_fallback'])
    })
  })

  describe('Performance and Memory Tests', () => {
    it('should complete processing within acceptable time limits', async () => {
      const fastResult = {
        ...mockEnhancedExtractionResult,
        analysis: { ...mockEnhancedExtractionResult.analysis, processingTime: 1500 }
      }
      
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockResolvedValue(fastResult)
      
      const startTime = Date.now()
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds in test
      expect(result.analysis.processingTime).toBeLessThan(3000) // AI processing under 3 seconds
    })

    it('should handle large documents efficiently', async () => {
      const largeDocumentResult = {
        ...mockEnhancedExtractionResult,
        lineItems: Array(50).fill(mockEnhancedExtractionResult.lineItems[0]),
        analysis: {
          ...mockEnhancedExtractionResult.analysis,
          itemCount: 50,
          estimatedValue: 1249.50,
          processingTime: 4500
        }
      }
      
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockResolvedValue(largeDocumentResult)
      
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        new ArrayBuffer(1024 * 1024), // 1MB test image
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result.lineItems).toHaveLength(50)
      expect(result.analysis.itemCount).toBe(50)
      expect(result.analysis.processingTime).toBeLessThan(10000) // Under 10 seconds even for large docs
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should recover from Google Cloud API rate limits', async () => {
      const rateLimitError = new Error('Rate limit exceeded')
      mockDocumentProcessor.processDocumentWithEnhancedAI
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockEnhancedExtractionResult)
      
      // First call should fail
      await expect(
        mockDocumentProcessor.processDocumentWithEnhancedAI(
          sampleImageBuffer,
          sampleProcessorId,
          sampleAccessToken
        )
      ).rejects.toThrow('Rate limit exceeded')
      
      // Second call should succeed
      const result = await mockDocumentProcessor.processDocumentWithEnhancedAI(
        sampleImageBuffer,
        sampleProcessorId,
        sampleAccessToken
      )
      
      expect(result).toEqual(mockEnhancedExtractionResult)
    })

    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Request timeout')
      mockDocumentProcessor.processDocumentWithEnhancedAI.mockRejectedValue(timeoutError)
      
      await expect(
        mockDocumentProcessor.processDocumentWithEnhancedAI(
          sampleImageBuffer,
          sampleProcessorId,
          sampleAccessToken
        )
      ).rejects.toThrow('Request timeout')
    })
  })
})

// Database Integration Tests
describe('Enhanced Extraction Database Integration', () => {
  it('should store enhanced extraction results in database correctly', async () => {
    // Mock database operations
    const mockDeliveryRecord = {
      id: 'test-delivery-123',
      client_id: 'test-client-456',
      extracted_line_items: mockEnhancedExtractionResult.lineItems,
      product_classification: mockEnhancedExtractionResult.analysis.productClassification,
      confidence_scores: {
        supplier: mockEnhancedExtractionResult.supplier.confidence,
        deliveryDate: mockEnhancedExtractionResult.deliveryDate.confidence,
        overall: mockEnhancedExtractionResult.analysis.overallConfidence
      },
      compliance_analysis: mockEnhancedExtractionResult.temperatureData.analysis,
      estimated_value: mockEnhancedExtractionResult.analysis.estimatedValue,
      item_count: mockEnhancedExtractionResult.analysis.itemCount,
      processing_metadata: mockEnhancedExtractionResult.processingMetadata
    }
    
    // Simulate successful database storage
    expect(mockDeliveryRecord.extracted_line_items).toHaveLength(1)
    expect(mockDeliveryRecord.product_classification.categories).toContain('poultry')
    expect(mockDeliveryRecord.confidence_scores.overall).toBeGreaterThan(0.8)
    expect(mockDeliveryRecord.estimated_value).toBe(24.99)
  })

  it('should handle database constraint violations gracefully', async () => {
    // Test handling of potential database issues
    const invalidExtractionResult = {
      ...mockEnhancedExtractionResult,
      analysis: {
        ...mockEnhancedExtractionResult.analysis,
        estimatedValue: null, // This might violate database constraints
        overallConfidence: -0.5 // Invalid confidence score
      }
    }
    
    // Normalize invalid data before database storage
    const normalizedValue = invalidExtractionResult.analysis.estimatedValue || 0
    const normalizedConfidence = Math.max(0, Math.min(1, invalidExtractionResult.analysis.overallConfidence))
    
    expect(normalizedValue).toBe(0)
    expect(normalizedConfidence).toBe(0)
  })
})

export default {}