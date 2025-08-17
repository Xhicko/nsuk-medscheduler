"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ClipboardList, LogOut, LayoutDashboard } from "lucide-react"
import Logo from "@/svg/NSUK_LOGO.svg"
import { useStudentLogout } from "@/hooks/student/useStudentLogout"

export default function StudentHeader({ student, loading }) {
  const pathname = usePathname()
  const router = useRouter()
  const notificationCount = 3
  const { logout, isLoggingOut } = useStudentLogout()

  // Normalize incoming student shape (API/store may use camelCase or snake_case)
  const displayName = student?.fullName || student?.full_name || null
  const displayEmail = student?.email || student?.institutional_email || null

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Admin-style: derive title from current path against known student routes
  const studentNav = [
    { title: 'Dashboard', url: '/student/dashboard', id: 'dashboard' },
    { title: 'Medical Forms', url: '/student/medical-forms', id: 'medical-forms' },
    { title: 'Notifications', url: '/student/notifications', id: 'notifications' },
  ]

  const titleize = (str) => str
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')

  const getNavigationPathTitle = () => {
    const active = studentNav.find((i) => i.url === pathname)
    if (active) return active.title
    // Fallback: compute from the first segment after /student
    const path = pathname || '/student/dashboard'
    const afterStudent = path.startsWith('/student') ? path.replace(/^\/student\/?/, '') : path.replace(/^\//, '')
    const [first] = afterStudent.split('/').filter(Boolean)
    if (!first || first === 'dashboard') return 'Dashboard'
    return titleize(first)
  }

  const prefetchOnHover = (url) => () => {
    if (!url || url === '#') return
    try {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    } catch {}
  }

  const handleLogout = () => logout('/student/login')

  const handleNotifications = () => {
    router.push("/student/notifications")
  }

  const handleMedicalForms = () => {
    router.push("/student/medical-forms")
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-[#0077B6]">
        <div className="container mx-auto px-2 xsm:px-3 sm:px-4">
          <div className="flex h-14 xsm:h-16 items-center justify-between">
            {/* Left side - Logo and Breadcrumb */}
            <div className="flex items-center space-x-2 xsm:space-x-3 sm:space-x-4">
              <Skeleton className="h-7 w-7 xsm:h-8 xsm:w-8 sm:h-9 sm:w-9 rounded-full" />
              {/* Mobile: compact title skeleton */}
              <Skeleton className="block sm:hidden h-4 w-24 xsm:w-32 rounded" />
              {/* sm+: full breadcrumb skeleton */}
              <Skeleton className="hidden sm:block h-4 w-48 rounded" />
            </div>
            {/* Right side - Avatar skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9 xsm:h-10 xsm:w-10 rounded-full" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#0077B6]">
      <div className="container mx-auto px-2 xsm:px-3 sm:px-4">
        <div className="flex h-14 xsm:h-16 items-center justify-between">
          {/* Left side - Logo and Breadcrumb */}
          <div className="flex items-center space-x-2 xsm:space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-7 w-7 p-1 xsm:h-8 xsm:w-8 sm:h-9 sm:w-9 rounded-full bg-[#0077b6] ring-2 ring-[#FFFFFF] shadow-themeLight">
                <Image
                  src={Logo}
                  alt="NSUK Logo"
                  width={28}
                  height={28}
                  className="object-contain rounded-full"
                  priority
                />
              </div>
            </div>

            {/* Responsive Breadcrumbs */}
            {/* Mobile (base to <sm): show compact current page title only */}
            <div className="block sm:hidden max-w-[160px] xsm:max-w-[220px] ml-2">
              <span className="text-white font-semibold text-sm xsm:text-base truncate">
                {getNavigationPathTitle()}
              </span>
            </div>

            {/* sm+ screens: show full breadcrumb with app name */}
            <div className="hidden sm:block">
              <Breadcrumb aria-label="Breadcrumb">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/student/dashboard"
                      className="font-bold cursor-pointer text-white hover:text-white/90"
                      onMouseEnter={prefetchOnHover('/student/dashboard')}
                    >
                      NSUK Medical Schedulizer
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white"/>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">{getNavigationPathTitle()}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Right side - Avatar with Dropdown */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 xsm:h-10 xsm:w-10 rounded-full min-w-touch min-h-touch cursor-pointer"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 xsm:h-10 xsm:w-10">
                    <AvatarFallback className="bg-white font-bold text-[#0077B6]">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
        {student && (
                  <>
                    <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
                    </div>
                    <DropdownMenuSeparator  className="bg-gray-300"/>
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => router.push('/student/dashboard')}
                  onMouseEnter={prefetchOnHover('/student/dashboard')}
                  className="cursor-pointer min-h-touch"
                >
                   <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleNotifications} onMouseEnter={prefetchOnHover('/student/notifications')} className="cursor-pointer min-h-touch">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                  <Badge variant="secondary" className="ml-auto bg-gray-200 rounded-full">
                    {notificationCount}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleMedicalForms} onMouseEnter={prefetchOnHover('/student/medical-forms')} className="cursor-pointer min-h-touch">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <span>Medical Forms</span>
                </DropdownMenuItem>

                  <DropdownMenuSeparator  className="bg-gray-300"/>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-white focus:text-destructive min-h-touch bg-red-700"
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4 text-white" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
