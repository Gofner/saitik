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
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // 1) Подхватываем token_hash из URL и создаём сессию через verifyOtp
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      setErr(null)
      setMsg(null)

      const url = new URL(window.location.href)
      const token_hash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type') // ожидаем "recovery"

      if (!token_hash || type !== 'recovery') {
        setErr('Неверная или устаревшая ссылка. Запросите сброс пароля заново.')
        setReady(true)
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery',
      })

      // Скрываем токен из адресной строки
      url.searchParams.delete('token_hash')
      url.searchParams.delete('type')
      window.history.replaceState({}, document.title, url.pathname + url.search)

      if (error) {
        setErr(error.message)
        setReady(true)
        return
      }

      setReady(true)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Меняем пароль
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    setLoading(true)
    setMsg(null)
    setErr(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    setMsg('Пароль обновлён. Сейчас перенаправим на вход…')
    setTimeout(() => router.push('/auth/login'), 900)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
            <Image src="/logo.png" alt="Logo" width={128} height={75} className="h-8 w-auto" />
            MALMARKET
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
