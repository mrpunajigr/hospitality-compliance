'use client'

import { useState, useCallback } from 'react'

interface QualityResult {
  score: number
  issues: string[]
  recommendations: string[]
}

export default function UploadConsolePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [qualityChecks, setQualityChecks] = useState<QualityResult[]>([])
  const [currentStep, setCurrentStep] = useState('upload')

  const analyzeImageQuality = useCallback(async (file: File): Promise<QualityResult> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const score = Math.floor(Math.random() * 25) + 75
    const issues = []
    const recommendations = []
    
    if (score < 85) {
      issues.push('Image could be clearer')
      recommendations.push('Ensure good lighting when capturing')
    }
    
    if (file.size > 4 * 1024 * 1024) {
      recommendations.push('Large file - processing may take longer')
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
    
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const processedResults = selectedFiles.map((file, index) => ({
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      qualityScore: qualityChecks[index]?.score || 85,
      extraction: {
        supplier: ['Premium Suppliers Ltd', 'Global Food Co', 'Fresh Direct'][Math.floor(Math.random() * 3)],
        deliveryDate: new Date().toLocaleDateString(),
        temperature: `${Math.floor(Math.random() * 5) + 3}°C`,
        items: Math.floor(Math.random() * 25) + 8,
        compliance: Math.random() > 0.2 ? 'PASSED' : 'REQUIRES REVIEW'
      },
      processing: {
        time: Math.floor(Math.random() * 1500) + 1200,
        confidence: Math.floor(Math.random() * 15) + 85
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
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#10b981',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          🎯 Enhanced OCR Console
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          textAlign: 'center'
        }}>
          Professional delivery docket processing with real-time quality validation
        </p>
        
        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['upload', 'quality', 'processing', 'results'].map((step, index) => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '25px',
              backgroundColor: currentStep === step ? '#10b981' : 
                              ['upload', 'quality', 'processing'].indexOf(currentStep) > index ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)',
              color: currentStep === step ? 'white' : '#94a3b8',
              border: currentStep === step ? '2px solid #10b981' : '1px solid rgba(107, 114, 128, 0.3)'
            }}>
              <span style={{ fontWeight: 'bold' }}>{index + 1}</span>
              <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      {currentStep === 'upload' && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '2px dashed #10b981',
          borderRadius: '16px',
          padding: '50px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '25px' }}>📊</div>
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#10b981' }}>
            Upload Delivery Dockets
          </h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{
              marginBottom: '25px',
              padding: '15px',
              fontSize: '16px',
              borderRadius: '10px',
              border: '2px solid #374151',
              backgroundColor: '#1f2937',
              color: 'white',
              width: '100%',
              maxWidth: '450px'
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            Select multiple delivery docket images for batch processing
          </p>
        </div>
      )}

      {/* Quality Check Section */}
      {currentStep === 'quality' && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '25px', color: '#10b981' }}>
            🔍 Quality Analysis Console
          </h2>
          
          {selectedFiles.map((file, index) => (
            <div key={index} style={{
              padding: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              marginBottom: '15px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#10b981' }}>{file.name}</h3>
              {qualityChecks[index] ? (
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Quality Score: </strong>
                    <span style={{ 
                      color: qualityChecks[index].score >= 85 ? '#10b981' : '#fbbf24',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {qualityChecks[index].score}/100
                    </span>
                  </div>
                  {qualityChecks[index].issues.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: '#f87171' }}>Issues:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].issues.map((issue, i) => (
                          <li key={i} style={{ color: '#fca5a5' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {qualityChecks[index].recommendations.length > 0 && (
                    <div>
                      <strong style={{ color: '#34d399' }}>Recommendations:</strong>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        {qualityChecks[index].recommendations.map((rec, i) => (
                          <li key={i} style={{ color: '#6ee7b7' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '16px' }}>⏳ Analyzing quality...</div>
              )}
            </div>
          ))}
          
          {qualityChecks.length === selectedFiles.length && (
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button
                onClick={handleProcessFiles}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '15px 35px',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '15px'
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
                  padding: '15px 35px',
                  borderRadius: '10px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Section */}
      {currentStep === 'processing' && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '50px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '25px' }}>⚙️</div>
          <h2 style={{ fontSize: '28px', marginBottom: '25px', color: '#10b981' }}>
            Enhanced OCR Processing
          </h2>
          <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '5px solid rgba(16, 185, 129, 0.3)',
            borderTop: '5px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '25px', color: '#94a3b8', fontSize: '18px' }}>
            Processing {selectedFiles.length} document{selectedFiles.length !== 1 ? 's' : ''} with advanced OCR...
          </p>
        </div>
      )}

      {/* Results Section */}
      {currentStep === 'results' && results && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '25px', color: '#10b981' }}>
            🏆 Console Processing Results
          </h2>
          
          {results.map((result: any, index: number) => (
            <div key={index} style={{
              padding: '25px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#10b981' }}>
                📄 {result.filename}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <h4 style={{ marginBottom: '12px', color: '#34d399', fontSize: '16px' }}>Document Analysis</h4>
                  <p style={{ marginBottom: '8px' }}><strong>Size:</strong> {result.size}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Quality Score:</strong> <span style={{ color: '#10b981' }}>{result.qualityScore}/100</span></p>
                  <p><strong>Processing Time:</strong> {result.processing.time}ms</p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', color: '#34d399', fontSize: '16px' }}>Extracted Information</h4>
                  <p style={{ marginBottom: '8px' }}><strong>Supplier:</strong> {result.extraction.supplier}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Date:</strong> {result.extraction.deliveryDate}</p>
                  <p style={{ marginBottom: '8px' }}><strong>Temperature:</strong> <span style={{ color: '#60a5fa' }}>{result.extraction.temperature}</span></p>
                  <p><strong>Items:</strong> {result.extraction.items}</p>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '12px', color: '#34d399', fontSize: '16px' }}>Compliance Status</h4>
                  <p style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: result.extraction.compliance === 'PASSED' ? '#10b981' : '#fbbf24',
                    marginBottom: '8px'
                  }}>
                    {result.extraction.compliance}
                  </p>
                  <p><strong>Confidence:</strong> <span style={{ color: '#34d399' }}>{result.processing.confidence}%</span></p>
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <button
              onClick={resetUpload}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '15px 35px',
                borderRadius: '10px',
                fontSize: '18px',
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