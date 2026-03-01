import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminListingsList } from '../../../components/admin-listings-list'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminListingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'developer'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id,title,price,currency,server,status,created_at,user_id,category_id')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) console.error('ADMIN listings load error:', error)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Активные объявления</h2>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500">
          {(listings ?? []).length} шт.
        </span>
      </div>

      <AdminListingsList listings={listings ?? []} />
    </div>
  )
}