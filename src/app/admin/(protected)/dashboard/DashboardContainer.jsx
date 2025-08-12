'use client'

import DashboardSkeleton from './DashboardSkeleton'
import DashboardView from './DashboardView'
import { useAuthStore } from '@/store/authStore'
import { useDashboardStore } from '@/store/admin/dashboardStore'

export default function DashboardContainer({ initialData }) {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading

   // Seed dashboard store from initialData once on first client render
   if (initialData) {
      const { setDashboardData } = useDashboardStore.getState()
      if (!useDashboardStore.getState().initialized) {
         setDashboardData(initialData)
      }
   }

   if(!authInitialized) {
      return <DashboardSkeleton />
   }

   return <DashboardView />
} 