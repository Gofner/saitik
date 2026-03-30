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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saitik.vercel.app'
  const listingUrl = `${siteUrl}/listing/${listing.id}`

  const embed = {
    title: listing.title,
    url: listingUrl,
    color: 0x22c55e, // Green color for approved
    fields: [
      {
        name: 'Цена',
        value: `${listing.price.toLocaleString('ru-RU')} ₽`,
        inline: true,
      },
      {
        name: 'Категория',
        value: listing.category,
        inline: true,
      },
    ],
    footer: {
      text: listing.sellerName ? `Продавец: ${listing.sellerName}` : 'Новое объявление',
    },
    timestamp: new Date().toISOString(),
  }

  if (listing.imageUrl) {
    Object.assign(embed, { thumbnail: { url: listing.imageUrl } })
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Saitik Marketplace',
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      console.error('[Discord] Failed to send webhook:', response.status)
    }
  } catch (error) {
    console.error('[Discord] Error sending webhook:', error)
  }
}
