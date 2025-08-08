'use client'

import DepartmentsSkeleton from './DepartmentsSkeleton'
import DepartmentsView from './DepartmentsView'
import DepartmentsLogic from './DepartmentsLogic'
import { useAuthStore } from '@/store/authStore'

export default function DepartmentsContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
   const logicProps = DepartmentsLogic()

   if(!authInitialized) {
      return <DepartmentsSkeleton />
   }

   return <DepartmentsView {...logicProps} />
}
