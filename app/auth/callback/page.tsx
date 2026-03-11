'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Авторизация...')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // Log URL for debugging
      const fullUrl = window.location.href
      const hash = window.location.hash
      const search = window.location.search
      setDebugInfo(`URL: ${fullUrl.substring(0, 100)}...`)
      
      // Check hash fragment for tokens (implicit flow)
      if (hash && hash.includes('access_token')) {
        setStatus('Обработка токена...')
        // Supabase client automatically handles hash fragment
        // Just need to wait a bit for it to process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setStatus('Успешно! Перенаправление...')
          window.location.replace('/')
          return
        }
      }
      
      // Check for code in query params (PKCE flow)
      const urlParams = new URLSearchParams(search)
      const code = urlParams.get('code')
      const errorParam = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      if (errorParam) {
        setStatus('Ошибка: ' + (errorDescription || errorParam))
        setTimeout(() => {
          window.location.replace('/auth/login?error=' + encodeURIComponent(errorDescription || errorParam))
        }, 2000)
        return
      }
      
      if (code) {
        setStatus('Обмен кода на сессию...')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setStatus('Ошибка: ' + error.message)
            setTimeout(() => {
              window.location.replace('/auth/login?error=exchange_failed')
            }, 2000)
            return
          }
          if (data.session) {
            setStatus('Успешно! Перенаправление...')
            window.location.replace('/')
            return
          }
        } catch (e) {
          setStatus('Ошибка обмена кода')
          setTimeout(() => {
            window.location.replace('/auth/login?error=callback_failed')
          }, 2000)
          return
        }
      }
      
      // Wait and check session one more time (Supabase may need time to process)
      setStatus('Проверка сессии...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('Успешно! Перенаправление...')
        window.location.replace('/')
        return
      }
      
      // Final fallback - no session found
      setStatus('Сессия не найдена')
      setDebugInfo(`hash: ${hash ? 'yes' : 'no'}, code: ${code ? 'yes' : 'no'}`)
      setTimeout(() => {
        window.location.replace('/auth/login')
      }, 3000)
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">{status}</p>
        {debugInfo && (
          <p className="text-xs text-muted-foreground/50 max-w-md text-center break-all">{debugInfo}</p>
        )}
      </div>
    </div>
  )
}
