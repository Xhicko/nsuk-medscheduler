"use client"
import MedicalFormsView from './MedicalFormsView'
import { useAuthStore } from '@/store/authStore'

export default function MedicalFormsContainer({ initialData, initialStep, visibleStepIds, submitSection }) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading
  const student = initialData || null
 
  return <MedicalFormsView  
            initialData={student} 
            initialStep={initialStep} 
            visibleStepIds={visibleStepIds}
            loading={!authInitialized || !student}
            submitSection={submitSection}
         />
}
