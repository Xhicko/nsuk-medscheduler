'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Droplets, TestTube } from "lucide-react"

export default function ResultsSkeleton(){

   return(
       <div className="min-h-screen bg-background">
           <StudentHeader student={null} loading={true} />

           <main className="container mx-auto px-4 py-6 xs:px-2 xs:py-4" role="main">
               {/* Blood Group and Genotype Section Skeleton */}
               <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <Droplets className="w-5 h-5 text-[#0077B6]" />
                           Blood Group & Genotype
                       </CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-3">
                           <div className="flex justify-between items-center p-3 bg-[#0077B6] rounded-lg">
                               <span className="font-medium text-white">Blood Group</span>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>
                           <div className="flex justify-between items-center p-3 bg-[#0077B6] rounded-lg">
                               <span className="font-medium text-white">Genotype</span>
                               <Skeleton className="h-6 w-12 bg-white" />
                           </div>
                       </div>
                   </CardContent>
               </Card>

               {/* Blood Tests Skeleton */}
               <Card className="mt-6">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <Droplets className="w-5 h-5 text-red-600" />
                           Blood Tests
                       </CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-3">
                           {/* Hemoglobin */}
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <div>
                                   <span className="font-medium">Hemoglobin Level</span>
                                   <Skeleton className="h-4 w-20 mt-1 bg-white" />
                               </div>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>

                           {/* WBC */}
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <div>
                                   <span className="font-medium">White Blood Cell Count</span>
                                   <Skeleton className="h-4 w-24 mt-1 bg-white" />
                               </div>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>

                           {/* Platelets */}
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <div>
                                   <span className="font-medium">Platelet Count</span>
                                   <Skeleton className="h-4 w-24 mt-1 bg-white" />
                               </div>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>

                           {/* Blood Sugar */}
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <div>
                                   <span className="font-medium">Random Blood Sugar</span>
                                   <Skeleton className="h-4 w-20 mt-1 bg-white" />
                               </div>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>
                       </div>
                   </CardContent>
               </Card>

               {/* Disease Screening Skeleton */}
               <Card className="mt-6">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <TestTube className="w-5 h-5 text-purple-600" />
                           Disease Screening
                       </CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-3">
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <span className="font-medium">HIV</span>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <span className="font-medium">Hepatitis B</span>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <span className="font-medium">Hepatitis C</span>
                               <Skeleton className="h-6 w-16 bg-white" />
                           </div>
                       </div>
                   </CardContent>
               </Card>
           </main>
       </div>
   )
}