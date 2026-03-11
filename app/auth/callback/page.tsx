'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // Get the code from URL
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Auth error:', error)
            router.push('/auth/login?error=auth_failed')
            return
          }
        } catch (e) {
          console.error('Callback error:', e)
          router.push('/auth/login?error=auth_failed')
          return
        }
      }
      
      // Redirect to home
      router.push('/')
      router.refresh()
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Авторизация...</p>
      </div>
    </div>
  )
}
