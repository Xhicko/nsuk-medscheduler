'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function DepartmentsSkeleton() {
   return (
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         {/* Page Header Skeleton */}
         <div className="w-full mx-auto mb-8">
            <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
               <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
                  <div className="flex-1">
                     <Skeleton className="h-8 w-64 mb-2 bg-white/20" />
                     <Skeleton className="h-4 w-96 bg-white/20" />
                  </div>
               </div>
               <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 bg-white/20" />
                  <Skeleton className="h-10 w-24 bg-white/20" />
               </div>
            </div>
         </div>
         
         {/* Search and Table Skeleton */}
         <div className="w-full mx-auto px-6">
            <div className="bg-white border-0 shadow-lg rounded-2xl">
               <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                     </div>
                     <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-56" />
                     </div>
                  </div>
               </div>
               
               <div className="p-8">
                  <div className="space-y-4">
                     {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
