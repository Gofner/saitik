'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
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
    setTimeout(() => router.push('/sign-in'), 900)
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
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Сохраняем…' : 'Сохранить пароль'}
              </Button>
            </form>

            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {err && <p className="text-sm text-destructive">{err}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
