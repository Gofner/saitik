'use client'

import { isOnline, getLastSeenText } from '@/lib/time'
import { cn } from '@/lib/utils'

interface OnlineStatusProps {
  lastSeenAt: string | null
  showText?: boolean
  className?: string
}

export function OnlineStatus({ lastSeenAt, showText = true, className }: OnlineStatusProps) {
  const online = isOnline(lastSeenAt)
  const statusText = getLastSeenText(lastSeenAt)

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          online ? 'bg-green-500' : 'bg-muted-foreground/50'
        )}
      />
      {showText && (
        <span className={cn(
          'text-xs',
          online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          {statusText}
        </span>
      )}
    </div>
  )
}
