import { ImagePreprocessor, PreprocessingResult } from './ImagePreprocessor';

export interface QualityMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  resolution: number;
  fileSize: number;
  aspectRatio: number;
}

export interface QualityReport {
  acceptable: boolean;
  score: number; // 0-100
  metrics: QualityMetrics;
  suggestions: string[];
  warnings: string[];
  preprocessing?: PreprocessingResult;
}

export class ImageQualityValidator {
  private preprocessor = new ImagePreprocessor();
  private thresholds = {
    brightness: { min: 30, max: 85 },
    contrast: { min: 25 },
    sharpness: { min: 35 },
    resolution: { min: 1200 * 800 },
    fileSize: { min: 100 * 1024, max: 8 * 1024 * 1024 },
    aspectRatio: { min: 0.5, max: 2.0 }
  };

  async validateForOCR(imageFile: File): Promise<QualityReport> {
    try {
      let fileToAnalyze = imageFile;
      let preprocessingResult: PreprocessingResult | undefined;

      // Preprocess large files or non-optimal formats
      if (imageFile.size > 10 * 1024 * 1024 || !this.isOptimalFormat(imageFile)) {
        console.log(`Preprocessing ${imageFile.name} (${ImagePreprocessor.formatFileSize(imageFile.size)})`);
        
        preprocessingResult = await this.preprocessor.preprocessForQualityAnalysis(imageFile, {
          maxWidth: 1920,
          maxHeight: 1920,
          maxFileSize: 5 * 1024 * 1024,
          quality: 0.85,
          targetFormat: 'jpeg'
        });
        
        fileToAnalyze = preprocessingResult.processedFile;
        
        // If preprocessing didn't actually process the file (e.g., unsupported format)
        if (preprocessingResult.processedFile === imageFile) {
          console.log('File format not supported for preprocessing, analyzing original file');
        } else {
          console.log(`Preprocessed to ${ImagePreprocessor.formatFileSize(fileToAnalyze.size)} in ${preprocessingResult.processingTime.toFixed(0)}ms`);
        }
      }

      // Check if the file format can be analyzed
      if (!this.isSupportedByBrowser(fileToAnalyze)) {
        console.log(`Cannot analyze ${fileToAnalyze.name} - unsupported format for quality analysis`);
        
        // Return estimated metrics for unsupported formats
        const metrics: QualityMetrics = {
          brightness: 50,
          contrast: 50, 
          sharpness: 50,
          resolution: 2000 * 1500, // Estimate for modern cameras
          fileSize: imageFile.size, // Use original file size
          aspectRatio: 1.33 // Common 4:3 ratio
        };

        const suggestions = this.generateSuggestions(metrics, preprocessingResult, imageFile);
        const warnings = this.generateWarnings(metrics, preprocessingResult, imageFile);
        const acceptable = true; // Accept for OCR processing despite no analysis
        const score = 50; // Neutral score

        return {
          acceptable,
          score,
          metrics,
          suggestions,
          warnings,
          preprocessing: preprocessingResult
        };
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Quality analysis timeout')), 8000);
      });

      const metrics = await Promise.race([
        this.calculateMetrics(fileToAnalyze),
        timeoutPromise
      ]);

      // Update metrics to reflect original file size for reporting
      if (preprocessingResult) {
        metrics.fileSize = imageFile.size; // Show original file size in metrics
      }

      const suggestions = this.generateSuggestions(metrics, preprocessingResult, imageFile);
      const warnings = this.generateWarnings(metrics, preprocessingResult, imageFile);
      const acceptable = this.isAcceptableForOCR(metrics);
      const score = this.calculateQualityScore(metrics);

      return {
        acceptable,
        score,
        metrics,
        suggestions,
        warnings,
        preprocessing: preprocessingResult
      };
    } catch (error) {
      console.error('Quality validation failed:', error);
      
      // Return fallback quality report
      return {
        acceptable: true,
        score: 50,
        metrics: {
          brightness: 50,
          contrast: 50,
          sharpness: 50,
          resolution: 0,
          fileSize: imageFile.size,
          aspectRatio: 1
        },
        suggestions: ['Quality analysis failed - using fallback validation'],
        warnings: ['Could not analyze image quality']
      };
    }
  }

  private async calculateMetrics(file: File): Promise<QualityMetrics> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          resolve({
            brightness: this.calculateBrightness(imageData),
            contrast: this.calculateContrast(imageData),
            sharpness: this.calculateSharpness(imageData),
            resolution: img.width * img.height,
            fileSize: file.size,
            aspectRatio: img.width / img.height
          });
        } catch (error) {
          console.error('Error processing image:', error);
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let brightness = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness += (r + g + b) / 3;
    }
    
    return (brightness / (data.length / 4)) / 255 * 100;
  }

  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data;
    const avgBrightness = this.calculateBrightness(imageData) * 255 / 100; // Convert back to 0-255 range
    let variance = 0;
    const pixelCount = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelBrightness = (r + g + b) / 3;
      variance += Math.pow(pixelBrightness - avgBrightness, 2);
    }
    
    const standardDeviation = Math.sqrt(variance / pixelCount);
    return Math.min((standardDeviation / 255) * 100, 100);
  }

  private calculateSharpness(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let sharpness = 0;
    let sampleCount = 0;
    
    // Sample every 4th pixel for performance (especially on large images)
    const step = Math.max(1, Math.floor(Math.min(width, height) / 100));
    
    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const i = (y * width + x) * 4;
        
        // Simple edge detection using adjacent pixels
        const current = data[i]; // Red channel only for speed
        const right = data[i + 4];
        const down = data[i + width * 4];
        
        const gx = Math.abs(current - right);
        const gy = Math.abs(current - down);
        sharpness += gx + gy;
        sampleCount++;
      }
    }
    
    if (sampleCount === 0) return 50; // Default if no samples
    return Math.min((sharpness / sampleCount) / 255 * 100, 100);
  }

  private isOptimalFormat(file: File): boolean {
    const optimalFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return optimalFormats.includes(file.type.toLowerCase());
  }

  private isSupportedByBrowser(file: File): boolean {
    // HEIC files are not supported by HTML Image element in most browsers
    const unsupportedFormats = ['image/heic', 'image/heif'];
    const isUnsupportedType = unsupportedFormats.includes(file.type.toLowerCase());
    const isUnsupportedExtension = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    return !isUnsupportedType && !isUnsupportedExtension;
  }

  private isAcceptableForOCR(metrics: QualityMetrics): boolean {
    return (
      metrics.brightness >= this.thresholds.brightness.min &&
      metrics.brightness <= this.thresholds.brightness.max &&
      metrics.contrast >= this.thresholds.contrast.min &&
      metrics.sharpness >= this.thresholds.sharpness.min &&
      metrics.resolution >= this.thresholds.resolution.min &&
      metrics.fileSize >= this.thresholds.fileSize.min &&
      metrics.fileSize <= this.thresholds.fileSize.max &&
      metrics.aspectRatio >= this.thresholds.aspectRatio.min &&
      metrics.aspectRatio <= this.thresholds.aspectRatio.max
    );
  }

  private calculateQualityScore(metrics: QualityMetrics): number {
    let score = 0;

    // Brightness score (30%)
    if (metrics.brightness >= 40 && metrics.brightness <= 80) {
      score += 30;
    } else if (metrics.brightness >= 30 && metrics.brightness <= 85) {
      score += 20;
    } else if (metrics.brightness >= 20 && metrics.brightness <= 90) {
      score += 10;
    }

    // Contrast score (25%)
    if (metrics.contrast >= 40) {
      score += 25;
    } else if (metrics.contrast >= 25) {
      score += 15;
    } else if (metrics.contrast >= 15) {
      score += 10;
    }

    // Sharpness score (25%)
    if (metrics.sharpness >= 50) {
      score += 25;
    } else if (metrics.sharpness >= 35) {
      score += 15;
    } else if (metrics.sharpness >= 20) {
      score += 10;
    }

    // Resolution score (20%)
    if (metrics.resolution >= 1920 * 1080) {
      score += 20;
    } else if (metrics.resolution >= 1200 * 800) {
      score += 15;
    } else if (metrics.resolution >= 800 * 600) {
      score += 10;
    }

    return Math.round(score);
  }

  private generateSuggestions(metrics: QualityMetrics, preprocessing?: PreprocessingResult, originalFile?: File): string[] {
    const suggestions: string[] = [];

    // Add preprocessing feedback
    if (preprocessing) {
      if (preprocessing.processedFile === originalFile && originalFile && originalFile.name.toLowerCase().includes('.heic')) {
        suggestions.push("HEIC format detected - browser cannot process this format for quality analysis");
        suggestions.push("Consider converting to JPEG/PNG format for detailed quality feedback");
        suggestions.push("File will still be uploaded for OCR processing");
      } else if (preprocessing.converted) {
        suggestions.push(`Converted from ${originalFile?.type || 'original format'} to JPEG for better compatibility`);
      }
      if (preprocessing.resized) {
        suggestions.push(`Resized image for faster processing (${preprocessing.compressionRatio.toFixed(1)}x smaller)`);
      }
      if (preprocessing.processingTime > 3000) {
        suggestions.push("Large file detected - consider capturing smaller images for faster analysis");
      }
    }

    if (metrics.brightness < 30) {
      suggestions.push("Improve lighting - image is too dark for optimal OCR");
    } else if (metrics.brightness > 85) {
      suggestions.push("Reduce lighting - image is too bright, may cause glare");
    }

    if (metrics.contrast < 25) {
      suggestions.push("Increase contrast between text and background");
    }

    if (metrics.sharpness < 35) {
      suggestions.push("Hold camera steady and ensure document is in focus");
    }

    if (metrics.resolution < 1200 * 800) {
      suggestions.push("Move closer to document or use higher camera resolution");
    }

    if (metrics.fileSize < 100 * 1024) {
      suggestions.push("Image quality too low - try capturing again");
    } else if (metrics.fileSize > 50 * 1024 * 1024) {
      suggestions.push("Very large file - consider using camera settings with lower resolution");
    } else if (metrics.fileSize > 20 * 1024 * 1024) {
      suggestions.push("Large file size may slow down processing");
    }

    if (metrics.aspectRatio < 0.5 || metrics.aspectRatio > 2.0) {
      suggestions.push("Document appears distorted - ensure proper framing");
    }

    return suggestions;
  }

  private generateWarnings(metrics: QualityMetrics, preprocessing?: PreprocessingResult, originalFile?: File): string[] {
    const warnings: string[] = [];

    // Add preprocessing warnings
    if (preprocessing) {
      if (preprocessing.processedFile === originalFile && originalFile && originalFile.name.toLowerCase().includes('.heic')) {
        warnings.push("HEIC format cannot be analyzed for quality - quality metrics are estimates");
      }
      if (preprocessing.compressionRatio > 10) {
        warnings.push("Image was heavily compressed - some quality may be lost");
      }
      if (preprocessing.processingTime > 5000) {
        warnings.push("Large file required significant processing time");
      }
    }

    if (metrics.brightness < 20 || metrics.brightness > 90) {
      warnings.push("Extreme brightness levels may prevent text recognition");
    }

    if (metrics.contrast < 15) {
      warnings.push("Very low contrast - text may be unreadable");
    }

    if (metrics.sharpness < 20) {
      warnings.push("Image appears blurry - OCR accuracy will be poor");
    }

    if (metrics.resolution < 800 * 600) {
      warnings.push("Resolution too low for reliable text extraction");
    }

    if (metrics.fileSize > 100 * 1024 * 1024) {
      warnings.push("Extremely large file - may cause memory issues");
    }

    return warnings;
  }
}