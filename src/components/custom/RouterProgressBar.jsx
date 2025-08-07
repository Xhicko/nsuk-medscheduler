'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RouterProgressBar() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  // Use a ref to track the previous pathname
  const prevPathname = useState(pathname)[0]
  
  // Only show loading when pathname actually changes
  const shouldShowLoading = pathname !== prevPathname

  if (!shouldShowLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-[#14C38E] animate-pulse"
        style={{
          width: '100%',
          animation: 'progressLoad 0.8s ease-out',
        }}
      />
      <style jsx>{`
        @keyframes progressLoad {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
