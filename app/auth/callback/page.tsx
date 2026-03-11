'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Авторизация...')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // With implicit flow, Supabase automatically processes the hash fragment
      // when detectSessionInUrl is true. We just need to check for the session.
      
      // Wait for Supabase to process the URL (hash fragment contains tokens)
      setStatus('Обработка...')
      
      // Give Supabase time to parse the hash and set the session
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if session was established
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setStatus('Ошибка: ' + error.message)
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
        return
      }
      
      if (session) {
        setStatus('Успешно! Перенаправление...')
        window.location.href = '/'
        return
      }
      
      // If no session yet, try listening for auth state change
      setStatus('Ожидание сессии...')
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setStatus('Успешно! Перенаправление...')
          subscription.unsubscribe()
          window.location.href = '/'
        }
      })
      
      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe()
        setStatus('Не удалось войти')
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 1500)
      }, 5000)
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
