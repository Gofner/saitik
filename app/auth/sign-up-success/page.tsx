import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
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
            <CardTitle className="text-2xl">Регистрация завершена!</CardTitle>
            <CardDescription>Проверьте вашу почту</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Мы отправили письмо с подтверждением на ваш email. Перейдите по ссылке
              в письме, чтобы активировать аккаунт и начать продавать.
            </p>

            <Button asChild className="w-full">
              <Link href="/">Главная</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
