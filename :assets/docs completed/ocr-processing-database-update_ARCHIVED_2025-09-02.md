# OCR Text Processing & Database Update - Claude Code Prompt

## 🎉 SUCCESS! Google Cloud OCR Working
**Current Status**: Getting real OCR text from delivery dockets
**Next Step**: Process OCR text and update database with extracted compliance data

## 🎯 REQUIRED DATA EXTRACTION

From the raw OCR text, extract these fields:

### 1. Supplier Name ✅ 
**Status**: Already working - "SERVICE FOODS - AUCKLAND FOODSERVICE" extracted

### 2. Delivery Date ✅
**Status**: Already working - "2025-09-01" extracted  

### 3. Number of Line Items ❌
**Need**: Parse OCR text to count product line items
**Pattern**: Look for item descriptions, quantities, prices in structured format

### 4. Temperature Reading ❌
**Need**: Find handwritten temperature values
**Patterns**: "2°C", "TEMP: 4°", "4.5 degrees", numbers followed by °C or °F

### 5. Additional Compliance Data ❌
**Need**: Extract invoice numbers, delivery signatures, special handling notes

## 🔧 IMPLEMENTATION REQUIRED

### Step 1: Create OCR Text Processing Function
Add this to your Edge Function:

```typescript
interface ExtractedData {
  supplierName: string;
  deliveryDate: string;
  temperatureReading?: string;
  lineItemCount: number;
  invoiceNumber?: string;
  deliverySignature?: string;
  specialNotes?: string;
}

function processOCRText(rawText: string): ExtractedData {
  console.log('🔍 Processing OCR text:', rawText.substring(0, 200) + '...');
  
  // Temperature extraction patterns
  const tempPatterns = [
    /(\d+\.?\d*)\s*°?C/gi,
    /TEMP[:\s]+(\d+\.?\d*)/gi,
    /(\d+\.?\d*)\s*degrees?/gi,
    /TEMPERATURE[:\s]+(\d+\.?\d*)/gi
  ];
  
  let temperatureReading = '';
  for (const pattern of tempPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      temperatureReading = match[0];
      break;
    }
  }
  
  // Line item counting
  const lineItems = countLineItems(rawText);
  
  // Invoice number extraction
  const invoiceMatch = rawText.match(/(?:INVOICE|INV)[:\s#]*([A-Z0-9\-]+)/i);
  const invoiceNumber = invoiceMatch ? invoiceMatch[1] : undefined;
  
  return {
    supplierName: extractSupplierName(rawText),
    deliveryDate: extractDeliveryDate(rawText),
    temperatureReading,
    lineItemCount: lineItems.length,
    invoiceNumber,
    deliverySignature: extractSignature(rawText),
    specialNotes: extractSpecialNotes(rawText)
  };
}

function countLineItems(text: string): string[] {
  // Look for patterns like:
  // "Chicken Breast 5kg $45.00"
  // "1x Tomatoes 2kg"
  const itemPatterns = [
    /\d+\s*x\s*[A-Za-z\s]+/gi,
    /[A-Za-z\s]+\s+\d+kg/gi,
    /[A-Za-z\s]+\s+\$\d+\.\d{2}/gi
  ];
  
  const items = new Set<string>();
  
  for (const pattern of itemPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(item => items.add(item.trim()));
    }
  }
  
  return Array.from(items);
}
```

### Step 2: Update Database Record
After processing OCR text, update the delivery record:

```typescript
// In your Edge Function, after OCR processing:
const extractedData = processOCRText(ocrText);

console.log('📊 Extracted compliance data:', extractedData);

// Update the database record
const { data: updateResult, error: updateError } = await supabase
  .from('delivery_records')
  .update({
    supplier_name: extractedData.supplierName,
    delivery_date: extractedData.deliveryDate,
    temperature_reading: extractedData.temperatureReading,
    line_item_count: extractedData.lineItemCount,
    invoice_number: extractedData.invoiceNumber,
    delivery_signature: extractedData.deliverySignature,
    special_notes: extractedData.specialNotes,
    processing_status: 'completed',
    raw_extracted_text: ocrText,
    processed_at: new Date().toISOString()
  })
  .eq('id', deliveryRecordId)
  .select();

if (updateError) {
  console.error('❌ Database update failed:', updateError);
  throw new Error(`Database update failed: ${updateError.message}`);
}

console.log('✅ Database updated successfully:', updateResult);
```

### Step 3: Handle Processing Status
Remove the "pending" status and show real data:

```typescript
// Update your response to include processing success
return new Response(JSON.stringify({
  success: true,
  deliveryRecordId,
  message: "Document processed successfully with real OCR data",
  extractedData: extractedData,
  processingStatus: 'completed'
}), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

## 🔍 DEBUGGING REQUIREMENTS

Add detailed logging to track extraction:

```typescript
console.log('🎯 OCR TEXT SAMPLE:', rawText.substring(0, 500));
console.log('🌡️ TEMPERATURE FOUND:', temperatureReading);
console.log('📦 LINE ITEMS FOUND:', lineItemCount);
console.log('🧾 INVOICE NUMBER:', invoiceNumber);
```

## 🎯 SUCCESS CRITERIA

When complete, your card should show:
- **Real supplier names** from actual delivery dockets
- **Actual delivery dates** from documents  
- **Real temperature readings** (handwritten values)
- **Accurate line item counts** from invoice details
- **Processing Status**: "completed" instead of "pending"

## 🚀 PRIORITY ACTIONS

1. **Implement OCR processing function** with temperature and line item extraction
2. **Update database** with processed compliance data
3. **Test with real delivery docket images** to verify extraction accuracy
4. **Handle edge cases** where temperature or line items aren't found

---

**YOU'RE AT THE FINISH LINE!** 
The OCR is working, now just process that text into structured compliance data and update your database. Your platform will be fully operational!