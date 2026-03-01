'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, CheckCircle, Users, Package } from 'lucide-react'

interface Stats {
  pendingCount: number
  activeCount: number
  usersCount: number
  totalListings: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    pendingCount: 0,
    activeCount: 0,
    usersCount: 0,
    totalListings: 0
  })

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      const [pending, active, users, total] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true })
      ])

      setStats({
        pendingCount: pending.count || 0,
        activeCount: active.count || 0,
        usersCount: users.count || 0,
        totalListings: total.count || 0
      })
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'На модерации',
      value: stats.pendingCount,
      icon: ClipboardList,
      color: 'text-yellow-500'
    },
    {
      title: 'Активных',
      value: stats.activeCount,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'Пользователей',
      value: stats.usersCount,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Всего объявлений',
      value: stats.totalListings,
      icon: Package,
      color: 'text-muted-foreground'
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Статистика</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={cn('h-4 w-4', card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
