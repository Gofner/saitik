import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">

      {/* Дисклеймер (вне контейнера, у самого левого края) */}
      <div className="px-4 py-2 text-xs text-muted-foreground/50">
        Не является официальным ресурсом игры «Малиновка». Создан по инициативе игроков
      </div>

      {/* Основной футер */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground lg:px-8">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/5qc9x5WAx8"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Discord"
          >
            <svg width="20" height="20" viewBox="0 0 245 240" fill="currentColor">
              <path d="M104.4 104.3c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1z" />
              <path d="M189.5 20h-134C24.7 20 10 34.7 10 53.5v133.1c0 18.8 14.7 33.5 33.5 33.5h113.4l-5.3-18.5 12.8 11.9 12.1 11.2L235 240V53.5C235 34.7 220.3 20 201.5 20z" />
            </svg>
          </a>

          <a
            href="https://t.me/malinovka_hooligans"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Telegram"
          >
            <svg width="20" height="20" viewBox="0 0 240 240" fill="currentColor">
              <path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0z" />
            </svg>
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
    </footer>
  )
}
