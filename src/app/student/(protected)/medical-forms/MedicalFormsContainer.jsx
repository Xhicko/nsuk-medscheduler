"use client"

import {useEffect} from 'react'
import { useStudentDashboardStore } from '@/store/Client/studentDashboardStore'
import MedicalFormsView from './MedicalFormsView'
import { useAuthStore } from '@/store/authStore'

export default function MedicalFormsContainer({ initialData }) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading
  const storeData = useStudentDashboardStore(state => state.data)
  const student = storeData || initialData || null
 

  return <MedicalFormsView  initialData={student}  loading={!authInitialized || !student} />
}
