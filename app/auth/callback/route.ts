import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      const provider = user.app_metadata.provider
      const userMetadata = user.user_metadata
      
      // Prepare profile data based on provider
      let displayName: string | null = null
      let discord: string | null = null
      let avatarUrl: string | null = null
      
      if (provider === 'discord') {
        displayName = userMetadata.custom_claims?.global_name || 
                      userMetadata.full_name || 
                      userMetadata.name ||
                      userMetadata.preferred_username
        discord = userMetadata.preferred_username || userMetadata.name
        avatarUrl = userMetadata.avatar_url
      } else if (provider === 'google') {
        displayName = userMetadata.full_name || userMetadata.name || userMetadata.email?.split('@')[0]
        avatarUrl = userMetadata.avatar_url || userMetadata.picture
      }
      
      // Update profile with OAuth data
      if (displayName || discord || avatarUrl) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('display_name, discord, avatar_url')
            .eq('id', user.id)
            .single()
          
          const updateData: Record<string, string> = {}
          
          if (displayName && !existingProfile?.display_name) {
            updateData.display_name = displayName
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
        } catch (e) {
          // Profile update is not critical, continue with redirect
          console.error('Profile update error:', e)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
