'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAdminAuthStore } from '@/store/Admin/adminAuthStore'
import { CLIENT_ENDPOINTS } from '@/config/apiEndpoints'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export function useAdminReAuthenticate() {
  const [isReAuthenticating, setIsReAuthenticating] = useState(false)
  const { setAdmin, clearAdmin } = useAdminAuthStore()

  // Accept email and password for admin login
  const reAuthenticate = async (email, password) => {
    setIsReAuthenticating(true)

    try {
      // Call the login endpoint with email and password
      const response = await axios.post(CLIENT_ENDPOINTS.AUTH.LOGIN, {
        email: email,
        password: password
      })
      
      if (response.status === 200) {
        // Create Supabase client
        const supabase = createClientComponentClient()
        
        if (response.data.session) {
          try {
            // Set the session from the server response
            const { error } = await supabase.auth.setSession({
              access_token: response.data.session.access_token,
              refresh_token: response.data.session.refresh_token
            })
            
            if (error) {
              console.error('Session setup failed:', error)
              toast.error('Failed to restore session')
              return false
            }
          } catch (sessionError) {
            console.error('Session setup error:', sessionError)
            return false
          }
        }
        // Check for admin role
        if (response.data.user?.user_metadata?.role === 'admin') {
          setAdmin(response.data.user)
          return true
        } else {
          clearAdmin()
          toast.error('Not an admin user')
          return false
        }
      }
      return false
    } catch (error) {
      console.error('Admin re-authentication error:', error)
      clearAdmin()
      return false
    } finally {
      setIsReAuthenticating(false)
    }
  }

  return {
    reAuthenticate,
    isReAuthenticating
  }
} 