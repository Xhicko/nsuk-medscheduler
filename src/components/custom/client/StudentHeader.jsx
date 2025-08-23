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
import { getStepIdByIndex } from '@/config/stepsConfig'

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

  // Derive canonical medical-forms steps path from student's stored index (server SOT)
  const studentCurrentStepIndex = student?.medicalFormStatus?.current_step ?? student?.medical_form_status?.current_step ?? 0
  const canonicalMedicalStepId = getStepIdByIndex(studentCurrentStepIndex)
  const medicalFormsPath = `/student/medical-forms/steps/${canonicalMedicalStepId}`

  // Determine if medical form is completed
  const medicalStatusFlag = student?.medicalFormStatus?.status
  const isMedicalCompleted = medicalStatusFlag === "completed"

  const handleLogout = () => logout('/student/login')

  const handleNotifications = () => {
    router.push("/student/notifications")
  }

  const handleMedicalForms = () => {
   if(isMedicalCompleted) return
   router.push(medicalFormsPath)
  }

  // Helper function to check if a menu item is active
  const isActiveMenuItem = (url) => {
  if (url === '/student/medical-forms') return pathname?.startsWith('/student/medical-forms')
  return pathname === url
  }

  // Helper function to get menu item classes
  const getMenuItemClasses = (url, isLogout = false, isDisabled = false) => {
    const baseClasses = "cursor-pointer min-h-touch"
    
    if (isLogout) {
      return `${baseClasses} text-white hover:!text-white bg-red-800 hover:!bg-red-700`
    }

    if (isDisabled) {
      return `${baseClasses} !cursor-not-allowed opacity-60 bg-gray-100 text-gray-600`
    }
    
    if (isActiveMenuItem(url)) {
      return `${baseClasses} bg-[#0077B6] text-white focus:bg-[#0077B6] focus:text-white`
    }
    
    return baseClasses
  }

  // Helper function to get icon classes
  const getIconClasses = (url, isDisabled = false) => {
    const baseClasses = "mr-2 h-4 w-4"

     if (isDisabled) {
      return `${baseClasses} text-gray-600`
    }
    
    if (isActiveMenuItem(url)) {
      return `${baseClasses} text-white`
    }
    
    return baseClasses
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-[#0077B6]">
        <div className="container mx-auto px-2 xsm:px-3 sm:px-4">
          <div className="flex h-14 xsm:h-16 items-center justify-between">
            {/* Left side - Logo and Breadcrumb */}
            <div className="flex items-center space-x-2 xsm:space-x-3 sm:space-x-4">
              <Skeleton className="h-7 w-7 xsm:h-8 xsm:w-8 sm:h-9 sm:w-9 rounded-full bg-white" />
              {/* Mobile: compact title skeleton */}
              <Skeleton className="block sm:hidden h-4 w-24 ml-3 xsm:w-32 rounded bg-white" />
              {/* sm+: full breadcrumb skeleton */}
              <Skeleton className="hidden sm:block h-4 w-48 ml-3 rounded bg-white" />
            </div>
            {/* Right side - Avatar skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9 xsm:h-10 xsm:w-10 rounded-full bg-white" />
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
                    <DropdownMenuSeparator className="bg-gray-300"/>
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => router.push('/student/dashboard')}
                  className={getMenuItemClasses('/student/dashboard')}
                >
                  <LayoutDashboard className={getIconClasses('/student/dashboard')} />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={handleNotifications} 
                  className={getMenuItemClasses('/student/notifications')}
                >
                  <Bell className={getIconClasses('/student/notifications')} />
                  <span>Notifications</span>
                  <Badge variant="secondary" className="ml-auto bg-gray-200 rounded-full">
                    {notificationCount}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={handleMedicalForms} 
                  disabled={isMedicalCompleted}
                  aria-disabled={isMedicalCompleted}
                  className={getMenuItemClasses('/student/medical-forms', false, isMedicalCompleted)}
                >
                  <ClipboardList className={getIconClasses('/student/medical-forms', isMedicalCompleted)} />
                  <span>Medical Forms</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-300"/>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className={getMenuItemClasses('', true)}
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