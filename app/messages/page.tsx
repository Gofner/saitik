import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConversationsList } from '@/components/conversations-list'

export const metadata = {
  title: 'Сообщения — MALMARKET',
  description: 'Ваши диалоги с продавцами и покупателями',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(id, title, photos),
      buyer:profiles!conversations_buyer_id_fkey(id, display_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey(id, display_name, avatar_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  // Get unread counts for each conversation
  const conversationsWithUnread = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      return { ...conv, unread_count: count || 0 }
    })
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Сообщения</h1>
        <ConversationsList 
          conversations={conversationsWithUnread} 
          currentUserId={user.id} 
        />
      </main>
      <Footer />
    </div>
  )
}
