"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SegmentOtherButton({ className }) {
  const pathname = usePathname() || ''
  // Secondary CTA shows the opposite segment
  const isStudent = pathname.startsWith('/student')
  const isAdmin = pathname.startsWith('/admin')
  const href = isStudent ? '/admin/login' : '/student/login'
  const label = isStudent ? 'Admin Login' : 'Student Login'

  return (
    <Button asChild variant="outline" className={`h-11 rounded-full border-white text-[#0077B6] hover:bg-white/80 hover:text-[#0077B6] px-6 ${className || ''}`}>
      <Link href={href} aria-label={label}>{label}</Link>
    </Button>
  )
}
