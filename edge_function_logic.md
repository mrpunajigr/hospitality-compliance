# Process Delivery Docket - Edge Function Logic

## Function: `process-delivery-docket`

### Trigger
- **Event:** File upload to `delivery-dockets` bucket
- **File types:** `.jpg`, `.jpeg`, `.png`, `.pdf`

### Input Parameters
```typescript
{
  bucketId: string,
  fileName: string,
  filePath: string,
  userId: string,
  clientId: string
}
```

### Processing Pipeline

#### 1. Authentication & Validation
```typescript
// Verify user has access to upload for this client
const userClient = await getUserClient(userId);
if (userClient !== clientId) throw new Error('Unauthorized');

// Validate file type and size
if (!isValidImageType(fileName)) throw new Error('Invalid file type');
if (fileSize > MAX_FILE_SIZE) throw new Error('File too large');
```

#### 2. Retrieve Google Cloud Credentials
```typescript
// Get credentials from Google Secret Manager
const credentials = await getSecretValue('delivery-docket-ai-credentials');
const auth = new GoogleAuth({ credentials: JSON.parse(credentials) });
```

#### 3. Download Image from Supabase Storage
```typescript
// Get the uploaded image
const { data: imageBuffer } = await supabase.storage
  .from('delivery-dockets')
  .download(filePath);
```

#### 4. Process with Google Document AI
```typescript
const documentAI = new DocumentProcessorServiceClient({ auth });

const request = {
  name: PROCESSOR_ID,
  rawDocument: {
    content: imageBuffer.toString('base64'),
    mimeType: 'image/jpeg'
  }
};

const [result] = await documentAI.processDocument(request);
const extractedText = result.document.text;
```

#### 5. Extract Key Data Using Pattern Matching
```typescript
const extractedData = {
  supplierName: extractSupplierName(extractedText),
  deliveryDate: extractDeliveryDate(extractedText),
  temperatures: extractTemperatures(extractedText),
  products: extractProducts(extractedText),
  docketNumber: extractDocketNumber(extractedText)
};

// Temperature extraction patterns
function extractTemperatures(text) {
  const tempPatterns = [
    /temp[:\s]*(-?\d+\.?\d*)[°]?[cf]/gi,
    /(-?\d+\.?\d*)[°][cf]/gi,
    /temperature[:\s]*(-?\d+\.?\d*)/gi
  ];
  
  const temperatures = [];
  tempPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      temperatures.push({
        value: parseFloat(match[1]),
        unit: detectUnit(match[0]),
        context: getContext(text, match.index)
      });
    }
  });
  
  return temperatures;
}
```

#### 6. Validate Temperature Compliance
```typescript
const complianceResults = validateTemperatures(extractedData.temperatures);

function validateTemperatures(temperatures) {
  return temperatures.map(temp => ({
    ...temp,
    isCompliant: checkCompliance(temp.value, temp.unit),
    riskLevel: assessRisk(temp.value, temp.unit),
    alertRequired: temp.value > CRITICAL_TEMP_THRESHOLD
  }));
}

// Compliance rules for different product types
const COMPLIANCE_RULES = {
  chilled: { min: 0, max: 4, unit: 'C' },
  frozen: { min: -25, max: -18, unit: 'C' },
  ambient: { min: 5, max: 25, unit: 'C' }
};
```

#### 7. Store Results in Database
```typescript
// Create delivery record
const deliveryRecord = await supabase
  .from('delivery_records')
  .insert({
    client_id: clientId,
    user_id: userId,
    image_path: filePath,
    supplier_name: extractedData.supplierName,
    delivery_date: extractedData.deliveryDate,
    docket_number: extractedData.docketNumber,
    raw_extracted_text: extractedText,
    processing_status: 'completed',
    created_at: new Date().toISOString()
  })
  .select()
  .single();

// Store temperature readings
const temperatureRecords = extractedData.temperatures.map(temp => ({
  delivery_record_id: deliveryRecord.id,
  temperature_value: temp.value,
  temperature_unit: temp.unit,
  is_compliant: temp.isCompliant,
  risk_level: temp.riskLevel,
  context: temp.context
}));

await supabase
  .from('temperature_readings')
  .insert(temperatureRecords);
```

#### 8. Handle Alerts & Notifications
```typescript
// Check for compliance violations
const violations = complianceResults.filter(temp => !temp.isCompliant);

if (violations.length > 0) {
  // Create alert record
  await supabase
    .from('compliance_alerts')
    .insert({
      delivery_record_id: deliveryRecord.id,
      alert_type: 'temperature_violation',
      severity: assessSeverity(violations),
      message: generateAlertMessage(violations),
      requires_action: true
    });
  
  // Trigger real-time notification
  await supabase
    .channel('compliance-alerts')
    .send({
      type: 'temperature_violation',
      payload: { deliveryRecord, violations }
    });
}
```

#### 9. Return Processing Results
```typescript
return {
  success: true,
  deliveryRecordId: deliveryRecord.id,
  extractedData,
  complianceResults,
  alertsGenerated: violations.length,
  processingTime: Date.now() - startTime
};
```

### Error Handling Strategy
```typescript
try {
  // Main processing logic
} catch (error) {
  // Log error for debugging
  console.error('Document processing failed:', error);
  
  // Update record with error status
  await supabase
    .from('delivery_records')
    .update({ 
      processing_status: 'failed',
      error_message: error.message 
    })
    .eq('id', deliveryRecordId);
    
  // Return error response
  return { success: false, error: error.message };
}
```

### Performance Considerations
- **Timeout:** Set to 60 seconds (document processing can take time)
- **Memory:** 512MB to handle large images
- **Retry Logic:** Automatic retry for temporary Google Cloud failures
- **Caching:** Cache common supplier names and patterns

### Security Features
- **Input validation:** File type, size, user permissions
- **Sanitization:** Clean extracted text before storage
- **Audit logging:** Track all processing attempts
- **Rate limiting:** Prevent abuse from single users

---

## Integration Points

**Database Tables Needed:**
- `delivery_records` (main record)
- `temperature_readings` (extracted temps)
- `compliance_alerts` (violations)
- `suppliers` (master list)
- `client_users` (user-client relationships)

**Real-time Features:**
- Live notifications for violations
- Processing status updates
- Dashboard updates when new dockets processed

**Reporting Capabilities:**
- Compliance percentage by supplier
- Temperature trend analysis
- Violation frequency reports
- Audit trail for inspectors