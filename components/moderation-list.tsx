'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Listing, Profile } from '@/lib/types'
import { Check, X, ExternalLink, Loader2, User, Calendar, Gamepad2, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { approveListing, rejectListing } from '@/app/admin/moderation/actions'
import { toast } from 'sonner'

type ListingWithProfile = Listing & { profiles: Profile }

interface ModerationListProps {
  listings: ListingWithProfile[]
}

export function ModerationList({ listings }: ModerationListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setActionId(id)
    startTransition(async () => {
      const result = await approveListing(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Объявление одобрено')
        router.refresh()
      }
      setActionId(null)
    })
  }

  async function handleReject() {
    if (!rejectingId) return
    setActionId(rejectingId)
    startTransition(async () => {
      const result = await rejectListing(rejectingId, rejectionReason)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Объявление отклонено')
        router.refresh()
      }
      setRejectingId(null)
      setRejectionReason('')
      setActionId(null)
    })
  }

  return (
    <>
      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden border-border/50 bg-card/50">
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                {/* Thumbnail */}
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
                  {listing.photos && listing.photos.length > 0 ? (
                    <Image
                      src={listing.photos[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </div>
                    <Link
                      href={`/listing/${listing.id}`}
                      target="_blank"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="h-3.5 w-3.5" />
                      {listing.server ? `Сервер ${listing.server}` : 'Сервер не указан'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {listing.price.toLocaleString('ru-RU')} {listing.currency}
                    </span>
                    <Link
                      href={`/admin/users/${listing.user_id}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      {listing.profiles?.display_name || 'Пользователь'}
                    </Link>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(listing.created_at), {
                        addSuffix: true,
                        locale: ru
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(listing.id)}
                    disabled={isPending && actionId === listing.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isPending && actionId === listing.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Одобрить
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingId(listing.id)}
                    disabled={isPending && actionId === listing.id}
                    className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить объявление</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения (опционально). Продавец увидит эту причину.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Причина отклонения</Label>
            <Input
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Например: Недостаточно информации"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending && actionId === rejectingId}
            >
              {isPending && actionId === rejectingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Отклонить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
