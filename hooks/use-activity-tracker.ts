'use client'

import { useEffect, useRef } from 'react'

const ACTIVITY_INTERVAL = 60000 // Update every 60 seconds

export function useActivityTracker() {
  const lastUpdate = useRef<number>(0)

  useEffect(() => {
    const updateActivity = async () => {
      const now = Date.now()
      // Prevent too frequent updates
      if (now - lastUpdate.current < ACTIVITY_INTERVAL) return
      
      lastUpdate.current = now
      
      try {
        await fetch('/api/user/activity', { method: 'POST' })
      } catch {
        // Ignore errors - activity tracking is non-critical
      }
    }

    // Update on mount
    updateActivity()

    // Update on user interactions
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    
    const handleActivity = () => {
      updateActivity()
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Also update periodically if user is active
    const interval = setInterval(updateActivity, ACTIVITY_INTERVAL)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(interval)
    }
  }, [])
}
