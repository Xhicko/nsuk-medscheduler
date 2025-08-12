'use client'

import DepartmentsSkeleton from './DepartmentsSkeleton'
import DepartmentsView from './DepartmentsView'
import DepartmentsLogic from './DepartmentsLogic'
import { useAuthStore } from '@/store/authStore'

export default function DepartmentsContainer({ initialData }) {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
   const logicProps = DepartmentsLogic(initialData)

   if(!authInitialized) {
      return <DepartmentsSkeleton />
   }

   return <DepartmentsView {...logicProps} />
}
