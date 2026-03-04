'use client'

import Link from 'next/link'
import type { Conversation } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ImageIcon } from 'lucide-react'

interface ConversationsListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function ConversationsList({ conversations, currentUserId }: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">Нет сообщений</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Напишите продавцу на странице объявления, чтобы начать диалог
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {conversations.map((conv) => {
        const isBuyer = currentUserId === conv.buyer_id
        const otherUser = isBuyer ? conv.seller : conv.buyer
        const listing = conv.listing as { id: string; title: string; photos: string[] } | undefined
        const photo = listing?.photos?.[0]

        return (
          <Link key={conv.id} href={`/listing/${conv.listing_id}?chat=${conv.id}`}>
            <Card className="border-border/50 bg-card transition-colors hover:bg-secondary/50">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Listing photo */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border/30 bg-secondary">
                  {photo ? (
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {listing?.title || 'Объявление удалено'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {isBuyer ? 'Продавец: ' : 'Покупатель: '}
                      {otherUser?.display_name || 'Пользователь'}
                    </span>
                  </div>
                </div>

                {/* Unread badge */}
                {conv.unread_count && conv.unread_count > 0 && (
                  <Badge variant="destructive" className="flex-shrink-0">
                    {conv.unread_count > 99 ? '99+' : conv.unread_count}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
