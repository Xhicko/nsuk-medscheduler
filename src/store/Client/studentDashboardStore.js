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

      // getters
      getProfile: () => get().data || null,
      getMedicalFormStatus: () => get().data?.medicalFormStatus || null,

      // actions
      setData: (payload) => set({ data: payload, error: null, lastFetched: Date.now(), initialized: true }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),

      clearStore: () => set({ data: null, error: null, lastFetched: null, initialized: false }),

      fetchDashboard: async () => {
        if (get().loading) return
        set({ loading: true, error: null })
        try {
          const res = await axios.get(STUDENT_ENDPOINTS.DASHBOARD, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
            timeout: 20000,
          })
          const payload = res.data?.data || null
          set({ data: payload, loading: false, error: null, lastFetched: Date.now(), initialized: true })
          return payload
        } catch (err) {
          const msg = err?.response?.data?.error || err.message || 'Failed to fetch dashboard data'
          set({ error: msg, loading: false })
          throw err
        }
      },

      isDataStale: () => {
        const last = get().lastFetched
        return !last || (Date.now() - last) > 5 * 60 * 1000
      },

      fetchIfNeeded: async () => {
        if (!get().initialized || get().isDataStale()) {
          return await get().fetchDashboard()
        }
        return get().data
      },
    })),
    {
      name: 'student-dashboard-store',
      version: 1,
      partialize: (state) => ({ data: state.data, lastFetched: state.lastFetched, initialized: state.initialized }),
    }
  )
)
