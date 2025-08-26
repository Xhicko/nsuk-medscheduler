'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import NotificationsSkeleton from './NotificationsSkeleton'
import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Clock, Calendar, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return dateString
  }
}

export default function NotificationsView({ 
   student, 
   loading,
   notifications, 
   isLoading, 
   error,  
}) {
   const InitialStudentData = student || null

   const unreadNotifications = useMemo(
      () => notifications.filter((notification) => !notification.is_read),
      [notifications]
   )

   const unreadNotificationsCount = unreadNotifications.length

   if (loading) {
      return <NotificationsSkeleton />
   }

    if (error) {
      return (
         <div className="min-h-screen bg-background">
            <StudentHeader student={InitialStudentData} />
            <main className="container mx-auto px-4 py-6">
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h2 className="text-red-800 font-semibold">Error Loading Notifications</h2>
                  <p className="text-red-600">{error}</p>
               </div>
            </main>
         </div>
      )
   }

   return(
       <div className="min-h-screen bg-background">
            <StudentHeader 
               student={InitialStudentData}
            />

            <main className="container mx-auto px-4 py-6 xs:px-2 xs:py-4" role="main">
                <div className="flex items-center justify-between">
                  <h1 className="text-normal text-[#0077B6] font-bold ">Messages</h1>
                  <p className="text-sm text-[#0077B6]"> <b>{unreadNotificationsCount}</b> </p>
               </div>

               <div className='mt-3'> 
                        {notifications.length === 0 ? (
                           // Center empty state both vertically and horizontally.
                           <div className="flex items-center justify-center min-h-[70dvh]">
                              <Card>
                                 <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                                    <div className="relative mb-6">
                                       <Bell className="h-16 w-16 text-[#0077B6]" />
                                       <Stethoscope className="h-8 w-8 text-[#0077B6] absolute -bottom-1 -right-1" />
                                    </div>
                                    <h3 className="text-lg font-medium text-[#0077B6] mb-2 text-center">No notifications</h3>
                                    <p className="text-sm text-[#0077B6]/90 text-center max-w-sm">No appointment updates or medical notifications right now.</p>
                                 </CardContent>
                              </Card>
                           </div>
                      ) : (
                  <div className="space-y-3">
                     {notifications.map((notification) => (
                     <Card
                        key={notification.id}
                        className={cn(
                           "transition-all",
                           !notification.is_read && "border-l-4 border-[#0077B6] bg-blue-50/50 mb-3",
                        )}
                     >
                        <CardContent className="p-2 mb-3">
                           <div className="flex items-start">
                           <div className="flex-shrink-0 mt-0.5 mr-3">
                              <Calendar className="h-5 w-5 text-[#0077B6]" />
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                 <h3 className={cn("font-light text-sm text-[#0077B6]", !notification.is_read && "font-semibold")}>
                                    {notification.title}
                                 </h3>
                                 <div className="flex items-center gap-2 flex-shrink-0">
                                 {!notification.is_read && (
                                    <div className="w-2 h-2 bg-primary rounded-full" aria-label="Unread" />
                                 )}
                                 </div>
                              </div>

                              <p className="text-sm text-[#0077B6] leading-relaxed mb-3 whitespace-pre-wrap">
                                 {notification.message}
                              </p>

                              <div className="flex items-center gap-1 text-xs text-[#0077B6]">
                                 <Clock className="h-3 w-3" />
                                 <span>{formatDateTime(notification.created_at)}</span>
                              </div>
                           </div>
                           </div>
                        </CardContent>
                     </Card>
                     ))}
                  </div>
               )
             }
               </div>
            </main>
       </div>
   )

}