import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { CategoriesSection } from '@/components/categories-section'
import { RecentListings } from '@/components/recent-listings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: categories, error: categoriesError },
    { data: listings, error: listingsError },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('listings')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  if (categoriesError) console.error('HOME categories error:', categoriesError)
  if (listingsError) console.error('HOME listings error:', listingsError)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection categories={categories ?? []} />
        <RecentListings listings={listings ?? []} />
      </main>
      <Footer />
    </div>
  )
}