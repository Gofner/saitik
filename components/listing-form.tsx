'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category, Listing, ListingItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Upload, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const SERVERS = ['01', '02', '03', '04']
const TALISMANS_CATEGORY_SLUG = 'talismans-packs'
const DEFAULT_TALISMAN_COVER = '/images/talisman-default-cover.png'

interface Props {
  categories: Category[]
  userId: string
  listing?: Listing
}

interface ItemForm {
  id?: string
  name: string
  description: string
  price: string
}

export function ListingForm({ categories, userId, listing }: Props) {
  const router = useRouter()
  const isEditing = !!listing

  const [title, setTitle] = useState(listing?.title ?? '')
  const [description, setDescription] = useState(listing?.description ?? '')
  const [server, setServer] = useState(listing?.server ?? '')
  const [price, setPrice] = useState(listing?.price?.toString() ?? '')
  const [currency, setCurrency] = useState(listing?.currency ?? 'RUB')
  const [categoryId, setCategoryId] = useState(listing?.category_id ?? '')
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? [])
  const [items, setItems] = useState<ItemForm[]>(
    listing?.listing_items?.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? '',
      price: i.price.toString(),
    })) ?? [],
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [useDefaultCover, setUseDefaultCover] = useState(false)

  // Find the Talismans category
  const talismanCategory = categories.find(c => c.slug === TALISMANS_CATEGORY_SLUG)
  const isTalismanCategory = categoryId === talismanCategory?.id

  // Auto-enable/disable default cover when category changes
  useEffect(() => {
    if (isTalismanCategory) {
      setUseDefaultCover(true)
    } else {
      setUseDefaultCover(false)
    }
  }, [isTalismanCategory])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || photos.length >= 10) return

    setUploading(true)
    const supabase = createClient()
    const newPhotos: string[] = []

    for (const file of Array.from(files).slice(0, 10 - photos.length)) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('listing-photos')
        .upload(path, file)

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(path)
        newPhotos.push(publicUrl)
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setUploading(false)
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', description: '', price: '' }])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !price || !categoryId) {
      toast.error('Заполните обязательные поля')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Нужно войти в аккаунт')
      setSaving(false)
      return
    }

    // Check if user is banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      toast.error('Ваш аккаунт заблокирован')
      setSaving(false)
      return
    }

    // Prepare photos array - add default cover at the beginning if enabled
    const finalPhotos = isTalismanCategory && useDefaultCover 
      ? [DEFAULT_TALISMAN_COVER, ...photos] 
      : photos

    const listingData = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      game: 'Малиновка',
      server: server || null,
      price: parseFloat(price),
      currency,
      category_id: categoryId,
      photos: finalPhotos,
      status: 'pending' as const,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEditing && listing) {
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listing.id)

        if (error) throw error

        // Delete old items and insert new ones
        await supabase.from('listing_items').delete().eq('listing_id', listing.id)

        if (items.length > 0) {
          const itemsData = items
            .filter((i) => i.name.trim())
            .map((item, index) => ({
              listing_id: listing.id,
              name: item.name.trim(),
              description: item.description.trim() || null,
              price: parseFloat(item.price) || 0,
              sort_order: index,
            }))
          if (itemsData.length > 0) {
            await supabase.from('listing_items').insert(itemsData)
          }
        }

        toast.success('Объявление обновлено и отправлено на проверку')
      } else {
        const { data: newListing, error } = await supabase
          .from('listings')
          .insert(listingData)
          .select()
          .single()

        if (error) throw error

        if (items.length > 0 && newListing) {
          const itemsData = items
            .filter((i) => i.name.trim())
            .map((item, index) => ({
              listing_id: newListing.id,
              name: item.name.trim(),
              description: item.description.trim() || null,
              price: parseFloat(item.price) || 0,
              sort_order: index,
            }))
          if (itemsData.length > 0) {
            await supabase.from('listing_items').insert(itemsData)
          }
        }

        toast.success('Объявление создано и отправлено на проверку')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ошибка сохранения'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic info */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{'Название *'}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Мужской скин Персей"
              required
              className="bg-secondary/50 border-border/50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="server">{'Сервер *'}</Label>
            <Select value={server} onValueChange={setServer} required>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Выберите сервер" />
              </SelectTrigger>
              <SelectContent>
                {SERVERS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">{'Категория *'}</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Тут можете оставить контакты для связи..."
              rows={4}
              className="bg-secondary/50 border-border/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">{'Цена *'}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1000"
                required
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">Игровая валюта</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Фото (до 10)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Default cover for Talismans category */}
          {isTalismanCategory && (
            <div className="flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border/30">
                <img 
                  src={DEFAULT_TALISMAN_COVER} 
                  alt="Обложка по умолчанию" 
                  loading="eager"
                  className={`h-full w-full object-cover transition-opacity ${useDefaultCover ? 'opacity-100' : 'opacity-40'}`}
                />
                {!useDefaultCover && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Обложка по умолчанию</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Автоматически добавляется для категории "Талисманы/Паки"
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {useDefaultCover ? 'Вкл' : 'Выкл'}
                </span>
                <Switch
                  checked={useDefaultCover}
                  onCheckedChange={setUseDefaultCover}
                />
              </div>
            </div>
          )}

          {/* User photos */}
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-md border border-border/30">
                <img src={photo} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Удалить фото"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 10 && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/50 text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handlePhotoUpload}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Товары в лоте</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1">
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border border-border/30 p-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <Input
                      placeholder="Название товара"
                      value={item.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                      className="bg-secondary/50 border-border/50 h-9 text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Описание"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        className="bg-secondary/50 border-border/50 h-9 text-sm flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Цена"
                        value={item.price}
                        onChange={(e) => updateItem(i, 'price', e.target.value)}
                        className="bg-secondary/50 border-border/50 h-9 text-sm w-24"
                      />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Добавьте отдельные товары, если в лоте несколько позиций
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? 'Сохранить' : 'Создать объявление'}
        </Button>
      </div>
    </form>
  )
}
