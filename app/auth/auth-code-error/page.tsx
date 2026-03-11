import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
            <Image
              src="/logo.png"
              alt="Logo"
              width={128}
              height={75}
              className="h-8 w-auto"
            />
            MALMARKET
          </Link>
        </div>
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Ошибка авторизации</CardTitle>
            <CardDescription>
              Не удалось завершить вход через социальную сеть
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Возможные причины:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Вы отменили авторизацию</li>
              <li>Истекло время сессии</li>
              <li>Проблемы с подключением</li>
            </ul>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/auth/login">Попробовать снова</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">На главную</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
