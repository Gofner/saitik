'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // 1) Подхватываем сессию из ссылки письма (hash или code)
  useEffect(() => {
    const init = async () => {
      setErr(null)

      try {
        // Вариант A: после verify Supabase часто редиректит с токенами в hash:
        // /auth/reset-password#access_token=...&refresh_token=...&type=recovery
        const hash = window.location.hash?.replace(/^#/, '') ?? ''
        const hashParams = new URLSearchParams(hash)
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          // чистим hash, чтобы не светить токены в адресной строке
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
          if (error) throw error
        } else {
          // Вариант B: code-based flow:
          // /auth/reset-password?code=...
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            url.searchParams.delete('code')
            window.history.replaceState({}, document.title, url.pathname + url.search)
            if (error) throw error
          }
        }

        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setErr('Сессия для сброса пароля не найдена. Откройте ссылку из письма заново или запросите сброс ещё раз.')
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Не удалось подтвердить ссылку сброса пароля.')
      } finally {
        setReady(true)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Меняем пароль
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    setErr(null)
    setMsg('Пароль обновлён. Сейчас перенаправим на вход…')
    setTimeout(() => router.push('/auth/login'), 900)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
            <Image src="/logo.png" alt="Logo" width={128} height={75} className="h-8 w-auto" />
            ОПГ "Малиновка"
          </Link>
        </div>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Новый пароль</CardTitle>
            <CardDescription>Придумайте новый пароль для аккаунта.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!ready ? (
              <p className="text-sm text-muted-foreground">Проверяем ссылку…</p>
            ) : (
              <>
                <form onSubmit={onSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      className="bg-secondary/50 border-border/50"
                      disabled={!!err || loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={!!err || loading}>
                    {loading ? 'Сохраняем…' : 'Сохранить пароль'}
                  </Button>
                </form>

                {msg && <p className="text-sm text-green-600">{msg}</p>}
                {err && (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">{err}</p>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-foreground underline underline-offset-4"
                    >
                      Запросить сброс пароля заново
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
