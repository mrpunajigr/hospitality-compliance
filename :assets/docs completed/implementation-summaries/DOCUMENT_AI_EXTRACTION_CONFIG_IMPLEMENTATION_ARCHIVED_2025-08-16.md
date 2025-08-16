# Document AI Extraction & Configurable Results System

## 🎯 OVERVIEW

Create a comprehensive system where Google Cloud Document AI extracts detailed information from delivery dockets, and clients can configure which data points appear in their results cards based on their business needs.

## 📊 GOOGLE CLOUD AI EXTRACTION CAPABILITIES

### **Document AI Processor Configuration**

#### **Primary Data Extraction:**
```typescript
interface DocumentAIExtraction {
  // Core Compliance Data (Always Extract)
  supplier: {
    value: string,
    confidence: number,
    boundingBox: BoundingBox,
    extractionMethod: 'text_detection' | 'entity_recognition'
  },
  
  deliveryDate: {
    value: Date,
    confidence: number,
    boundingBox: BoundingBox,
    format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  },
  
  handwrittenNotes: {
    signedBy: string,
    confidence: number,
    boundingBox: BoundingBox,
    extractionMethod: 'handwriting_recognition'
  },
  
  temperatureData: {
    readings: TemperatureReading[],
    overallCompliance: 'compliant' | 'violation' | 'warning'
  },
  
  // Business Data (Configurable Display)
  invoiceNumber: {
    value: string,
    confidence: number,
    boundingBox: BoundingBox
  },
  
  items: LineItem[],
  
  analysis: {
    productClassification: ProductClassification,
    estimatedValue: number,
    itemCount: number
  }
}

interface TemperatureReading {
  value: number,
  unit: 'C' | 'F',
  productContext: string, // "dairy products", "frozen goods"
  boundingBox: BoundingBox,
  confidence: number,
  complianceStatus: 'pass' | 'fail' | 'warning'
}

interface LineItem {
  description: string,
  quantity: number,
  unitSize: string, // "1kg", "500ml", "12 pack"
  unitPrice: number,
  totalPrice: number,
  sku: string,
  productCategory: 'frozen' | 'chilled' | 'ambient',
  confidence: number
}

interface ProductClassification {
  frozen: string[], // ["ice cream", "frozen vegetables"]
  chilled: string[], // ["dairy", "meat", "fresh produce"]
  ambient: string[], // ["dry goods", "canned items", "bread"]
  unclassified: string[]
}
```

### **AI Processing Pipeline:**

#### **Stage 1: Document Structure Recognition**
```typescript
async function extractDocumentStructure(document: Buffer) {
  const structureAnalysis = await documentAI.processDocument({
    name: PROCESSOR_ID,
    rawDocument: {
      content: document.toString('base64'),
      mimeType: 'image/jpeg'
    },
    documentProcessorConfig: {
      enableNativeStructureExtraction: true,
      enableFormExtraction: true,
      enableTableExtraction: true
    }
  });
  
  return {
    documentType: detectDocumentType(structureAnalysis),
    layout: extractLayoutElements(structureAnalysis),
    tables: extractTables(structureAnalysis),
    forms: extractFormFields(structureAnalysis)
  };
}
```

#### **Stage 2: Entity and Field Extraction**
```typescript
async function extractBusinessEntities(document: Buffer, structure: DocumentStructure) {
  const entityExtraction = await documentAI.processDocument({
    name: ENTITY_PROCESSOR_ID,
    rawDocument: {
      content: document.toString('base64'),
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
  });
  
  return processEntityResults(entityExtraction);
}
```

#### **Stage 3: Product Classification**
```typescript
function classifyProductTemperatureRequirements(items: LineItem[]): ProductClassification {
  const classification = {
    frozen: [],
    chilled: [],
    ambient: [],
    unclassified: []
  };
  
  const temperatureKeywords = {
    frozen: [
      'ice cream', 'frozen', 'gelato', 'sorbet', 'frozen vegetables',
      'frozen meat', 'frozen fish', 'frozen fruit', 'ice', 'freezer'
    ],
    chilled: [
      'milk', 'dairy', 'cheese', 'yogurt', 'butter', 'cream',
      'fresh meat', 'chicken', 'beef', 'pork', 'seafood', 'fish',
      'fresh produce', 'salad', 'lettuce', 'refrigerated'
    ],
    ambient: [
      'bread', 'flour', 'rice', 'pasta', 'canned', 'dry goods',
      'oil', 'vinegar', 'spices', 'nuts', 'biscuits', 'cereal'
    ]
  };
  
  items.forEach(item => {
    const description = item.description.toLowerCase();
    let classified = false;
    
    for (const [category, keywords] of Object.entries(temperatureKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        classification[category].push(item.description);
        classified = true;
        break;
      }
    }
    
    if (!classified) {
      classification.unclassified.push(item.description);
    }
  });
  
  return classification;
}
```

## ⚙️ CONFIGURABLE RESULTS SYSTEM

### **Client Configuration Interface**

#### **Database Schema for Configuration:**
```sql
CREATE TABLE client_display_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    config_name TEXT DEFAULT 'default',
    is_active BOOLEAN DEFAULT true,
    
    -- Mandatory Fields (Always Shown)
    show_supplier BOOLEAN DEFAULT true,
    show_delivery_date BOOLEAN DEFAULT true,
    show_signed_by BOOLEAN DEFAULT true,
    show_temperature_data BOOLEAN DEFAULT true,
    show_product_classification BOOLEAN DEFAULT true,
    
    -- Optional Fields (Configurable)
    show_invoice_number BOOLEAN DEFAULT false,
    show_items BOOLEAN DEFAULT false,
    show_unit_size BOOLEAN DEFAULT false,
    show_unit_price BOOLEAN DEFAULT false,
    show_sku_code BOOLEAN DEFAULT false,
    show_tax BOOLEAN DEFAULT false,
    
    -- Display Preferences
    results_card_layout TEXT DEFAULT 'compact' CHECK (results_card_layout IN ('compact', 'detailed', 'minimal')),
    group_by_temperature_category BOOLEAN DEFAULT true,
    show_confidence_scores BOOLEAN DEFAULT false,
    
    -- Business-Specific Settings
    currency_symbol TEXT DEFAULT '$',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    temperature_unit TEXT DEFAULT 'C',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Configuration Panel UI Component:**
```typescript
interface ConfigurationPanelProps {
  clientId: string;
  currentConfig: DisplayConfiguration;
  onConfigUpdate: (config: DisplayConfiguration) => void;
}

interface DisplayConfiguration {
  mandatoryFields: {
    supplier: boolean; // Always true
    deliveryDate: boolean; // Always true
    signedBy: boolean; // Always true
    temperatureData: boolean; // Always true
    productClassification: boolean; // Always true
  };
  
  optionalFields: {
    invoiceNumber: boolean;
    items: boolean;
    unitSize: boolean;
    unitPrice: boolean;
    skuCode: boolean;
    tax: boolean;
  };
  
  displayPreferences: {
    cardLayout: 'compact' | 'detailed' | 'minimal';
    groupByTemperatureCategory: boolean;
    showConfidenceScores: boolean;
    currencySymbol: string;
    dateFormat: string;
    temperatureUnit: 'C' | 'F';
  };
}
```

### **Configuration Panel Interface:**

#### **Visual Layout:**
```typescript
const ConfigurationPanel = () => {
  return (
    <div className="configuration-panel">
      <h3>Results Card Configuration</h3>
      
      <div className="mandatory-section">
        <h4>Mandatory Information (Always Displayed)</h4>
        <div className="field-list disabled">
          <Field label="Supplier Name" checked={true} disabled={true} />
          <Field label="Delivery Date" checked={true} disabled={true} />
          <Field label="Signed By" checked={true} disabled={true} />
          <Field label="Temperature Data" checked={true} disabled={true} />
          <Field label="Product Classification" checked={true} disabled={true} />
        </div>
      </div>
      
      <div className="optional-section">
        <h4>Optional Information (Choose What to Display)</h4>
        <div className="field-list">
          <Field 
            label="Invoice Number" 
            checked={config.invoiceNumber} 
            onChange={handleToggle('invoiceNumber')}
            description="Show invoice/order numbers from dockets"
          />
          <Field 
            label="Line Items" 
            checked={config.items} 
            onChange={handleToggle('items')}
            description="Display individual products and quantities"
          />
          <Field 
            label="Unit Sizes" 
            checked={config.unitSize} 
            onChange={handleToggle('unitSize')}
            description="Show package sizes (1kg, 500ml, etc.)"
          />
          <Field 
            label="Unit Prices" 
            checked={config.unitPrice} 
            onChange={handleToggle('unitPrice')}
            description="Display individual item prices"
          />
          <Field 
            label="SKU/Product Codes" 
            checked={config.skuCode} 
            onChange={handleToggle('skuCode')}
            description="Show product codes and SKUs"
          />
          <Field 
            label="Tax Information" 
            checked={config.tax} 
            onChange={handleToggle('tax')}
            description="Display tax amounts and rates"
          />
        </div>
      </div>
      
      <div className="display-preferences">
        <h4>Display Preferences</h4>
        <Select 
          label="Card Layout"
          value={config.cardLayout}
          options={[
            { value: 'compact', label: 'Compact - Essential info only' },
            { value: 'detailed', label: 'Detailed - All selected fields' },
            { value: 'minimal', label: 'Minimal - Critical compliance only' }
          ]}
        />
        
        <Toggle 
          label="Group by Temperature Category"
          checked={config.groupByTemperatureCategory}
          description="Organize items by Frozen/Chilled/Ambient"
        />
        
        <Toggle 
          label="Show AI Confidence Scores"
          checked={config.showConfidenceScores}
          description="Display how confident the AI is about extracted data"
        />
      </div>
      
      <div className="preview-section">
        <h4>Preview</h4>
        <ResultsCardPreview config={config} sampleData={sampleExtraction} />
      </div>
    </div>
  );
};
```

### **Dynamic Results Card Generation:**

#### **Results Card Component:**
```typescript
interface ResultsCardProps {
  extractionData: DocumentAIExtraction;
  displayConfig: DisplayConfiguration;
  onEdit?: () => void;
}

const ResultsCard = ({ extractionData, displayConfig, onEdit }: ResultsCardProps) => {
  return (
    <div className={`results-card layout-${displayConfig.cardLayout}`}>
      <CardHeader>
        <h3>Delivery Docket Results</h3>
        {onEdit && <Button onClick={onEdit}>Edit Configuration</Button>}
      </CardHeader>
      
      <CardBody>
        {/* Mandatory Fields - Always Shown */}
        <MandatorySection>
          <Field label="Supplier" value={extractionData.supplier.value} />
          <Field label="Delivery Date" value={formatDate(extractionData.deliveryDate.value, displayConfig.dateFormat)} />
          <Field label="Signed By" value={extractionData.handwrittenNotes.signedBy} />
          <TemperatureSection 
            data={extractionData.temperatureData} 
            unit={displayConfig.temperatureUnit}
          />
          <ProductClassificationSection 
            data={extractionData.analysis.productClassification}
            grouped={displayConfig.groupByTemperatureCategory}
          />
        </MandatorySection>
        
        {/* Optional Fields - Based on Configuration */}
        <OptionalSection>
          {displayConfig.optionalFields.invoiceNumber && extractionData.invoiceNumber && (
            <Field label="Invoice Number" value={extractionData.invoiceNumber.value} />
          )}
          
          {displayConfig.optionalFields.items && extractionData.items.length > 0 && (
            <ItemsSection 
              items={extractionData.items}
              showUnitSize={displayConfig.optionalFields.unitSize}
              showUnitPrice={displayConfig.optionalFields.unitPrice}
              showSku={displayConfig.optionalFields.skuCode}
              showTax={displayConfig.optionalFields.tax}
              currencySymbol={displayConfig.displayPreferences.currencySymbol}
            />
          )}
        </OptionalSection>
        
        {/* Confidence Scores - If Enabled */}
        {displayConfig.displayPreferences.showConfidenceScores && (
          <ConfidenceSection data={extractionData} />
        )}
      </CardBody>
    </div>
  );
};
```

### **Business-Specific Presets:**

#### **Industry Templates:**
```typescript
const industryPresets = {
  restaurant: {
    name: 'Restaurant Standard',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: false,
      unitPrice: false,
      skuCode: false,
      tax: false
    },
    cardLayout: 'compact',
    groupByTemperatureCategory: true
  },
  
  hotel: {
    name: 'Hotel Catering',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: true,
      unitPrice: true,
      skuCode: false,
      tax: true
    },
    cardLayout: 'detailed',
    groupByTemperatureCategory: true
  },
  
  cafe: {
    name: 'Café Basic',
    optionalFields: {
      invoiceNumber: false,
      items: false,
      unitSize: false,
      unitPrice: false,
      skuCode: false,
      tax: false
    },
    cardLayout: 'minimal',
    groupByTemperatureCategory: true
  },
  
  catering: {
    name: 'Catering Business',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: true,
      unitPrice: true,
      skuCode: true,
      tax: true
    },
    cardLayout: 'detailed',
    groupByTemperatureCategory: false
  }
};
```

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: Enhanced Document AI Processing**
1. **Upgrade extraction capabilities** to capture all data points
2. **Implement product classification** logic
3. **Add confidence scoring** for all extracted fields
4. **Create structured data format** for extraction results

### **Phase 2: Configuration System**
1. **Build database schema** for client configurations
2. **Create configuration panel** in admin settings
3. **Implement industry presets** for quick setup
4. **Add real-time preview** functionality

### **Phase 3: Dynamic Results Cards**
1. **Build configurable results card** component
2. **Implement layout variations** (compact/detailed/minimal)
3. **Add export capabilities** for configured data
4. **Test across different business types**

### **Phase 4: Business Intelligence**
1. **Analytics on field usage** - which fields are most valuable
2. **Extraction accuracy tracking** - improve AI over time
3. **Business insights** - trends in product categories, pricing
4. **Compliance reporting** - automated reports based on configured data

## 💡 STRATEGIC BENEFITS

### **For Clients:**
- **Customized experience** - see only relevant data
- **Business-specific workflows** - different industries need different info
- **Reduced noise** - focus on what matters for their operation
- **Scalable complexity** - start simple, add detail as needed

### **For Platform:**
- **Universal appeal** - works for any hospitality business
- **Competitive advantage** - no other platform offers this flexibility
- **Data richness** - capture everything, display selectively
- **Future-proof** - easy to add new data types and configurations

### **For Bolt-On Modules:**
- **Consistent data model** - all modules use same extraction format
- **Shared configuration** - settings apply across modules
- **Layered complexity** - modules can add their own optional fields
- **Business intelligence** - rich data for analytics and insights

---

**This system transforms the platform from a simple compliance tool into a comprehensive business intelligence platform that adapts to each client's specific needs and grows with their business complexity.**