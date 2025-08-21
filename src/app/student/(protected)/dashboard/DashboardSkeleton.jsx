'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"


export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <StudentHeader student={null} loading={true} />
      <Card className="w-[95%] mx-auto bg-[#0077B6] border-none mt-5 h-[80dvh]">
      <CardHeader>
        <CardTitle className=" text-xl xs:text-lg font-semibold">
           <Skeleton className="h-3 w-25 bg-white" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-3 xs:gap-2">
          {/* Profile Fields Skeletons */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-1">
              {/* Label skeleton */}
              <Skeleton className="h-3 w-30 mb-2 bg-white " />
              {/* Value skeleton - varying widths for realistic look */}
              <Skeleton 
                className={`h-4 bg-white ${
                  index === 0 ? 'w-full h-12' : // Full Name
                  index === 1 ? 'w-full h-12' : // Gender
                  index === 2 ? 'w-full h-12' : // Matric Number
                  index === 3 ? 'w-full h-12' : // Email
                  index === 4 ? 'w-full h-12' : // Faculty
                  'w-full h-12' // Department
                }`}
              />
            </div>
          ))}

          {/* Medical Form Status Skeleton */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-24 bg-white" />
            <Skeleton className="h-12 w-full bg-white" />
          </div>
        </div>

        {/* Button Section Skeleton */}
        <div className="mt-6 pt-4 border-t border-white">
          <Skeleton className="w-full h-11 bg-white rounded-md" />
        </div>

        {/* Footer Text Skeleton */}
        <div className="mt-4 pt-4 border-t border-white">
          <Skeleton className="h-6 w-full bg-white" />
        </div>
      </CardContent>
      </Card>
    </div>)
}
