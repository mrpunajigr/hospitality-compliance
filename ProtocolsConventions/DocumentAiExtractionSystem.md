# Document AI Extraction & Configurable Results System

## 🎯 PURPOSE: Intelligent Document Processing with Customizable Display

Create a sophisticated document processing system using Google Cloud Document AI that extracts comprehensive data from delivery dockets and allows clients to configure which information appears in their results display.

## 📋 EXTRACTION FIELD SPECIFICATIONS

### **MANDATORY FIELDS (Always Extracted & Displayed):**

1. **Supplier Information**
   - Company name, business name, trading name
   - Contact details if present
   - Supplier identification numbers

2. **Delivery Date & Time**
   - Delivery date (required for compliance)
   - Time of delivery if recorded
   - Date format standardization

3. **Handwritten Notes & Signatures**
   - Who signed for delivery (name, initials, signature)
   - Any handwritten notes on docket
   - Delivery instructions or comments

4. **Temperature Information**
   - All temperature readings recorded
   - Temperature zones (frozen, chilled, ambient)
   - Temperature compliance status

5. **Product Classification**
   - Automatic categorization: Frozen, Chilled, or Ambient
   - Based on product type analysis
   - Compliance risk assessment

### **OPTIONAL FIELDS (Client Configurable):**

6. **Invoice Number**
   - Invoice/docket reference numbers
   - Purchase order numbers
   - Delivery note numbers

7. **Items & Products**
   - Product names and descriptions
   - Quantities delivered
   - Product categories

8. **Unit Size & Packaging**
   - Package sizes (kg, litres, units)
   - Packaging type (cartons, bags, containers)
   - Unit measurements

9. **Unit Price & Costs**
   - Individual item prices
   - Line item totals
   - Pricing per unit

10. **SKU/Product Codes**
    - Internal product codes
    - Supplier product codes
    - Barcode numbers

11. **Tax Information**
    - GST amounts and rates
    - Tax-exempt items
    - Total tax calculations

## 🤖 GOOGLE CLOUD AI INTEGRATION

### **DOCUMENT AI PROCESSOR CONFIGURATION:**
```typescript
// Google Cloud Document AI setup
const ProcessorConfiguration = {
  processorType: 'FORM_PARSER_PROCESSOR', // Best for delivery dockets
  location: 'us-central1', // Or your preferred region
  features: [
    'TEXT_EXTRACTION',
    'HANDWRITING_DETECTION', 
    'TABLE_EXTRACTION',
    'ENTITY_EXTRACTION'
  ]
};
```

### **EXTRACTION PIPELINE:**
```typescript
interface DocumentProcessingPipeline {
  // Step 1: Basic text extraction
  ExtractAllText(document: Buffer): Promise<string>;
  
  // Step 2: Structured data extraction
  ExtractStructuredData(text: string): Promise<RawDocumentData>;
  
  // Step 3: Business entity recognition
  ExtractBusinessEntities(data: RawDocumentData): Promise<BusinessEntities>;
  
  // Step 4: Temperature analysis
  ExtractTemperatureData(data: RawDocumentData): Promise<TemperatureReading[]>;
  
  // Step 5: Product classification
  ClassifyProductTemperatureRequirements(products: string[]): Promise<ProductClassification[]>;
  
  // Step 6: Validation and compliance checking
  ValidateComplianceRequirements(data: ProcessedDocumentData): Promise<ComplianceStatus>;
}
```

### **DATA EXTRACTION PATTERNS:**
```typescript
// Temperature extraction patterns
const TemperaturePatterns = [
  /(\d+\.?\d*)\s*°?[Cc]/g,           // "4°C" or "4.5C"
  /temp:?\s*(\d+\.?\d*)/gi,          // "Temp: 4" or "TEMP 4.5"
  /(\d+\.?\d*)\s*degrees?/gi,        // "4 degrees" or "4.5 degree"
  /chilled:?\s*(\d+\.?\d*)/gi,       // "Chilled: 4°C"
  /frozen:?\s*(-?\d+\.?\d*)/gi       // "Frozen: -18°C"
];

// Supplier name patterns
const SupplierPatterns = [
  /from:?\s*([A-Za-z\s&\-]+)/gi,     // "From: Company Name"
  /supplier:?\s*([A-Za-z\s&\-]+)/gi, // "Supplier: Company Name"
  /delivered by:?\s*([A-Za-z\s&\-]+)/gi // "Delivered by: Company"
];

// Product classification rules
const ProductClassificationRules = {
  frozen: ['ice cream', 'frozen', 'ice', 'gelato', 'sorbet'],
  chilled: ['dairy', 'milk', 'cheese', 'yogurt', 'cream', 'meat', 'chicken', 'beef'],
  ambient: ['bread', 'flour', 'rice', 'pasta', 'canned', 'dry goods', 'vegetables', 'fruit']
};
```

## ⚙️ CLIENT CONFIGURATION SYSTEM

### **CONFIGURATION PANEL INTERFACE:**
```typescript
interface ClientDisplayConfiguration {
  clientId: string;
  mandatoryFields: {
    supplier: true;
    deliveryDate: true;
    handwrittenNotes: true;
    temperatureInformation: true;
    productClassification: true;
  };
  optionalFields: {
    invoiceNumber: boolean;
    items: boolean;
    unitSize: boolean;
    unitPrice: boolean;
    skuCodes: boolean;
    taxInformation: boolean;
  };
  displaySettings: {
    cardLayout: 'compact' | 'detailed' | 'list';
    showThumbnails: boolean;
    groupBySupplier: boolean;
    sortBy: 'date' | 'supplier' | 'status';
  };
}
```

### **INDUSTRY PRESET CONFIGURATIONS:**
```typescript
const IndustryPresets = {
  cafe: {
    name: 'Café - Simple Compliance',
    description: 'Basic compliance tracking for small cafés',
    optionalFields: {
      invoiceNumber: false,
      items: false,
      unitSize: false,
      unitPrice: false,
      skuCodes: false,
      taxInformation: false
    },
    displaySettings: {
      cardLayout: 'compact',
      showThumbnails: true,
      groupBySupplier: true,
      sortBy: 'date'
    }
  },
  
  restaurant: {
    name: 'Restaurant - Standard Tracking',
    description: 'Compliance plus basic inventory tracking',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: false,
      unitPrice: false,
      skuCodes: false,
      taxInformation: false
    },
    displaySettings: {
      cardLayout: 'detailed',
      showThumbnails: true,
      groupBySupplier: false,
      sortBy: 'date'
    }
  },
  
  hotel: {
    name: 'Hotel - Full Business Intelligence',
    description: 'Complete cost tracking and inventory management',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: true,
      unitPrice: true,
      skuCodes: true,
      taxInformation: true
    },
    displaySettings: {
      cardLayout: 'detailed',
      showThumbnails: false,
      groupBySupplier: false,
      sortBy: 'supplier'
    }
  },
  
  catering: {
    name: 'Catering - Event Tracking',
    description: 'Cost analysis and detailed product tracking',
    optionalFields: {
      invoiceNumber: true,
      items: true,
      unitSize: true,
      unitPrice: true,
      skuCodes: false,
      taxInformation: true
    },
    displaySettings: {
      cardLayout: 'list',
      showThumbnails: false,
      groupBySupplier: true,
      sortBy: 'date'
    }
  }
};
```

### **CONFIGURATION UI COMPONENT:**
```typescript
const ConfigurationPanel = ({ clientId, currentConfig, onUpdate }) => {
  const [config, setConfig] = useState(currentConfig);
  
  const HandlePresetSelection = (presetKey: string) => {
    const preset = IndustryPresets[presetKey];
    setConfig({ ...config, ...preset });
  };
  
  const HandleToggle = (field: string) => {
    setConfig({
      ...config,
      optionalFields: {
        ...config.optionalFields,
        [field]: !config.optionalFields[field]
      }
    });
  };
  
  return (
    <div className="ConfigurationPanel">
      <h3>Display Configuration</h3>
      
      {/* Industry Presets */}
      <div className="IndustryPresets">
        <h4>Quick Setup</h4>
        {Object.entries(IndustryPresets).map(([key, preset]) => (
          <button 
            key={key}
            onClick={() => HandlePresetSelection(key)}
            className="PresetButton"
          >
            {preset.name}
          </button>
        ))}
      </div>
      
      {/* Optional Fields Configuration */}
      <div className="OptionalFields">
        <h4>Optional Information</h4>
        
        <label className="FieldToggle">
          <input 
            type="checkbox" 
            checked={config.optionalFields.invoiceNumber}
            onChange={() => HandleToggle('invoiceNumber')}
          />
          Invoice Numbers
        </label>
        
        <label className="FieldToggle">
          <input 
            type="checkbox" 
            checked={config.optionalFields.items}
            onChange={() => HandleToggle('items')}
          />
          Product Items & Descriptions
        </label>
        
        <label className="FieldToggle">
          <input 
            type="checkbox" 
            checked={config.optionalFields.unitPrice}
            onChange={() => HandleToggle('unitPrice')}
          />
          Pricing Information
        </label>
        
        {/* Additional toggles for other optional fields */}
      </div>
      
      {/* Display Settings */}
      <div className="DisplaySettings">
        <h4>Display Layout</h4>
        
        <select 
          value={config.displaySettings.cardLayout}
          onChange={(e) => setConfig({
            ...config,
            displaySettings: {
              ...config.displaySettings,
              cardLayout: e.target.value
            }
          })}
        >
          <option value="compact">Compact Cards</option>
          <option value="detailed">Detailed Cards</option>
          <option value="list">List View</option>
        </select>
      </div>
      
      {/* Live Preview */}
      <div className="LivePreview">
        <h4>Preview</h4>
        <ResultsCard 
          sampleData={SampleDocumentData} 
          configuration={config}
        />
      </div>
    </div>
  );
};
```

## 📊 RESULTS DISPLAY SYSTEM

### **DYNAMIC RESULTS CARD:**
```typescript
const ResultsCard = ({ documentData, configuration }) => {
  const { mandatoryFields, optionalFields, displaySettings } = configuration;
  
  return (
    <div className={`ResultsCard Layout${displaySettings.cardLayout}`}>
      {/* Always show mandatory fields */}
      <div className="MandatorySection">
        <h4>{documentData.supplier}</h4>
        <p>Delivered: {FormatDate(documentData.deliveryDate)}</p>
        <p>Temperature: {documentData.temperatureStatus}</p>
        <p>Signed by: {documentData.handwrittenNotes}</p>
        <div className="ProductClassification">
          {documentData.productClassification.map(item => (
            <span key={item.type} className={`ClassificationBadge ${item.type}`}>
              {item.type}: {item.products.join(', ')}
            </span>
          ))}
        </div>
      </div>
      
      {/* Conditionally show optional fields */}
      <div className="OptionalSection">
        {optionalFields.invoiceNumber && documentData.invoiceNumber && (
          <p>Invoice: {documentData.invoiceNumber}</p>
        )}
        
        {optionalFields.items && documentData.items && (
          <div className="ItemsList">
            <h5>Items Delivered</h5>
            {documentData.items.map(item => (
              <div key={item.id} className="ItemRow">
                <span>{item.description}</span>
                {optionalFields.unitSize && <span>{item.unitSize}</span>}
                {optionalFields.unitPrice && <span>${item.unitPrice}</span>}
              </div>
            ))}
          </div>
        )}
        
        {optionalFields.taxInformation && documentData.taxInfo && (
          <div className="TaxInformation">
            <p>GST: ${documentData.taxInfo.gstAmount}</p>
            <p>Total: ${documentData.taxInfo.totalAmount}</p>
          </div>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="StatusIndicators">
        <span className={`ComplianceStatus ${documentData.complianceStatus}`}>
          {documentData.complianceStatus}
        </span>
        
        {documentData.temperatureViolations && (
          <span className="TemperatureAlert">
            ⚠️ Temperature Issue
          </span>
        )}
      </div>
    </div>
  );
};
```

### **DATABASE SCHEMA:**
```sql
-- Client display configurations
CREATE TABLE ClientDisplayConfigurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  configuration jsonb NOT NULL,
  preset_name varchar(100),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Processed document data
CREATE TABLE ProcessedDocuments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id),
  original_filename varchar(255) NOT NULL,
  storage_path varchar(500) NOT NULL,
  
  -- Mandatory extracted data
  supplier varchar(255) NOT NULL,
  delivery_date date NOT NULL,
  handwritten_notes text,
  temperature_readings jsonb NOT NULL,
  product_classification jsonb NOT NULL,
  
  -- Optional extracted data
  invoice_number varchar(100),
  items jsonb,
  unit_sizes jsonb,
  unit_prices jsonb,
  sku_codes jsonb,
  tax_information jsonb,
  
  -- Processing metadata
  extraction_confidence float,
  processing_version varchar(50),
  compliance_status varchar(50) NOT NULL,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_processed_documents_client_date 
ON ProcessedDocuments(client_id, delivery_date);

CREATE INDEX idx_processed_documents_supplier 
ON ProcessedDocuments(client_id, supplier);

CREATE INDEX idx_processed_documents_compliance 
ON ProcessedDocuments(client_id, compliance_status);
```

## 🔍 VALIDATION & COMPLIANCE

### **TEMPERATURE COMPLIANCE RULES:**
```typescript
const ComplianceRules = {
  frozen: {
    maxTemperature: -15,
    alertThreshold: -12,
    criticalThreshold: -10
  },
  chilled: {
    maxTemperature: 4,
    alertThreshold: 6,
    criticalThreshold: 8
  },
  ambient: {
    maxTemperature: 25,
    alertThreshold: 30,
    criticalThreshold: 35
  }
};

const ValidateTemperatureCompliance = (
  temperature: number, 
  productType: 'frozen' | 'chilled' | 'ambient'
): ComplianceStatus => {
  const rules = ComplianceRules[productType];
  
  if (temperature > rules.criticalThreshold) {
    return { status: 'critical', alert: true, message: 'Critical temperature violation' };
  } else if (temperature > rules.alertThreshold) {
    return { status: 'warning', alert: true, message: 'Temperature above recommended' };
  } else if (temperature <= rules.maxTemperature) {
    return { status: 'compliant', alert: false, message: 'Temperature within safe range' };
  } else {
    return { status: 'marginal', alert: false, message: 'Temperature slightly elevated' };
  }
};
```

---
**This Document AI extraction system provides intelligent, configurable document processing that scales from simple café compliance to comprehensive hotel business intelligence.**