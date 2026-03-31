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
  const { data: listing, error: listingError } = await adminClient
    .from('listings')
    .select('id, title, price, photos, category_id, user_id')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return { error: listingError?.message || 'Объявление не найдено' }
  }

  // Get category name
  const { data: category } = await adminClient
    .from('categories')
    .select('name')
    .eq('id', listing.category_id)
    .single()

  // Get seller profile
  const { data: sellerProfile } = await adminClient
    .from('profiles')
    .select('display_name')
    .eq('id', listing.user_id)
    .single()

  const { error } = await adminClient
    .from('listings')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)

  if (error) {
    return { error: error.message }
  }

  // Send Discord notification (non-blocking)
  try {
    await sendListingApprovedWebhook({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: category?.name || 'Без категории',
      imageUrl: listing.photos?.[0] || null,
      sellerName: sellerProfile?.display_name || 'Пользователь',
    })
  } catch (err) {
    console.error('[Discord] approveListing webhook error:', err)
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
lib/discord.ts
