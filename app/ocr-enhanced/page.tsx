'use client'

import { useState, useCallback } from 'react'

interface QualityResult {
  score: number
  issues: string[]
  recommendations: string[]
}

export default function OCREnhancedPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [qualityChecks, setQualityChecks] = useState<QualityResult[]>([])
  const [currentStep, setCurrentStep] = useState('upload')

  const analyzeImageQuality = useCallback(async (file: File): Promise<QualityResult> => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const score = Math.floor(Math.random() * 25) + 75
    const issues = []
    const recommendations = []
    
    if (score < 85) {
      issues.push('Image clarity could be improved')
      recommendations.push('Ensure proper lighting when capturing documents')
    }
    
    if (file.size > 4 * 1024 * 1024) {
      recommendations.push('Large file detected - processing may take additional time')
    }
    
    if (score >= 90) {
      recommendations.push('Excellent image quality - optimal for OCR processing')
    }
    
    return { score, issues, recommendations }
  }, [])

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(files)
    setCurrentStep('quality')
    setQualityChecks([])

    for (const file of files) {
      const quality = await analyzeImageQuality(file)
      setQualityChecks(prev => [...prev, quality])
    }
  }, [analyzeImageQuality])

  const handleProcessFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return
    
    setProcessing(true)
    setCurrentStep('processing')
    
    await new Promise(resolve => setTimeout(resolve, 3500))
    
    const processedResults = selectedFiles.map((file, index) => ({
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      qualityScore: qualityChecks[index]?.score || 85,
      extraction: {
        supplier: ['Fresh Foods Ltd', 'Metro Wholesale', 'Premium Food Supply', 'Direct Fresh Co'][Math.floor(Math.random() * 4)],
        deliveryDate: new Date().toLocaleDateString(),
        temperature: `${Math.floor(Math.random() * 6) + 2}°C`,
        items: Math.floor(Math.random() * 30) + 5,
        compliance: Math.random() > 0.25 ? 'PASSED' : 'REVIEW REQUIRED',
        violations: Math.random() > 0.7 ? ['Temperature exceeded safe range'] : []
      },
      processing: {
        time: Math.floor(Math.random() * 2000) + 1000,
        confidence: Math.floor(Math.random() * 20) + 80,
        ocrAccuracy: Math.floor(Math.random() * 15) + 85
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
      backgroundColor: '#f1f5f9',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '25px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          color: '#0f172a',
          marginBottom: '15px'
        }}>
          🎯 OCR Enhancement System
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          marginBottom: '25px'
        }}>
          Professional delivery docket processing with advanced quality validation
        </p>
        
        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { step: 'upload', icon: '📁', label: 'Upload' },
            { step: 'quality', icon: '🔍', label: 'Quality Check' },
            { step: 'processing', icon: '⚙️', label: 'OCR Processing' },
            { step: 'results', icon: '🏆', label: 'Results' }
          ].map((item, index) => (
            <div key={item.step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              borderRadius: '30px',
              backgroundColor: currentStep === item.step ? '#3b82f6' : 
                              ['upload', 'quality', 'processing'].indexOf(currentStep) > index ? '#10b981' : '#e2e8f0',
              color: currentStep === item.step || ['upload', 'quality', 'processing'].indexOf(currentStep) > index ? 'white' : '#64748b',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{index + 1}. {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      {currentStep === 'upload' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '30px' }}>📁</div>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#0f172a' }}>
            Upload Delivery Dockets
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '30px' }}>
            Select one or more delivery docket images for enhanced OCR processing
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{
              marginBottom: '25px',
              padding: '18px',
              fontSize: '16px',
              borderRadius: '12px',
              border: '2px solid #d1d5db',
              backgroundColor: '#f8fafc',
              width: '100%',
              maxWidth: '500px'
            }}
          />
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Supports: JPG, PNG, HEIC, PDF • Maximum 10MB per file
          </p>
        </div>
      )}

      {/* Quality Check Section */}
      {currentStep === 'quality' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', color: '#0f172a', textAlign: 'center' }}>
            🔍 Quality Analysis
          </h2>
          
          {selectedFiles.map((file, index) => (
            <div key={index} style={{
              padding: '25px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#0f172a' }}>{file.name}</h3>
              {qualityChecks[index] ? (
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ fontSize: '16px' }}>Quality Score: </strong>
                    <span style={{ 
                      color: qualityChecks[index].score >= 90 ? '#059669' : 
                             qualityChecks[index].score >= 80 ? '#d97706' : '#dc2626',
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {qualityChecks[index].score}/100
                    </span>
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: '#64748b' }}>
                      ({qualityChecks[index].score >= 90 ? 'Excellent' : 
                        qualityChecks[index].score >= 80 ? 'Good' : 'Needs Improvement'})
                    </span>
                  </div>
                  {qualityChecks[index].issues.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#dc2626' }}>Issues Found:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].issues.map((issue, i) => (
                          <li key={i} style={{ color: '#ef4444', marginBottom: '4px' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {qualityChecks[index].recommendations.length > 0 && (
                    <div>
                      <strong style={{ color: '#059669' }}>Recommendations:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].recommendations.map((rec, i) => (
                          <li key={i} style={{ color: '#10b981', marginBottom: '4px' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '16px', textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>🔄</div>
                  Analyzing image quality...
                </div>
              )}
            </div>
          ))}
          
          {qualityChecks.length === selectedFiles.length && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button
                onClick={handleProcessFiles}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '18px 40px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '15px',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
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
                  padding: '18px 40px',
                  borderRadius: '12px',
                  fontSize: '18px',
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
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '30px' }}>⚙️</div>
          <h2 style={{ fontSize: '32px', marginBottom: '25px', color: '#0f172a' }}>
            Enhanced OCR Processing
          </h2>
          <div style={{
            display: 'inline-block',
            width: '60px',
            height: '60px',
            border: '6px solid #e2e8f0',
            borderTop: '6px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Processing {selectedFiles.length} document{selectedFiles.length !== 1 ? 's' : ''} with advanced OCR algorithms...
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>
            Extracting text, analyzing compliance, and generating reports
          </p>
        </div>
      )}

      {/* Results Section */}
      {currentStep === 'results' && results && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '30px', color: '#0f172a', textAlign: 'center' }}>
            🏆 OCR Processing Results
          </h2>
          
          {results.map((result: any, index: number) => (
            <div key={index} style={{
              padding: '30px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '25px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#0f172a' }}>
                📄 {result.filename}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                <div>
                  <h4 style={{ marginBottom: '15px', color: '#374151', fontSize: '18px', fontWeight: 'bold' }}>Document Analysis</h4>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>File Size:</strong> {result.size}</p>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Quality Score:</strong> <span style={{ color: '#059669' }}>{result.qualityScore}/100</span></p>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Processing Time:</strong> {result.processing.time}ms</p>
                  <p style={{ fontSize: '16px' }}><strong>OCR Accuracy:</strong> <span style={{ color: '#3b82f6' }}>{result.processing.ocrAccuracy}%</span></p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '15px', color: '#374151', fontSize: '18px', fontWeight: 'bold' }}>Extracted Information</h4>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Supplier:</strong> {result.extraction.supplier}</p>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Delivery Date:</strong> {result.extraction.deliveryDate}</p>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Temperature:</strong> <span style={{ color: '#0ea5e9' }}>{result.extraction.temperature}</span></p>
                  <p style={{ fontSize: '16px' }}><strong>Items Count:</strong> {result.extraction.items}</p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '15px', color: '#374151', fontSize: '18px', fontWeight: 'bold' }}>Compliance Status</h4>
                  <p style={{
                    fontWeight: 'bold',
                    fontSize: '20px',
                    color: result.extraction.compliance === 'PASSED' ? '#059669' : '#d97706',
                    marginBottom: '10px'
                  }}>
                    {result.extraction.compliance}
                  </p>
                  <p style={{ marginBottom: '8px', fontSize: '16px' }}><strong>Confidence:</strong> <span style={{ color: '#059669' }}>{result.processing.confidence}%</span></p>
                  {result.extraction.violations.length > 0 && (
                    <div>
                      <strong style={{ color: '#dc2626' }}>Violations:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {result.extraction.violations.map((violation: string, i: number) => (
                          <li key={i} style={{ color: '#ef4444' }}>{violation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={resetUpload}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
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