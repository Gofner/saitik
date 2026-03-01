import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, type Listing } from '@/lib/types'
import { Clock, ImageIcon } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
  showStatus?: boolean
}

export function ListingCard({ listing, showStatus }: ListingCardProps) {
  const firstPhoto = listing.photos?.[0]
  const timeAgo = getTimeAgo(listing.created_at)

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {firstPhoto ? (
            <img
              src={firstPhoto}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
          {showStatus && (
            <Badge
              variant={listing.status === 'active' ? 'default' : 'secondary'}
              className="absolute top-2 right-2 text-xs"
            >
              {listing.status === 'active' ? 'Активно' : listing.status === 'pending' ? 'На проверке' : listing.status === 'rejected' ? 'Отклонено' : 'Скрыто'}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-medium text-foreground">
              {listing.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">{listing.server ? `Сервер ${listing.server}` : ''}</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">
              {formatPrice(listing.price, listing.currency)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} д`
  return `${Math.floor(days / 7)} нед`
}
