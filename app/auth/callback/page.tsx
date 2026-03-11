'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Авторизация...')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // Check if we already have a session (Supabase auto-handles hash fragment)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (session) {
        setStatus('Успешно! Перенаправление...')
        window.location.href = '/'
        return
      }
      
      // Try to get code from URL query params
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const errorParam = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      if (errorParam) {
        console.error('OAuth error:', errorParam, errorDescription)
        setStatus('Ошибка авторизации')
        setTimeout(() => {
          window.location.href = '/auth/login?error=' + encodeURIComponent(errorDescription || errorParam)
        }, 1000)
        return
      }
      
      if (code) {
        setStatus('Обмен кода на сессию...')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Exchange error:', error)
            setStatus('Ошибка: ' + error.message)
            setTimeout(() => {
              window.location.href = '/auth/login?error=exchange_failed'
            }, 2000)
            return
          }
          if (data.session) {
            setStatus('Успешно! Перенаправление...')
            window.location.href = '/'
            return
          }
        } catch (e) {
          console.error('Callback error:', e)
          setStatus('Ошибка авторизации')
          setTimeout(() => {
            window.location.href = '/auth/login?error=callback_failed'
          }, 2000)
          return
        }
      }
      
      // No code and no session - something went wrong
      setStatus('Не удалось получить данные авторизации')
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
