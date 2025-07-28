'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthProvider({ initialUser, initialError, children }) {
  const { setUser, setError, setLoading, setInitialized, clearUser } = useAuthStore()
  const [supabase, setSupabase] = useState(null)

  // 1) On mount, create a Supabase browser client
  useEffect(() => {
    const client = createClientComponentClient({
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
    setSupabase(client)

    // 2) Listen for auth state changes
    const { data: listener } = client.auth.onAuthStateChange(
      async (event, session) => {
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          clearUser()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => {
      listener.subscription?.unsubscribe()
    }
  }, [setUser, clearUser])

  // 3) Initialize auth state when supabase client is ready
  useEffect(() => {
    if (!supabase) return

    const initAuth = async () => {
      try {
        setLoading(true)

        // Handle initial error if passed from SSR
        if (initialError) {
          setError(initialError)
          setLoading(false)
          setInitialized(true)
          return
        }

        // If we have initialUser from SSR, use it
        if (initialUser) {
          setUser(initialUser)
          setLoading(false)
          setInitialized(true)
          return
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          // Don't show toast for normal "no session" errors
          if (!userError.message.includes('session_not_found')) {
            setError(userError)
            toast.error(`Auth Error: ${userError.message}`)
          }
          clearUser()
        } else if (user) {
          setUser(user)
        } else {
          clearUser()
        }

      } catch (err) {
        console.error('Auth init error:', err)
        setError(err)
        clearUser()
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    // Run on mount
    initAuth()

    // Run on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        initAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [supabase, initialUser, initialError, setUser, setError, setLoading, setInitialized, clearUser])

  return <>{children}</>
}