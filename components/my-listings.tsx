'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, STATUS_LABELS, type Listing } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Eye, EyeOff, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export function MyListings({ listings, activeCount }: { listings: Listing[]; activeCount: number }) {
  const router = useRouter()
  const canCreate = activeCount < 3

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return
    const supabase = createClient()
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      toast.error('Ошибка удаления')
    } else {
      toast.success('Объявление удалено')
      router.refresh()
    }
  }

  const handleToggleVisibility = async (listing: Listing) => {
    const supabase = createClient()
    const newStatus = listing.status === 'hidden' ? 'pending' : 'hidden'
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listing.id)
    if (error) {
      toast.error('Ошибка обновления')
    } else {
      toast.success(newStatus === 'hidden' ? 'Объявление скрыто' : 'Объявление отправлено на проверку')
      router.refresh()
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои объявления</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCount} из 3 слотов использовано
          </p>
        </div>
        {canCreate ? (
          <Button asChild className="gap-2">
            <Link href="/dashboard/create">
              <Plus className="h-4 w-4" />
              Создать
            </Link>
          </Button>
        ) : (
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Лимит достигнут
          </Button>
        )}
      </div>

      {listings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const status = STATUS_LABELS[listing.status]
            const firstPhoto = listing.photos?.[0]
            return (
              <Card key={listing.id} className="border-border/50 bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/30 bg-secondary">
                    {firstPhoto ? (
                      <img src={firstPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium text-foreground">{listing.title}</h3>
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{listing.server ? `Сервер ${listing.server}` : ''}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                    {listing.status === 'rejected' && listing.rejection_reason && (
                      <p className="mt-1 text-xs text-destructive">
                        {'Причина: '}{listing.rejection_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {listing.status === 'active' || listing.status === 'hidden' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleVisibility(listing)}
                        title={listing.status === 'hidden' ? 'Показать' : 'Скрыть'}
                      >
                        {listing.status === 'hidden' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/edit/${listing.id}`} title="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(listing.id)}
                      title="Удалить"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/50 py-20 text-center">
          <p className="text-muted-foreground">У вас пока нет объявлений</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/dashboard/create">
              <Plus className="h-4 w-4" />
              Создать первое объявление
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
