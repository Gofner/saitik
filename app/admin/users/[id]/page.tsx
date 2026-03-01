'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, Ban, CheckCircle, Loader2, User, Calendar, Send, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Listing } from '@/lib/types'
import { ListingCard } from '@/components/listing-card'

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('user')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')

  const fetchUser = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Get current user role
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single()
      if (myProfile) setCurrentUserRole(myProfile.role)
    }
    
    const [{ data: profile }, { data: userListings }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('listings').select('*, category:categories(*)').eq('user_id', id).order('created_at', { ascending: false })
    ])
    
    setUser(profile)
    setListings(userListings || [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  async function handleBan() {
    if (!user) return
    setActionLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('profiles')
      .update({
        is_banned: true,
        ban_reason: banReason || null,
        banned_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    // Hide all user's listings
    await supabase
      .from('listings')
      .update({ status: 'hidden' })
      .eq('user_id', user.id)
    
    toast.success('Пользователь забанен')
    setBanDialogOpen(false)
    setBanReason('')
    fetchUser()
    setActionLoading(false)
  }

  async function handleUnban() {
    if (!user) return
    setActionLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null
      })
      .eq('id', user.id)
    
    toast.success('Пользователь разбанен')
    fetchUser()
    setActionLoading(false)
  }

  async function handleSetRole(newRole: 'user' | 'admin' | 'developer') {
    if (!user) return
    setActionLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)
    
    const roleLabels = { user: 'Пользователь', admin: 'Администратор', developer: 'Разработчик' }
    toast.success(`Роль изменена на: ${roleLabels[newRole]}`)
    fetchUser()
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Пользователь не найден</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/users')}>
          Назад к списку
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Профиль пользователя</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User info */}
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-medium">
                {user.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold">{user.display_name || 'Без имени'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.role === 'admin' && <Badge variant="secondary">Админ</Badge>}
                  {user.role === 'developer' && <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Разработчик</Badge>}
                  {user.is_banned && <Badge variant="destructive">Забанен</Badge>}
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </div>
              {user.telegram && (
                <a
                  href={`https://t.me/${user.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {user.telegram}
                </a>
              )}
              {user.discord && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {user.discord}
                </div>
              )}
            </div>

            {user.is_banned && user.ban_reason && (
              <>
                <Separator className="bg-border/50" />
                <div>
                  <p className="text-sm font-medium text-destructive">Причина бана:</p>
                  <p className="text-sm text-muted-foreground mt-1">{user.ban_reason}</p>
                </div>
              </>
            )}

            <Separator className="bg-border/50" />

            {/* Actions */}
            <div className="space-y-2">
              {user.is_banned ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleUnban}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Разбанить
                </Button>
              ) : (
                <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Ban className="h-4 w-4" />
                      Забанить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Забанить пользователя</DialogTitle>
                      <DialogDescription>
                        Пользователь не сможет входить на сайт. Все его объявления будут скрыты.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                      <Label htmlFor="banReason">Причина бана (опционально)</Label>
                      <Input
                        id="banReason"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Например: Мошенничество"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button variant="destructive" onClick={handleBan} disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Забанить'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Role management - only developer can change roles freely, admin can only demote to user */}
              {currentUserRole === 'developer' ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium mb-2">Изменить роль:</p>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      variant={user.role === 'user' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSetRole('user')}
                      disabled={actionLoading || user.role === 'user'}
                    >
                      User
                    </Button>
                    <Button
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSetRole('admin')}
                      disabled={actionLoading || user.role === 'admin'}
                    >
                      Admin
                    </Button>
                    <Button
                      variant={user.role === 'developer' ? 'default' : 'outline'}
                      size="sm"
                      className={user.role === 'developer' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      onClick={() => handleSetRole('developer')}
                      disabled={actionLoading || user.role === 'developer'}
                    >
                      Dev
                    </Button>
                  </div>
                </div>
              ) : currentUserRole === 'admin' && user.role === 'user' ? (
                <p className="text-xs text-muted-foreground">
                  Только разработчик может изменять роли
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* User listings */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">
            Объявления пользователя ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Нет объявлений</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showStatus />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
