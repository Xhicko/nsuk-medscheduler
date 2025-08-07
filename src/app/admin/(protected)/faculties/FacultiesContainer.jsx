'use client'

import FacultiesSkeleton from './FacultiesSkeleton'
import FacultiesView from './FacultiesView'
import FacultiesLogic from './FacultiesLogic'
import { useAuthStore } from '@/store/authStore'

export default function FacultiesContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
   const logicProps = FacultiesLogic()

   if(!authInitialized) {
      return <FacultiesSkeleton />
   }

   return <FacultiesView {...logicProps} />
}
