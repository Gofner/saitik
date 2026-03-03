'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    setErr(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/reset-password`,
    })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    setMsg('Если аккаунт существует — мы отправили письмо для сброса пароля.')
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
            <CardTitle className="text-2xl">Сброс пароля</CardTitle>
            <CardDescription>Введите email — мы пришлём ссылку для сброса.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Отправляем…' : 'Отправить ссылку'}
              </Button>
            </form>

            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {err && <p className="text-sm text-destructive">{err}</p>}

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-foreground underline underline-offset-4">
                Вернуться ко входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
