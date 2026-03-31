'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Profile } from '@/lib/types'
import { Loader2, Save, User, MessageCircle } from 'lucide-react'

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    telegram: profile?.telegram || '',
    discord: profile?.discord || '',
    vk_url: profile?.vk_url || '',
    bio: profile?.bio || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Вы не авторизованы')
      setLoading(false)
      return
    }

    if (formData.display_name.trim()) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', formData.display_name.trim())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        setError('Это имя уже занято. Выберите другое')
        setLoading(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name || null,
        telegram: formData.telegram || null,
        discord: formData.discord || null,
        vk_url: formData.vk_url || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Основная информация
            </CardTitle>
            <CardDescription className="text-xs">
              Эти данные будут видны другим пользователям
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Отображаемое имя</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Ваш никнейм"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                placeholder="Коротко расскажите о себе"
                rows={5}
                className="resize-none bg-background"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              Контакты для связи
            </CardTitle>
            <CardDescription className="text-xs">
              Покупатели смогут связаться с вами через эти контакты
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                value={formData.telegram}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    telegram: e.target.value,
                  }))
                }
                placeholder="@username или t.me/username"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                value={formData.discord}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discord: e.target.value,
                  }))
                }
                placeholder="username#0000 или username"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vk_url">ВКонтакте</Label>
              <Input
                id="vk_url"
                value={formData.vk_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vk_url: e.target.value,
                  }))
                }
                placeholder="https://vk.com/username"
                className="bg-background"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-500">
              Профиль успешно обновлён
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-48">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Сохранить изменения
        </Button>
      </div>
    </form>
  )
}
Что это даст

После замены:
