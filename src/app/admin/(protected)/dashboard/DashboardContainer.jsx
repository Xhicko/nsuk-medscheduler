'use client'

import DashboardSkeleton from './DashboardSkeleton'
import DashboardView from './DashboardView'
import { useAuthStore } from '@/store/authStore'

export default function DashboardContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading

   if(!authInitialized) {
      return <DashboardSkeleton />
   }

   return <DashboardView />
} 