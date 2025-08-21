'use client';

import { useEffect, useState } from 'react';

export default function ProductionVersionFooter() {
  const [version, setVersion] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const loadVersion = () => {
      if (typeof window !== 'undefined' && (window as any).APP_VERSION) {
        // Use production version if available, otherwise strip build number for clean display
        const fullVersion = (window as any).APP_VERSION;
        const prodVersion = (window as any).PRODUCTION_VERSION || fullVersion.replace(/\.\d{3}([a-z]?)$/, '$1');
        setVersion(prodVersion);
      } else {
        // Fallback version if version.js hasn't loaded
        setVersion('v1.8.16');
        // Retry loading
        setTimeout(loadVersion, 100);
      }
    };
    
    loadVersion();
  }, []);
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <footer className="text-center text-xs text-gray-400 py-2">
        JiGR Compliance Platform
      </footer>
    );
  }
  
  return (
    <footer className="text-center text-xs text-gray-400 py-2">
      JiGR Compliance Platform {version}
    </footer>
  );
}