'use client'

import { useEffect, useRef } from 'react'

const ACTIVITY_INTERVAL = 60000

export function useActivityTracker() {
  const lastUpdate = useRef<number>(0)

  useEffect(() => {
    const updateActivity = async () => {
      const now = Date.now()

      if (now - lastUpdate.current < ACTIVITY_INTERVAL) return

      lastUpdate.current = now

      try {
        await fetch('/api/user/activity', { method: 'POST' })
      } catch {
        // Ignore errors - activity tracking is non-critical
      }
    }

    const handleActivity = () => {
      updateActivity()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity()
      }
    }

    updateActivity()

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateActivity()
      }
    }, ACTIVITY_INTERVAL)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])
}
