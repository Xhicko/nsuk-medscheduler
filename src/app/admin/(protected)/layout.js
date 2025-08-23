'use client'

import NavigationView from "./Navigation/NavigationView"
import RouterProgressBar from "@/components/custom/RouterProgressBar"
import useDepartmentsStore from '@/store/admin/departmentsStore'

// Immediate invocation to trigger department loading without useEffect
// const initializeDepartments = (() => {
//   if (typeof window !== 'undefined') {
//     // Use setTimeout to defer execution without blocking render
//     setTimeout(() => {
//       const store = useDepartmentsStore.getState()
//       if (!store.initialized) {
//         store.fetchDepartments()
//       }
//     }, 0)
//   }
//   return true
// })()

export default function ProtectedAdminLayout({ children }) {
  // Trigger departments fetch on component initialization (no useEffect)
  const fetchDepartments = useDepartmentsStore(state => state.fetchDepartments)
  
  // Call fetchDepartments immediately if not initialized
  const isInitialized = useDepartmentsStore(state => state.initialized)
  if (!isInitialized && typeof window !== 'undefined') {
    // Use queueMicrotask for better performance than setTimeout
    queueMicrotask(() => fetchDepartments())
  }

  return (
    <>
      <RouterProgressBar />
      <NavigationView>
        {children}
      </NavigationView>
    </>
  )
} 