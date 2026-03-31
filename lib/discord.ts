const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

interface ListingInfo {
  id: string
  title: string
  price: number
  category: string
  imageUrl?: string | null
  sellerName?: string
}

export async function sendListingApprovedWebhook(listing: ListingInfo) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('[Discord] Webhook URL not configured, skipping notification')
    return
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.opgmalmarket.com'
  const listingUrl = `${siteUrl}/listing/${listing.id}`

  const embed: Record<string, unknown> = {
    title: listing.title,
    url: listingUrl,
    color: 0x22c55e,
    fields: [
      {
        name: 'Цена',
        value: `${Number(listing.price).toLocaleString('ru-RU')} вирт`,
        inline: true,
      },
      {
        name: 'Категория',
        value: listing.category,
        inline: true,
      },
    ],
    footer: {
      text: listing.sellerName
        ? `Продавец: ${listing.sellerName}`
        : 'Новое объявление',
    },
    timestamp: new Date().toISOString(),
  }

  if (listing.imageUrl) {
    embed.thumbnail = { url: listing.imageUrl }
  }

  try {
    console.log('[Discord] Sending webhook for listing:', listing.id, listing.title)

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'MALMARKET',
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[Discord] Failed to send webhook:', response.status, text)
      return
    }

    console.log('[Discord] Webhook sent successfully')
  } catch (error) {
    console.error('[Discord] Error sending webhook:', error)
  }
}
