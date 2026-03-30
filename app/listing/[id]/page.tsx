import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingDetail } from '@/components/listing-detail'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*, category:categories(*), listing_items(*)')
    .eq('id', id)
    .single()

  // Fetch profile separately with last_seen_at
  let profile = null
  if (listing?.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, last_seen_at')
      .eq('id', listing.user_id)
      .single()
    profile = profileData
  }

  if (!listing || listing.status !== 'active') {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ListingDetail listing={listing} profile={profile} />
      </main>
      <Footer />
    </div>
  )
}
