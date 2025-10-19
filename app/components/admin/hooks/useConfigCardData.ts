import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/rbac-core'
import type { 
  ConfigItem, 
  BuiltInItem, 
  CreateItemData, 
  UseConfigCardData, 
  UserPermissions,
  ConfigApiResponse 
} from '@/app/types/config-card'

export function useConfigCardData<T extends ConfigItem>(
  apiEndpoint: string,
  builtInItems: BuiltInItem[]
): UseConfigCardData<T> {
  // Data state
  const [items, setItems] = useState<T[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewSecurity: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [showAddForm, setShowAddForm] = useState(false)
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Load user client data for permissions
  const loadUserClient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const clientInfo = await getUserClient(user.id)
        return clientInfo
      }
    } catch (error) {
      console.error('Error loading user client:', error)
      return null
    }
  }

  // Get authenticated session token
  const getSessionToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('No authentication session')
    }
    return session.access_token
  }

  // Load items from API
  const loadItems = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await getSessionToken()
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ConfigApiResponse<T> = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setItems(data.items || [])
      setUserPermissions(data.userPermissions || {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewSecurity: false
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items'
      setError(errorMessage)
      console.error('Error loading items:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle a built-in item (enable/disable)
  const toggleItem = async (builtInItem: BuiltInItem, enable: boolean) => {
    try {
      setError(null)
      const token = await getSessionToken()

      if (enable) {
        // Create/enable the item
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...builtInItem, // Include any additional properties first
            name: builtInItem.name,
            description: builtInItem.description || 'Built-in item',
            color: builtInItem.color || '#6B7280',
            icon: builtInItem.icon || '●',
            area_type: builtInItem.area_type,
            default_role: builtInItem.default_role,
            security_level: 'medium',
            sort_order: items.length
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to enable item')
        }
      } else {
        // Disable the item
        const existingItem = items.find(item => item.name === builtInItem.name)
        if (existingItem) {
          const response = await fetch(apiEndpoint, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              id: existingItem.id,
              name: existingItem.name,
              is_active: false
            })
          })

          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to disable item')
          }
        }
      }

      // Reload items after toggle
      await loadItems()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Toggle failed'
      setError(errorMessage)
      console.error('Error toggling item:', err)
    }
  }

  // Rename an existing item
  const renameItem = async (item: T, newName: string) => {
    try {
      setError(null)
      const token = await getSessionToken()

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: item.id,
          name: newName.trim(),
          // Preserve other properties
          description: (item as any).description,
          color: (item as any).color,
          icon: (item as any).icon,
          area_type: (item as any).area_type,
          default_role: (item as any).default_role
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rename item')
      }

      // Clear rename state and reload
      setRenamingItem(null)
      setRenameValue('')
      await loadItems()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rename failed'
      setError(errorMessage)
      console.error('Error renaming item:', err)
    }
  }

  // Add a new custom item
  const addCustomItem = async (data: CreateItemData) => {
    try {
      setError(null)
      const token = await getSessionToken()

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data, // Include any additional properties first
          name: data.name.trim(),
          description: data.description || 'Custom item',
          color: data.color || '#6B7280',
          icon: data.icon || '●',
          security_level: 'medium',
          sort_order: items.length
        })
      })

      const responseData = await response.json()
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add item')
      }

      // Hide add form and reload
      setShowAddForm(false)
      await loadItems()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Add failed'
      setError(errorMessage)
      console.error('Error adding item:', err)
    }
  }

  // Delete an item
  const deleteItem = async (item: T) => {
    try {
      setError(null)
      const token = await getSessionToken()

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: item.id })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item')
      }

      // Reload items after deletion
      await loadItems()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      console.error('Error deleting item:', err)
    }
  }

  // Load items on mount
  useEffect(() => {
    loadItems()
  }, [apiEndpoint])

  return {
    // Data state
    items,
    userPermissions,
    isLoading,
    error,
    
    // Actions
    loadItems,
    toggleItem,
    renameItem,
    addCustomItem,
    deleteItem,
    
    // UI state
    showAddForm,
    setShowAddForm,
    renamingItem,
    setRenamingItem,
    renameValue,
    setRenameValue
  }
}