'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ListingForm } from '@/components/listing-form'
import type { Listing, ListingItem, Category } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [items, setItems] = useState<ListingItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const [listingRes, itemsRes, categoriesRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('listing_items')
          .select('*')
          .eq('listing_id', params.id)
          .order('sort_order'),
        supabase
          .from('categories')
          .select('*')
          .order('sort_order')
      ])

      if (listingRes.error || !listingRes.data) {
        router.push('/dashboard')
        return
      }

      setListing(listingRes.data)
      setItems(itemsRes.data || [])
      setCategories(categoriesRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 lg:px-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Редактировать объявление</h1>
      <ListingForm
        categories={categories}
        listing={listing}
        existingItems={items}
        mode="edit"
      />
    </div>
  )
}
