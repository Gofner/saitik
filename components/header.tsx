'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Shield, MessageCircle } from 'lucide-react'
import { MessageBadge } from '@/components/message-badge'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const loadUserAndProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', userId)
        .single()
      setIsAdmin(profile?.role === 'admin' || profile?.role === 'developer')
      setDisplayName(profile?.display_name ?? null)
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadUserAndProfile(user.id)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserAndProfile(session.user.id)
      } else {
        setIsAdmin(false)
        setDisplayName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setDisplayName(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <Image
            src="/logo.png"
            alt="Logo"
            width={128}
            height={75}
            className="h-8 w-auto"
          />
          MALMARKET
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Главная
          </Link>
          <Link href="/catalog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Каталог
          </Link>
          {user && <MessageBadge />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">
                    {displayName ?? '...'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Мои объявления
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Профиль
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Админ-панель
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Регистрация</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="flex flex-col gap-2 border-t border-border/50 bg-background px-4 py-4 md:hidden">
          <Link href="/catalog" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
            Каталог
          </Link>
          {user ? (
            <>
              <Link href="/messages" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <MessageCircle className="h-4 w-4" />
                Сообщения
              </Link>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
                Мои объявления
              </Link>
              <Link href="/dashboard/profile" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
                Профиль
              </Link>
              {isAdmin && (
                <Link href="/admin" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Админ-панель
                </Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-secondary">
                Выйти
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setMobileOpen(false)}>
                Войти
              </Link>
              <Link href="/auth/sign-up" className="rounded-md px-3 py-2 text-sm text-foreground bg-primary text-primary-foreground text-center" onClick={() => setMobileOpen(false)}>
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
