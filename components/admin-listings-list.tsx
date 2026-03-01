'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function AdminListingsList({ listings: initialListings }: { listings: any[] }) {
  const [listings, setListings] = useState(initialListings)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Удалить объявление? Это действие нельзя отменить.')) return

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('listings').delete().eq('id', id)

      if (error) {
        console.error('DELETE listing error:', error)
        toast.error(error.message)
        return
      }

      toast.success('Объявление удалено')
      setListings((prev) => prev.filter((x) => x.id !== id))
    })
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
        <p className="text-lg font-medium">Активных объявлений нет</p>
        <p className="text-sm text-muted-foreground">Здесь появятся объявления со статусом active</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {listings.map((l) => (
        <div
          key={l.id}
          className="flex flex-col gap-3 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{l.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Сервер {l.server ?? '-'} • {l.price ?? '-'} {l.currency ?? ''} • {new Date(l.created_at).toLocaleString()}
            </div>
            <div className="mt-1 text-xs">
              <Link href={`/listing/${l.id}`} target="_blank" rel="noreferrer" className="underline">
                Открыть объявление
              </Link>
            </div>
          </div>

          <Button variant="destructive" disabled={isPending} onClick={() => handleDelete(l.id)}>
            Удалить
          </Button>
        </div>
      ))}
    </div>
  )
}