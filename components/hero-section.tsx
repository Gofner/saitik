'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function HeroSection() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/catalog')
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border/30">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Маркетплейс игровых предметов игры Малиновка
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Покупайте и продавайте предметы и имущество игры Малиновка за виртуальную валюту
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по предметам, картам..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 pl-10 bg-secondary/50 border-border/50 focus:border-foreground/30"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Найти
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
