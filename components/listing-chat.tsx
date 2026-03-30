'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile, Listing, Conversation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, MessageCircle, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoscowTime } from '@/lib/time'
import { OnlineStatus } from '@/components/online-status'

interface ListingChatProps {
  listing: Listing
  currentUser: Profile | null
  sellerProfile?: Profile | null
}

interface ConversationWithBuyer extends Conversation {
  buyer?: Profile
  unread_count?: number
}

export function ListingChat({ listing, currentUser, sellerProfile }: ListingChatProps) {
  const searchParams = useSearchParams()
  const chatIdFromUrl = searchParams.get('chat')
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sellerConversations, setSellerConversations] = useState<ConversationWithBuyer[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithBuyer | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const sellerId = listing.user_id
  const isSeller = currentUser?.id === sellerId

  // Load conversation for buyer
  useEffect(() => {
    if (!currentUser || isSeller) {
      setLoading(false)
      return
    }

    const loadConversation = async () => {
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

  // Load all conversations for seller
  useEffect(() => {
    if (!currentUser || !isSeller) return

    const loadSellerConversations = async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          *,
          buyer:profiles!conversations_buyer_id_fkey(id, display_name, avatar_url, last_seen_at)
        `)
        .eq('listing_id', listing.id)
        .eq('seller_id', currentUser.id)
        .order('updated_at', { ascending: false })

      if (conversations && conversations.length > 0) {
        // Get unread counts
        const convsWithUnread = await Promise.all(
          conversations.map(async (conv) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('is_read', false)
              .neq('sender_id', currentUser.id)

            return { ...conv, unread_count: count || 0 }
          })
        )
        setSellerConversations(convsWithUnread)
        
        // Auto-open conversation from URL param
        if (chatIdFromUrl) {
          const targetConv = convsWithUnread.find(c => c.id === chatIdFromUrl)
          if (targetConv) {
            setSelectedConversation(targetConv)
            setConversationId(targetConv.id)
            loadMessages(targetConv.id)
            return
          }
        }
      }
      setLoading(false)
    }

    loadSellerConversations()
  }, [currentUser, listing.id, isSeller, chatIdFromUrl])

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

  // Open a specific conversation (for seller)
  const openConversation = (conv: ConversationWithBuyer) => {
    setSelectedConversation(conv)
    setConversationId(conv.id)
    setMessages([])
    setLoading(true)
    loadMessages(conv.id)
    
    // Update unread count locally
    setSellerConversations(prev => 
      prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
    )
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
          // Skip if message is from current user (already added locally)
          if (payload.new.sender_id === currentUser?.id) return
          
          const { data: newMsg } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (newMsg) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
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

  // Send Telegram notification (non-blocking)
  const sendTelegramNotification = async (
    recipientId: string,
    messageContent: string
  ) => {
    // Don't notify if sending to self
    if (recipientId === currentUser?.id) return

    try {
      await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          senderName: currentUser?.display_name,
          messagePreview: messageContent,
          listingTitle: listing.title,
          conversationId,
        }),
      })
    } catch {
      // Notification errors should not affect chat functionality
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    setSending(true)

    let convId = conversationId

    // Create conversation if doesn't exist (for buyer)
    if (!convId && !isSeller) {
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

    if (!convId) {
      setSending(false)
      return
    }

    const messageContent = newMessage.trim()
    
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: currentUser.id,
        content: messageContent
      })
      .select('*, sender:profiles(id, display_name, avatar_url)')
      .single()

    if (!error && newMsg) {
      // Add message to local state immediately
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId)
      
      // Send Telegram notification to recipient (non-blocking)
      const recipientId = isSeller 
        ? selectedConversation?.buyer_id 
        : sellerId
      if (recipientId) {
        sendTelegramNotification(recipientId, messageContent)
      }
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

  // Seller view: show list of conversations or selected chat
  if (isSeller) {
    // No conversations yet
    if (sellerConversations.length === 0 && !loading) {
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

    // Show chat with selected buyer
    if (selectedConversation) {
      const buyer = selectedConversation.buyer
      return (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setSelectedConversation(null)
                    setConversationId(null)
                    setMessages([])
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={buyer?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {buyer?.display_name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>Чат с {buyer?.display_name || 'покупателем'}</span>
              </CardTitle>
              <OnlineStatus lastSeenAt={buyer?.last_seen_at || null} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg bg-background/50 p-3">
              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
                  Нет сообщений
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
                      <div className="flex flex-col">
                        <div
                          className={cn(
                            'rounded-lg px-3 py-2 text-sm',
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className={cn(
                          'mt-1 text-[10px] text-muted-foreground',
                          isOwn ? 'text-right' : 'text-left'
                        )}>
                          {formatMoscowTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

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

    // Show list of conversations for seller
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Сообщения от покупателей ({sellerConversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sellerConversations.map((conv) => {
              const buyer = conv.buyer
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="flex items-center gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={buyer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {buyer?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {buyer?.display_name || 'Покупатель'}
                      </span>
                      <OnlineStatus lastSeenAt={buyer?.last_seen_at || null} showText={false} />
                    </div>
                    <OnlineStatus lastSeenAt={buyer?.last_seen_at || null} />
                  </div>
                  {conv.unread_count && conv.unread_count > 0 && (
                    <Badge variant="destructive">
                      {conv.unread_count > 99 ? '99+' : conv.unread_count}
                    </Badge>
                  )}
                </button>
              )
            })
          )}
        </CardContent>
      </Card>
    )
  }

  // Buyer view: single chat with seller
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Чат с продавцом
          </CardTitle>
          {sellerProfile && (
            <OnlineStatus lastSeenAt={sellerProfile.last_seen_at} />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg bg-background/50 p-3">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Начните диалог с продавцом
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
                  <div className="flex flex-col">
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className={cn(
                      'mt-1 text-[10px] text-muted-foreground',
                      isOwn ? 'text-right' : 'text-left'
                    )}>
                      {formatMoscowTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

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
