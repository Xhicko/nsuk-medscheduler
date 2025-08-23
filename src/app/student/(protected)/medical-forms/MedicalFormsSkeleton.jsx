'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export default function MedicalFormsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <StudentHeader student={null} loading={true} />

      <main className=" bg-[#0077B6] w-[95%] mx-auto mt-5 px-4 py-6 xs:px-2 xs:py-4" role="main">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between mt-2 mb-3">
              <Skeleton className="w-24 h-4 bg-white" />
              <Skeleton className="w-10 h-4 bg-white" />
            </div>
            <div className="pt-1 mb-2">
              <Skeleton className="w-full h-2 rounded bg-white " />
            </div>
              <Skeleton className="w-48 h-4 mx-auto bg-white" />
          </div>

          {/* three example section skeletons */}
          {[1,2,3].map((i) => (
            <Card key={i} className="animate-pulse mb-3 border-white">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="w-40 h-5 bg-white" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="w-full h-3 bg-white mb-2" />
                  <Skeleton className="w-3/4 h-3 bg-white mb-2" />
                  <Skeleton className="w-1/2 h-3 bg-white mb-2" />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* footer action skeleton */}
          <div className="pt-6 border-t">
            <Skeleton className="w-full h-10 rounded bg-white" />
          </div>
        </div>
      </main>
    </div>
  )
}
