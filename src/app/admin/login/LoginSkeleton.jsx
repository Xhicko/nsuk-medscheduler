import React from "react"
import { User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoginSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md">
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardHeader className="pb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-[#14C38E] rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle>
              <Skeleton className="w-32 h-6 mx-auto mb-2 bg-[#14C38E]" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="w-40 h-4 mx-auto bg-[#14C38E]" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-2">
              <div className="mb-4">
                <Skeleton className="w-full h-12 rounded bg-[#14C38E]" />
              </div>
              <div className="mb-4">
                <Skeleton className="w-full h-12 rounded bg-[#14C38E]" />
              </div>
              <div className="pt-4">
                <Skeleton className="w-full h-12 rounded bg-[#14C38E]" />
              </div>
            </form>
            <div className="mt-6 text-center">
              <Skeleton className="w-48 h-4 mx-auto bg-[#14C38E]" />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Skeleton className="w-56 h-3 mx-auto bg-[#14C38E]" />
        </div>
      </div>
    </div>
  )
}
