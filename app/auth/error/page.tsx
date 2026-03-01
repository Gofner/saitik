import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Ошибка авторизации</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {params?.error
                ? `Код ошибки: ${params.error}`
                : 'Произошла неизвестная ошибка.'}
            </p>
            <Button asChild>
              <Link href="/auth/login">Вернуться ко входу</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
