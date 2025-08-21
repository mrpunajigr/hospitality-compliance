'use client'

import { useState, useCallback } from 'react'

interface QualityResult {
  score: number
  issues: string[]
  recommendations: string[]
}

export default function UploadActionPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [qualityChecks, setQualityChecks] = useState<QualityResult[]>([])
  const [currentStep, setCurrentStep] = useState('upload') // upload, quality, processing, results

  const analyzeImageQuality = useCallback(async (file: File): Promise<QualityResult> => {
    // Simulate quality analysis
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const score = Math.floor(Math.random() * 30) + 70 // 70-100 score
    const issues = []
    const recommendations = []
    
    if (score < 80) {
      issues.push('Image resolution could be higher')
      recommendations.push('Move closer to document for better detail')
    }
    
    if (file.size > 5 * 1024 * 1024) {
      issues.push('Large file size detected')
      recommendations.push('Consider compressing image')
    }
    
    return { score, issues, recommendations }
  }, [])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(files)
    setCurrentStep('quality')
    setQualityChecks([])

    // Analyze each file
    for (const file of files) {
      const quality = await analyzeImageQuality(file)
      setQualityChecks(prev => [...prev, quality])
    }
  }, [analyzeImageQuality])

  const handleProcessFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return
    
    setProcessing(true)
    setCurrentStep('processing')
    
    // Simulate enhanced OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const processedResults = selectedFiles.map((file, index) => ({
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      qualityScore: qualityChecks[index]?.score || 85,
      extraction: {
        supplier: ['Fresh Foods Ltd', 'Metro Wholesale', 'Food Supply Co'][Math.floor(Math.random() * 3)],
        deliveryDate: new Date().toLocaleDateString(),
        temperature: `${Math.floor(Math.random() * 6) + 2}°C`,
        items: Math.floor(Math.random() * 20) + 5,
        compliance: Math.random() > 0.3 ? 'PASSED' : 'REVIEW REQUIRED'
      },
      processing: {
        time: Math.floor(Math.random() * 2000) + 1000,
        confidence: Math.floor(Math.random() * 20) + 80
      }
    }))
    
    setResults(processedResults)
    setProcessing(false)
    setCurrentStep('results')
  }, [selectedFiles, qualityChecks])

  const resetUpload = () => {
    setSelectedFiles([])
    setResults(null)
    setQualityChecks([])
    setCurrentStep('upload')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1e293b',
          marginBottom: '10px'
        }}>
          🎯 Enhanced OCR Processing System
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '20px'
        }}>
          Professional delivery docket processing with quality validation
        </p>
        
        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          {['upload', 'quality', 'processing', 'results'].map((step, index) => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: currentStep === step ? '#3b82f6' : 
                              ['upload', 'quality', 'processing'].indexOf(currentStep) > index ? '#10b981' : '#e2e8f0',
              color: currentStep === step || ['upload', 'quality', 'processing'].indexOf(currentStep) > index ? 'white' : '#64748b'
            }}>
              <span>{index + 1}</span>
              <span style={{ textTransform: 'capitalize' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      {currentStep === 'upload' && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📁</div>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>
            Upload Delivery Dockets
          </h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{
              marginBottom: '20px',
              padding: '15px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #d1d5db',
              width: '100%',
              maxWidth: '400px'
            }}
          />
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Select one or more delivery docket images for processing
          </p>
        </div>
      )}

      {/* Quality Check Section */}
      {currentStep === 'quality' && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>
            🔍 Quality Analysis
          </h2>
          
          {selectedFiles.map((file, index) => (
            <div key={index} style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{file.name}</h3>
              {qualityChecks[index] ? (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Quality Score: </strong>
                    <span style={{ 
                      color: qualityChecks[index].score >= 85 ? '#10b981' : '#f59e0b',
                      fontWeight: 'bold'
                    }}>
                      {qualityChecks[index].score}/100
                    </span>
                  </div>
                  {qualityChecks[index].issues.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Issues:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].issues.map((issue, i) => (
                          <li key={i} style={{ color: '#dc2626' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {qualityChecks[index].recommendations.length > 0 && (
                    <div>
                      <strong>Recommendations:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].recommendations.map((rec, i) => (
                          <li key={i} style={{ color: '#059669' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748b' }}>Analyzing quality...</div>
              )}
            </div>
          ))}
          
          {qualityChecks.length === selectedFiles.length && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleProcessFiles}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🚀 Process with Enhanced OCR
              </button>
              <button
                onClick={resetUpload}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Section */}
      {currentStep === 'processing' && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚙️</div>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>
            Processing with Enhanced OCR
          </h2>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '20px', color: '#64748b' }}>
            Analyzing {selectedFiles.length} document{selectedFiles.length !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {/* Results Section */}
      {currentStep === 'results' && results && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>
            🏆 Processing Results
          </h2>
          
          {results.map((result: any, index: number) => (
            <div key={index} style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#1e293b' }}>
                📄 {result.filename}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151' }}>Document Info</h4>
                  <p><strong>Size:</strong> {result.size}</p>
                  <p><strong>Quality Score:</strong> {result.qualityScore}/100</p>
                  <p><strong>Processing Time:</strong> {result.processing.time}ms</p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151' }}>Extracted Data</h4>
                  <p><strong>Supplier:</strong> {result.extraction.supplier}</p>
                  <p><strong>Date:</strong> {result.extraction.deliveryDate}</p>
                  <p><strong>Temperature:</strong> {result.extraction.temperature}</p>
                  <p><strong>Items:</strong> {result.extraction.items}</p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '8px', color: '#374151' }}>Compliance</h4>
                  <p style={{
                    fontWeight: 'bold',
                    color: result.extraction.compliance === 'PASSED' ? '#059669' : '#dc2626'
                  }}>
                    {result.extraction.compliance}
                  </p>
                  <p><strong>Confidence:</strong> {result.processing.confidence}%</p>
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={resetUpload}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Process More Documents
            </button>
          </div>
        </div>
      )}
    </div>
  )
}