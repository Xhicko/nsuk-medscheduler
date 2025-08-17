import StudentHeader from '@/components/custom/client/StudentHeader'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
  <StudentHeader student={null} loading={true} />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
