import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyListings } from '@/components/my-listings'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*, category:categories(*), listing_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const activeCount = listings?.filter((l) => l.status === 'active' || l.status === 'pending').length ?? 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <MyListings listings={listings ?? []} activeCount={activeCount} />
    </div>
  )
}
