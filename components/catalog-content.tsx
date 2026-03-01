'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { Category, Listing } from '@/lib/types'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const SERVERS = ['01', '02', '03', '04']

interface Props {
  listings: Listing[]
  categories: Category[]
  totalCount: number
  currentPage: number
  perPage: number
  searchQuery: string
  selectedCategory: string
  selectedServer: string
  selectedSort: string
}

export function CatalogContent({
  listings,
  categories,
  totalCount,
  currentPage,
  perPage,
  searchQuery,
  selectedCategory,
  selectedServer,
  selectedSort,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchQuery)
  const totalPages = Math.ceil(totalCount / perPage)

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 when filters change
    if (!updates.page) params.delete('page')
    router.push(`/catalog?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: query })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Каталог</h1>

      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </form>

        <Select
          value={selectedCategory || 'all'}
          onValueChange={(v) => updateParams({ category: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/50 border-border/50">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedServer || 'all'}
          onValueChange={(v) => updateParams({ server: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/50 border-border/50">
            <SelectValue placeholder="Сервер" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все серверы</SelectItem>
            {SERVERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSort}
          onValueChange={(v) => updateParams({ sort: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/50 border-border/50">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Сначала новые</SelectItem>
            <SelectItem value="price_asc">Цена: по возрастанию</SelectItem>
            <SelectItem value="price_desc">Цена: по убыванию</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {totalCount > 0 ? `Найдено ${totalCount} объявлений` : 'Ничего не найдено'}
      </p>

      {/* Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/50 py-20 text-center">
          <p className="text-muted-foreground">Нет объявлений по вашему запросу</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setQuery(''); updateParams({ q: '', category: '', server: '' }) }}>
            Сбросить фильтры
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: String(currentPage - 1) })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: String(currentPage + 1) })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
