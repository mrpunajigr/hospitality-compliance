'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'
import { ResponsiveLayout } from '@/app/components/ResponsiveLayout'
import { ModuleCard } from '@/app/components/ModuleCard'
import { SearchInput } from '@/app/components/SearchInput'
import { NumberInput } from '@/app/components/NumberInput'
import { InventoryItem, InventoryLocation } from '@/types/InventoryTypes'
import { 
  ArrowLeft, 
  Search, 
  Camera, 
  Check, 
  X, 
  Clock,
  WifiOff,
  Wifi
} from 'lucide-react'

type CountStep = 'item-selection' | 'counting'

interface CountData {
  itemId: string
  itemName: string
  quantity: number
  unit: string
  locationId?: string
  notes: string
  photoUrl?: string
}

export default function CountNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL parameters
  const preSelectedItemId = searchParams.get('item_id')
  const preSelectedItemName = searchParams.get('item_name')

  // State
  const [step, setStep] = useState<CountStep>(preSelectedItemId ? 'counting' : 'item-selection')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [locations, setLocations] = useState<InventoryLocation[]>([])
  const [recentItems, setRecentItems] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Count form state
  const [countData, setCountData] = useState<CountData>({
    itemId: preSelectedItemId || '',
    itemName: preSelectedItemName || '',
    quantity: 0,
    unit: '',
    locationId: '',
    notes: '',
    photoUrl: undefined
  })

  const countModule = getModuleConfig('count')

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    loadData()
    loadRecentItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [searchTerm, selectedCategory, items])

  useEffect(() => {
    if (preSelectedItemId && items.length > 0) {
      const item = items.find(i => i.id === preSelectedItemId)
      if (item) {
        selectItem(item)
      }
    }
  }, [preSelectedItemId, items])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const userId = session.user.id

      // Load items
      const { data: itemData, error: itemError } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories!left(name)
        `)
        .eq('client_id', userId)
        .eq('is_active', true)
        .order('item_name')

      if (itemError) throw itemError

      const processedItems = itemData?.map(item => ({
        ...item,
        category_name: item.inventory_categories?.name
      })) || []

      setItems(processedItems)

      // Load categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('inventory_categories')
        .select('id, name')
        .eq('client_id', userId)
        .eq('is_active', true)
        .order('name')

      if (categoryError) throw categoryError
      setCategories(categoryData || [])

      // Load locations
      const { data: locationData, error: locationError } = await supabase
        .from('inventory_locations')
        .select('*')
        .eq('client_id', userId)
        .eq('is_active', true)
        .order('name')

      if (locationError) throw locationError
      setLocations(locationData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentItems = () => {
    const recent = localStorage.getItem('recentCountItems')
    if (recent) {
      setRecentItems(JSON.parse(recent))
    }
  }

  const saveRecentItem = (itemId: string) => {
    const recent = JSON.parse(localStorage.getItem('recentCountItems') || '[]')
    const updated = [itemId, ...recent.filter((id: string) => id !== itemId)].slice(0, 5)
    localStorage.setItem('recentCountItems', JSON.stringify(updated))
    setRecentItems(updated)
  }

  const filterItems = () => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const selectItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setCountData(prev => ({
      ...prev,
      itemId: item.id,
      itemName: item.item_name,
      unit: item.count_unit
    }))
    setStep('counting')
    saveRecentItem(item.id)
  }

  const handleSubmitCount = async () => {
    if (!selectedItem || countData.quantity < 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      if (isOnline) {
        // Submit directly to database
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        const { error } = await supabase
          .from('inventory_count')
          .insert({
            client_id: session.user.id,
            item_id: countData.itemId,
            quantity_on_hand: countData.quantity,
            count_unit: countData.unit,
            location_id: countData.locationId || null,
            notes: countData.notes || null,
            counted_by: session.user.id,
            count_date: new Date().toISOString()
          })

        if (error) throw error

        alert('Count saved successfully!')
      } else {
        // Save to offline queue
        const offlineCount = {
          id: Date.now().toString(),
          ...countData,
          timestamp: new Date().toISOString(),
          synced: false
        }

        const existingQueue = JSON.parse(localStorage.getItem('offlineCountQueue') || '[]')
        existingQueue.push(offlineCount)
        localStorage.setItem('offlineCountQueue', JSON.stringify(existingQueue))

        alert('Count saved offline. It will sync when you\'re back online.')
      }

      // Reset form and go to next item or back to selection
      resetForm()
      
    } catch (error) {
      console.error('Error saving count:', error)
      alert('Failed to save count. Please try again.')
    }
  }

  const resetForm = () => {
    setCountData({
      itemId: '',
      itemName: '',
      quantity: 0,
      unit: '',
      locationId: '',
      notes: '',
      photoUrl: undefined
    })
    setSelectedItem(null)
    setStep('item-selection')
  }

  const goBack = () => {
    if (step === 'counting') {
      setStep('item-selection')
    } else {
      router.push('/stock/items')
    }
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {step === 'item-selection' ? 'Select Item to Count' : `Count: ${selectedItem?.item_name}`}
                </h1>
                {step === 'counting' && selectedItem?.brand && (
                  <p className="text-sm text-gray-300">{selectedItem.brand}</p>
                )}
              </div>
            </div>
            
            {/* Online/Offline indicator */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {step === 'item-selection' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <ModuleCard theme="light" className="p-6">
              <div className="space-y-4">
                <SearchInput
                  placeholder="Search items by name or brand..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === ''
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    style={{ minHeight: '40px' }}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      style={{ minHeight: '40px' }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </ModuleCard>

            {/* Recent Items */}
            {recentItems.length > 0 && (
              <ModuleCard theme="light" className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentItems
                    .map(id => items.find(item => item.id === id))
                    .filter(Boolean)
                    .map((item) => (
                      <button
                        key={item!.id}
                        onClick={() => selectItem(item!)}
                        className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                        style={{ minHeight: '80px' }}
                      >
                        <h4 className="font-medium text-white text-sm">{item!.item_name}</h4>
                        {item!.brand && <p className="text-xs text-gray-300 mt-1">{item!.brand}</p>}
                        <p className="text-xs text-blue-300 mt-2">
                          {item!.category_name || 'Uncategorized'}
                        </p>
                      </button>
                    ))}
                </div>
              </ModuleCard>
            )}

            {/* All Items */}
            <ModuleCard theme="light" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                All Items ({filteredItems.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item)}
                    className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
                    style={{ minHeight: '80px' }}
                  >
                    <h4 className="font-medium text-white text-sm">{item.item_name}</h4>
                    {item.brand && <p className="text-xs text-gray-300 mt-1">{item.brand}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                        {item.category_name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-gray-300">{item.count_unit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ModuleCard>
          </div>
        )}

        {step === 'counting' && selectedItem && (
          <div className="space-y-6">
            {/* Count Input */}
            <ModuleCard theme="light" className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Enter Count</h2>
                  <p className="text-white/70">How many {countData.unit} of {selectedItem.item_name}?</p>
                </div>
                
                <NumberInput
                  value={countData.quantity}
                  onChange={(value) => setCountData(prev => ({ ...prev, quantity: value }))}
                  unit={countData.unit}
                  autoFocus
                  onEnter={handleSubmitCount}
                />
              </div>
            </ModuleCard>

            {/* Additional Options */}
            <ModuleCard theme="light" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Location (Optional)
                  </label>
                  <select
                    value={countData.locationId}
                    onChange={(e) => setCountData(prev => ({ ...prev, locationId: e.target.value }))}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                    style={{ minHeight: '48px' }}
                  >
                    <option value="">Select location...</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={countData.notes}
                    onChange={(e) => setCountData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this count..."
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                  />
                </div>

                {/* Photo Upload (Future Enhancement) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Photo (Optional)
                  </label>
                  <button
                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-400 rounded-lg text-white hover:bg-white/5 transition-colors"
                    disabled
                    style={{ minHeight: '100px' }}
                  >
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <span className="text-sm opacity-50">Photo upload coming soon</span>
                    </div>
                  </button>
                </div>
              </div>
            </ModuleCard>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep('item-selection')}
                className="flex-1 flex items-center justify-center px-6 py-4 border border-gray-400 rounded-lg text-white hover:bg-white/5 transition-colors"
                style={{ minHeight: '56px' }}
              >
                <X className="h-5 w-5 mr-2" />
                Change Item
              </button>
              
              <button
                onClick={handleSubmitCount}
                className="flex-1 flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                style={{ minHeight: '56px' }}
              >
                <Check className="h-5 w-5 mr-2" />
                Save Count
              </button>
            </div>
          </div>
        )}
      </main>
    </ResponsiveLayout>
  )
}