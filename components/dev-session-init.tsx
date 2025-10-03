'use client'

import { useEffect } from 'react'
import { initDevSessionManagement } from '@/lib/dev-session-clear'

/**
 * Component to initialize development session management
 * This runs once when the app loads and clears stale sessions
 */
export function DevSessionInit() {
  useEffect(() => {
    initDevSessionManagement()
  }, [])

  return null
}
