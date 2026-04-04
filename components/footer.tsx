import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-8 text-sm text-muted-foreground lg:px-8">

        {/* Left — текст */}
        <div className="flex min-w-0 items-center">
          <span className="text-xs text-muted-foreground/60 leading-tight">
            Не является официальным ресурсом игры «Малиновка». <br />
            Создан по инициативе игроков.
          </span>
        </div>

        {/* Center — только Каталог */}
        <div className="flex items-center justify-center">
          <Link href="/catalog" className="transition-colors hover:text-foreground">
            Каталог
          </Link>
        </div>

        {/* Right — иконки + MALMARKET */}
        <div className="flex items-center justify-end gap-3">
          {/* Discord */}
          
            href="https://discord.gg/5qc9x5WAx8"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Discord"
            title="Discord"
          >
            <svg width="18" height="18" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
              <path d="M60.1 4.9A58.6 58.6 0 0 0 45.5.4a40.6 40.6 0 0 0-1.8 3.7 54.2 54.2 0 0 0-16.3 0A38.9 38.9 0 0 0 25.6.4 58.5 58.5 0 0 0 11 4.9C1.6 19.1-.98 33 .31 46.6a59 59 0 0 0 18 9.1 44.6 44.6 0 0 0 3.9-6.3 38.4 38.4 0 0 1-6.1-2.9l1.5-1.1a42 42 0 0 0 35.9 0l1.5 1.1a38.3 38.3 0 0 1-6.1 2.9 44.3 44.3 0 0 0 3.9 6.3 58.8 58.8 0 0 0 18-9.1C72 30.9 68.2 17.1 60.1 4.9ZM23.7 38.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.9 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.5 0 6.4 3.2 6.4 7.2s-2.9 7.2-6.4 7.2Z" />
            </svg>
          </a>

          {/* Telegram */}
          
            href="https://t.me/malinovka_hooligans"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Telegram"
            title="Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.196 13.4l-2.965-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.957.159z" />
            </svg>
          </a>

          <p className="text-muted-foreground/60 ml-1">MALMARKET © 2026</p>
        </div>

      </div>
    </footer>
  )
}
