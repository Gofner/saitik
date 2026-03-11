import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      const provider = user.app_metadata.provider
      const userMetadata = user.user_metadata
      
      // Prepare profile data based on provider
      let displayName: string | null = null
      let vkUrl: string | null = null
      let discord: string | null = null
      let avatarUrl: string | null = null
      
      if (provider === 'discord') {
        // Discord provides username and global_name
        displayName = userMetadata.custom_claims?.global_name || 
                      userMetadata.full_name || 
                      userMetadata.name ||
                      userMetadata.preferred_username
        discord = userMetadata.preferred_username || userMetadata.name
        avatarUrl = userMetadata.avatar_url
      } else if (provider === 'vk' || provider === 'vkontakte') {
        // VK provides first_name, last_name
        const firstName = userMetadata.first_name || ''
        const lastName = userMetadata.last_name || ''
        displayName = `${firstName} ${lastName}`.trim() || userMetadata.full_name || userMetadata.name
        // VK user ID for profile URL
        if (userMetadata.provider_id || userMetadata.sub) {
          vkUrl = `https://vk.com/id${userMetadata.provider_id || userMetadata.sub}`
        }
        avatarUrl = userMetadata.avatar_url || userMetadata.picture
      }
      
      // Update profile with OAuth data
      if (displayName || vkUrl || discord || avatarUrl) {
        const updateData: Record<string, string | null> = {}
        
        // Get existing profile to check if display_name is already set
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('display_name, vk_url, discord, avatar_url')
          .eq('id', user.id)
          .single()
        
        // Only set display_name if it's not already set
        if (displayName && !existingProfile?.display_name) {
          updateData.display_name = displayName
        }
        
        // Always update social links if we have them and they're not set
        if (vkUrl && !existingProfile?.vk_url) {
          updateData.vk_url = vkUrl
        }
        if (discord && !existingProfile?.discord) {
          updateData.discord = discord
        }
        if (avatarUrl && !existingProfile?.avatar_url) {
          updateData.avatar_url = avatarUrl
        }
        
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString()
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
