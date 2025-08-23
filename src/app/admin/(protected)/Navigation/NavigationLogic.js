'use client'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import {
   Compass,
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
 import { useAdminStore } from '@/store/admin/adminStore'

// Move static data outside component to prevent recreation
const NSUKMedSchedulizer = {
  name: 'NSUK MedSched',
  fullName: 'NSUK Medical Schedulizer', 
  rights: 'All rights reserved, NSUK 2025',
}

// Pre-define navigation base paths (without isActive) for better performance
const navigationBasePaths = [
  { title: 'Dashboard', icon: Compass, url: '/admin/dashboard', id:'dashboard' },
  { title: 'Students', icon: UserRoundCheck, url: '/admin/students', id:'students' },
  { title: 'Faculties', icon: University, url: '/admin/faculties', id:'faculties' },
  { title: 'Departments', icon: Layers, url: '/admin/departments', id:'departments' },
  { title: 'Medicals', icon: ClipboardPlus, url: '/admin/medical_forms', id:'medical_forms' },
  { title: 'Appointments', icon: CalendarSync, url: '/admin/appointments', id:'appointments' },
  { title: 'Results', icon: BellRing, url: '/admin/students-results', id:'students-results' },
  { title: 'Admin Management', icon: ShieldEllipsis, url: '/admin/admin-management', id:'admin-management' },
]

export default function NavigationLogic(){
   const pathname = usePathname()
   const user = useAuthStore(state => state.user)
   const loading = useAuthStore(state => state.loading)
   const initialized = useAuthStore(state => state.initialized)
   const authInitialized = initialized && !loading
   const isAuthenticated = authInitialized && Boolean(user)
   
   // Get profile data from admin store
   const profile = useAdminStore(state => state.profile)

   // Only add isActive property when pathname changes (more efficient)
   const navigationPaths = useMemo(() => 
     navigationBasePaths.map(path => ({
       ...path,
       isActive: pathname === path.url
     })), [pathname]
   )

   const NavigationPathDropdown = useMemo(() => [
      { title: 'Logout',    icon: LogOut,   url: '/admin/logout'},
    ], [])

   const skeletonNavigationPaths = () => {
      const countedNavigationPaths = !authInitialized ? navigationPaths.length : 0
      return Array(countedNavigationPaths).fill(null).map((_, index) => ({
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
      NSUKMedSchedulizer,
      profile
    }
}