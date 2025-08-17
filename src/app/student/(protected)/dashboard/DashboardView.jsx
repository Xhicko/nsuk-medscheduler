"use client"

import StudentHeader from '@/components/custom/client/StudentHeader'
import StudentProfileCard from '@/components/custom/client/StudentProfileCard'
import { useStudentDashboardStore } from '@/store/Client/studentDashboardStore'
import DashboardSkeleton from './DashboardSkeleton'

export default function DashboardView({ initialData, loading }) {
  const storeData = useStudentDashboardStore((state) => state.data)
  const student = storeData || initialData || null

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader student={student} />
      <main className="container mx-auto px-4 py-6 xs:px-2 xs:py-4" role="main">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid gap-6 xs:gap-4">
            <StudentProfileCard student={student} />
          </div>
        </div>
      </main>
    </div>
  )
}
