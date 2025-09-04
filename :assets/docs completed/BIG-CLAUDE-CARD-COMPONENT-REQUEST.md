# REQUEST: Build Fresh Card Component for Delivery Dockets

## Current Status ✅
- **Upload functionality**: Working perfectly (200 OK responses)
- **Edge Function processing**: Successful data extraction  
- **Problem**: Existing card component has persistent state management issues preventing display

## Edge Function Response Structure (EXACT FORMAT)

Our Edge Function returns this EXACT structure:

```json
{
  "success": true,
  "deliveryRecordId": "uuid-string",
  "message": "Document processed successfully",
  "enhancedExtraction": {
    "supplier": { 
      "value": "Premium Produce Ltd",
      "confidence": 0.925 
    },
    "deliveryDate": { 
      "value": "2025-08-31",
      "confidence": 0.925 
    },
    "temperatureData": {
      "readings": [{
        "value": 2.1,
        "unit": "C",
        "complianceStatus": "pass"
      }]
    },
    "lineItems": [
      {
        "item_number": 1,
        "description": "Fresh Chicken Breast - 2kg",
        "quantity": 1,
        "unit": "kg",
        "confidence": 0.95
      }
      // ... more items
    ],
    "analysis": {
      "overallConfidence": 0.925,
      "itemCount": 7,
      "processingTime": 150
    }
  }
}
```

## Required Card Display Fields (User's Original Request)

The cards MUST show these 5 fields:
1. **Supplier Name** - from `enhancedExtraction.supplier.value`
2. **Delivery Date** - from `enhancedExtraction.deliveryDate.value` 
3. **Number of Line Items** - from `enhancedExtraction.analysis.itemCount`
4. **Temperature (handwritten)** - from `enhancedExtraction.temperatureData.readings[0].value`
5. **Thumbnail of Docket** - from upload file preview

## Integration Point

The new card component should integrate with our existing `EnhancedUpload.tsx` component at line 739 where we removed the broken card section.

## Current State Management

Our upload files are stored in state as:
```typescript
interface UploadFile {
  id: string
  file: File
  status: 'completed' // when successful
  result?: EnhancedExtractionResult // contains the Edge Function response
  preview?: string // thumbnail URL
}
```

## Design System Integration

Please use our design system utilities:
- `getCardStyle('secondary')` for individual cards
- `getTextStyle('cardTitle')` for card titles
- Glass morphism styling with white text on blue backgrounds

## Request to Big Claude

Please build a fresh card component that:
1. Takes the Edge Function response structure above
2. Displays the 5 required fields cleanly
3. Integrates seamlessly with our existing upload state management
4. Uses our design system utilities
5. Handles the temperature compliance color coding (green ≤4°C, yellow 4-7°C, red >7°C)

The component should be simple, robust, and eliminate the complex state management issues we've been experiencing.