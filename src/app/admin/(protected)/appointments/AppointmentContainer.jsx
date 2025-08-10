'use client'

import AppointmentView from './AppointmentView'
import AppointmentSkeleton from './AppointmentSkeleton'
import AppointmentLogic from './AppointmentLogic'
import { useAuthStore } from '@/store/authStore'

export default function AppointmentContainer() {
  const loading = useAuthStore((state) => state.loading)
  const initialized = useAuthStore((state) => state.initialized)
  const authInitialized = initialized && !loading

  const logic = AppointmentLogic()

  if (!authInitialized) {
    return <AppointmentSkeleton />
  }

  return <AppointmentView {...logic} />
}
