'use client'

import StudentsSkeleton from './StudentsSkeleton'
import StudentsView from './StudentsView'
import StudentsLogic from './StudentsLogic'
import { useAuthStore } from '@/store/authStore'

export default function StudentsContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
   const logicProps = StudentsLogic()

   if(!authInitialized) {
      return <StudentsSkeleton />
   }

   return <StudentsView {...logicProps} />
}
