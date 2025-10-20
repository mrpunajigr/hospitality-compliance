// This file contains the advanced ConfigCard Designer with full integration features
// Save this for future implementation when TypeScript issues are resolved

'use client';

import { useState, useEffect } from 'react';
import { getCardStyle, getTextStyle, getButtonStyle } from '@/lib/design-system';
import { getModuleConfig } from '@/lib/module-config';
import { ModuleHeader } from '@/app/components/ModuleHeader';
import type { FieldKey, DisplayFieldConfig } from '@/app/types/Configuration';

interface FieldOption {
  value: string;
  label: string;
  isDefault?: boolean;
}

interface ExistingFieldDefinition {
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

export default function ConfigCardDesignerAdvanced() {
  const [configCards, setConfigCards] = useState<ConfigCardDefinition[]>([]);
  const [existingFields, setExistingFields] = useState<ExistingFieldDefinition[]>([]);
  const [existingConfigCards, setExistingConfigCards] = useState<Record<string, DisplayFieldConfig>>({});
  const [editingCard, setEditingCard] = useState<ConfigCardDefinition | null>(null);
  const [editingField, setEditingField] = useState<ConfigCardField | null>(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [isNewField, setIsNewField] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const moduleConfig = getModuleConfig('dev');

  // Load existing ConfigCard definitions and field data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadConfigCards(),
      loadExistingFields(),
      loadExistingConfigCards()
    ]);
  };

  const loadConfigCards = async () => {
    try {
      const response = await fetch('/api/config/configcards');
      if (response.ok) {
        const data = await response.json();
        setConfigCards(data);
      } else {
        setConfigCards(getDefaultConfigCards());
      }
    } catch (error) {
      console.error('Failed to load ConfigCard definitions:', error);
      setConfigCards(getDefaultConfigCards());
    } finally {
      setLoading(false);
    }
  };

  const loadExistingFields = async () => {
    try {
      const response = await fetch('/api/config/fields');
      if (response.ok) {
        const data = await response.json();
        const allFields = [...data.mandatoryFields, ...data.optionalFields];
        setExistingFields(allFields);
        console.log('✅ Loaded existing fields:', allFields.length);
      }
    } catch (error) {
      console.error('Failed to load existing fields:', error);
    }
  };

  const loadExistingConfigCards = async () => {
    try {
      const response = await fetch('/api/config/display');
      if (response.ok) {
        const data = await response.json();
        setExistingConfigCards(data.fields || {});
        console.log('✅ Loaded existing ConfigCard fields:', Object.keys(data.fields || {}).length);
      }
    } catch (error) {
      console.error('Failed to load existing ConfigCards:', error);
    }
  };

  const handleDeployConfigCards = async () => {
    if (!confirm('Deploy designed ConfigCards to live admin interface? This will update the current configuration.')) {
      return;
    }

    try {
      setLoading(true);

      // Convert ConfigCard definitions to display configuration format
      const deploymentFields: Record<string, DisplayFieldConfig> = {};

      configCards.forEach(card => {
        card.fields.forEach(field => {
          const fieldKey = field.fieldKey as FieldKey;
          deploymentFields[fieldKey] = {
            label: field.label,
            description: field.description,
            category: field.required ? 'mandatory' : 'optional',
            order: field.displayOrder,
            defaultValue: field.defaultValue,
            enabled: true,
            toggleState: {
              enabledMessage: `${field.label} enabled ✓`,
              disabledMessage: `${field.label} disabled`,
              indicator: {
                icon: '✓',
                background: 'bg-green-500'
              }
            }
          };
        });
      });

      // Deploy to display configuration
      const displayConfig = {
        fields: deploymentFields
      };

      const response = await fetch('/api/config/display', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(displayConfig)
      });

      if (response.ok) {
        alert(`✅ Successfully deployed ${Object.keys(deploymentFields).length} fields from ${configCards.length} ConfigCards to live admin interface!`);
        await loadAllData();
      } else {
        const error = await response.json();
        alert(`❌ Deployment failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      alert(`❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseExistingField = (field: ExistingFieldDefinition) => {
    const configField: ConfigCardField = {
      id: field.key,
      fieldKey: field.key,
      label: field.label,
      description: field.description,
      fieldType: mapValidationTypeToFieldType(field.validation?.type),
      required: field.validation?.required || false,
      displayOrder: field.order,
      defaultValue: field.defaultValue
    };
    
    if (editingCard) {
      editingCard.fields.push(configField);
      setEditingCard({ ...editingCard });
    }
    setShowFieldPicker(false);
  };

  const mapValidationTypeToFieldType = (validationType?: string): ConfigCardField['fieldType'] => {
    switch (validationType) {
      case 'number': return 'number';
      case 'date': return 'date';
      case 'boolean': return 'boolean';
      default: return 'text';
    }
  };

  const getDefaultConfigCards = (): ConfigCardDefinition[] => {
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
          }
        ]
      }
    ];
  };

  // Field Picker Modal Component with full integration
  function FieldPickerModal({ existingFields, existingConfigCards, onAddNew, onUseExisting, onClose }: {
    existingFields: ExistingFieldDefinition[];
    existingConfigCards: Record<string, DisplayFieldConfig>;
    onAddNew: () => void;
    onUseExisting: (field: ExistingFieldDefinition) => void;
    onClose: () => void;
  }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'mandatory' | 'optional' | 'configcard'>('all');

    const filteredFields = existingFields.filter(field => {
      const matchesSearch = field.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           field.key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const configCardFields = Object.entries(existingConfigCards).filter(([key, _]) => {
      const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || selectedCategory === 'configcard';
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${getTextStyle('sectionTitle', 'light')} mb-0`}>
                🔍 Field Browser
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
                ✕
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="mandatory">Mandatory Fields</option>
                <option value="optional">Optional Fields</option>
                <option value="configcard">Existing ConfigCards</option>
              </select>
            </div>

            {/* Create New Field Button */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Create New Field</h3>
                  <p className="text-sm text-blue-700">Define a completely new field with custom properties</p>
                </div>
                <button
                  onClick={onAddNew}
                  className={`${getButtonStyle('primary')} px-4 py-2`}
                >
                  + New Field
                </button>
              </div>
            </div>

            {/* Field Configuration System Fields */}
            {(selectedCategory === 'all' || selectedCategory === 'mandatory' || selectedCategory === 'optional') && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  📋 Field Configuration System ({filteredFields.length} fields)
                </h3>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {filteredFields.map((field) => (
                    <div key={field.key} className="p-3 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{field.label}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              field.category === 'mandatory' 
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {field.category}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {field.validation?.type || 'string'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                          <div className="text-xs text-gray-500">
                            Field Key: <code className="bg-gray-200 px-1 rounded">{field.key}</code>
                            {field.defaultValue && ` • Default: ${field.defaultValue}`}
                          </div>
                        </div>
                        <button
                          onClick={() => onUseExisting(field)}
                          className="ml-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Use Field
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing ConfigCard Fields */}
            {(selectedCategory === 'all' || selectedCategory === 'configcard') && configCardFields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  🎨 Existing ConfigCard Fields ({configCardFields.length} fields)
                </h3>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {configCardFields.map(([fieldKey, fieldConfig]) => (
                    <div key={fieldKey} className="p-3 border border-purple-200 rounded bg-purple-50 hover:bg-purple-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{fieldConfig.label}</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
                              ConfigCard
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              fieldConfig.category === 'mandatory' 
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {fieldConfig.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{fieldConfig.description}</p>
                          <div className="text-xs text-gray-500">
                            Field Key: <code className="bg-gray-200 px-1 rounded">{fieldKey}</code>
                            • Order: #{fieldConfig.order}
                            • Enabled: {fieldConfig.enabled ? '✅' : '❌'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const existingField: ExistingFieldDefinition = {
                              key: fieldKey,
                              label: fieldConfig.label,
                              description: fieldConfig.description,
                              category: fieldConfig.category,
                              order: fieldConfig.order,
                              defaultValue: fieldConfig.defaultValue,
                              enabled: fieldConfig.enabled,
                              validation: { required: fieldConfig.category === 'mandatory', type: 'string' }
                            };
                            onUseExisting(existingField);
                          }}
                          className="ml-3 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Use Field
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredFields.length === 0 && configCardFields.length === 0 && searchTerm && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No fields found matching "{searchTerm}"</p>
                <button
                  onClick={onAddNew}
                  className={`${getButtonStyle('outline')} px-4 py-2 mt-4`}
                >
                  Create "{searchTerm}" as New Field
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main render with integration features would go here...
  return (
    <div>
      <h1>Advanced ConfigCard Designer with Full Integration</h1>
      <p>This version includes complete Field Browser, deployment pipeline, and unified workflow.</p>
    </div>
  );
}