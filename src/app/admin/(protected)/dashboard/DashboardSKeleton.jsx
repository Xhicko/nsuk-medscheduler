import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-[calc(100vh-49px)] bg-white">
      {/* Header Section Skeleton */}
      <div className="mb-8">
        <div className="relative p-6 overflow-hidden text-white shadow-lg bg-gradient-to-r from-[#0077B6]/90 to-[#0077B6] rounded-2xl md:p-8">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 -mb-24 -ml-24 rounded-full bg-white/5"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0 lg:flex-1">
                {/* Welcome text skeleton */}
                <div className="mb-3">
                  <div className="h-8 mb-2 rounded bg-white/20 animate-pulse"></div>
                  <div className="w-3/4 h-6 rounded bg-white/20 animate-pulse"></div>
                </div>
                
                {/* Info panel skeleton */}
                <div className="p-4 border bg-white/15 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 p-2 rounded-lg bg-white/20 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 mb-2 rounded bg-white/20 animate-pulse"></div>
                        <div className="w-1/2 h-6 rounded bg-white/20 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 p-2 rounded-lg bg-white/20 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 mb-2 rounded bg-white/20 animate-pulse"></div>
                        <div className="w-1/2 h-6 rounded bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats skeleton */}
              <div className="flex flex-col space-y-3 lg:ml-8">
                <div className="px-4 py-3 text-center border rounded-lg bg-white/10 backdrop-blur-sm border-white/20">
                  <div className="h-4 mb-2 rounded bg-white/20 animate-pulse"></div>
                  <div className="h-8 rounded bg-white/20 animate-pulse"></div>
                </div>
                <div className="px-4 py-3 text-center border rounded-lg bg-white/10 backdrop-blur-sm border-white/20">
                  <div className="h-4 mb-2 rounded bg-white/20 animate-pulse"></div>
                  <div className="h-6 rounded bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics Section Skeleton */}
      <div className="mt-8 mb-10">
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#0077B6]/10 to-[#0077B6]/15">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 bg-[#0077B6] rounded-full opacity-25"></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="rounded-full p-2.5 bg-[#0077B6]/80 text-white w-10 h-10 animate-pulse"></div>
                      <div className="w-16 h-6 bg-[#0077B6]/60 rounded animate-pulse"></div>
                    </div>
                    <div className="w-24 h-4 bg-[#0077B6]/95 rounded animate-pulse mb-2"></div>
                    <div className="w-16 h-8 bg-[#0077B6] rounded animate-pulse mb-3"></div>
                    <div className="w-full h-1 bg-[#0077B6]/30 rounded-full">
                      <div className="h-full bg-[#0077B6] rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Student Activation Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
        {/* Active Students Card Skeleton */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#0077B6]/10 to-[#0077B6]/15">
          <CardContent className="p-0">
            <div className="p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 mr-4 text-white bg-[#0077B6]/60 rounded-full w-12 h-12 animate-pulse"></div>
                  <div>
                    <div className="w-32 h-4 bg-[#0077B6]/95 rounded animate-pulse mb-2"></div>
                    <div className="w-20 h-8 bg-[#0077B6]/90 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-40 h-3 bg-[#0077B6]/95 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-6 bg-[#0077B6]/60 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Students Card Skeleton */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-100 to-gray-150">
          <CardContent className="p-0">
            <div className="p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 p-3 mr-4 text-white bg-gray-600 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-32 h-4 mb-2 bg-gray-800 rounded animate-pulse"></div>
                    <div className="w-20 h-8 bg-gray-900 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-40 h-3 mb-2 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-24 h-6 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-8">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardHeader className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-48 h-6 mb-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-64 h-4 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="w-32 h-10 bg-[#0077B6] rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8">
                <div className="space-y-4">
                  {/* Table header skeleton */}
                  <div className="flex pb-4 space-x-4 border-b border-gray-100">
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <div key={colIndex} className="flex-1">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Table rows skeleton */}
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex py-4 space-x-4">
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <div key={colIndex} className="flex-1">
                          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}