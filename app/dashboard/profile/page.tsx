'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfileForm } from '@/components/profile-form'
import { TelegramLink } from '@/components/telegram-link'
import type { Profile } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*, telegram_chat_id')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setTelegramLinked(!!data?.telegram_chat_id)
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const refreshTelegramStatus = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', profile?.id)
      .single()

    setTelegramLinked(!!data?.telegram_chat_id)
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Мой профиль</h1>
        <p className="text-sm text-muted-foreground">
          Управляйте информацией профиля и способами связи
        </p>
      </div>

      <ProfileForm profile={profile} />

      <TelegramLink
        isLinked={telegramLinked}
        onStatusChange={refreshTelegramStatus}
      />
    </div>
  )
}
