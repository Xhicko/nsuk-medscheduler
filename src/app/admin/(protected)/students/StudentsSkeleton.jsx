'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from '@/lib/utils'

export default function StudentsSkeleton(){
   return(
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         {/* Page Header Skeleton */}
         <div className="w-full mx-auto mb-8">
            <div className="p-8 bg-white border-0 shadow-lg rounded-2xl">
               <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-8 h-8 rounded-lg bg-[#0077B6]/20" />
                  <div className="space-y-2">
                     <Skeleton className="h-8 w-72 bg-[#0077B6]/20" />
                     <Skeleton className="h-4 w-96 bg-[#0077B6]/10" />
                  </div>
               </div>
               <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-lg bg-[#0077B6]/20" />
                  <Skeleton className="h-10 w-24 rounded-lg bg-[#0077B6]/10" />
               </div>
            </div>
         </div>

         {/* Search and Filter Section Skeleton */}
         <Card className="mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <CardHeader>
               <Skeleton className="h-6 w-48 bg-[#0077B6]/20" />
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Skeleton className="h-12 w-full rounded-lg bg-[#0077B6]/10" />
                  <Skeleton className="h-12 w-full rounded-lg bg-[#0077B6]/10" />
                  <Skeleton className="h-12 w-full rounded-lg bg-[#0077B6]/10" />
               </div>
            </CardContent>
         </Card>

         {/* Students Table Skeleton */}
         <Card className="bg-white border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
               <div className="flex items-center justify-between">
                  <div className="space-y-2">
                     <Skeleton className="h-7 w-40 bg-[#0077B6]/20" />
                     <Skeleton className="h-4 w-56 bg-[#0077B6]/10" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg bg-[#0077B6]/20" />
               </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 p-4 rounded-lg bg-gray-50">
                     {[...Array(6)].map((_, index) => (
                        <Skeleton key={index} className="h-4 bg-[#0077B6]/10" />
                     ))}
                  </div>
                  
                  {/* Table Rows */}
                  {[...Array(8)].map((_, rowIndex) => (
                     <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
                        {[...Array(5)].map((_, colIndex) => (
                           <Skeleton key={colIndex} className="h-4 bg-[#0077B6]/5" />
                        ))}
                        <div className="flex gap-2">
                           <Skeleton className="h-8 w-8 rounded bg-[#0077B6]/10" />
                           <Skeleton className="w-8 h-8 bg-red-100 rounded" />
                        </div>
                     </div>
                  ))}
               </div>

               {/* Pagination Skeleton */}
               <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                  <Skeleton className="h-4 w-48 bg-[#0077B6]/10" />
                  <div className="flex gap-2">
                     {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-8 w-8 rounded bg-[#0077B6]/10" />
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   )
}
