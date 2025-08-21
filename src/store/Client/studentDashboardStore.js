import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import axios from 'axios'
import { STUDENT_ENDPOINTS } from '@/config/studentConfig'

export const useStudentDashboardStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
      initialized: false,
      // Add request tracking
      activeRequest: null,

      // getters
      getProfile: () => get().data || null,
      getMedicalFormStatus: () => get().data?.medicalFormStatus || null,

      // actions
      setData: (payload) => {
        set({ 
          data: payload, 
          error: null, 
          lastFetched: Date.now(), 
          initialized: true,
          loading: false,
          activeRequest: null
        })
      },
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false, activeRequest: null }),

      clearStore: () => set({ 
        data: null, 
        error: null, 
        lastFetched: null, 
        initialized: false, 
        loading: false,
        activeRequest: null
      }),

      fetchDashboard: async () => {
        const state = get()
        
        // Prevent duplicate requests
        if (state.loading || state.activeRequest) {
          console.log('Request already in progress, skipping...')
          return state.activeRequest || Promise.resolve(state.data)
        }

        set({ loading: true, error: null })
        
        // Create and store the request promise
        const requestPromise = (async () => {
          try {
            const res = await axios.get(STUDENT_ENDPOINTS.DASHBOARD, {
              headers: { 
                'Cache-Control': 'no-cache', 
                'Pragma': 'no-cache' 
              },
              timeout: 20000,
            })
            
            const payload = res.data?.data || null
            set({ 
              data: payload, 
              loading: false, 
              error: null, 
              lastFetched: Date.now(), 
              initialized: true,
              activeRequest: null
            })
            
            return payload
          } catch (err) {
            const msg = err?.response?.data?.error || err.message || 'Failed to fetch dashboard data'
            set({ error: msg, loading: false, activeRequest: null })
            throw err
          }
        })()
        
        set({ activeRequest: requestPromise })
        return requestPromise
      },

      isDataStale: () => {
        const last = get().lastFetched
        // Increase stale time to 10 minutes to reduce requests
        return !last || (Date.now() - last) > 10 * 60 * 1000
      },

      fetchIfNeeded: async () => {
        const state = get()
        
        // Don't fetch if we already have a request in progress
        if (state.activeRequest) {
          return state.activeRequest
        }
        
        // Only fetch if not initialized OR data is stale
        if (!state.initialized || state.isDataStale()) {
          return await get().fetchDashboard()
        }
        
        return state.data
      },
    })),
    {
      name: 'student-dashboard-store',
      version: 2, // Increment version to clear old cached data
      partialize: (state) => ({ 
        data: state.data, 
        lastFetched: state.lastFetched, 
        initialized: state.initialized 
        // Don't persist loading, error, or activeRequest
      }),
    }
  )
)