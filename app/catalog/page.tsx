import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CatalogContent } from '@/components/catalog-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; server?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (categoriesError) console.error('CATALOG categories error:', categoriesError)

  const page = Number(params.page) || 1
  const perPage = 12
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('listings')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('status', 'active')


  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.category) {
    const cat = categories?.find((c) => c.slug === params.category)
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (params.server) {
    query = query.eq('server', params.server)
  }

  const sortField =
    params.sort === 'price_asc' || params.sort === 'price_desc' ? 'price' : 'created_at'
  const ascending = params.sort === 'price_asc'
  query = query.order(sortField, { ascending }).range(from, to)

  const { data: listings, count, error: listingsError } = await query

  if (listingsError) console.error('CATALOG listings error:', listingsError)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CatalogContent
          listings={listings ?? []}
          categories={categories ?? []}
          totalCount={count ?? 0}
          currentPage={page}
          perPage={perPage}
          searchQuery={params.q || ''}
          selectedCategory={params.category || ''}
          selectedServer={params.server || ''}
          selectedSort={params.sort || 'newest'}
        />
      </main>
      <Footer />
    </div>
  )
}