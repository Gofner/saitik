'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Link2, Unlink, ExternalLink, Check, Bell } from 'lucide-react'

interface TelegramLinkProps {
  isLinked: boolean
  onStatusChange?: () => void
}

export function TelegramLink({ isLinked, onStatusChange }: TelegramLinkProps) {
  const [loading, setLoading] = useState(false)
  const [linkUrl, setLinkUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [linked, setLinked] = useState(isLinked)

  const generateLink = async () => {
    setLoading(true)
    setError(null)
    setLinkUrl(null)

    try {
      const response = await fetch('/api/telegram/link', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Не удалось создать ссылку')
        return
      }

      setLinkUrl(data.linkUrl)
    } catch {
      setError('Ошибка сети. Попробуйте позже')
    } finally {
      setLoading(false)
    }
  }

  const unlinkTelegram = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/telegram/link', { method: 'DELETE' })
      
      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Не удалось отвязать')
        return
      }

      setLinked(false)
      setLinkUrl(null)
      onStatusChange?.()
    } catch {
      setError('Ошибка сети. Попробуйте позже')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Telegram-уведомления
        </CardTitle>
        <CardDescription>
          Получайте уведомления о новых сообщениях в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              Telegram привязан. Вы получаете уведомления о новых сообщениях.
            </div>
            <Button
              variant="outline"
              onClick={unlinkTelegram}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="mr-2 h-4 w-4" />
              )}
              Отвязать Telegram
            </Button>
          </div>
        ) : linkUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Перейдите по ссылке ниже и нажмите Start в боте:
            </p>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 p-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть Telegram-бота
            </a>
            <p className="text-center text-xs text-muted-foreground">
              Ссылка действительна 15 минут
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setLinkUrl(null)
                setLinked(true)
                onStatusChange?.()
              }}
              className="w-full"
            >
              Я привязал Telegram
            </Button>
          </div>
        ) : (
          <Button
            onClick={generateLink}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="mr-2 h-4 w-4" />
            )}
            Привязать Telegram
          </Button>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
