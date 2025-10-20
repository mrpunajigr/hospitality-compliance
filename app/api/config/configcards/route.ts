import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FieldOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

interface ConfigCardField {
  id: string;
  fieldKey: string;
  label: string;
  description: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  required: boolean;
  options?: FieldOption[];
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  displayOrder: number;
}

interface ConfigCardDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  securityLevel: 'low' | 'medium' | 'high';
  category: 'admin' | 'user' | 'reporting' | 'compliance';
  fields: ConfigCardField[];
  layout: 'single-column' | 'two-column' | 'grid';
  enabled: boolean;
}

/**
 * GET /api/config/configcards
 * Load ConfigCard definitions from database or return defaults
 */
export async function GET() {
  try {
    console.log('🔍 [ConfigCardsAPI] Loading ConfigCard definitions');

    // Try to load from database
    const { data: configData, error } = await supabase
      .from('configcard_definitions')
      .select('*')
      .order('name');

    if (error && error.code !== 'PGRST116') { // PGRST116 = relation does not exist
      console.error('❌ [ConfigCardsAPI] Database error:', error);
      return NextResponse.json(getDefaultConfigCards());
    }

    if (!configData || configData.length === 0) {
      console.log('📋 [ConfigCardsAPI] No database config found, returning defaults');
      return NextResponse.json(getDefaultConfigCards());
    }

    // Convert database format to API format
    const configCards: ConfigCardDefinition[] = configData.map((dbCard) => ({
      id: dbCard.id,
      name: dbCard.name,
      title: dbCard.title,
      description: dbCard.description || '',
      securityLevel: dbCard.security_level,
      category: dbCard.category,
      layout: dbCard.layout,
      enabled: dbCard.enabled ?? true,
      fields: dbCard.fields || []
    }));

    console.log('✅ [ConfigCardsAPI] Loaded from database:', {
      configCards: configCards.length
    });

    return NextResponse.json(configCards);

  } catch (error) {
    console.error('❌ [ConfigCardsAPI] GET error:', error);
    return NextResponse.json(getDefaultConfigCards());
  }
}

/**
 * POST /api/config/configcards
 * Save ConfigCard definitions to database
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 [ConfigCardsAPI] Saving ConfigCard definitions');

    const configCards: ConfigCardDefinition[] = await request.json();
    
    // Validate request body
    if (!Array.isArray(configCards)) {
      return NextResponse.json(
        { error: 'Invalid request: expected array of ConfigCard definitions' },
        { status: 400 }
      );
    }

    // Create configcard_definitions table if it doesn't exist
    await createConfigCardDefinitionsTable();

    // Clear existing configuration
    const { error: deleteError } = await supabase
      .from('configcard_definitions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ [ConfigCardsAPI] Failed to clear existing config:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clear existing configuration' },
        { status: 500 }
      );
    }

    // Prepare new ConfigCard definitions
    const dbRecords = configCards.map(card => ({
      id: card.id,
      name: card.name,
      title: card.title,
      description: card.description,
      security_level: card.securityLevel,
      category: card.category,
      layout: card.layout,
      enabled: card.enabled,
      fields: card.fields
    }));

    // Insert new configuration
    const { data, error: insertError } = await supabase
      .from('configcard_definitions')
      .insert(dbRecords)
      .select();

    if (insertError) {
      console.error('❌ [ConfigCardsAPI] Failed to insert new config:', insertError);
      return NextResponse.json(
        { error: 'Failed to save configuration', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ [ConfigCardsAPI] Configuration saved successfully:', {
      totalConfigCards: configCards.length
    });

    return NextResponse.json({
      success: true,
      message: 'ConfigCard definitions saved successfully',
      configCardsCount: configCards.length
    });

  } catch (error) {
    console.error('❌ [ConfigCardsAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Create configcard_definitions table if it doesn't exist
 */
async function createConfigCardDefinitionsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS configcard_definitions (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      security_level VARCHAR(20) CHECK (security_level IN ('low', 'medium', 'high')),
      category VARCHAR(20) CHECK (category IN ('admin', 'user', 'reporting', 'compliance')),
      layout VARCHAR(20) CHECK (layout IN ('single-column', 'two-column', 'grid')),
      enabled BOOLEAN DEFAULT true,
      fields JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_configcard_definitions_name ON configcard_definitions(name);
    CREATE INDEX IF NOT EXISTS idx_configcard_definitions_category ON configcard_definitions(category);
    CREATE INDEX IF NOT EXISTS idx_configcard_definitions_security ON configcard_definitions(security_level);
    CREATE INDEX IF NOT EXISTS idx_configcard_definitions_enabled ON configcard_definitions(enabled);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.log('ℹ️ [ConfigCardsAPI] Table creation info:', error.message);
    } else {
      console.log('✅ [ConfigCardsAPI] ConfigCard definitions table ready');
    }
  } catch (error) {
    console.log('ℹ️ [ConfigCardsAPI] Table setup note:', error);
  }
}

/**
 * Get default ConfigCard definitions
 */
function getDefaultConfigCards(): ConfigCardDefinition[] {
  return [
    {
      id: 'user-profile',
      name: 'User Profile',
      title: 'User Profile Information',
      description: 'Manage user profile data and job assignments',
      securityLevel: 'medium',
      category: 'admin',
      layout: 'two-column',
      enabled: true,
      fields: [
        {
          id: 'job-title',
          fieldKey: 'jobTitle',
          label: 'Job Title',
          description: 'Staff member job role',
          fieldType: 'select',
          required: true,
          options: [
            { value: 'head-chef', label: 'Head Chef', isDefault: true },
            { value: 'sous-chef', label: 'Sous Chef' },
            { value: 'line-cook', label: 'Line Cook' },
            { value: 'kitchen-hand', label: 'Kitchen Hand' },
            { value: 'manager', label: 'Manager' }
          ],
          defaultValue: 'head-chef',
          displayOrder: 1
        },
        {
          id: 'department',
          fieldKey: 'department',
          label: 'Department',
          description: 'Work department assignment',
          fieldType: 'select',
          required: true,
          options: [
            { value: 'kitchen', label: 'Kitchen', isDefault: true },
            { value: 'front-of-house', label: 'Front of House' },
            { value: 'management', label: 'Management' },
            { value: 'cleaning', label: 'Cleaning' }
          ],
          defaultValue: 'kitchen',
          displayOrder: 2
        }
      ]
    },
    {
      id: 'delivery-processing',
      name: 'Delivery Processing',
      title: 'Delivery Document Processing',
      description: 'Configure fields for delivery document processing',
      securityLevel: 'high',
      category: 'compliance',
      layout: 'grid',
      enabled: true,
      fields: [
        {
          id: 'supplier-classification',
          fieldKey: 'supplierClassification',
          label: 'Supplier Classification',
          description: 'Type of supplier for compliance tracking',
          fieldType: 'select',
          required: true,
          options: [
            { value: 'meat', label: 'Meat Supplier' },
            { value: 'dairy', label: 'Dairy Supplier' },
            { value: 'produce', label: 'Produce Supplier', isDefault: true },
            { value: 'dry-goods', label: 'Dry Goods' },
            { value: 'beverages', label: 'Beverages' }
          ],
          defaultValue: 'produce',
          displayOrder: 1
        },
        {
          id: 'urgency-level',
          fieldKey: 'urgencyLevel',
          label: 'Urgency Level',
          description: 'Processing priority level',
          fieldType: 'select',
          required: false,
          options: [
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority', isDefault: true },
            { value: 'high', label: 'High Priority' },
            { value: 'urgent', label: 'Urgent' }
          ],
          defaultValue: 'medium',
          displayOrder: 2
        }
      ]
    },
    {
      id: 'team-management',
      name: 'Team Management',
      title: 'Team Configuration',
      description: 'Manage team structure and roles',
      securityLevel: 'high',
      category: 'admin',
      layout: 'single-column',
      enabled: true,
      fields: [
        {
          id: 'access-level',
          fieldKey: 'accessLevel',
          label: 'Access Level',
          description: 'System access permissions',
          fieldType: 'select',
          required: true,
          options: [
            { value: 'view-only', label: 'View Only' },
            { value: 'standard', label: 'Standard Access', isDefault: true },
            { value: 'admin', label: 'Administrator' },
            { value: 'super-admin', label: 'Super Administrator' }
          ],
          defaultValue: 'standard',
          displayOrder: 1
        }
      ]
    }
  ];
}