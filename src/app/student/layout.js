'use client'

import { useStudentLogout } from '@/hooks/student/useStudentLogout'
import StudentAccessOutBridge from '@/components/custom/client/AccessOutBridge'

export default function ClientRootLayout({ children }) {
  const { isLoggingOut } = useStudentLogout()

  return (
    <>
      {children}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
          <StudentAccessOutBridge />
        </div>
      )}
    </>
  )
}
