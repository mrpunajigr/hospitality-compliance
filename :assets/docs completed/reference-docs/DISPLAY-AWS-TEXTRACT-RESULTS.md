# 🔍 Display AWS Textract Results with Thumbnail

## Add Raw Text Display to EnhancedUpload Component

To show the actual AWS Textract extracted text alongside the thumbnail, we need to modify the results display section.

### Find and Update: `/app/components/delivery/EnhancedUpload.tsx`

Look for line ~650 in the "Processing Results" section and add this enhanced display:

Replace the existing results section (around line 604-700) with:

```typescript
{/* Enhanced Results Preview with Raw AWS Textract Text */}
{statusCounts.completed > 0 && (
  <div className={getCardStyle('primary')}>
    <div className="p-6">
      <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
        Processing Results ({statusCounts.completed} completed)
      </h3>
      
      <div className="space-y-6">
        {uploadFiles
          .filter(f => f.status === 'completed' && f.result)
          .map((uploadFile) => {
            const result = uploadFile.result
            if (!result) return null
            const extraction = result.enhancedExtraction
            if (!extraction) return null
            
            return (
              <div key={uploadFile.id} className="bg-white/10 rounded-xl p-6">
                
                {/* Header with Thumbnail and Basic Info */}
                <div className="flex items-start space-x-4 mb-6">
                  {/* Large Thumbnail */}
                  <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {uploadFile.preview ? (
                      <img 
                        src={uploadFile.preview} 
                        alt={uploadFile.file.name}
                        className="w-32 h-32 object-cover rounded-lg border border-white/30"
                      />
                    ) : (
                      <span className="text-white text-4xl">📄</span>
                    )}
                  </div>
                  
                  {/* File Info and Stats */}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-2">
                      {uploadFile.file.name}
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Confidence</div>
                        <div className="text-green-300 text-lg font-bold">
                          {((extraction.analysis?.overallConfidence || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Items Found</div>
                        <div className="text-blue-300 text-lg font-bold">
                          {extraction.lineItems?.length || 0}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Supplier</div>
                        <div className="text-white text-sm font-medium truncate">
                          {extraction.supplier?.value || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Process Time</div>
                        <div className="text-purple-300 text-sm font-medium">
                          {extraction.analysis?.processingTime || 0}ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Raw AWS Textract Text Display */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-medium">🤖 AWS Textract Raw Extraction</h5>
                    <button
                      onClick={() => {
                        // Get raw text from database record
                        navigator.clipboard.writeText(result.deliveryRecordId)
                        alert('Record ID copied to clipboard')
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                    >
                      Copy Record ID
                    </button>
                  </div>
                  
                  {/* Raw Text Container */}
                  <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap break-words">
                      {/* This will show the actual AWS Textract extracted text */}
                      {/* We need to fetch this from the database record */}
                      <RawTextractDisplay recordId={result.deliveryRecordId} />
                    </pre>
                  </div>
                </div>
                
                {/* Structured Data Display */}
                <div className="border-t border-white/20 pt-4 mt-4">
                  <h5 className="text-white font-medium mb-3">📊 Structured Analysis</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Line Items */}
                    {extraction.lineItems && extraction.lineItems.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-2">Line Items ({extraction.lineItems.length})</div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {extraction.lineItems.slice(0, 5).map((item: any, index: number) => (
                            <div key={index} className="text-white text-sm flex justify-between">
                              <span className="truncate flex-1">{item.description}</span>
                              <span className="text-blue-300 ml-2">{item.quantity}</span>
                            </div>
                          ))}
                          {extraction.lineItems.length > 5 && (
                            <div className="text-white/60 text-xs">
                              +{extraction.lineItems.length - 5} more items...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Temperature Data */}
                    {extraction.temperatureData && extraction.temperatureData.readings && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-2">Temperature Readings</div>
                        <div className="space-y-1">
                          {extraction.temperatureData.readings.slice(0, 3).map((reading: any, index: number) => (
                            <div key={index} className="text-white text-sm flex justify-between">
                              <span>{reading.value}°{reading.unit}</span>
                              <span className={`${reading.complianceStatus === 'pass' ? 'text-green-300' : 'text-red-300'}`}>
                                {reading.complianceStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            )
          })}
      </div>
    </div>
  </div>
)}
```

## Create Raw Textract Display Component

Create a new component to fetch and display the raw AWS Textract text:

```typescript
// Add this component inside EnhancedUpload.tsx or create separate file

interface RawTextractDisplayProps {
  recordId: string
}

function RawTextractDisplay({ recordId }: RawTextractDisplayProps) {
  const [rawText, setRawText] = useState<string>('Loading AWS Textract results...')
  
  useEffect(() => {
    const fetchRawText = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_records')
          .select('raw_extracted_text, processing_metadata')
          .eq('id', recordId)
          .single()
        
        if (error) throw error
        
        if (data?.raw_extracted_text) {
          setRawText(data.raw_extracted_text)
        } else {
          setRawText('No raw text available - processing may have failed')
        }
      } catch (error) {
        console.error('Error fetching raw text:', error)
        setRawText('Error loading AWS Textract results')
      }
    }
    
    if (recordId) {
      fetchRawText()
    }
  }, [recordId])
  
  return <span>{rawText}</span>
}
```

## Import useState and useEffect

Make sure these are imported at the top of the component:

```typescript
import { useCallback, useRef, useState, useEffect } from 'react'
```

## Result

This will show:
1. ✅ **Large thumbnail** (128x128px) of the uploaded image
2. ✅ **Processing statistics** (confidence, items found, etc.)
3. ✅ **Raw AWS Textract text** in a scrollable black terminal-style box
4. ✅ **Structured analysis** showing parsed line items and temperatures
5. ✅ **Copy functionality** to get the record ID for debugging

The raw AWS Textract text will be displayed in green monospace font in a dark container, showing exactly what text AWS extracted from the delivery docket image.