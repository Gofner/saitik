import { createServerClient } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

// Store cookies to set them all at once
const cookiesToSet: string[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Clear previous cookies
  cookiesToSet.length = 0
  
  const code = req.query.code as string | undefined

  if (!code) {
    return res.redirect('/auth/auth-code-error')
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = []
          for (const [name, value] of Object.entries(req.cookies)) {
            if (value) cookies.push({ name, value })
          }
          return cookies
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
            const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : '; Max-Age=31536000'
            const cookieString = `${name}=${value}; Path=/; HttpOnly; SameSite=Lax${maxAge}${secure}`
            cookiesToSet.push(cookieString)
          })
        },
      },
    }
  )

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error.message)
      return res.redirect('/auth/auth-code-error')
    }

    // Set all cookies at once using setHeader with array
    if (cookiesToSet.length > 0) {
      res.setHeader('Set-Cookie', cookiesToSet)
    }

    return res.redirect('/')
  } catch (err) {
    console.error('Callback error:', err)
    return res.redirect('/auth/auth-code-error')
  }
}
