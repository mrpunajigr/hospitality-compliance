# IMPLEMENTATION PLAN - Document AI Parser Enhancement

## Phase 1: Robust Google Cloud Document AI Parser

### Current Problem
- Raw Google Cloud response contains 13 detailed line items
- Current parser only extracts generic "WHOLESALE FOOD & BEVERAGE" text  
- Business value (individual products) not reaching users

### Step-by-Step Implementation

#### 1. Add Comprehensive Logging (IMMEDIATE)
Location: `supabase/functions/process-delivery-docket/index.ts` around line 364

```typescript
// After Google Cloud API call succeeds
const result = await response.json()
console.log('🔍 COMPLETE Google Cloud Response:', JSON.stringify(result, null, 2))
console.log('🔍 Document Pages:', result.document?.pages?.length)
console.log('🔍 Tables Found:', result.document?.pages?.[0]?.tables?.length)
console.log('🔍 Entities Found:', result.document?.entities?.length)
```

#### 2. Create Advanced Table Parser
Replace current `extractLineItems` function (lines 128-169) with:

```typescript
function parseGoogleCloudTables(document: any): LineItem[] {
  const lineItems: LineItem[] = []
  
  try {
    const pages = document?.pages || []
    
    for (const page of pages) {
      // Parse tables - primary source of structured data
      if (page.tables) {
        for (const table of page.tables) {
          const tableItems = parseTableStructure(table, document.text)
          lineItems.push(...tableItems)
        }
      }
      
      // Parse paragraphs - fallback for non-table data
      if (page.paragraphs && lineItems.length === 0) {
        const paragraphItems = parseProductParagraphs(page.paragraphs, document.text)
        lineItems.push(...paragraphItems)
      }
    }
    
    console.log(`🎯 Extracted ${lineItems.length} line items from Google Cloud response`)
    return lineItems
    
  } catch (error) {
    console.error('❌ Table parsing error:', error)
    return []
  }
}

function parseTableStructure(table: any, fullText: string): LineItem[] {
  const items: LineItem[] = []
  
  try {
    // Extract text from table cells
    const rows = table.bodyRows || []
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.cells || []
      
      if (cells.length >= 3) { // Expect at least product, quantity, price columns
        const item = extractItemFromTableRow(cells, fullText)
        if (item.productName && item.productName.length > 3) {
          items.push(item)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Table row parsing error:', error)
  }
  
  return items
}

function extractItemFromTableRow(cells: any[], fullText: string): LineItem {
  const item: LineItem = {
    productName: '',
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    category: 'ambient'
  }
  
  try {
    // Extract text content from each cell
    for (let i = 0; i < cells.length; i++) {
      const cellText = getCellText(cells[i], fullText).trim()
      
      if (i === 0 && cellText.length > 0) {
        item.productName = cellText
      } else if (i === 1 && /\d+/.test(cellText)) {
        item.quantity = cellText
      } else if (i >= 2 && /\$?\d+\.?\d*/.test(cellText)) {
        if (!item.unitPrice) {
          item.unitPrice = cellText
        } else {
          item.totalPrice = cellText
        }
      }
    }
    
    // Determine category from product name
    const productLower = item.productName.toLowerCase()
    if (productLower.includes('frozen') || productLower.includes('ice')) {
      item.category = 'frozen'
    } else if (productLower.includes('chilled') || productLower.includes('dairy')) {
      item.category = 'chilled'  
    }
    
  } catch (error) {
    console.error('❌ Cell extraction error:', error)
  }
  
  return item
}

function getCellText(cell: any, fullText: string): string {
  try {
    const textSegments = cell.layout?.textAnchor?.textSegments || []
    let cellText = ''
    
    for (const segment of textSegments) {
      const startIndex = parseInt(segment.startIndex) || 0
      const endIndex = parseInt(segment.endIndex) || startIndex + 1
      cellText += fullText.substring(startIndex, endIndex)
    }
    
    return cellText
  } catch (error) {
    return ''
  }
}
```

#### 3. Enhanced Product Recognition
Add fallback parsing for non-table documents:

```typescript
function parseProductParagraphs(paragraphs: any[], fullText: string): LineItem[] {
  const items: LineItem[] = []
  
  try {
    for (const paragraph of paragraphs) {
      const paragraphText = extractParagraphText(paragraph, fullText)
      
      // Look for product patterns like "TOMATOES 5KG $12.50"
      const productMatches = paragraphText.match(/([A-Z][A-Z\s]+)\s+(\d+\w*)\s+\$?([\d.]+)/g)
      
      if (productMatches) {
        for (const match of productMatches) {
          const item = parseProductLine(match)
          if (item.productName) {
            items.push(item)
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Paragraph parsing error:', error)
  }
  
  return items
}
```

#### 4. Update Edge Function Integration
Replace current extraction logic (lines 370-383) with:

```typescript
// Extract structured data using enhanced parsers
const lineItems = parseGoogleCloudTables(result.document)
const supplierName = extractSupplierFromText(extractedText) || extractSupplierFromTables(result.document)
const deliveryInfo = extractDeliveryDetails(result.document, extractedText)

console.log('🎯 ENHANCED EXTRACTION RESULTS:')
console.log('  📋 Supplier:', supplierName)
console.log('  📦 Line Items:', lineItems.length)
console.log('  📄 Sample Items:', lineItems.slice(0, 3).map(item => 
  `${item.productName} - ${item.quantity} - ${item.unitPrice}`
))
```

### Testing Strategy
1. Deploy enhanced parser
2. Upload same test document that shows 13 items in dev tools
3. Verify console logs show structured data extraction
4. Confirm UI displays individual products instead of "WHOLESALE FOOD & BEVERAGE"

### Success Criteria
- ✅ Console logs show 13 parsed line items with product details
- ✅ SimpleResultsCard displays individual products with quantities/prices  
- ✅ Supplier shows specific company name
- ✅ No regression in working authentication/database features