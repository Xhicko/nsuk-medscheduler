'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from '@/lib/utils'

export default function UploadDataSkeleton(){
   return(
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         {/* Page Header Skeleton */}
         <div className="w-full mx-auto mb-8">
            <div className="p-8 bg-white border-0 shadow-lg rounded-2xl">
               <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-8 h-8 rounded-lg bg-[#0077B6]/20" />
                  <div className="space-y-2">
                     <Skeleton className="h-8 w-80 bg-[#0077B6]/20" />
                     <Skeleton className="h-4 w-96 bg-[#0077B6]/10" />
                  </div>
               </div>
               <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-lg bg-[#0077B6]/20" />
                  <Skeleton className="h-10 w-24 rounded-lg bg-[#0077B6]/10" />
               </div>
            </div>
         </div>

         {/* Tab Buttons Skeleton */}
         <div className="flex justify-center gap-4 mb-8">
            <Skeleton className="h-14 w-48 rounded-lg bg-[#0077B6]/30" />
            <Skeleton className="h-14 w-48 rounded-lg bg-[#0077B6]/10" />
         </div>

         {/* Main Content Skeleton */}
         <div className="w-full mx-auto">
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
               <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-3">
                        <Skeleton className="h-8 w-40 bg-[#0077B6]/20" />
                        <Skeleton className="h-4 w-64 bg-[#0077B6]/10" />
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="space-y-6">
                  {/* Form Fields Grid Skeleton */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     {/* Input Field Skeletons */}
                     {[...Array(3)].map((_, index) => (
                        <div key={index} className="space-y-2">
                           <div className="relative">
                              <Skeleton className="h-16 w-full rounded-lg bg-[#0077B6]/10" />
                              <Skeleton className="absolute left-4 top-4 w-5 h-5 rounded bg-[#0077B6]/20" />
                           </div>
                        </div>
                     ))}

                     {/* Dropdown Field Skeletons */}
                     {[...Array(3)].map((_, index) => (
                        <div key={index} className="space-y-2">
                           <Skeleton className="h-16 w-full rounded-lg bg-[#0077B6]/10" />
                        </div>
                     ))}
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <Skeleton className="h-14 w-full rounded-lg bg-[#0077B6]/20" />
                     <Skeleton className="h-14 w-full rounded-lg bg-[#0077B6]/30" />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   )
}