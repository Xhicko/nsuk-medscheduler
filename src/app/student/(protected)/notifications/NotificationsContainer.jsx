"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import NotificationsView from './NotificationsView'
import { useAuthStore } from '@/store/authStore'

export default function NotificationsContainer({ initialData}) {
  const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading
  const [notifications, setNotifications] = useState(initialData?.notifications || [])
  const [isLoading, setIsLoading] = useState(false)
  const error = initialData?.notificationsError || null
  const student = initialData?.student || null

   // Function to mark notification as read
  const markAsRead = async (notificationId) => {
       setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        )
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
     finally {
      setIsLoading(false)
    }
  }

  return <NotificationsView  
      student={student} 
      loading={!authInitialized || !student}
      isLoading={isLoading}
      error={error}
      onMarkAsRead={markAsRead}
      notifications={notifications}
   />
}