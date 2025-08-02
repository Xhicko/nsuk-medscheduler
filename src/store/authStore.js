// /store/authStore.js
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    loading: true,
    initialized: false,       
    error: null,

    setUser: (user, profile = null) => 
     set({ 
       user: profile ? { ...user, profile } : user, 
       error: null, 
       initialized: true 
     }),

    setLoading: (loading) => 
     set({ 
       loading 
     }),

    setInitialized: (initialized) =>
      set({ 
        initialized 
      }),

    setError: (error) => 
     set({ 
       error
     }),

    clearUser: () => 
     set({ 
       user: null, 
       error: null, 
       initialized: true 
     }),

    signOut: async () => {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      
      try {
        await supabase.auth.signOut()
        set({ 
          user: null, 
          error: null, 
          initialized: true 
        })
      } catch (error) {
        console.error('Sign out error:', error)
        set({ error })
      }
    }
  }))
)