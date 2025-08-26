'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"


export default function NotificationsSkeleton() {
  return (
       <div className="min-h-screen bg-background">
           <StudentHeader student={null} loading={true} />
          <Card>
            <CardContent className="p-4">
            <div className="flex items-start gap-3">
               <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
               <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-16" />
                  </div>
               </div>
            </div>
            </CardContent>
          </Card>
      </div>
  )
}