import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function getUserFromCookie() {
  try {
    // Await cookies() before using it
    const cookieStore = await cookies()

    // Create an SSR‐only Supabase client bound to the incoming cookie
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { 
      data: { user }, 
      error 
    } = await supabase.auth.getUser()

    // If there's no user, or an error, return null + the error (if any)
    if (!user || error) {
      return {
        user: null,
        error: error ? error.message : null,
      }
    }

    // If user exists and is validated, return the user
    return {
      user: user,
      error: null,
    }
  } catch (error) {
    console.error('Error in getUserFromCookie:', error)
    return {
      user: null,
      error: error.message || 'Unknown auth error',
    }
  }
}