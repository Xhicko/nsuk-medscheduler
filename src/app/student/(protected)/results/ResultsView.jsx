'use client'

import StudentHeader from '@/components/custom/client/StudentHeader'
import ResultsSkeleton from './ResultSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, TestTube, ArrowLeft } from "lucide-react"

export default function ResultsView({ 
   student, 
   loading,
   results, 
   error,  
}) {
   const InitialStudentData = student || null
   const resultData = results?.[0]

   if (loading) {
      return <ResultsSkeleton />
   }

    if (error) {
      return (
         <div className="min-h-screen bg-background">
            <StudentHeader student={InitialStudentData} />
            <main className="container mx-auto px-4 py-6">
               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h2 className="text-red-800 font-semibold">Error Loading results</h2>
                  <p className="text-red-600">{error}</p>
               </div>
            </main>
         </div>
      )
   }

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case "normal":
         case "negative":
            return "bg-green-100 text-green-800 border-green-200"
         case "positive":
         case "high":
            return "bg-red-100 text-red-800 border-red-200"
         case "low":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
         default:
            return "bg-gray-100 text-gray-800 border-gray-200"
      }
   }

   return(
       <div className="min-h-screen bg-background">
            <StudentHeader 
               student={InitialStudentData}
            />

            <main className="container mx-auto px-4 py-6 xs:px-2 xs:py-4" role="main">
                 {/* Blood Group and Genotype Section */}
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
                              <Badge variant="outline" className="bg-white text-[#0077B6] font-bold">
                              {resultData?.blood_group || 'Not Available'}
                              </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-[#0077B6] rounded-lg">
                              <span className="font-medium text-white">Genotype</span>
                              <Badge variant="outline" className="bg-white text-[#0077B6] font-bold">
                                 {resultData?.genotype || 'Not Available'}
                              </Badge>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Blood Tests */}
                  <Card className="mt-6">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Droplets className="w-5 h-5 text-red-600" />
                           Blood Tests
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <div>
                              <span className="font-medium">Hemoglobin Level</span>
                              <p className="text-sm text-gray-600">{resultData.hemoglobin_value} g/dL</p>
                           </div>
                           <Badge variant="outline" className={getStatusColor(resultData.hemoglobin_status)}>
                              {resultData.hemoglobin_status}
                           </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <div>
                              <span className="font-medium">White Blood Cell Count</span>
                              <p className="text-sm text-gray-600">{resultData.wbc_value} × 10³/μL</p>
                           </div>
                           <Badge variant="outline" className={getStatusColor(resultData.wbc_status)}>
                              {resultData.wbc_status}
                           </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <div>
                              <span className="font-medium">Platelet Count</span>
                              <p className="text-sm text-gray-600">{resultData.platelets_value} × 10³/μL</p>
                           </div>
                           <Badge variant="outline" className={getStatusColor(resultData.platelets_status)}>
                              {resultData.platelets_status}
                           </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <div>
                              <span className="font-medium">Random Blood Sugar</span>
                              <p className="text-sm text-gray-600">{resultData.blood_sugar_value} mg/dL</p>
                           </div>
                           <Badge variant="outline" className={getStatusColor(resultData.blood_sugar_status)}>
                              {resultData.blood_sugar_status}
                           </Badge>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Disease Screening */}
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
                           <Badge variant="outline" className={getStatusColor(resultData.hiv_result)}>
                              {resultData.hiv_result}
                           </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-medium">Hepatitis B</span>
                           <Badge variant="outline" className={getStatusColor(resultData.hepatitis_b_result)}>
                              {resultData.hepatitis_b_result}
                           </Badge>
                           </div>

                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-medium">Hepatitis C</span>
                           <Badge variant="outline" className={getStatusColor(resultData.hepatitis_c_result)}>
                              {resultData.hepatitis_c_result}
                           </Badge>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
            </main>
       </div>
   )

}