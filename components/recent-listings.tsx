import Link from 'next/link'
import type { Listing } from '@/lib/types'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function RecentListings({ listings }: { listings: Listing[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Последние объявления</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalog" className="gap-1">
            Все объявления
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/50 py-16 text-center">
          <p className="text-muted-foreground">Пока нет объявлений</p>
          <p className="mt-1 text-sm text-muted-foreground/60">Станьте первым продавцом!</p>
        </div>
      )}
    </section>
  )
}
