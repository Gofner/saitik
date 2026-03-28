import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId, senderName, messagePreview, listingTitle, conversationId } = await request.json()

    // Don't send notification if sender == recipient
    if (recipientId === user.id) {
      return NextResponse.json({ skipped: true, reason: 'self_message' })
    }

    const adminClient = createAdminClient()

    // Get recipient's telegram_chat_id
    const { data: recipient } = await adminClient
      .from('profiles')
      .select('telegram_chat_id, display_name')
      .eq('id', recipientId)
      .single()

    if (!recipient?.telegram_chat_id) {
      return NextResponse.json({ skipped: true, reason: 'no_telegram' })
    }

    // Build notification message
    const truncatedMessage = messagePreview.length > 100 
      ? messagePreview.substring(0, 100) + '...' 
      : messagePreview

    const text = `<b>Новое сообщение</b>\n\nОт: ${escapeHtml(senderName || 'Пользователь')}\nОбъявление: ${escapeHtml(listingTitle || 'Без названия')}\n\n${escapeHtml(truncatedMessage)}`

    const sent = await sendTelegramMessage(recipient.telegram_chat_id, text)

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('[Telegram Notify] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
