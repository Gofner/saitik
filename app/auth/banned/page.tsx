import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ban } from 'lucide-react'

export default function BannedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Аккаунт заблокирован</CardTitle>
          <CardDescription>
            Ваш аккаунт был заблокирован администратором за нарушение правил площадки.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Если вы считаете, что это ошибка, свяжитесь с администрацией.
          </p>
          <Button asChild variant="outline">
            <Link href="/">На главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
