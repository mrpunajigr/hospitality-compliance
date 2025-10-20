import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FieldDefinition {
  key: string;
  label: string;
  description: string;
  category: 'mandatory' | 'optional';
  order: number;
  defaultValue: any;
  enabled: boolean;
  validation?: {
    required?: boolean;
    type?: 'string' | 'number' | 'date' | 'boolean';
    minLength?: number;
    maxLength?: number;
  };
}

interface FieldConfigurationData {
  mandatoryFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
}

/**
 * GET /api/config/fields
 * Load field configuration from database or return defaults
 */
export async function GET() {
  try {
    console.log('🔍 [FieldsAPI] Loading field configuration');

    // Try to load from database
    const { data: configData, error } = await supabase
      .from('field_definitions')
      .select('*')
      .order('field_order');

    if (error && error.code !== 'PGRST116') { // PGRST116 = relation does not exist
      console.error('❌ [FieldsAPI] Database error:', error);
      return NextResponse.json(getDefaultConfiguration());
    }

    if (!configData || configData.length === 0) {
      console.log('📋 [FieldsAPI] No database config found, returning defaults');
      return NextResponse.json(getDefaultConfiguration());
    }

    // Convert database format to API format
    const mandatoryFields: FieldDefinition[] = [];
    const optionalFields: FieldDefinition[] = [];

    configData.forEach((dbField) => {
      const field: FieldDefinition = {
        key: dbField.field_key,
        label: dbField.label,
        description: dbField.description || '',
        category: dbField.category,
        order: dbField.field_order,
        defaultValue: dbField.default_value,
        enabled: dbField.enabled_by_default ?? true,
        validation: dbField.validation_rules || {}
      };

      if (field.category === 'mandatory') {
        mandatoryFields.push(field);
      } else {
        optionalFields.push(field);
      }
    });

    const result: FieldConfigurationData = {
      mandatoryFields: mandatoryFields.sort((a, b) => a.order - b.order),
      optionalFields: optionalFields.sort((a, b) => a.order - b.order)
    };

    console.log('✅ [FieldsAPI] Loaded from database:', {
      mandatory: mandatoryFields.length,
      optional: optionalFields.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [FieldsAPI] GET error:', error);
    return NextResponse.json(getDefaultConfiguration());
  }
}

/**
 * POST /api/config/fields
 * Save field configuration to database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 [FieldsAPI] Saving field configuration');

    const body: FieldConfigurationData = await request.json();
    
    // Validate request body
    if (!body.mandatoryFields || !body.optionalFields) {
      return NextResponse.json(
        { error: 'Invalid request: missing mandatoryFields or optionalFields' },
        { status: 400 }
      );
    }

    // Create field_definitions table if it doesn't exist
    await createFieldDefinitionsTable();

    // Clear existing configuration
    const { error: deleteError } = await supabase
      .from('field_definitions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ [FieldsAPI] Failed to clear existing config:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clear existing configuration' },
        { status: 500 }
      );
    }

    // Prepare new field definitions
    const allFields = [...body.mandatoryFields, ...body.optionalFields];
    const dbRecords = allFields.map(field => ({
      field_key: field.key,
      label: field.label,
      description: field.description,
      category: field.category,
      field_order: field.order,
      default_value: field.defaultValue,
      validation_rules: field.validation || {},
      enabled_by_default: field.enabled
    }));

    // Insert new configuration
    const { data, error: insertError } = await supabase
      .from('field_definitions')
      .insert(dbRecords)
      .select();

    if (insertError) {
      console.error('❌ [FieldsAPI] Failed to insert new config:', insertError);
      return NextResponse.json(
        { error: 'Failed to save configuration', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ [FieldsAPI] Configuration saved successfully:', {
      totalFields: allFields.length,
      mandatory: body.mandatoryFields.length,
      optional: body.optionalFields.length
    });

    return NextResponse.json({
      success: true,
      message: 'Field configuration saved successfully',
      fieldsCount: allFields.length
    });

  } catch (error) {
    console.error('❌ [FieldsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Create field_definitions table if it doesn't exist
 */
async function createFieldDefinitionsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS field_definitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      field_key VARCHAR(50) UNIQUE NOT NULL,
      label VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(20) CHECK (category IN ('mandatory', 'optional')),
      field_order INTEGER,
      default_value JSONB,
      validation_rules JSONB,
      enabled_by_default BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_field_definitions_key ON field_definitions(field_key);
    CREATE INDEX IF NOT EXISTS idx_field_definitions_category ON field_definitions(category);
    CREATE INDEX IF NOT EXISTS idx_field_definitions_order ON field_definitions(field_order);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.log('ℹ️ [FieldsAPI] Table creation info:', error.message);
    } else {
      console.log('✅ [FieldsAPI] Field definitions table ready');
    }
  } catch (error) {
    console.log('ℹ️ [FieldsAPI] Table setup note:', error);
  }
}

/**
 * Get default hardcoded configuration
 */
function getDefaultConfiguration(): FieldConfigurationData {
  return {
    mandatoryFields: [
      {
        key: 'supplier',
        label: 'Supplier',
        description: 'Name of the delivery supplier - required for compliance tracking',
        category: 'mandatory',
        order: 1,
        defaultValue: '',
        enabled: true,
        validation: { required: true, type: 'string', minLength: 1 }
      },
      {
        key: 'deliveryDate',
        label: 'Delivery Date',
        description: 'Date when the delivery was received - required for compliance',
        category: 'mandatory',
        order: 2,
        defaultValue: null,
        enabled: true,
        validation: { required: true, type: 'date' }
      },
      {
        key: 'handwrittenNotes',
        label: 'Handwritten Notes',
        description: 'Any handwritten notes on delivery documentation',
        category: 'mandatory',
        order: 3,
        defaultValue: '',
        enabled: true,
        validation: { required: true, type: 'string' }
      },
      {
        key: 'temperature',
        label: 'Temperature',
        description: 'Delivery temperature reading - critical for food safety',
        category: 'mandatory',
        order: 4,
        defaultValue: null,
        enabled: true,
        validation: { required: true, type: 'number' }
      },
      {
        key: 'productClassification',
        label: 'Product Classification',
        description: 'Type of product delivered - required for proper handling',
        category: 'mandatory',
        order: 5,
        defaultValue: 'general',
        enabled: true,
        validation: { required: true, type: 'string' }
      }
    ],
    optionalFields: [
      {
        key: 'invoiceNumber',
        label: 'Invoice Number',
        description: 'Invoice or reference number for this delivery',
        category: 'optional',
        order: 6,
        defaultValue: '',
        enabled: true,
        validation: { required: false, type: 'string' }
      },
      {
        key: 'items',
        label: 'Items',
        description: 'List of items included in this delivery',
        category: 'optional',
        order: 7,
        defaultValue: [],
        enabled: true,
        validation: { required: false, type: 'string' }
      },
      {
        key: 'unitSize',
        label: 'Unit Size',
        description: 'Size or quantity per unit delivered',
        category: 'optional',
        order: 8,
        defaultValue: '',
        enabled: false,
        validation: { required: false, type: 'string' }
      },
      {
        key: 'unitPrice',
        label: 'Unit Price',
        description: 'Price per unit for cost tracking',
        category: 'optional',
        order: 9,
        defaultValue: 0,
        enabled: false,
        validation: { required: false, type: 'number' }
      },
      {
        key: 'sku',
        label: 'SKU',
        description: 'Stock Keeping Unit identifier',
        category: 'optional',
        order: 10,
        defaultValue: '',
        enabled: false,
        validation: { required: false, type: 'string' }
      },
      {
        key: 'tax',
        label: 'Tax',
        description: 'Tax amount or percentage applied',
        category: 'optional',
        order: 11,
        defaultValue: 0,
        enabled: false,
        validation: { required: false, type: 'number' }
      }
    ]
  };
}