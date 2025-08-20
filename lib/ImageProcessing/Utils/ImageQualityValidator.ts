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
}

export class ImageQualityValidator {
  private thresholds = {
    brightness: { min: 30, max: 85 },
    contrast: { min: 25 },
    sharpness: { min: 35 },
    resolution: { min: 1200 * 800 },
    fileSize: { min: 100 * 1024, max: 8 * 1024 * 1024 },
    aspectRatio: { min: 0.5, max: 2.0 }
  };

  async validateForOCR(imageFile: File): Promise<QualityReport> {
    const metrics = await this.calculateMetrics(imageFile);
    const suggestions = this.generateSuggestions(metrics);
    const warnings = this.generateWarnings(metrics);
    const acceptable = this.isAcceptableForOCR(metrics);
    const score = this.calculateQualityScore(metrics);

    return {
      acceptable,
      score,
      metrics,
      suggestions,
      warnings
    };
  }

  private async calculateMetrics(file: File): Promise<QualityMetrics> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
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
    const brightness = this.calculateBrightness(imageData);
    let variance = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelBrightness = (r + g + b) / 3;
      variance += Math.pow(pixelBrightness - brightness, 2);
    }
    
    return Math.sqrt(variance / (data.length / 4)) / 255 * 100;
  }

  private calculateSharpness(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    let sharpness = 0;
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const gx = -data[i - 4] + data[i + 4] - 2 * data[i - width * 4] + 2 * data[i + width * 4] - data[i - width * 4 - 4] + data[i + width * 4 + 4];
        const gy = -data[i - width * 4] - 2 * data[i] - data[i + 4] + data[i + width * 4] + 2 * data[i + width * 4] + data[i + width * 4 + 4];
        sharpness += Math.sqrt(gx * gx + gy * gy);
      }
    }
    
    return Math.min(sharpness / ((imageData.width - 2) * (imageData.height - 2)) / 255 * 100, 100);
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

  private generateSuggestions(metrics: QualityMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.brightness < 30) {
      suggestions.push("Improve lighting - image is too dark");
    } else if (metrics.brightness > 85) {
      suggestions.push("Reduce lighting - image is too bright");
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
    } else if (metrics.fileSize > 8 * 1024 * 1024) {
      suggestions.push("File size too large - may cause processing delays");
    }

    if (metrics.aspectRatio < 0.5 || metrics.aspectRatio > 2.0) {
      suggestions.push("Document appears distorted - ensure proper framing");
    }

    return suggestions;
  }

  private generateWarnings(metrics: QualityMetrics): string[] {
    const warnings: string[] = [];

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

    return warnings;
  }
}