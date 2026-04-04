import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground lg:px-8">

        {/* Верхняя строка */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          {/* Left: socials */}
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/5qc9x5WAx8"
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Discord"
            >
              {/* svg */}
            </a>

            <a
              href="https://t.me/malinovka_hooligans"
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Telegram"
            >
              {/* svg */}
            </a>
          </div>

          {/* Center */}
          <nav className="flex justify-center">
            <Link href="/catalog" className="transition-colors hover:text-foreground">
              Каталог
            </Link>
          </nav>

          {/* Right */}
          <p className="text-muted-foreground/60">MALMARKET © 2026</p>
        </div>

        {/* Нижняя строка (дисклеймер) */}
        <div className="mt-4 text-xs text-muted-foreground/50 text-left">
          Не является официальным ресурсом игры «Малиновка». Создан по инициативе игроков
        </div>

      </div>
    </footer>
  )
}
