'use client'

import { useState } from 'react'
import ConfigCard, { PermissionGate, useConfigConfirmation } from './ConfigCard'
import { useConfigCardData } from './hooks/useConfigCardData'
import type {
  ConfigCardTemplateProps,
  ConfigItem,
  BuiltInItem,
  CreateItemData,
  FormField
} from '@/app/types/config-card'
import { DEFAULT_FORM_FIELDS } from '@/app/types/config-card'

export default function ConfigCardTemplate<T extends ConfigItem>({
  title,
  description,
  icon = '⚙️',
  securityLevel,
  apiEndpoint,
  builtInItems,
  itemDisplayKey,
  itemTypeKey,
  colorKey,
  canRename = true,
  canToggle = true,
  canAddCustom = true,
  customFields = DEFAULT_FORM_FIELDS,
  customItemDefaults = {},
  renderItem,
  renderAddForm,
  onItemToggle,
  onItemRename,
  onItemAdd,
  onItemDelete,
  className = ''
}: ConfigCardTemplateProps<T>) {
  
  // Use the data hook
  const {
    items,
    userPermissions,
    isLoading,
    error,
    loadItems,
    toggleItem,
    renameItem,
    addCustomItem,
    deleteItem,
    showAddForm,
    setShowAddForm,
    renamingItem,
    setRenamingItem,
    renameValue,
    setRenameValue
  } = useConfigCardData<T>(apiEndpoint, builtInItems)

  // Form state for adding custom items
  const [customFormData, setCustomFormData] = useState<Record<string, any>>({})

  // Confirmation dialog
  const { confirm, ConfirmationDialog } = useConfigConfirmation()

  // Handle toggle with optional custom handler
  const handleToggle = async (builtInItem: BuiltInItem, enable: boolean) => {
    if (onItemToggle) {
      const existingItem = items.find(item => item[itemDisplayKey] === builtInItem.name)
      if (existingItem) {
        onItemToggle(existingItem, enable)
      }
    }
    await toggleItem(builtInItem, enable)
  }

  // Handle rename
  const handleRename = (builtInItem: BuiltInItem) => {
    const existingItem = items.find(item => item[itemDisplayKey] === builtInItem.name)
    if (existingItem) {
      setRenamingItem(existingItem.id)
      setRenameValue(String(existingItem[itemDisplayKey]))
    }
  }

  // Save rename
  const saveRename = async () => {
    if (!renamingItem || !renameValue.trim()) return

    const item = items.find(item => item.id === renamingItem)
    if (!item) return

    if (onItemRename) {
      onItemRename(item, renameValue.trim())
    }
    await renameItem(item, renameValue.trim())
  }

  // Handle custom item form submission
  const handleAddCustomItem = async () => {
    const name = customFormData.name?.trim() || ''
    if (!name) return

    const formData: CreateItemData = {
      name,
      ...customItemDefaults,
      ...customFormData
    }

    if (onItemAdd) {
      onItemAdd(formData)
    }
    await addCustomItem(formData)
    setCustomFormData({})
  }

  // Handle item deletion with confirmation
  const handleDelete = async (item: T) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item[itemDisplayKey]}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: () => {}
    })

    if (confirmed) {
      if (onItemDelete) {
        onItemDelete(item)
      }
      await deleteItem(item)
    }
  }

  // Default item renderer
  const defaultRenderItem = (item: T, isBuiltIn: boolean, builtInConfig?: BuiltInItem) => {
    const isEnabled = item.is_active
    const displayName = String(item[itemDisplayKey])
    const itemType = itemTypeKey ? String(item[itemTypeKey]) : undefined
    const itemColor = colorKey ? String(item[colorKey]) : builtInConfig?.color

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          {itemColor && (
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: itemColor }}
            />
          )}
          <div>
            <h4 className="font-medium text-gray-900">{displayName}</h4>
            {itemType && (
              <p className="text-sm text-gray-600">{itemType}</p>
            )}
            {builtInConfig?.description && (
              <p className="text-sm text-gray-600">{builtInConfig.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canToggle && (
            <PermissionGate hasPermission={userPermissions.canEdit}>
              <button
                onClick={() => builtInConfig && handleToggle(builtInConfig, !isEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </PermissionGate>
          )}
          
          {canRename && isEnabled && builtInConfig && (
            <PermissionGate hasPermission={userPermissions.canEdit}>
              <button
                onClick={() => handleRename(builtInConfig)}
                className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Rename
              </button>
            </PermissionGate>
          )}
          
          {!isBuiltIn && (
            <PermissionGate hasPermission={userPermissions.canDelete}>
              <button
                onClick={() => handleDelete(item)}
                className="px-3 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              >
                Delete
              </button>
            </PermissionGate>
          )}
        </div>
      </div>
    )
  }

  // Default add form renderer
  const defaultRenderAddForm = (fields: FormField[], onSubmit: (data: CreateItemData) => void) => (
    <div className="flex gap-3">
      {fields.map(field => {
        if (field.type === 'select') {
          return (
            <select
              key={field.key}
              value={customFormData[field.key] || field.defaultValue || ''}
              onChange={(e) => setCustomFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        }

        return (
          <input
            key={field.key}
            type={field.type}
            value={customFormData[field.key] || field.defaultValue || ''}
            onChange={(e) => setCustomFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      })}
      <button
        onClick={() => {
          const name = customFormData.name?.trim() || ''
          if (name) {
            onSubmit({ name, ...customFormData })
          }
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add
      </button>
      <button
        onClick={() => {setShowAddForm(false); setCustomFormData({})}}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  )

  return (
    <>
      <ConfigCard
        title={title}
        description={description}
        icon={icon}
        securityLevel={securityLevel}
        userPermissions={userPermissions}
        isLoading={isLoading}
        error={error || undefined}
        onRefresh={loadItems}
        className={className}
      >
        {/* Built-in Items with Toggles */}
        <div className="space-y-3 mb-6">
          {builtInItems.map((builtInItem) => {
            const existingItem = items.find(item => item[itemDisplayKey] === builtInItem.name)
            const isBuiltIn = true

            if (renderItem && existingItem) {
              return (
                <div key={`builtin-${builtInItem.name}`}>
                  {renderItem(existingItem, isBuiltIn, builtInItem)}
                </div>
              )
            }

            // Use default renderer
            const itemToRender = existingItem || {
              id: `temp-${builtInItem.name}`,
              [itemDisplayKey]: builtInItem.name,
              is_active: false,
              created_at: new Date().toISOString()
            } as T

            return (
              <div key={`builtin-${builtInItem.name}`}>
                {defaultRenderItem(itemToRender, isBuiltIn, builtInItem)}
              </div>
            )
          })}
        </div>

        {/* Custom Items */}
        {items.filter(item => !builtInItems.some(bi => bi.name === item[itemDisplayKey])).length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-800">Custom Items</h4>
            {items
              .filter(item => !builtInItems.some(bi => bi.name === item[itemDisplayKey]))
              .map((item) => (
                <div key={`custom-${item.id}`}>
                  {renderItem ? renderItem(item, false) : defaultRenderItem(item, false)}
                </div>
              ))}
          </div>
        )}

        {/* Rename Dialog */}
        {renamingItem && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Rename Item</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new name"
              />
              <button
                onClick={saveRename}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {setRenamingItem(null); setRenameValue('')}}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Custom Item */}
        {canAddCustom && (
          <PermissionGate hasPermission={userPermissions.canCreate}>
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Add Custom {title}</h4>
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Custom {title}
                </button>
              ) : (
                renderAddForm ? renderAddForm(customFields, handleAddCustomItem) : defaultRenderAddForm(customFields, handleAddCustomItem)
              )}
            </div>
          </PermissionGate>
        )}
      </ConfigCard>

      <ConfirmationDialog />
    </>
  )
}