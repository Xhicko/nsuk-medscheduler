"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SegmentCtaButton({ className }) {
  const pathname = usePathname() || ''
  // Primary CTA defaults to Student Login
  let href = '/student/login'
  let label = 'Student Login'

  if (pathname.startsWith('/admin')) {
    href = '/admin/login'
    label = 'Admin Login'
  } else if (pathname.startsWith('/student')) {
    href = '/student/login'
    label = 'Student Login'
  }

  return (
    <Button asChild className={`h-11 rounded-full bg-[#0077B6] hover:bg-[#005a8a] text-white px-6 ${className || ''}`}>
      <Link href={href} aria-label={label}>{label}</Link>
    </Button>
  )
}
