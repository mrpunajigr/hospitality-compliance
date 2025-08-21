'use client'

import { useState, useEffect } from 'react';
import { QualityReport } from '../Utils/ImageQualityValidator';

interface QualityIndicatorProps {
  qualityReport: QualityReport | null;
  isProcessing: boolean;
}

export default function QualityIndicator({ qualityReport, isProcessing }: QualityIndicatorProps) {
  if (isProcessing) {
    return (
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <p className="text-blue-200 text-sm font-medium">Analyzing image quality...</p>
        </div>
      </div>
    );
  }

  if (!qualityReport) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30';
    return 'bg-red-500/20 border-red-400/30';
  };

  return (
    <div className="space-y-4">
      {/* Overall Quality Score */}
      <div className={`rounded-xl p-4 border ${getScoreBackground(qualityReport.score)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">Image Quality</span>
          <span className={`text-lg font-bold ${getScoreColor(qualityReport.score)}`}>
            {qualityReport.score}%
          </span>
        </div>
        
        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/70">Brightness:</span>
            <span className={qualityReport.metrics.brightness >= 30 && qualityReport.metrics.brightness <= 85 ? 'text-green-400' : 'text-yellow-400'}>
              {Math.round(qualityReport.metrics.brightness)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Contrast:</span>
            <span className={qualityReport.metrics.contrast >= 25 ? 'text-green-400' : 'text-yellow-400'}>
              {Math.round(qualityReport.metrics.contrast)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Sharpness:</span>
            <span className={qualityReport.metrics.sharpness >= 35 ? 'text-green-400' : 'text-yellow-400'}>
              {Math.round(qualityReport.metrics.sharpness)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Resolution:</span>
            <span className={qualityReport.metrics.resolution >= 1200 * 800 ? 'text-green-400' : 'text-yellow-400'}>
              {qualityReport.metrics.resolution >= 1000000 ? `${(qualityReport.metrics.resolution / 1000000).toFixed(1)}MP` : `${Math.round(qualityReport.metrics.resolution / 1000)}K`}
            </span>
          </div>
        </div>
      </div>

      {/* Preprocessing Info */}
      {qualityReport.preprocessing && (
        <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4">
          <h4 className="text-purple-300 text-sm font-medium mb-2">⚡ Processing Info:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/70">Original Size:</span>
              <span className="text-purple-300">{(qualityReport.preprocessing.originalSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Processed Size:</span>
              <span className="text-purple-300">{(qualityReport.preprocessing.processedSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Compression:</span>
              <span className="text-purple-300">{qualityReport.preprocessing.compressionRatio.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Process Time:</span>
              <span className="text-purple-300">{qualityReport.preprocessing.processingTime.toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {qualityReport.suggestions.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
          <h4 className="text-blue-300 text-sm font-medium mb-2">💡 Improvement Tips:</h4>
          <ul className="space-y-1">
            {qualityReport.suggestions.map((suggestion, index) => (
              <li key={index} className="text-blue-200 text-xs flex items-start space-x-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {qualityReport.warnings.length > 0 && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
          <h4 className="text-red-300 text-sm font-medium mb-2">⚠️ Quality Warnings:</h4>
          <ul className="space-y-1">
            {qualityReport.warnings.map((warning, index) => (
              <li key={index} className="text-red-200 text-xs flex items-start space-x-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* OCR Readiness */}
      <div className={`rounded-xl p-3 border ${qualityReport.acceptable ? 'bg-green-500/20 border-green-400/30' : 'bg-yellow-500/20 border-yellow-400/30'}`}>
        <div className="flex items-center space-x-2">
          <span className={qualityReport.acceptable ? 'text-green-400' : 'text-yellow-400'}>
            {qualityReport.acceptable ? '✅' : '⚠️'}
          </span>
          <span className={`text-sm font-medium ${qualityReport.acceptable ? 'text-green-300' : 'text-yellow-300'}`}>
            {qualityReport.acceptable ? 'Ready for OCR Processing' : 'May have OCR accuracy issues'}
          </span>
        </div>
      </div>
    </div>
  );
}