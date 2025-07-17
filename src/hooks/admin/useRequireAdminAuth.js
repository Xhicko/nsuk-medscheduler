'use client'

import { useEffect } from 'react'
import { useAdminAuthStore } from '@/store/Admin/adminAuthStore'

export default function useRequireAdminAuth() {
  const { admin, loading, initialized } = useAdminAuthStore()

  useEffect(() => {
    // Handle showing the re-auth modal or redirect for admins
    if (initialized && !loading && !admin) {
      console.log('No authenticated admin, modal will be shown or redirect triggered')
    }
  }, [admin, loading, initialized])

  return {
    isAuthenticated: !!admin,
    isLoading: loading || !initialized,
    admin
  }
} 