export interface PreprocessingOptions {
  maxWidth: number;
  maxHeight: number;
  maxFileSize: number; // in bytes
  quality: number; // 0.1 to 1.0 for JPEG compression
  targetFormat: 'jpeg' | 'png' | 'webp';
}

export interface PreprocessingResult {
  processedFile: File;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  resized: boolean;
  converted: boolean;
  processingTime: number;
}

export class ImagePreprocessor {
  private defaultOptions: PreprocessingOptions = {
    maxWidth: 2048,
    maxHeight: 2048,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    quality: 0.85,
    targetFormat: 'jpeg'
  };

  async preprocessForQualityAnalysis(file: File, options?: Partial<PreprocessingOptions>): Promise<PreprocessingResult> {
    const startTime = performance.now();
    const opts = { ...this.defaultOptions, ...options };
    const originalSize = file.size;

    // Check if browser can process this file format
    if (!this.isSupportedByBrowser(file)) {
      console.warn(`Unsupported format: ${file.type} (${file.name}). Browser cannot process HEIC/HEIF files.`);
      
      return {
        processedFile: file,
        originalSize,
        processedSize: file.size,
        compressionRatio: 1,
        resized: false,
        converted: false,
        processingTime: performance.now() - startTime
      };
    }

    // Skip processing if file is already small and in good format
    if (file.size <= opts.maxFileSize && this.isOptimalFormat(file)) {
      return {
        processedFile: file,
        originalSize,
        processedSize: file.size,
        compressionRatio: 1,
        resized: false,
        converted: false,
        processingTime: performance.now() - startTime
      };
    }

    try {
      const processedFile = await this.processImage(file, opts);
      const processingTime = performance.now() - startTime;

      return {
        processedFile,
        originalSize,
        processedSize: processedFile.size,
        compressionRatio: originalSize / processedFile.size,
        resized: await this.wasResized(file, processedFile),
        converted: file.type !== processedFile.type,
        processingTime
      };
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      
      // Return original file if preprocessing fails
      return {
        processedFile: file,
        originalSize,
        processedSize: file.size,
        compressionRatio: 1,
        resized: false,
        converted: false,
        processingTime: performance.now() - startTime
      };
    }
  }

  private async processImage(file: File, options: PreprocessingOptions): Promise<File> {
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
          // Calculate optimal dimensions
          const { width, height } = this.calculateOptimalDimensions(
            img.width, 
            img.height, 
            options.maxWidth, 
            options.maxHeight
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Enable image smoothing for better quality during resize
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], this.generateFileName(file, options.targetFormat), {
                  type: `image/${options.targetFormat}`,
                  lastModified: Date.now()
                });
                resolve(processedFile);
              } else {
                reject(new Error('Failed to create processed image blob'));
              }
            },
            `image/${options.targetFormat}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for processing'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    // Don't upscale images
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    let width = maxWidth;
    let height = maxWidth / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  private generateFileName(originalFile: File, targetFormat: string): string {
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${baseName}_processed_${timestamp}.${targetFormat}`;
  }

  private isOptimalFormat(file: File): boolean {
    const optimalFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return optimalFormats.includes(file.type.toLowerCase());
  }

  private isSupportedByBrowser(file: File): boolean {
    // HEIC files are not supported by HTML Image element in most browsers
    const unsupportedFormats = ['image/heic', 'image/heif'];
    return !unsupportedFormats.includes(file.type.toLowerCase()) && 
           !file.name.toLowerCase().endsWith('.heic') && 
           !file.name.toLowerCase().endsWith('.heif');
  }

  private async wasResized(originalFile: File, processedFile: File): Promise<boolean> {
    // Simple heuristic: if processed file is much smaller, it was likely resized
    const sizeRatio = processedFile.size / originalFile.size;
    return sizeRatio < 0.8; // If processed file is less than 80% of original size
  }

  // Utility method to get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility method to estimate OCR processing time based on file size
  static estimateProcessingTime(fileSize: number): number {
    // Rough estimates in milliseconds
    if (fileSize < 1024 * 1024) return 1000; // < 1MB: ~1 second
    if (fileSize < 5 * 1024 * 1024) return 3000; // < 5MB: ~3 seconds
    if (fileSize < 10 * 1024 * 1024) return 6000; // < 10MB: ~6 seconds
    return 10000; // > 10MB: ~10+ seconds
  }
}