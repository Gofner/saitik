import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, type Listing, type Profile } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CategoryIcon } from '@/components/category-icon'
import DeleteListingButton from '@/components/delete-listing-button'
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MessageCircle,
  Send,
} from 'lucide-react'

export function ListingDetail({
  listing,
  profile,
}: {
  listing: Listing
  profile: Profile | null
}) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const photos = listing.photos ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/catalog" className="transition-colors hover:text-foreground">
          Каталог
        </Link>
        <span>/</span>
        {listing.category && (
          <>
            <Link
              href={`/catalog?category=${listing.category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {listing.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Photo gallery - 3 cols */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/50 bg-secondary">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[currentPhoto]}
                  alt={`${listing.title} - фото ${currentPhoto + 1}`}
                  className="h-full w-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPhoto((p) => (p + 1) % photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            i === currentPhoto ? 'bg-foreground' : 'bg-foreground/30'
                          }`}
                          aria-label={`Фото ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-all ${
                    i === currentPhoto
                      ? 'border-foreground'
                      : 'border-border/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info - 2 cols */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div>
            {/* Category badge + delete button */}
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {listing.category && (
                  <Badge variant="secondary" className="gap-1">
                    <CategoryIcon icon={listing.category.icon} className="h-3 w-3" />
                    {listing.category.name}
                  </Badge>
                )}
              </div>

              <DeleteListingButton listingId={String(listing.id)} />
            </div>

            <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.server ? `Сервер ${listing.server}` : ''}
            </p>
          </div>

          <div className="text-3xl font-bold text-foreground">
            {formatPrice(listing.price, listing.currency)}
          </div>

          <Separator className="bg-border/50" />

          {/* Seller info */}
          {profile && (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                    {profile.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {profile.display_name || 'Продавец'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {'На площадке с '}
                      {new Date(profile.created_at).toLocaleDateString('ru-RU', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full gap-2">
                <MessageCircle className="h-4 w-4" />
                Связаться с продавцом
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Контакты продавца</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-4">
                {profile?.telegram ? (
                  <a
                    href={`https://t.me/${profile.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:bg-secondary"
                  >
                    <Send className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Telegram</p>
                      <p className="text-sm text-muted-foreground">{profile.telegram}</p>
                    </div>
                  </a>
                ) : null}
                {profile?.discord ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 p-4">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Discord</p>
                      <p className="text-sm text-muted-foreground">{profile.discord}</p>
                    </div>
                  </div>
                ) : null}
                {!profile?.telegram && !profile?.discord && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Продавец не указал контактные данные
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Description */}
          {listing.description && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          {listing.listing_items && listing.listing_items.length > 0 && (
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Товары в лоте</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {listing.listing_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border/30 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price, listing.currency)}
                        </span>
                        {!item.in_stock && (
                          <Badge variant="secondary" className="text-xs">
                            Нет в наличии
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
