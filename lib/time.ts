// Format date to Moscow time (UTC+3)
export function formatMoscowTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return d.toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date with full date and time in Moscow timezone
export function formatMoscowDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return d.toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Check if user was online recently (within last 5 minutes)
export function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false
  const lastSeen = new Date(lastSeenAt)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  return diffMinutes < 5
}

// Get relative time description
export function getLastSeenText(lastSeenAt: string | null): string {
  if (!lastSeenAt) return 'давно'
  
  const lastSeen = new Date(lastSeenAt)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
  
  if (diffMinutes < 1) return 'только что'
  if (diffMinutes < 5) return 'онлайн'
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ч. назад`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  
  return formatMoscowDateTime(lastSeen)
}
