'use client'

import UploadDataSkeleton from './UploadDataSkeleton'
import UploadDataView from './UploadDataView'
import { useAuthStore } from '@/store/authStore'

export default function UploadDataContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading

   if(!authInitialized) {
      return <UploadDataSkeleton />
   }

   return <UploadDataView />
} 