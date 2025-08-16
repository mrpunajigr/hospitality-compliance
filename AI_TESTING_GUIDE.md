# AI Integration Testing Guide

Comprehensive guide for testing the Google Cloud Document AI integration and enhanced processing pipeline.

## Testing Overview

The AI integration includes comprehensive test coverage for:
- 6-stage processing pipeline
- Error handling and fallback mechanisms
- Performance and memory optimization
- Database integration
- Safari 12 compatibility

## Running Tests

### Prerequisites

Install testing dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom babel-jest jest-html-reporters
```

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only AI integration tests
npm test ai-integration

# Run tests for specific component
npm test SafariCompatibleUpload
```

### Test Configuration

The project uses Jest with the following configuration:

- **Test Environment**: jsdom for React component testing
- **Coverage Threshold**: 70% minimum (80% for AI integration)
- **Test Timeout**: 30 seconds for AI processing tests
- **Module Mapping**: Configured for absolute imports

## Test Structure

### 1. AI Integration Tests (`test/ai-integration.test.ts`)

#### Stage-by-Stage Testing
- **Stage 1**: Document structure recognition
- **Stage 2**: Entity and field extraction
- **Stage 3**: Enhanced data processing
- **Stage 4**: Product classification
- **Stage 5**: Temperature compliance analysis
- **Stage 6**: Confidence scoring and validation

#### Error Handling Tests
- Google Cloud API failures
- Network timeouts
- Rate limiting
- Fallback mechanism validation

#### Performance Tests
- Processing time limits
- Memory usage monitoring
- Large document handling

### 2. Component Tests

#### SafariCompatibleUpload Component
```bash
# Test Safari 12 specific functionality
npm test SafariCompatibleUpload

# Test file upload and compression
npm test -- --testNamePattern="image compression"

# Test memory management
npm test -- --testNamePattern="memory"
```

#### EnhancedUpload Component
```bash
# Test enhanced extraction display
npm test EnhancedUpload

# Test batch processing
npm test -- --testNamePattern="batch"
```

### 3. Database Integration Tests

```bash
# Test database schema changes
npm test -- --testNamePattern="database"

# Test enhanced extraction storage
npm test -- --testNamePattern="enhanced extraction"
```

## Test Scenarios

### Successful Processing Test

```typescript
describe('Successful AI Processing', () => {
  it('should process delivery docket through all 6 stages', async () => {
    const result = await processDocumentWithEnhancedAI(
      sampleImageBuffer,
      processorId,
      accessToken
    )
    
    expect(result.analysis.overallConfidence).toBeGreaterThan(0.8)
    expect(result.processingMetadata.processingStages).toHaveLength(6)
    expect(result.temperatureData.overallCompliance).toBe('pass')
  })
})
```

### Fallback Mechanism Test

```typescript
describe('Fallback Mechanisms', () => {
  it('should use fallbacks when Google Cloud fails', async () => {
    // Mock Google Cloud API failure
    mockGoogleCloudAPI.mockRejectedValue(new Error('API unavailable'))
    
    const result = await processDocumentWithEnhancedAI(
      sampleImageBuffer,
      processorId,
      accessToken
    )
    
    expect(result.processingMetadata.fallbackMode).toBe(true)
    expect(result.processingMetadata.processingNotes).toContain('fallback')
  })
})
```

### Safari 12 Compatibility Test

```typescript
describe('Safari 12 Compatibility', () => {
  it('should compress images within memory constraints', async () => {
    const largeFile = new File(['large image data'], 'large.jpg', { 
      size: 5 * 1024 * 1024 // 5MB
    })
    
    const compressedBlob = await compressImageForSafari12(largeFile)
    
    expect(compressedBlob.size).toBeLessThan(1024 * 1024) // Under 1MB
  })
})
```

## Mock Data and Fixtures

### Sample Documents

Create test documents in `test/fixtures/`:

```
test/fixtures/
├── delivery-dockets/
│   ├── valid-docket.jpg        # Standard delivery docket
│   ├── temperature-violation.jpg # Docket with temp violations
│   ├── multi-page-docket.pdf   # Multi-page document
│   └── handwritten-notes.jpg   # Docket with signatures
├── invoices/
│   └── sample-invoice.pdf
└── corrupted/
    └── invalid-image.jpg       # Test error handling
```

### Mock Responses

```typescript
// Mock successful Google Cloud response
const mockSuccessfulResponse = {
  document: {
    text: 'ACME FOODS\nDelivery Date: 15/08/2025\nTemp: 4°C',
    entities: [
      { type: 'supplier_name', mentionText: 'ACME FOODS', confidence: 0.95 },
      { type: 'delivery_date', mentionText: '15/08/2025', confidence: 0.88 }
    ]
  }
}

// Mock API failure response  
const mockFailureResponse = {
  error: {
    code: 503,
    message: 'Service temporarily unavailable'
  }
}
```

## Performance Testing

### Memory Usage Tests

```typescript
describe('Memory Management', () => {
  it('should not exceed memory limits on iPad Air', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize
    
    await processMultipleDocuments(10) // Process 10 documents
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize
    const memoryIncrease = finalMemory - initialMemory
    
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Under 100MB increase
  })
})
```

### Processing Time Tests

```typescript
describe('Performance Requirements', () => {
  it('should process documents within time limits', async () => {
    const startTime = Date.now()
    
    const result = await processDocumentWithEnhancedAI(
      sampleImageBuffer,
      processorId,
      accessToken
    )
    
    const processingTime = Date.now() - startTime
    
    expect(processingTime).toBeLessThan(10000) // Under 10 seconds
    expect(result.analysis.processingTime).toBeLessThan(5000) // AI processing under 5 seconds
  })
})
```

## Integration Testing

### End-to-End Upload Test

```typescript
describe('End-to-End Upload Flow', () => {
  it('should upload and process document successfully', async () => {
    // 1. Upload file to storage
    const uploadResult = await uploadToSupabase(testFile, clientId, userId)
    expect(uploadResult.deliveryRecord.id).toBeDefined()
    
    // 2. Process with AI
    const processingResult = await processWithAI(uploadResult.deliveryRecord.id)
    expect(processingResult.analysis.overallConfidence).toBeGreaterThan(0.7)
    
    // 3. Verify database storage
    const storedRecord = await fetchDeliveryRecord(uploadResult.deliveryRecord.id)
    expect(storedRecord.extracted_line_items).toBeDefined()
    expect(storedRecord.product_classification).toBeDefined()
  })
})
```

### Database Schema Tests

```typescript
describe('Database Integration', () => {
  it('should store enhanced extraction data correctly', async () => {
    const extractionResult = mockEnhancedExtractionResult
    
    const storedRecord = await storeEnhancedExtraction(
      'test-record-id',
      extractionResult
    )
    
    expect(storedRecord.extracted_line_items).toHaveLength(1)
    expect(storedRecord.confidence_scores.overall).toBe(0.84)
    expect(storedRecord.estimated_value).toBe(24.99)
  })
})
```

## Test Environment Setup

### Local Testing

```bash
# Set test environment variables
export NODE_ENV=test
export MOCK_AI_PROCESSING=true
export MOCK_DATABASE=true

# Run tests with mocked services
npm test
```

### CI/CD Testing

```yaml
# .github/workflows/test.yml
name: AI Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:ai-integration
```

## Debugging Tests

### Enable Detailed Logging

```bash
# Enable verbose test output
npm test -- --verbose

# Enable test logging
ENABLE_TEST_LOGGING=true npm test

# Run specific test with debugging
npm test -- --testNamePattern="Stage 1" --verbose
```

### Debug Failing Tests

```typescript
describe('Debug AI Processing', () => {
  it('should log processing stages', async () => {
    console.log('Starting AI processing test...')
    
    const result = await processDocumentWithEnhancedAI(
      sampleImageBuffer,
      processorId,
      accessToken
    )
    
    console.log('Processing result:', JSON.stringify(result, null, 2))
    console.log('Processing stages:', result.processingMetadata.processingStages)
    
    expect(result).toBeDefined()
  })
})
```

## Test Coverage

### Coverage Requirements

- **Overall**: 70% minimum coverage
- **AI Integration**: 80% minimum coverage
- **Critical Components**: 85% minimum coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Check coverage for specific file
npm run test:coverage -- --collectCoverageFrom="app/components/delivery/*.tsx"
```

## Continuous Testing

### Watch Mode for Development

```bash
# Watch tests during development
npm run test:watch

# Watch specific test suite
npm run test:watch -- ai-integration
```

### Pre-commit Testing

```bash
# Run critical tests before commit
npm run test:critical

# Run quick smoke tests
npm run test:smoke
```

## Troubleshooting Tests

### Common Test Issues

1. **Timeout Errors**
   - Increase test timeout in jest.config.js
   - Mock slow external API calls
   - Check for infinite loops in test code

2. **Memory Issues**
   - Run tests with `--maxWorkers=1`
   - Clear mocks between tests
   - Check for memory leaks in components

3. **Mock Configuration**
   - Verify mock setup in `test/setup.ts`
   - Clear mocks with `jest.clearAllMocks()`
   - Reset modules with `jest.resetModules()`

### Test Debugging Commands

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand ai-integration

# Run tests without coverage (faster)
npm test -- --collectCoverage=false

# Run tests with specific node options
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

---

## Test Quality Checklist

- [ ] All 6 AI processing stages tested
- [ ] Error handling and fallback mechanisms covered
- [ ] Performance and memory tests passing
- [ ] Safari 12 compatibility verified
- [ ] Database integration tested
- [ ] End-to-end workflows covered
- [ ] Mock data covers edge cases
- [ ] Coverage requirements met
- [ ] CI/CD pipeline configured
- [ ] Documentation updated

🧪 **Testing Complete!** Your AI integration is thoroughly tested and ready for production deployment.