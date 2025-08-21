'use client'

import { useState, useEffect } from 'react'
import EnhancedUpload from '../../components/delivery/EnhancedUpload'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function UploadActionPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Enhanced authentication with demo mode support
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
      } else {
        // Demo mode fallback
        console.log('🚀 Demo mode - OCR Enhancement system ready')
        const demoUser = {
          id: 'demo-user-ocr-enhanced',
          email: 'demo@ocrenhancement.com',
          user_metadata: { full_name: 'OCR Demo User' }
        }
        const demoClient = {
          id: 'demo-client-ocr',
          name: 'OCR Enhancement Demo',
          business_type: 'restaurant'
        }
        setUser(demoUser)
        setUserClient(demoClient)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleUploadSuccess = (result: any) => {
    setLastUpload(result)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <h2 style={{ color: '#1e293b', fontSize: '24px' }}>Loading OCR Enhancement System...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Success Notification */}
      {showNotification && lastUpload && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          ✅ OCR processing completed successfully!
        </div>
      )}

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 40px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '8px'
        }}>
          🎯 OCR Enhancement System
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#64748b'
        }}>
          Advanced delivery docket processing with quality validation
        </p>
        {userClient && (
          <p style={{
            fontSize: '14px',
            color: '#10b981',
            marginTop: '8px'
          }}>
            📊 {userClient.name} - Enhanced Processing Mode
          </p>
        )}
      </div>

      {/* Main Upload Interface */}
      <div style={{ padding: '0 20px' }}>
        <EnhancedUpload
          onUploadSuccess={handleUploadSuccess}
          user={user}
          userClient={userClient}
        />
      </div>

      {/* Recent Results */}
      {lastUpload && (
        <div style={{
          margin: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '15px'
          }}>
            🏆 Latest Processing Result
          </h3>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <p><strong>Status:</strong> {lastUpload.status}</p>
            <p><strong>Quality Score:</strong> {lastUpload.qualityScore || 'N/A'}/100</p>
            <p><strong>Processing Time:</strong> {lastUpload.processingTime || 'N/A'}ms</p>
          </div>
        </div>
      )}
    </div>
  )
}