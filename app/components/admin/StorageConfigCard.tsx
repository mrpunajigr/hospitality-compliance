'use client'

import { useState, useEffect } from 'react'
import ConfigCard from './ConfigCard'

interface StorageArea {
  id: string
  name: string
  area_type: 'pantry' | 'storeroom' | 'fridge' | 'freezer' | 'chiller' | 'underbench' | 'other'
  temperature_min?: number
  temperature_max?: number
  location_description?: string
  is_active: boolean
  created_at: string
}

const BUILT_IN_STORAGE_AREAS = [
  { name: 'Pantry', area_type: 'pantry' },
  { name: 'Storeroom', area_type: 'storeroom' },
  { name: 'Fridge 1', area_type: 'fridge' },
  { name: 'Fridge 2', area_type: 'fridge' },
  { name: 'Walk-in Chiller', area_type: 'chiller' },
  { name: 'Freezer', area_type: 'freezer' },
  { name: 'Under Bench Fridge', area_type: 'underbench' },
  { name: 'Under Bench Freezer', area_type: 'underbench' }
]

export default function StorageConfigCard() {
  const [storageAreas, setStorageAreas] = useState<StorageArea[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaType, setNewAreaType] = useState<string>('fridge')

  const loadStorageAreas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/config/storage-areas')
      if (response.ok) {
        const data = await response.json()
        setStorageAreas(data.storage_areas || [])
      } else {
        console.error('Failed to load storage areas')
      }
    } catch (error) {
      console.error('Error loading storage areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBuiltInAreas = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/config/storage-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_create',
          storage_areas: BUILT_IN_STORAGE_AREAS
        })
      })

      if (response.ok) {
        await loadStorageAreas()
      } else {
        console.error('Failed to add built-in storage areas')
      }
    } catch (error) {
      console.error('Error adding built-in storage areas:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCustomArea = async () => {
    if (!newAreaName.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/config/storage-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          storage_area: {
            name: newAreaName,
            area_type: newAreaType
          }
        })
      })

      if (response.ok) {
        await loadStorageAreas()
        setNewAreaName('')
        setNewAreaType('fridge')
      } else {
        console.error('Failed to add custom storage area')
      }
    } catch (error) {
      console.error('Error adding custom storage area:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleArea = async (id: string) => {
    setSaving(true)
    try {
      const area = storageAreas.find(a => a.id === id)
      if (!area) return

      const response = await fetch('/api/config/storage-areas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !area.is_active
        })
      })

      if (response.ok) {
        await loadStorageAreas()
      } else {
        console.error('Failed to toggle storage area')
      }
    } catch (error) {
      console.error('Error toggling storage area:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteArea = async (id: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/config/storage-areas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        await loadStorageAreas()
      } else {
        console.error('Failed to delete storage area')
      }
    } catch (error) {
      console.error('Error deleting storage area:', error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadStorageAreas()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-black text-lg font-semibold">Storage</h3>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading storage areas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-black text-lg font-semibold">Storage</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/20 cursor-help">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="font-medium text-orange-400 text-xs">High</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Set areas</p>
      </div>

      {/* Built-in Storage Areas Quick Setup */}
      {storageAreas.length === 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-black font-medium mb-1">Quick Setup</h4>
              <p className="text-gray-600 text-sm">Add standard storage areas for your business</p>
            </div>
            <button
              onClick={handleAddBuiltInAreas}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Standard Areas'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Storage Areas */}
      {storageAreas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-black font-medium mb-3">Current Storage Areas</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {storageAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-black font-medium">{area.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {area.area_type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleArea(area.id)}
                    disabled={saving}
                    className={`w-8 h-4 rounded-full relative transition-all duration-200 ${
                      area.is_active ? 'bg-green-500' : 'bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
                        area.is_active ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteArea(area.id)}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    title="Delete storage area"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Storage Area */}
      <div>
        <h4 className="text-black font-medium mb-3">Add Custom Storage Area</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">Area Name</label>
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="e.g., Cold Room 3"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-black placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Area Type</label>
            <select
              value={newAreaType}
              onChange={(e) => setNewAreaType(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-black"
            >
              <option value="pantry">Pantry</option>
              <option value="storeroom">Storeroom</option>
              <option value="fridge">Fridge</option>
              <option value="freezer">Freezer</option>
              <option value="chiller">Chiller</option>
              <option value="underbench">Under Bench</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleAddCustomArea}
          disabled={saving || !newAreaName.trim()}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add Storage Area'}
        </button>
      </div>
    </div>
  )
}