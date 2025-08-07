'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/admin/adminStore'
import useDepartmentsStore from '@/store/admin/departmentsStore'
import { toast } from 'react-hot-toast'

export function useAdminLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const signOut = useAuthStore(state => state.signOut)
  const clearProfile = useAdminStore(state => state.clearProfile)
  const clearDepartments = useDepartmentsStore(state => state.clearStore)

  // Reset isLoggingOut when we reach the admin login page
  useEffect(() => {
    if (isLoggingOut && pathname === '/admin/login') {
      setIsLoggingOut(false)
    }
  }, [pathname, isLoggingOut])

  const logout = async (redirectTo = '/admin/login') => {
    if (isLoggingOut) return 
    
    // Ensure redirectTo is a valid string path
    const loginPath = typeof redirectTo === 'string' && redirectTo.startsWith('/') 
      ? redirectTo 
      : '/admin/login'
    
    setIsLoggingOut(true)
    
    try {
      // Clear admin profile data
      clearProfile()
      
      // Clear departments store
      clearDepartments()
      
      // Then sign out
      await signOut()
      
      // Navigate to admin login page using validated path
      router.replace(loginPath)

    } catch (error) {
      console.error('Admin logout failed:', error)
      toast.error('Admin logout failed. Please try again.')
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
} 