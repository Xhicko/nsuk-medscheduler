// /store/admin/adminStore.js
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

export const useAdminStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        profile: null,
        loading: false,
        error: null,

        setProfile: (profile) => 
          set({ 
            profile, 
            error: null,
            loading: false
          }),

        setLoading: (loading) => 
          set({ 
            loading 
          }),

        setError: (error) => 
          set({ 
            error
          }),

        clearProfile: () => 
          set({ 
            profile: null, 
            error: null,
            loading: false
          }),

        // Convenience getters
        getFullName: () => get().profile?.full_name,
        getEmail: () => get().profile?.email,
        getMedicalId: () => get().profile?.medical_id,
        getRole: () => get().profile?.role,
        isAdmin: () => ['admin', 'superadmin'].includes(get().profile?.role),
      }),
      {
        name: 'admin-store', 
        partialize: (state) => ({ profile: state.profile }),
      }
    )
  )
) 