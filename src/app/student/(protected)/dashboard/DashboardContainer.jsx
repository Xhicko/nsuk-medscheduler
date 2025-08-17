"use client"

import DashboardView from './DashboardView'
import { useStudentDashboardStore } from '@/store/Client/studentDashboardStore'
import { useAuthStore } from '@/store/authStore'

export default function DashboardContainer({ initialData }) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading

  // Prefer SSR initialData, fallback to store
  const storeData = useStudentDashboardStore(state => state.data)
  const student = storeData || initialData || null

  // Pass loading state to DashboardView
  return <DashboardView initialData={student} loading={!authInitialized || !student} />
}
