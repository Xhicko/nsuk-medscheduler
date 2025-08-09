'use client'

import MedicalFormsView from './MedicalFormsView'
import MedicalFormsSkeleton from './MedicalFormsSkeleton'
import { useAuthStore } from '@/store/authStore'
import MedicalFormsLogic from './MedicalFormsLogic'

export default function MedicalFormsContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
  const logic = MedicalFormsLogic()

    if(!authInitialized) {
      return <MedicalFormsSkeleton />
   }
  
  return (
    <MedicalFormsView {...logic} />
  )
}
