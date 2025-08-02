import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'

export const useDashboardStore = create(
  subscribeWithSelector((set, get) => ({
    // Raw dashboard payload
    dashboardData: null,
    loading: false,
    error: null,
    lastFetched: null,
    initialized: false,

    // Simple getters, matching RPC keys
    getStats: () => {
      const dashboardData = get().dashboardData
      console.log('getStats - dashboardData:', dashboardData)
      console.log('getStats - stats:', dashboardData?.stats)
      
      return {
        appointmentsToday:    dashboardData?.stats?.appointmentsToday    ?? 0,
        appointmentsThisWeek: dashboardData?.stats?.appointmentsThisWeek ?? 0,
        appointmentsThisMonth:dashboardData?.stats?.appointmentsThisMonth?? 0,
        approvedBloodResults: dashboardData?.stats?.approvedBloodResults ?? 0,
        totalUnactivatedStudentsThisWeek: dashboardData?.stats?.totalUnactivatedStudentsThisWeek ?? 0,
        totalActivatedStudentsThisWeek:   dashboardData?.stats?.totalActivatedStudentsThisWeek   ?? 0,
        totalMissedAppointments:         dashboardData?.stats?.totalMissedAppointments         ?? 0,
        totalCompletedAppointments:      dashboardData?.stats?.completedAppointments      ?? 0,
        upcomingAppointments:            dashboardData?.stats?.upcomingAppointments            ?? 0,
        pendingBloodResults:             dashboardData?.stats?.pendingBloodResults             ?? 0,
      }
    },

    getRecentMedicalForms: () => get().dashboardData?.recentMedicalForms    ?? [],
    getTodaysAppointments:   () => get().dashboardData?.todaysAppointments   ?? [],
    getRecentMissedAppointments: () => get().dashboardData?.recentMissedAppointments ?? [],

    // Core actions
    setDashboardData: (data) => set({
      dashboardData: data,
      error: null,
      lastFetched: Date.now(),
      initialized: true
    }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error, loading: false }),

    clearDashboard: () => set({
      dashboardData: null,
      error: null,
      lastFetched: null,
      initialized: false
    }),

    // Fetch dashboard data
    fetchDashboardData: async () => {
      if (get().loading) return
      set({ loading: true, error: null })
      try {
        const response = await axios.get(ADMIN_ENDPOINTS.DASHBOARD, {
          timeout: 30000,
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
        
        console.log('Dashboard API Response:', response.data)
        console.log('Dashboard API Response Stats:', response.data?.stats)
        
        set({
          dashboardData: response.data,
          loading: false,
          error: null,
          lastFetched: Date.now(),
          initialized: true
        })
        
        console.log('Stored Dashboard Data:', get().dashboardData)
        return response.data
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        const msg = err.response?.data?.error || err.message || 'Failed to fetch dashboard data'
        set({ error: msg, loading: false })
        throw err
      }
    },

    // Staleness check (5 minutes)
    isDataStale: () => {
      const last = get().lastFetched
      return !last || (Date.now() - last) > 5 * 60 * 1000
    },

    // Conditional fetch
    fetchIfNeeded: async () => {
      if (!get().initialized || get().isDataStale()) {
        return await get().fetchDashboardData()
      }
      return get().dashboardData
    },

    // Chart data
    getChartData: () => {
      const chartData = get().dashboardData
      if (!chartData) return null
      return {
        appointmentStats: [
          { name: 'Today',    value: chartData.appointmentsToday },
          { name: 'This Week',value: chartData.appointmentsThisWeek },
          { name: 'This Month',value: chartData.appointmentsThisMonth },
          { name: 'Missed',   value: chartData.totalMissedAppointments }
        ],
        studentStats: [
          { name: 'Activated',  value: chartData.totalActivatedStudentsThisWeek },
          { name: 'Unactivated',value: chartData.totalUnactivatedStudentsThisWeek }
        ],
        bloodResultStats: [
          { name: 'Approved', value: chartData.approvedBloodResults },
          { name: 'Pending',  value: chartData.pendingBloodResults }
        ]
      }
    }
  }))
)
