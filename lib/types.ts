export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  sort_order: number
}

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  telegram: string | null
  discord: string | null
  bio: string | null
  role: 'user' | 'admin' | 'developer'
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string | null
  game: string
  server: string | null
  price: number
  currency: 'GAME'
  status: 'pending' | 'active' | 'hidden' | 'rejected'
  rejection_reason: string | null
  photos: string[]
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  profile?: Profile
  listing_items?: ListingItem[]
}

export interface ListingItem {
  id: string
  listing_id: string
  name: string
  description: string | null
  price: number
  in_stock: boolean
  sort_order: number
  created_at: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '\u20BD',
  USD: '$',
  EUR: '\u20AC',
}

export function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${Number(price).toLocaleString('ru-RU')} ${symbol}`
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435', color: 'text-warning' },
  active: { label: '\u0410\u043A\u0442\u0438\u0432\u043D\u043E', color: 'text-success' },
  hidden: { label: '\u0421\u043A\u0440\u044B\u0442\u043E', color: 'text-muted-foreground' },
  rejected: { label: '\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E', color: 'text-destructive' },
}
