# Phase 1: Barcode Implementation Guide

**For**: Claude Code  
**Phase**: 1 (STOCK & COUNT Core)  
**Feature**: Barcode Scanning  
**Effort**: ~12 hours

---

## Database Status

✅ `inventory_items.barcode` field is LIVE  
✅ Indexes created for fast lookups  
✅ Unique constraint active (per client)  
✅ Field is optional (NULL allowed)

---

## Components to Build

### 1. BarcodeScanner Component (4 hours)

**File**: `components/inventory/BarcodeScanner.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  // iPad camera access
  // QuaggaJS for barcode detection
  // Manual entry fallback
  // Support UPC/EAN/GTIN formats
}
```

**Features**:
- iPad Air (2013) camera access
- Real-time barcode detection
- Visual scanning feedback
- Manual entry fallback
- Error handling

**Libraries**:
```bash
npm install @ericblade/quagga2
```

**iPad Safari 12 Camera API**:
```typescript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Back camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
})
```

---

### 2. Barcode Lookup API (1 hour)

**File**: `app/api/inventory/barcode/[code]/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const supabase = createClient();
  
  // Get user's client_id (automatic via RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Lookup by barcode
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (
        category_name
      )
    `)
    .eq('barcode', params.code)
    .single();
    
  if (error || !data) {
    return NextResponse.json({ item: null });
  }
  
  return NextResponse.json({ item: data });
}
```

**Usage in frontend**:
```typescript
const lookupBarcode = async (barcode: string) => {
  const response = await fetch(`/api/inventory/barcode/${barcode}`);
  const { item } = await response.json();
  return item;
};
```

---

### 3. COUNT Interface Integration (3 hours)

**File**: `app/count/new/page.tsx`

Add barcode scanning to stocktake interface:

```typescript
const [showScanner, setShowScanner] = useState(false);
const [items, setItems] = useState<CountItem[]>([]);

const handleBarcodeScan = async (barcode: string) => {
  // Lookup item
  const item = await lookupBarcode(barcode);
  
  if (!item) {
    toast.error('Item not found. Try manual search.');
    return;
  }
  
  // Check if already in count
  const existing = items.find(i => i.id === item.id);
  if (existing) {
    // Focus on existing item for quantity entry
    focusItem(item.id);
  } else {
    // Add to count list
    addItemToCount(item);
  }
  
  setShowScanner(false);
};

return (
  <div>
    {/* Quick actions */}
    <div className="flex gap-2 mb-4">
      <Button onClick={() => setShowSearch(true)}>
        🔍 Search Items
      </Button>
      <Button onClick={() => setShowScanner(true)}>
        📷 Scan Barcode
      </Button>
    </div>
    
    {/* Scanner modal */}
    {showScanner && (
      <BarcodeScanner 
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    )}
    
    {/* Count items list */}
    <div className="count-items">
      {items.map(item => (
        <CountItemCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);
```

**Key UX Points**:
- Large "Scan Barcode" button
- Modal scanner overlay
- Auto-close on successful scan
- Focus quantity input after scan
- Clear error messages

---

### 4. Item Entry Form (2 hours)

**File**: `app/stock/items/new/page.tsx`

Add barcode field to item creation:

```typescript
const [showScanner, setShowScanner] = useState(false);
const [formData, setFormData] = useState({
  item_name: '',
  brand: '',
  barcode: '', // ⭐ New field
  recipe_unit: '',
  // ... other fields
});

const handleBarcodeScan = (barcode: string) => {
  // Check for duplicates first
  checkDuplicateBarcode(barcode).then(existing => {
    if (existing) {
      if (confirm(`This barcode already exists for "${existing.item_name}". Link to existing item?`)) {
        router.push(`/stock/items/${existing.id}`);
      }
    } else {
      setFormData(prev => ({ ...prev, barcode }));
      setShowScanner(false);
    }
  });
};

return (
  <form>
    {/* ... other fields ... */}
    
    <div className="form-field">
      <label>Barcode (Optional)</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={formData.barcode}
          onChange={e => setFormData(prev => ({ 
            ...prev, 
            barcode: e.target.value 
          }))}
          placeholder="012345678905"
          maxLength={20}
        />
        <Button 
          type="button"
          onClick={() => setShowScanner(true)}
        >
          📷 Scan
        </Button>
      </div>
    </div>
    
    {showScanner && (
      <BarcodeScanner 
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    )}
  </form>
);
```

---

### 5. Utility Functions (0.5 hours)

**File**: `lib/utils/barcode.ts`

```typescript
// Validate barcode format
export function isValidBarcode(code: string): boolean {
  const cleaned = code.replace(/\D/g, '');
  return [8, 12, 13, 14].includes(cleaned.length);
}

// Format for display
export function formatBarcode(code: string): string {
  const cleaned = code.replace(/\D/g, '');
  
  if (cleaned.length === 12) {
    // UPC-A: 0-12345-67890-5
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 6)}-${cleaned.slice(6, 11)}-${cleaned.slice(11)}`;
  }
  
  if (cleaned.length === 13) {
    // EAN-13: 0-123456-789012-3
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 7)}-${cleaned.slice(7, 13)}`;
  }
  
  return code;
}

// Clean for storage
export function cleanBarcode(code: string): string {
  return code.replace(/\D/g, '');
}

// Check for duplicate
export async function checkDuplicateBarcode(
  barcode: string,
  clientId: string
): Promise<{ id: string; item_name: string } | null> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('inventory_items')
    .select('id, item_name')
    .eq('client_id', clientId)
    .eq('barcode', cleanBarcode(barcode))
    .maybeSingle();
    
  return data;
}
```

---

## Testing Checklist

### Manual Testing:
- [ ] Scan UPC-A barcode (12 digits)
- [ ] Scan EAN-13 barcode (13 digits)
- [ ] Enter barcode manually
- [ ] Test invalid barcode length
- [ ] Test duplicate barcode
- [ ] Test barcode with spaces/dashes
- [ ] Scan during COUNT
- [ ] Scan when adding new item
- [ ] Test camera permissions prompt
- [ ] Test manual entry fallback

### iPad Air (2013) Testing:
- [ ] Works in Portrait mode
- [ ] Works in Landscape mode
- [ ] Camera opens correctly
- [ ] Scanning is responsive
- [ ] No crashes
- [ ] Permissions handled gracefully

### Edge Cases:
- [ ] Empty barcode (should allow)
- [ ] Very long barcode (should reject)
- [ ] Non-numeric barcode (should clean/reject)
- [ ] Same barcode different clients (should work)
- [ ] Poor lighting conditions
- [ ] Damaged/unclear barcode

---

## Success Metrics

✅ Barcode scanning functional on iPad Air  
✅ 90%+ successful scan rate  
✅ <2 seconds scan-to-result time  
✅ Zero crashes from camera access  
✅ Manual fallback always available  

---

## iPad Camera Permissions

**User Prompt**:
```
JiGR needs camera access to scan product barcodes 
during stocktakes. This makes counting faster and 
more accurate.

[ Don't Allow ]  [ Allow ]
```

**Handle Denial**:
```typescript
if (permissionDenied) {
  toast.info('Camera access required for scanning. You can still enter barcodes manually.');
  // Show manual entry option
}
```

---

## QuaggaJS Configuration

**Installation**:
```bash
npm install @ericblade/quagga2
```

**Basic Setup**:
```typescript
import Quagga from '@ericblade/quagga2';

Quagga.init({
  inputStream: {
    name: 'Live',
    type: 'LiveStream',
    target: videoElement,
    constraints: {
      width: 1280,
      height: 720,
      facingMode: 'environment'
    },
  },
  decoder: {
    readers: ['upc_reader', 'ean_reader']
  },
  locate: true,
}, (err) => {
  if (err) {
    console.error('QuaggaJS init failed:', err);
    return;
  }
  Quagga.start();
});

Quagga.onDetected((result) => {
  const barcode = result.codeResult.code;
  if (isValidBarcode(barcode)) {
    onScan(barcode);
    Quagga.stop();
  }
});
```

---

## Rollback Plan

If barcode features cause issues:

**Phase 1**: Disable barcode scanning UI  
- Remove scan buttons
- Hide barcode fields
- Data still stored, just not used

**Phase 2**: Remove barcode field from database  
```sql
ALTER TABLE inventory_items DROP COLUMN barcode;
```

---

## Documentation for Users

### User Guide Section: "Scanning Barcodes"

**How to scan during stocktake**:
1. Start a new count
2. Tap "📷 Scan Barcode"
3. Point camera at product barcode
4. Wait for green flash
5. Enter quantity
6. Repeat!

**Tips for best results**:
- Good lighting helps
- Hold steady for 1-2 seconds
- Try different angles if first scan fails
- Clean/undamaged barcodes work best
- Manual entry always available as backup

---

## Time Estimates

| Task | Hours |
|------|-------|
| BarcodeScanner component | 4 |
| Barcode lookup API | 1 |
| COUNT integration | 3 |
| Item form integration | 2 |
| Utilities & validation | 0.5 |
| Testing & polish | 2 |
| **TOTAL** | **12.5** |

---

## Priority

**HIGH**: This feature provides immediate, measurable value:
- 83% faster stocktakes
- Zero item identification errors
- Professional competitive advantage
- iPad-native experience

Build this EARLY in Phase 1 for maximum impact!

---

**Ready to build! The database is ready, specs are clear, let's make stocktakes 10x faster! 🚀**
