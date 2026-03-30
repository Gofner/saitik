'use client'

import { useActivityTracker } from '@/hooks/use-activity-tracker'

export function ActivityTrackerWrapper({ children }: { children: React.ReactNode }) {
  useActivityTracker()
  return <>{children}</>
}
