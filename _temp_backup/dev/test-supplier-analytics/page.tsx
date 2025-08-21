'use client'

// DEV TOOL: Test Supplier Performance Analytics
// Tests supplier ranking algorithms with controlled data sets

import { useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

// Mock delivery data for testing
const mockDeliveryData = [
  {
    id: '1',
    supplier_name: 'Premium Foods Ltd',
    created_at: '2025-01-10T10:00:00Z',
    temperature_readings: [
      { temperature: '2.1', is_compliant: true },
      { temperature: '2.3', is_compliant: true },
    ]
  },
  {
    id: '2', 
    supplier_name: 'Premium Foods Ltd',
    created_at: '2025-01-11T11:00:00Z',
    temperature_readings: [
      { temperature: '3.8', is_compliant: true },
    ]
  },
  {
    id: '3',
    supplier_name: 'Budget Supplies Co',
    created_at: '2025-01-10T14:00:00Z',
    temperature_readings: [
      { temperature: '5.2', is_compliant: false },
      { temperature: '4.8', is_compliant: false },
    ]
  },
  {
    id: '4',
    supplier_name: 'Budget Supplies Co', 
    created_at: '2025-01-11T15:00:00Z',
    temperature_readings: [
      { temperature: '3.1', is_compliant: true },
    ]
  },
  {
    id: '5',
    supplier_name: 'Local Fresh Market',
    created_at: '2025-01-12T09:00:00Z',
    temperature_readings: [
      { temperature: '1.9', is_compliant: true },
      { temperature: '2.2', is_compliant: true },
      { temperature: '1.8', is_compliant: true },
    ]
  },
  {
    id: '6',
    supplier_name: 'No Data Supplier',
    created_at: '2025-01-12T16:00:00Z',
    temperature_readings: []
  }
]

interface SupplierStats {
  name: string
  deliveryCount: number
  complianceRate: number
  avgTemperature: number
  violationCount: number
  trend: 'improving' | 'declining' | 'stable'
}

// Test function - duplicates the logic from EnhancedComplianceDashboard
const analyzeSupplierPerformance = (records: any[]): SupplierStats[] => {
  const supplierData = new Map<string, {
    deliveries: any[]
    violations: number
    temperatures: number[]
  }>()
  
  // Group data by supplier
  records.forEach(record => {
    if (!record.supplier_name) return
    
    if (!supplierData.has(record.supplier_name)) {
      supplierData.set(record.supplier_name, {
        deliveries: [],
        violations: 0,
        temperatures: []
      })
    }
    
    const data = supplierData.get(record.supplier_name)!
    data.deliveries.push(record)
    
    // Check for violations
    if (record.temperature_readings) {
      record.temperature_readings.forEach((reading: any) => {
        if (reading.temperature) {
          data.temperatures.push(parseFloat(reading.temperature))
        }
        if (reading.is_compliant === false) {
          data.violations++
        }
      })
    }
  })
  
  // Convert to SupplierStats format
  const suppliers: SupplierStats[] = []
  
  supplierData.forEach((data, name) => {
    // Calculate compliance based on deliveries with readings, not total violations
    const deliveriesWithReadings = data.deliveries.filter(delivery => 
      delivery.temperature_readings && delivery.temperature_readings.length > 0
    )
    
    const compliantDeliveries = deliveriesWithReadings.filter(delivery =>
      delivery.temperature_readings.every((reading: any) => reading.is_compliant !== false)
    )
    
    const complianceRate = deliveriesWithReadings.length > 0 ? 
      (compliantDeliveries.length / deliveriesWithReadings.length) * 100 : 0
    
    const avgTemp = data.temperatures.length > 0 ? 
      data.temperatures.reduce((sum, temp) => sum + temp, 0) / data.temperatures.length : 0
    
    suppliers.push({
      name,
      deliveryCount: data.deliveries.length,
      complianceRate: Math.round(complianceRate),
      avgTemperature: Number(avgTemp.toFixed(1)),
      violationCount: data.violations,
      trend: complianceRate >= 95 ? 'stable' : complianceRate >= 85 ? 'declining' : 'improving'
    })
  })
  
  return suppliers.sort((a, b) => b.deliveryCount - a.deliveryCount)
}

export default function TestSupplierAnalyticsPage() {
  const [results, setResults] = useState<SupplierStats[] | null>(null)
  
  const runAnalysis = () => {
    console.log('🧪 Running supplier analytics test with mock data...')
    console.log('📊 Mock delivery data:', mockDeliveryData)
    
    const analyzed = analyzeSupplierPerformance(mockDeliveryData)
    console.log('📈 Analysis results:', analyzed)
    
    setResults(analyzed)
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/chef-workspace1jpg.jpg')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      
      <div className={getCardStyle('primary')}>
        <div className="text-center mb-8">
          <h1 className={`${getTextStyle('pageTitle')} text-white mb-4`}>
            🧪 Supplier Analytics Test Suite
          </h1>
          <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
            Validates supplier performance calculations with controlled test data
          </p>
          
          <button
            onClick={runAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Run Analysis Test
          </button>
        </div>
        
        {/* Test Data Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className={`${getTextStyle('sectionTitle')} text-white mb-3`}>
              Test Data Overview
            </h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• <strong>Premium Foods Ltd:</strong> 2 deliveries, all compliant (2.1°C avg)</li>
              <li>• <strong>Budget Supplies Co:</strong> 2 deliveries, 50% compliant (4.4°C avg)</li>
              <li>• <strong>Local Fresh Market:</strong> 1 delivery, 100% compliant (2.0°C avg)</li>
              <li>• <strong>No Data Supplier:</strong> 1 delivery, no temperature readings</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className={`${getTextStyle('sectionTitle')} text-white mb-3`}>
              Expected Results
            </h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• <strong>Premium Foods:</strong> 100% compliance, 2.7°C avg</li>
              <li>• <strong>Budget Supplies:</strong> 50% compliance, 4.4°C avg</li>
              <li>• <strong>Local Fresh:</strong> 100% compliance, 2.0°C avg</li>
              <li>• <strong>No Data:</strong> 0% compliance (excluded from rankings)</li>
            </ul>
          </div>
          
        </div>
      </div>
      
      {/* Results Display */}
      {results && (
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>
              🏆 Supplier Performance Results
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {results.map((supplier, index) => (
                <div 
                  key={supplier.name}
                  className="bg-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-600 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    
                    <div>
                      <div className={`${getTextStyle('body')} text-white font-semibold`}>
                        {supplier.name}
                      </div>
                      <div className="text-white/60 text-sm">
                        {supplier.deliveryCount} deliveries • {supplier.violationCount} violations
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      supplier.complianceRate >= 95 ? 'text-green-300' :
                      supplier.complianceRate >= 85 ? 'text-yellow-300' :
                      supplier.complianceRate >= 50 ? 'text-orange-300' :
                      'text-red-300'
                    }`}>
                      {supplier.complianceRate}%
                    </div>
                    <div className="text-white/60 text-sm">
                      {supplier.avgTemperature}°C avg
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      supplier.trend === 'stable' ? 'bg-green-600/30 text-green-300' :
                      supplier.trend === 'declining' ? 'bg-yellow-600/30 text-yellow-300' :
                      'bg-blue-600/30 text-blue-300'
                    }`}>
                      {supplier.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Validation Results */}
            <div className="mt-6 bg-green-600/20 rounded-xl p-4">
              <h3 className="text-green-300 font-semibold mb-2">✅ Validation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-200">
                {results.map(supplier => (
                  <div key={supplier.name}>
                    <strong>{supplier.name}:</strong> 
                    {supplier.name === 'Premium Foods Ltd' && supplier.complianceRate === 100 ? ' ✅ Correct' :
                     supplier.name === 'Budget Supplies Co' && supplier.complianceRate === 50 ? ' ✅ Correct' :
                     supplier.name === 'Local Fresh Market' && supplier.complianceRate === 100 ? ' ✅ Correct' :
                     supplier.name === 'No Data Supplier' && supplier.complianceRate === 0 ? ' ✅ Correct' :
                     ' ❌ Unexpected result'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  )
}