'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Props = {
  listingId: string
}

export default function DeleteListingButton({ listingId }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [canDelete, setCanDelete] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkRole() {
      setChecking(true)
      setError(null)

      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr || !authData?.user) {
        if (!cancelled) {
          setCanDelete(false)
          setChecking(false)
        }
        return
      }

      // Если у тебя роль хранится иначе — поменяй этот запрос
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', authData.user.id)
        .single()

      if (!cancelled) {
        if (profErr || !profile) {
          setCanDelete(false)
        } else {
          const role = String(profile.role ?? '')
          setCanDelete(
            role === 'admin' ||
            role === 'developer' ||
            profile.is_admin === true
          )
        }
        setChecking(false)
      }
    }

    checkRole()

    return () => {
      cancelled = true
    }
  }, [supabase])

  async function onDelete() {
    setError(null)

    const ok = confirm('Удалить объявление? Это действие нельзя отменить.')
    if (!ok) return

    setLoading(true)
    const { error } = await supabase.from('listings').delete().eq('id', listingId)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/catalog')
    router.refresh()
  }

  if (checking) return null
  if (!canDelete) return null

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        className="w-full"
        onClick={onDelete}
        disabled={loading}
      >
        {loading ? 'Удаляем…' : 'Удалить объявление'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
