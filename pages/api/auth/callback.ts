import { createServerClient } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${value}; Path=${options?.path || '/'}; HttpOnly; SameSite=Lax${options?.maxAge ? `; Max-Age=${options.maxAge}` : '; Max-Age=31536000'}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
            res.appendHeader('Set-Cookie', cookieString)
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

    return res.redirect('/')
  } catch (err) {
    console.error('Callback error:', err)
    return res.redirect('/auth/auth-code-error')
  }
}
