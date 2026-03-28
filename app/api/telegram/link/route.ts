import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateLinkToken } from '@/lib/telegram'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = generateLinkToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('profiles')
      .update({
        telegram_link_token: token,
        telegram_link_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('[Telegram Link] Error:', error)
      return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'SaitikNotifyBot'
    const linkUrl = `https://t.me/${botUsername}?start=${token}`

    return NextResponse.json({ linkUrl, expiresAt: expiresAt.toISOString() })
  } catch (error) {
    console.error('[Telegram Link] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('profiles')
      .update({
        telegram_chat_id: null,
        telegram_link_token: null,
        telegram_link_expires_at: null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('[Telegram Unlink] Error:', error)
      return NextResponse.json({ error: 'Failed to unlink' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Telegram Unlink] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
