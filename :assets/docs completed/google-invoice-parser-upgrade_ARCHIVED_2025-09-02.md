# Switch to Google Invoice Parser - Claude Code Prompt

## 🎯 MAJOR UPGRADE OPPORTUNITY

**Current**: Document OCR processor returns raw text requiring manual parsing
**Upgrade**: Invoice Parser returns structured JSON with extracted fields
**Benefit**: Get supplier names, line items, dates, amounts directly structured

## 🏗️ IMPLEMENTATION REQUIRED

### Step 1: Create New Invoice Processor
In Google Cloud Console:
1. **Document AI > Create Processor**
2. **Select**: Invoice Parser (not Document OCR)
3. **Location**: us-central1
4. **Name**: delivery-docket-invoice-processor
5. **Copy the new Processor ID**

### Step 2: Update Edge Function Processor ID
```typescript
// Replace current processor ID with Invoice Parser ID:
const processorId = 'YOUR_NEW_INVOICE_PARSER_ID_HERE';
const processorName = `projects/hospitality-compliance-apps/locations/us-central1/processors/${processorId}`;
```

### Step 3: Handle Structured Invoice Response
Replace raw text parsing with structured field extraction:

```typescript
// Instead of parsing raw OCR text, handle structured response:
function processInvoiceResponse(response: any): ExtractedData {
  const document = response.document;
  const entities = document.entities || [];
  
  console.log('📊 STRUCTURED INVOICE DATA:', JSON.stringify(entities, null, 2));
  
  // Extract structured fields directly:
  const supplierName = extractField(entities, 'supplier_name') || 
                      extractField(entities, 'remit_to_name') ||
                      extractField(entities, 'supplier_address/supplier_name');
  
  const deliveryDate = extractField(entities, 'invoice_date') ||
                      extractField(entities, 'due_date');
  
  const invoiceNumber = extractField(entities, 'invoice_id');
  
  // Line items are structured arrays:
  const lineItems = entities.filter(entity => 
    entity.type === 'line_item' || entity.type === 'line_item/description'
  );
  
  // Extract amounts and totals:
  const totalAmount = extractField(entities, 'total_amount') ||
                     extractField(entities, 'net_amount');
  
  return {
    supplierName: supplierName || 'Unknown Supplier',
    deliveryDate: formatDate(deliveryDate) || new Date().toISOString().split('T')[0],
    lineItemCount: lineItems.length,
    invoiceNumber: invoiceNumber || '',
    totalAmount: totalAmount || '',
    lineItems: lineItems,
    // Still need manual extraction for temperature:
    temperatureReading: extractTemperatureFromText(document.text || '')
  };
}

function extractField(entities: any[], fieldType: string): string | null {
  const entity = entities.find(e => e.type === fieldType);
  return entity?.textAnchor?.content || entity?.normalizedValue?.text || null;
}

function extractTemperatureFromText(text: string): string | null {
  const tempPatterns = [
    /(\d+\.?\d*)\s*°?C/gi,
    /TEMP[:\s]+(\d+\.?\d*)/gi,
    /(\d+\.?\d*)\s*degrees?/gi
  ];
  
  for (const pattern of tempPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
```

### Step 4: Update Database with Structured Data
```typescript
// Update database with structured invoice data:
const extractedData = processInvoiceResponse(documentAIResponse);

console.log('🎯 STRUCTURED EXTRACTION SUCCESS:', extractedData);

const { data: updateResult, error: updateError } = await supabase
  .from('delivery_records')
  .update({
    supplier_name: extractedData.supplierName,
    delivery_date: extractedData.deliveryDate,
    temperature_reading: extractedData.temperatureReading,
    line_item_count: extractedData.lineItemCount,
    invoice_number: extractedData.invoiceNumber,
    total_amount: extractedData.totalAmount,
    processing_status: 'completed',
    raw_extracted_text: documentAIResponse.document.text,
    structured_data: JSON.stringify(extractedData.lineItems),
    processed_at: new Date().toISOString()
  })
  .eq('id', deliveryRecordId)
  .select();
```

## 📋 EXPECTED STRUCTURED RESPONSE

Invoice Parser returns entities like:
```json
{
  "entities": [
    {
      "type": "supplier_name",
      "textAnchor": {
        "content": "SERVICE FOODS - AUCKLAND FOODSERVICE"
      }
    },
    {
      "type": "invoice_date",
      "normalizedValue": {
        "text": "2025-09-01"
      }
    },
    {
      "type": "line_item/description",
      "textAnchor": {
        "content": "Fresh Chicken Breast 5kg"
      }
    },
    {
      "type": "line_item/amount",
      "normalizedValue": {
        "text": "$45.00"
      }
    }
  ]
}
```

## 🎯 ADVANTAGES OF INVOICE PARSER

**Current OCR Processing**: 
- Raw text parsing with regex
- Error-prone field extraction
- Manual line item counting
- Inconsistent supplier name formats

**Invoice Parser Benefits**:
- ✅ Structured supplier information
- ✅ Automatic line item extraction with descriptions and amounts
- ✅ Normalized date formats
- ✅ Invoice numbers automatically detected
- ✅ Total amounts calculated
- ✅ Higher accuracy for structured documents

## 🚀 IMPLEMENTATION PRIORITY

1. **Create Invoice Parser processor** in Google Cloud Console
2. **Update processor ID** in Edge Function
3. **Replace OCR text parsing** with structured entity extraction
4. **Test with delivery docket images** to verify structured data extraction
5. **Update database schema** if needed for additional structured fields

## 🎯 SUCCESS CRITERIA

After implementation:
- Supplier names extracted with higher accuracy
- Line items automatically counted and detailed
- Invoice numbers detected automatically
- Amounts and totals available for cost tracking
- Temperature still manually extracted (Invoice Parser + custom logic)

---

**THIS IS THE MISSING PIECE!** Invoice Parser will give you professional-grade structured data extraction instead of manual text parsing. Perfect for delivery dockets and compliance documentation.