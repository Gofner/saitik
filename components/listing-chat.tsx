'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile, Listing } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingChatProps {
  listing: Listing
  currentUser: Profile | null
}

export function ListingChat({ listing, currentUser }: ListingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const sellerId = listing.user_id
  const isSeller = currentUser?.id === sellerId

  // Load or create conversation
  useEffect(() => {
    if (!currentUser || isSeller) {
      setLoading(false)
      return
    }

    const loadConversation = async () => {
      // Find existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', currentUser.id)
        .single()

      if (existingConv) {
        setConversationId(existingConv.id)
        loadMessages(existingConv.id)
      } else {
        setLoading(false)
      }
    }

    loadConversation()
  }, [currentUser, listing.id, isSeller])

  // Load messages for seller (show all conversations)
  useEffect(() => {
    if (!currentUser || !isSeller) return

    const loadSellerConversations = async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('seller_id', currentUser.id)

      if (conversations && conversations.length > 0) {
        // For now, show first conversation (we can expand this later)
        setConversationId(conversations[0].id)
        loadMessages(conversations[0].id)
      } else {
        setLoading(false)
      }
    }

    loadSellerConversations()
  }, [currentUser, listing.id, isSeller])

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(id, display_name, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', convId)
        .neq('sender_id', currentUser?.id)
    }
    setLoading(false)
  }

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (newMsg) {
            setMessages(prev => [...prev, newMsg])
            // Mark as read if not sender
            if (newMsg.sender_id !== currentUser?.id) {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUser?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startConversation = async () => {
    if (!currentUser) return

    setSending(true)
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: listing.id,
        buyer_id: currentUser.id,
        seller_id: sellerId
      })
      .select()
      .single()

    if (newConv && !error) {
      setConversationId(newConv.id)
    }
    setSending(false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    setSending(true)

    let convId = conversationId

    // Create conversation if doesn't exist
    if (!convId) {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: currentUser.id,
          seller_id: sellerId
        })
        .select()
        .single()

      if (error || !newConv) {
        setSending(false)
        return
      }
      convId = newConv.id
      setConversationId(convId)
    }

    // Send message
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: currentUser.id,
        content: newMessage.trim()
      })

    if (!error) {
      setNewMessage('')
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId)
    }

    setSending(false)
  }

  if (!currentUser) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Войдите, чтобы написать продавцу
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isSeller && !conversationId) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Пока никто не написал по этому объявлению
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          Чат с {isSeller ? 'покупателем' : 'продавцом'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Messages */}
        <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg bg-background/50 p-3">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Начните диалог с {isSeller ? 'покупателем' : 'продавцом'}
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUser.id
              const sender = msg.sender as Profile | undefined
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    isOwn ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={sender?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {sender?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-background"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
