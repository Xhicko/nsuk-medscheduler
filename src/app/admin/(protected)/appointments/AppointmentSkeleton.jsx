'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AppointmentSkeleton() {
  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="w-full mx-auto mb-8">
        <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-white rounded-xl">
              <Skeleton className="w-8 h-8 rounded-lg bg-[#0077B6]/10" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-72 bg-white/30" />
              <Skeleton className="h-4 w-96 bg-white/20" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Reload button */}
            <Skeleton className="h-10 w-28 rounded-xl bg-white/30" />
            {/* Segmented control */}
            <div className="inline-flex w-full sm:w-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
              <Skeleton className="h-10 w-44 rounded-lg bg-[#0077B6]/10" />
              <Skeleton className="h-10 w-48 ml-1 rounded-lg bg-[#0077B6]/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Table and filters */}
      <div className="w-full mx-auto px-6">
        <Card className="border-0 rounded-2xl bg-white">
          <CardHeader className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <Skeleton className="h-6 w-56 bg-[#0077B6]/20" />
                <Skeleton className="h-4 w-72 bg-[#0077B6]/10" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <Skeleton className="h-14 w-64 rounded-xl bg-[#0077B6]/10" />
                {/* Scheduled sub-filter (only visible when scheduled, but fine as skeleton) */}
                <Skeleton className="h-12 w-48 rounded-xl bg-[#0077B6]/10" />
                {/* Faculty */}
                <Skeleton className="h-12 w-56 rounded-xl bg-[#0077B6]/10" />
                {/* Department (conditionally shown) */}
                <Skeleton className="h-12 w-56 rounded-xl bg-[#0077B6]/10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table header */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-full">
                <div className="bg-[#0077B6] px-4 py-3">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Numbered column */}
                    <Skeleton className="h-5 w-6 bg-white/30 rounded" />
                    {/* Simulate 6-8 header cells */}
                    <Skeleton className="h-5 bg-white/30 rounded col-span-2" />
                    <Skeleton className="h-5 bg-white/30 rounded col-span-2" />
                    <Skeleton className="h-5 bg-white/30 rounded col-span-2" />
                    <Skeleton className="h-5 bg-white/30 rounded col-span-2" />
                    <Skeleton className="h-5 bg-white/30 rounded col-span-2" />
                    <Skeleton className="h-5 bg-white/30 rounded col-span-1" />
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {[...Array(8)].map((_, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-12 gap-4 px-4 py-4">
                      <Skeleton className="h-4 w-6 bg-[#0077B6]/10 rounded" />
                      <Skeleton className="h-4 bg-[#0077B6]/10 rounded col-span-2" />
                      <Skeleton className="h-4 bg-[#0077B6]/10 rounded col-span-2" />
                      <Skeleton className="h-4 bg-[#0077B6]/10 rounded col-span-2" />
                      <Skeleton className="h-4 bg-[#0077B6]/10 rounded col-span-2" />
                      <Skeleton className="h-4 bg-[#0077B6]/10 rounded col-span-2" />
                      {/* Actions */}
                      <div className="flex items-center gap-2 col-span-1">
                        <Skeleton className="h-8 w-8 rounded bg-[#0077B6]/10" />
                        <Skeleton className="h-8 w-8 rounded bg-[#0077B6]/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
              <Skeleton className="h-4 w-40 bg-[#0077B6]/10" />
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded bg-[#0077B6]/10" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
