'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

type Props = {
  listingId: string
  className?: string
}

export default function DeleteListingButton({ listingId, className }: Props) {
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
          setCanDelete(role === 'admin' || role === 'developer' || profile.is_admin === true)
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
    <div className={className}>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onDelete}
        disabled={loading}
        title="Удалить объявление"
        aria-label="Удалить объявление"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}
