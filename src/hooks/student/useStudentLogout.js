'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'
import { useStudentDashboardStore } from '@/store/Client/studentDashboardStore'

export function useStudentLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const signOut = useAuthStore(state => state.signOut)
  const clearUser = useAuthStore(state => state.clearUser)
  const clearDashboard = useStudentDashboardStore(state => state.clearStore)

  // Reset isLoggingOut when we reach the student login page
  useEffect(() => {
    if (isLoggingOut && pathname === '/student/login') {
      setIsLoggingOut(false)
    }
  }, [pathname, isLoggingOut])

  const logout = async (redirectTo = '/student/login') => {
    if (isLoggingOut) return

    // Ensure redirectTo is a valid string path
    const loginPath = typeof redirectTo === 'string' && redirectTo.startsWith('/')
      ? redirectTo
      : '/student/login'

    setIsLoggingOut(true)

    try {
      // Clear any local user state
      clearUser()

  // Clear student dashboard persistent store
  clearDashboard()

      // Then sign out of Supabase
      await signOut()

      // Navigate to student login page using validated path
      router.replace(loginPath)
    } catch (error) {
      console.error('Student logout failed:', error)
      toast.error('Logout failed. Please try again.')
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}
