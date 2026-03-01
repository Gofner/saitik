import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ModerationList } from '@/components/moderation-list'
import { Check } from 'lucide-react'
import type { Listing } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ModerationPage() {
  const supabase = await createClient()

  // Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('ADMIN/MODERATION auth.getUser error:', userError)
  }

  if (!user) {
    redirect('/auth/login')
  }

  // Role check
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('ADMIN/MODERATION profile role error:', profileError)
  }

  if (!profile || !['admin', 'developer'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch pending listings (NO profiles join to avoid RLS issues)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (listingsError) {
    console.error('ADMIN/MODERATION listings fetch error:', listingsError)
  }

  const pendingListings = (listings as Listing[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Объявления на модерации</h2>
        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-500">
          {pendingListings.length} шт.
        </span>
      </div>

      {pendingListings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
          <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">Все объявления проверены</p>
          <p className="text-sm text-muted-foreground">
            Новых объявлений на модерации нет
          </p>
        </div>
      ) : (
        <ModerationList listings={pendingListings} />
      )}
    </div>
  )
}