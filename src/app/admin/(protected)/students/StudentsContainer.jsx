'use client'

import StudentsSkeleton from './StudentsSkeleton'
import StudentsView from './StudentsView'
import StudentsLogic from './StudentsLogic'
import StudentUploadModalLogic from './StudentUploadModalLogic'
import { useAuthStore } from '@/store/authStore'

export default function StudentsContainer() {
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   
   // Get students logic props
   const studentsLogic = StudentsLogic()
   
   // Get upload modal logic props directly, passing the reload function
   const uploadModalLogic = StudentUploadModalLogic(studentsLogic.handleReloadData)
   
   // Make uploadModalLogic available in window for debugging
   if (typeof window !== 'undefined') {
      window.uploadModalLogic = uploadModalLogic;
   }

   if(!authInitialized) {
      return <StudentsSkeleton />
   }

   // Pass both logic props separately to StudentsView
   return <StudentsView {...studentsLogic} uploadModalLogic={uploadModalLogic} />
}
