'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CategoryIcon } from '@/components/category-icon'
import { ListingChat } from '@/components/listing-chat'
import { ChevronLeft, ChevronRight, ImageIcon, MessageCircle, Send, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ListingDetail({ listing, profile }: { listing: Listing; profile: Profile | null }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUserAndAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        setCurrentUser(userProfile)
        setIsAdmin(userProfile.role === 'admin' || userProfile.role === 'developer')
      }
    }
    checkUserAndAdmin()
  }, [supabase])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id)

      if (error) throw error
      router.push('/catalog')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      setIsDeleting(false)
    }
  }
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const photos = listing.photos ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/catalog" className="hover:text-foreground transition-colors">
          Каталог
        </Link>
        <span>/</span>
        {listing.category && (
          <>
            <Link
              href={`/catalog?category=${listing.category.slug}`}
              className="hover:text-foreground transition-colors"
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
                  className="h-full w-full object-contain"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)}
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
                          className={`h-2 w-2 rounded-full transition-colors ${i === currentPhoto ? 'bg-foreground' : 'bg-foreground/30'}`}
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
                  className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded-md border transition-all bg-secondary ${i === currentPhoto ? 'border-foreground' : 'border-border/50 opacity-60 hover:opacity-100'}`}
                >
                  <img src={photo} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Chat section */}
          <div className="mt-6">
            <ListingChat listing={listing} currentUser={currentUser} />
          </div>
        </div>

        {/* Info - 2 cols */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {listing.category && (
                  <Badge variant="secondary" className="gap-1">
                    <CategoryIcon icon={listing.category.icon} className="h-3 w-3" />
                    {listing.category.name}
                  </Badge>
                )}
              </div>
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5" disabled={isDeleting}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Объявление "{listing.title}" будет удалено навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Удаление...' : 'Удалить'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
                      {'На площадке с '}{new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
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
                {profile?.vk_url ? (
                  <a
                    href={profile.vk_url.startsWith('http') ? profile.vk_url : `https://${profile.vk_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:bg-secondary"
                  >
                    <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.042-2.763-5.321-2.763-5.795 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.44 2.271 4.574 2.865 4.574.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.745c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.154-3.574 2.154-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-foreground">ВКонтакте</p>
                      <p className="text-sm text-muted-foreground">{profile.vk_url}</p>
                    </div>
                  </a>
                ) : null}
                {!profile?.telegram && !profile?.discord && !profile?.vk_url && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Продавец не указал контактные данные
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Description */}
          {listing.description && (
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Описание</CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-all">
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
