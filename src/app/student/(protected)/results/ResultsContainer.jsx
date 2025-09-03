"use client"

import ResultsView from './ResultsView'
import { useAuthStore } from '@/store/authStore'

export default function ResultsContainer({ initialData}) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading
  const results = initialData?.results || null
  const error = initialData?.resultsError || null
  const student = initialData?.student || null

  return <ResultsView  
      student={student} 
      results={results}
      loading={!authInitialized || !student}
      error={error}
   />
}