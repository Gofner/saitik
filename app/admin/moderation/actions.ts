'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendListingApprovedWebhook } from '@/lib/discord'

export async function approveListing(listingId: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // Check if current user is admin/developer
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Не авторизован' }
  }
  
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'developer'].includes(profile.role)) {
    return { error: 'Недостаточно прав' }
  }

  // Get listing info before updating
  const { data: listing } = await adminClient
    .from('listings')
    .select('id, title, price, category, images, user_id, profiles(display_name)')
    .eq('id', listingId)
    .single()

  const { error } = await adminClient
    .from('listings')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  // Send Discord notification (non-blocking)
  if (listing) {
    const sellerProfile = listing.profiles as { display_name?: string } | null
    sendListingApprovedWebhook({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: listing.category,
      imageUrl: listing.images?.[0] || null,
      sellerName: sellerProfile?.display_name,
    }).catch(() => {
      // Ignore Discord errors
    })
  }

  revalidatePath('/admin/moderation', 'page')
  revalidatePath('/', 'page')
  revalidatePath('/catalog', 'page')
  revalidatePath(`/listing/${listingId}`, 'page')
  return { success: true }
}

export async function rejectListing(listingId: string, reason?: string) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // Check if current user is admin/developer
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Не авторизован' }
  }
  
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'developer'].includes(profile.role)) {
    return { error: 'Недостаточно прав' }
  }

  const { error } = await adminClient
    .from('listings')
    .update({
      status: 'rejected',
      rejection_reason: reason || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/moderation', 'page')
  revalidatePath('/', 'page')
  revalidatePath('/catalog', 'page')
  return { success: true }
}
