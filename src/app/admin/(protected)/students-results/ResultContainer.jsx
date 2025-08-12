'use client'

import ResultView from './ResultView'
import ResultSkeleton from './ResultSkeleton'
import ResultLogic from './ResultLogic'
import { useAuthStore } from '@/store/authStore'

export default function ResultContainer({ initialData }) {
  const loading = useAuthStore((state) => state.loading)
  const initialized = useAuthStore((state) => state.initialized)
  const authInitialized = initialized && !loading

  const logic = ResultLogic(initialData)

  if (!authInitialized) {
    return <ResultSkeleton />
  }

  return <ResultView {...logic} />
}
