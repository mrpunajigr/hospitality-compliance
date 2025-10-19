'use client'

import { useEffect } from 'react'
import { autoEnableQuietMode } from '@/lib/console-utils'

export default function ConsoleManager() {
  useEffect(() => {
    // Auto-enable quiet mode by default for cleaner console
    autoEnableQuietMode()
  }, [])

  return null // This component doesn't render anything
}