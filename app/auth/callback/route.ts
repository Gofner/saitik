import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
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
      
      // Update profile with OAuth data (non-blocking)
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
        } catch {
          // Profile update failed, but auth succeeded - continue
        }
      }
      
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
