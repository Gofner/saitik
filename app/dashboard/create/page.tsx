import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListingForm } from '@/components/listing-form'

export default async function CreateListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  // Check listing limit
  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'active'])

  if ((count ?? 0) >= 3) {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Создать объявление</h1>
      <ListingForm categories={categories ?? []} userId={user.id} />
    </div>
  )
}
