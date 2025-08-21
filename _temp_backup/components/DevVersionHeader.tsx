'use client';

import { useEffect, useState } from 'react';

export default function DevVersionHeader() {
  const [versionInfo, setVersionInfo] = useState<any>(null);
  
  useEffect(() => {
    // Load version info from public/version.js
    const checkVersion = () => {
      if (typeof window !== 'undefined' && (window as any).APP_VERSION) {
        setVersionInfo({
          version: (window as any).APP_VERSION,
          buildTime: (window as any).BUILD_TIME,
          env: (window as any).BUILD_ENV
        });
      } else {
        // Retry after a short delay if version.js hasn't loaded yet
        setTimeout(checkVersion, 100);
      }
    };
    
    checkVersion();
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;
  
  if (!versionInfo) return null;
  
  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'N/A';
    }
  };
  
  return (
    <div className="fixed top-2 right-2 z-50 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-mono">
      <div className="font-bold">{versionInfo.version}</div>
      <div className="text-red-100">{versionInfo.env.toUpperCase()}</div>
      <div className="text-red-200">{formatTime(versionInfo.buildTime)}</div>
    </div>
  );
}