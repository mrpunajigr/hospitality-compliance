'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DeviceStats {
  totalUsers: number
  recommendedDevices: number
  legacyDevices: number
  iPadUsers: number
  topDevices: Array<{
    category: string
    subcategory: string
    count: number
    percentage: number
  }>
}

export default function DeviceAnalytics() {
  const [stats, setStats] = useState<DeviceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeviceStats() {
      try {
        setLoading(true)

        // Get device compatibility stats
        const { data: compatStats, error: compatError } = await supabase
          .from('device_compatibility_stats')
          .select('*')

        if (compatError) throw compatError

        // Get top device breakdown
        const { data: deviceBreakdown, error: deviceError } = await supabase
          .from('device_analytics')
          .select('*')
          .limit(10)

        if (deviceError) throw deviceError

        // Process the data
        const processedStats: DeviceStats = {
          totalUsers: compatStats?.find(s => s.metric === 'Total Users')?.count || 0,
          recommendedDevices: compatStats?.find(s => s.metric === 'Recommended Devices')?.count || 0,
          legacyDevices: compatStats?.find(s => s.metric === 'Legacy Devices')?.count || 0,
          iPadUsers: compatStats?.find(s => s.metric === 'iPads')?.count || 0,
          topDevices: deviceBreakdown || []
        }

        setStats(processedStats)
      } catch (err) {
        console.error('Device analytics fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchDeviceStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Analytics</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-white/20 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Analytics</h3>
        <div className="text-red-300 text-sm">
          Error loading analytics: {error}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Device Analytics</h3>
        <div className="text-white/60 text-sm">
          No device data available yet. Data will appear after users log in.
        </div>
      </div>
    )
  }

  const recommendedPercentage = stats.totalUsers > 0 
    ? Math.round((stats.recommendedDevices / stats.totalUsers) * 100) 
    : 0

  const legacyPercentage = stats.totalUsers > 0 
    ? Math.round((stats.legacyDevices / stats.totalUsers) * 100) 
    : 0

  const iPadPercentage = stats.totalUsers > 0 
    ? Math.round((stats.iPadUsers / stats.totalUsers) * 100) 
    : 0

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Device Analytics</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          <div className="text-sm text-white/70">Total Users</div>
        </div>
        
        <div className="bg-green-500/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-300">{recommendedPercentage}%</div>
          <div className="text-sm text-green-200">Recommended Devices</div>
        </div>
        
        <div className="bg-blue-500/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-300">{iPadPercentage}%</div>
          <div className="text-sm text-blue-200">iPad Users</div>
        </div>
        
        <div className="bg-orange-500/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-300">{legacyPercentage}%</div>
          <div className="text-sm text-orange-200">Legacy Devices</div>
        </div>
      </div>

      {/* Device Breakdown */}
      <div>
        <h4 className="text-md font-medium text-white mb-4">Device Types</h4>
        <div className="space-y-3">
          {stats.topDevices.slice(0, 6).map((device, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white text-sm font-medium">
                  {device.category === 'tablet' && device.subcategory === 'ipad' ? 'iPad' :
                   device.category === 'mobile' && device.subcategory === 'iphone' ? 'iPhone' :
                   device.category === 'tablet' && device.subcategory === 'android-tablet' ? 'Android Tablet' :
                   device.category === 'mobile' && device.subcategory === 'android-phone' ? 'Android Phone' :
                   `${device.category} (${device.subcategory})`}
                </div>
                <div className="text-white/60 text-xs">
                  {device.count} users ({Math.round(device.percentage)}%)
                </div>
              </div>
              
              <div className="w-20 bg-white/20 rounded-full h-2 ml-4">
                <div 
                  className="bg-blue-400 h-2 rounded-full"
                  style={{ width: `${Math.min(device.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <h4 className="text-md font-medium text-white mb-3">Insights</h4>
        <div className="space-y-2 text-sm">
          {iPadPercentage >= 50 && (
            <div className="text-green-300">
              ✅ Excellent iPad adoption ({iPadPercentage}%) - Perfect for hospitality workflows
            </div>
          )}
          
          {legacyPercentage > 20 && (
            <div className="text-orange-300">
              ⚠️ {legacyPercentage}% legacy devices - Consider iOS 12 compatibility optimizations
            </div>
          )}
          
          {recommendedPercentage >= 70 && (
            <div className="text-blue-300">
              🎯 Great device compatibility ({recommendedPercentage}% recommended devices)
            </div>
          )}
          
          {stats.totalUsers < 5 && (
            <div className="text-white/60">
              📊 Analytics will improve as more users join the platform
            </div>
          )}
        </div>
      </div>
    </div>
  )
}