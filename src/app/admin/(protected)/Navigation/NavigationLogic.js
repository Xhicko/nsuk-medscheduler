'use client'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import {
   Compass,
   UserRoundPlus,
   ClipboardPlus, 
   UserRoundCheck,
   University,
   Layers, 
   BellRing,
   CalendarSync,
   ShieldEllipsis,
   LogOut,  
 } from 'lucide-react'
 import { Skeleton } from '@/components/ui/skeleton'
 import { useAuthStore } from '@/store/authStore'

export default function NavigationLogic(){
   const pathname = usePathname()
   const user = useAuthStore(state => state.user)
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   const isAuthenticated = authInitialized && Boolean(user)

   const NSUKMedSchedulizer = useMemo(() => ({
      name: 'NSUK MedSched',
      fullName: 'NSUK Medical Schedulizer',
      rights: 'All rights reserved, Nsuk Medical Schedulizer 2025',
    }), [])
 

   const navigationPaths = useMemo(() => [
      { title: 'Dashbaord',icon: Compass,  url: '/admin/dashboard',id:'dashboard', isActive: pathname === '/admin/dashboard'},
      { title: 'Upload Students Data', icon: UserRoundPlus,url: '/admin/upload-student-data', id:'upload-student-data', isActive: pathname === '/admin/upload-student-data'},
      { title: 'Students',icon: UserRoundCheck,  url: '/admin/students',id:'students', isActive: pathname === '/admin/students'},
      { title: 'Faculties',icon: University,  url: '/admin/faculties',id:'faculties', isActive: pathname === '/admin/faculties'},
      { title: 'Departments',icon: Layers,  url: '/admin/departments',id:'departments', isActive: pathname === '/admin/departments'},
      { title: 'Medical Forms',icon: ClipboardPlus ,  url: '/admin/medical-forms',id:'medical-forms', isActive: pathname === '/admin/medical-forms'},
      { title: 'Appointments',icon: CalendarSync,  url: '/admin/appointments',id:'appointments', isActive: pathname === '/admin/appointments'},
      { title: 'Students Results',icon:BellRing,  url: '/admin/students-results',id:'students-results', isActive: pathname === '/admin/students-results'},
      { title: 'Admin Management',icon:ShieldEllipsis ,  url: '/admin/admin-management',id:'admin-management', isActive: pathname === '/admin/admin-management'},
    ], [pathname]
   )

   const NavigationPathDropdown = useMemo(() => [
      { title: 'Admin Management', icon: ShieldEllipsis ,  url: '/admin/admin-management'},
      { title: 'Logout',    icon: LogOut,   url: '/admin/logout'},
    ], [])

   const skeletonNavigationPaths = () => {
      const countedNavigationPaths = isAuthenticated ? navigationPaths.length : 0
      return Array(countedNavigationPaths).fill(null).map((unused, index) => ({
        id: `skeleton-nav-${index}`,
        isSkeleton: true,
        title: '',
        icon: () => (
          <div className="flex items-center mb-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-48 h-6 ml-2 rounded" />
          </div>
        )
      }))
    }

   const navigationItems = !authInitialized
     ? skeletonNavigationPaths()
     : (isAuthenticated ? navigationPaths : [])

   function getNavigationPathTitle() {
      if (!authInitialized) {
        return <Skeleton className="w-24 h-6 rounded" />
      }
      const active = navigationPaths.find(i => i.isActive)
      return active ? active.title : NSUKMedSchedulizer.name
    }

    return{
      navigationItems,
      skeletonNavigationPaths,
      getNavigationPathTitle,
      isAuthenticated,
      authInitialized,
      NavigationPathDropdown,
      NSUKMedSchedulizer
    }
}