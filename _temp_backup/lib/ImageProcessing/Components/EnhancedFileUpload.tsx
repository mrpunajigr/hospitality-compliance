'use client'

import { useState, useRef, useCallback, useMemo } from 'react';
import { ImageQualityValidator, QualityReport } from '../Utils/ImageQualityValidator';
import QualityIndicator from './QualityIndicator';

interface EnhancedFileUploadProps {
  onFileValidated: (file: File, qualityReport: QualityReport) => void;
  onFileRejected: (file: File, qualityReport: QualityReport) => void;
  allowPoorQuality?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function EnhancedFileUpload({ 
  onFileValidated, 
  onFileRejected, 
  allowPoorQuality = false,
  className = '',
  children 
}: EnhancedFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQualityReport, setCurrentQualityReport] = useState<QualityReport | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validator = useMemo(() => new ImageQualityValidator(), []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setCurrentQualityReport(null);

    try {
      const qualityReport = await validator.validateForOCR(file);
      setCurrentQualityReport(qualityReport);
      
      if (qualityReport.acceptable || allowPoorQuality) {
        onFileValidated(file, qualityReport);
      } else {
        onFileRejected(file, qualityReport);
      }
    } catch (error) {
      console.error('Quality validation failed:', error);
      // Fallback: allow file if validation fails
      const fallbackReport: QualityReport = {
        acceptable: true,
        score: 50,
        metrics: {
          brightness: 50,
          contrast: 50,
          sharpness: 50,
          resolution: 0,
          fileSize: file.size,
          aspectRatio: 1
        },
        suggestions: ['Quality validation failed - using fallback'],
        warnings: []
      };
      setCurrentQualityReport(fallbackReport);
      onFileValidated(file, fallbackReport);
    } finally {
      setIsProcessing(false);
    }
  }, [validator, onFileValidated, onFileRejected, allowPoorQuality]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processAgain = () => {
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const selectNewFile = () => {
    setSelectedFile(null);
    setCurrentQualityReport(null);
    triggerFileSelect();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileSelect}
        className="relative overflow-hidden p-8 rounded-3xl border-2 border-dashed border-white/30 hover:border-white/50 cursor-pointer transition-all duration-300 bg-white/5 hover:bg-white/10"
      >
        {children || (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-white/50" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Drop your image here or click to browse
            </h3>
            <p className="text-sm text-white/70">
              Supports JPG, PNG, WebP • Max 8MB
            </p>
            <p className="text-xs text-white/50 mt-2">
              Images will be analyzed for OCR quality
            </p>
          </div>
        )}
      </div>

      {/* Selected file info */}
      {selectedFile && (
        <div className="bg-white/10 border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                <p className="text-white/60 text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={processAgain}
                disabled={isProcessing}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                Reanalyze
              </button>
              <button
                onClick={selectNewFile}
                className="px-3 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                New File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quality Analysis */}
      <QualityIndicator 
        qualityReport={currentQualityReport} 
        isProcessing={isProcessing} 
      />

      {/* Action buttons for poor quality images */}
      {currentQualityReport && !currentQualityReport.acceptable && !allowPoorQuality && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Quality Below OCR Standards</p>
              <p className="text-yellow-200 text-xs">
                This image may produce poor OCR results. Consider retaking for better accuracy.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => selectedFile && onFileValidated(selectedFile, currentQualityReport)}
                className="px-4 py-2 bg-yellow-500/30 text-yellow-200 text-sm rounded-lg hover:bg-yellow-500/40 transition-colors"
              >
                Use Anyway
              </button>
              <button
                onClick={selectNewFile}
                className="px-4 py-2 bg-green-500/30 text-green-200 text-sm rounded-lg hover:bg-green-500/40 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}