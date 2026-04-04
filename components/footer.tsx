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
            <svg width="18" height="18" viewBox="0 0 245 240" fill="currentColor" aria-hidden="true">
              <path d="M104.4 104.3c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1z" />
              <path d="M189.5 20h-134C24.7 20 10 34.7 10 53.5v133.1c0 18.8 14.7 33.5 33.5 33.5h113.4l-5.3-18.5 12.8 11.9 12.1 11.2L235 240V53.5C235 34.7 220.3 20 201.5 20zm-39.7 135.8s-3.7-4.4-6.8-8.3c13.5-3.8 18.6-12.3 18.6-12.3-4.2 2.7-8.2 4.6-11.8 5.9-5.1 2.2-10 3.6-14.8 4.5-9.8 1.8-18.8 1.3-26.5-.1-5.8-1.1-10.8-2.6-15-4.5-2.4-.9-5-2.1-7.6-3.5-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.5-.3-2.2-1.2-3.4-2.1-3.4-2.1s4.9 8.3 17.9 12.2c-3.1 3.9-6.9 8.5-6.9 8.5-22.8-.7-31.5-15.7-31.5-15.7 0-33.3 14.9-60.3 14.9-60.3 14.9-11.1 29-10.8 29-10.8l1 1.2c-18.6 5.4-27.2 13.6-27.2 13.6s2.3-1.3 6.2-3.1c11.2-4.9 20-6.2 23.6-6.5.6-.1 1.1-.1 1.7-.2 6.1-.8 13.1-1 20.5-.2 9.7 1.1 20.1 3.9 30.7 9.6 0 0-8.2-7.8-25.9-13.2l1.4-1.6s14.1-.3 29 10.8c0 0 14.9 27 14.9 60.3 0 0-8.8 15-31.6 15.7z" />
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
            <svg width="18" height="18" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true">
              <path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zm58.6 82.1-19.7 92.8c-1.5 6.6-5.5 8.2-11.1 5.1l-30.7-22.6-14.8 14.3c-1.6 1.6-3 3-6.1 3l2.2-31.4 57.1-51.6c2.5-2.2-.5-3.4-3.9-1.2l-70.6 44.4-30.4-9.5c-6.6-2.1-6.7-6.6 1.4-9.7l118.8-45.8c5.5-2 10.3 1.3 8.5 9.2z" />
            </svg>
          </a>

          <p className="text-muted-foreground/60 ml-1">MALMARKET © 2026</p>
        </div>

      </div>
    </footer>
  )
}
