import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage, escapeHtml, type TelegramUpdate } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    // Only process text messages
    if (!update.message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = update.message.chat.id
    const text = update.message.text.trim()
    const firstName = update.message.from.first_name

    // Handle /start command with link token
    if (text.startsWith('/start ')) {
      const token = text.substring(7).trim()
      
      if (!token) {
        await sendTelegramMessage(
          chatId,
          'Привет! Чтобы привязать Telegram к аккаунту, перейдите в настройки профиля на сайте и нажмите "Привязать Telegram".'
        )
        return NextResponse.json({ ok: true })
      }

      // Link account using token
      const supabase = createAdminClient()
      
      // Find user with this token
      const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('id, display_name, telegram_link_token, telegram_link_expires_at')
        .eq('telegram_link_token', token)
        .single()

      if (findError || !profile) {
        await sendTelegramMessage(
          chatId,
          'Ссылка недействительна или устарела. Попробуйте получить новую ссылку в настройках профиля.'
        )
        return NextResponse.json({ ok: true })
      }

      // Check if token expired
      if (profile.telegram_link_expires_at) {
        const expiresAt = new Date(profile.telegram_link_expires_at)
        if (expiresAt < new Date()) {
          await sendTelegramMessage(
            chatId,
            'Ссылка истекла. Получите новую ссылку в настройках профиля.'
          )
          return NextResponse.json({ ok: true })
        }
      }

      // Update profile with chat_id and clear token
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_link_token: null,
          telegram_link_expires_at: null,
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('[Telegram] Error linking account:', updateError)
        await sendTelegramMessage(
          chatId,
          'Произошла ошибка при привязке аккаунта. Попробуйте позже.'
        )
        return NextResponse.json({ ok: true })
      }

      const displayName = profile.display_name || 'пользователь'
      await sendTelegramMessage(
        chatId,
        `Привет, ${escapeHtml(firstName)}! Telegram успешно привязан к аккаунту <b>${escapeHtml(displayName)}</b>.\n\nТеперь вы будете получать уведомления о новых сообщениях.`
      )
      
      return NextResponse.json({ ok: true })
    }

    // Handle /start without token
    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        `Привет, ${escapeHtml(firstName)}! Я бот для уведомлений Saitik.\n\nЧтобы привязать Telegram к аккаунту:\n1. Перейдите в настройки профиля на сайте\n2. Нажмите "Привязать Telegram"\n3. Перейдите по ссылке из профиля`
      )
      return NextResponse.json({ ok: true })
    }

    // Handle /unlink command
    if (text === '/unlink') {
      const supabase = createAdminClient()
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('telegram_chat_id', chatId.toString())
        .single()

      if (!profile) {
        await sendTelegramMessage(
          chatId,
          'Этот Telegram не привязан ни к одному аккаунту.'
        )
        return NextResponse.json({ ok: true })
      }

      await supabase
        .from('profiles')
        .update({ telegram_chat_id: null })
        .eq('id', profile.id)

      await sendTelegramMessage(
        chatId,
        'Telegram успешно отвязан от аккаунта. Вы больше не будете получать уведомления.'
      )
      
      return NextResponse.json({ ok: true })
    }

    // Unknown command
    await sendTelegramMessage(
      chatId,
      'Я понимаю только команды:\n/start - начать\n/unlink - отвязать аккаунт'
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
