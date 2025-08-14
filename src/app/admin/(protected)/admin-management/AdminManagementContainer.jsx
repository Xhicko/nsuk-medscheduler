'use client'

import AdminManagementSkeleton from './AdminManagementSkeleton'
import AdminManagementView from './AdminManagementView'
import AdminManagementLogic from './AdminManagementLogic'
import { useAuthStore } from '@/store/authStore'

export default function AdminManagementContainer({ initialData }) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading

  const logic = AdminManagementLogic(initialData)

  if (!authInitialized) {
    return <AdminManagementSkeleton />
  }

  return <AdminManagementView {...logic} />
}
