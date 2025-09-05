'use client'

import { useState } from 'react';
import EnhancedFileUpload from '@/lib/ImageProcessing/Components/EnhancedFileUpload';
import { QualityReport } from '@/lib/ImageProcessing/Utils/ImageQualityValidator';

export default function OCRTestPage() {
  const [qualityReports, setQualityReports] = useState<Array<{file: File, report: QualityReport}>>([]);

  const handleFileValidated = (file: File, qualityReport: QualityReport) => {
    console.log('File validated:', file.name, 'Quality:', qualityReport.score);
    setQualityReports(prev => [...prev, { file, report: qualityReport }]);
  };

  const handleFileRejected = (file: File, qualityReport: QualityReport) => {
    console.log('File rejected:', file.name, 'Quality:', qualityReport.score);
    // Still add to list for review
    setQualityReports(prev => [...prev, { file, report: qualityReport }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 OCR Enhancement Test
          </h1>
          <p className="text-white/70">
            Phase 1 Quality Validation System - Live Testing
          </p>
        </div>

        <div className="mb-8">
          <div 
            className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="relative">
              <h2 className="text-white text-xl font-bold mb-6">Upload & Analyze</h2>
              
              <EnhancedFileUpload
                onFileValidated={handleFileValidated}
                onFileRejected={handleFileRejected}
                allowPoorQuality={true}
              />
            </div>
          </div>
        </div>

        {/* Results Display */}
        {qualityReports.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">
              📊 Analysis Results ({qualityReports.length})
            </h3>
            
            <div className="space-y-4">
              {qualityReports.map((item, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{item.file.name}</span>
                    <span className={`text-lg font-bold ${
                      item.report.score >= 80 ? 'text-green-400' : 
                      item.report.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.report.score}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-white/70">Brightness:</span>
                      <div className="text-white">{Math.round(item.report.metrics.brightness)}%</div>
                    </div>
                    <div>
                      <span className="text-white/70">Contrast:</span>
                      <div className="text-white">{Math.round(item.report.metrics.contrast)}%</div>
                    </div>
                    <div>
                      <span className="text-white/70">Sharpness:</span>
                      <div className="text-white">{Math.round(item.report.metrics.sharpness)}%</div>
                    </div>
                    <div>
                      <span className="text-white/70">File Size:</span>
                      <div className="text-white">{(item.report.metrics.fileSize / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                  </div>

                  {item.report.preprocessing && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-purple-300 text-xs">
                        ⚡ Processed: {item.report.preprocessing.compressionRatio.toFixed(1)}x compression in {item.report.preprocessing.processingTime.toFixed(0)}ms
                      </div>
                    </div>
                  )}

                  {item.report.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-blue-300 text-xs font-medium mb-1">💡 Suggestions:</div>
                      {item.report.suggestions.slice(0, 3).map((suggestion, i) => (
                        <div key={i} className="text-blue-200 text-xs">• {suggestion}</div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                      item.report.acceptable 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {item.report.acceptable ? '✅ OCR Ready' : '⚠️ Quality Issues'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            🚀 Phase 1 OCR Enhancement - Real-time Quality Validation
          </p>
        </div>
      </div>
    </div>
  );
}