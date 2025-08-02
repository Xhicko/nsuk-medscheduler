'use client'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/svg/NSUK_LOGO.svg'
import {useSidebar} from '@/components/ui/sidebar'
import { useAdminLogout } from '@/hooks/admin/useAdminLogout'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
   Avatar, 
   AvatarFallback, 
   AvatarImage 
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import NavigationLogic from "./NavigationLogic";
import AccessOutBridge from "@/components/custom/admin/AccessOutBridge"
const NavigationContent = ({children}) =>{
   const { logout, isLoggingOut } = useAdminLogout()
   const {
      navigationItems,
      getNavigationPathTitle,
      isAuthenticated,
      authInitialized,
      NavigationPathDropdown,
      NSUKMedSchedulizer,
      profile
     } = NavigationLogic()
   
     const { state } = useSidebar()
     const sidebarCollapsed = state === 'collapsed'

   return (
      <div className="flex w-screen min-h-screen bg-white">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="w-full flex items-center justify-between group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center justify-between w-full">
                {!authInitialized ? (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full animate-pulse">
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
  
                    <Skeleton className="h-6 rounded w-45" />
  
                    <Skeleton className="w-6 h-6 rounded md:hidden" />
  
  
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-8 h-8 border-2 border-white rounded-full">
                      <Image
                        src={Logo}
                        alt="SCPC Logo"
                        width={30}
                        height={30}
                        className="object-contain rounded-full"
                        priority
                      />
                    </div>
                    <div className="overflow-hidden transition-[width] duration-300 ease-in-out group-data-[collapsible=icon]:w-0 w-auto">
                      <p className="text-white text-[14px] font-medium whitespace-nowrap">
                        {NSUKMedSchedulizer.fullName}
                      </p>
                    </div>
                    <div className="md:hidden">
                    <SidebarTrigger className="text-white rounded hover:bg-white/10 hover:text-white" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </SidebarHeader>
  
          <SidebarContent>
            <div className="absolute inset-x-0">
              <SidebarSeparator className="h-px bg-white" />
            </div>
            <SidebarMenu className="px-2 pt-3">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id || item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  {item.isSkeleton ? (
                    item.icon()
                  ) : (
                    <SidebarMenuButton
                      asChild={!item.onClick}
                      tooltip={item.title}
                      isActive={item.isActive}
                      className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-0 hover:bg-white hover:text-[#0077B6] data-[active=true]:bg-white data-[active=true]:text-[#0077B6] transition-colors rounded text-white"
                      onClick={() => item.onClick && item.onClick()}
                    >
                      {item.onClick ? (
                        <div className="flex items-center w-full group-data-[collapsible=icon]:justify-center cursor-pointer">
                          <item.icon className="w-5 h-5" />
                          <span className="ml-2 group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </div>
                      ) : (
                        <Link href={item.url || '#'} data-active={item.isActive} className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
                          <item.icon className="w-5 h-5" />
                          <span className="ml-2 group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
  
          <SidebarFooter>
            <div className="absolute inset-x-0">
              <SidebarSeparator className="h-px bg-white" />
            </div>
            <div className="flex items-center justify-center w-full pt-2">
              {!authInitialized ? (
                <Skeleton className="w-full h-6 rounded" />
              ) : (
                <>
                  <p className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:text-white group-data-[collapsible=icon]:text-[18px]">
                    &copy;
                  </p>
                  <p className="flex items-center text-white text-[12px] gap-2 truncate group-data-[collapsible=icon]:hidden">
                    &copy; {NSUKMedSchedulizer.rights}
                  </p>
                </>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
  
        <main className="flex flex-col flex-1 w-full max-w-full min-w-0">
          <header className={`fixed top-0 right-0 z-50 flex items-center h-[49px]  px-6  bg-[#0077B6] shadow-md transition-all duration-300 ${sidebarCollapsed ? 'md:pl-12' : 'md:pl-64'} left-0`}>
            <div className="flex items-center w-full p-2">
            {!authInitialized ? (
              <Skeleton className="w-6 h-6 mr-3 rounded" />
            ):(
                 <SidebarTrigger className="mr-3 text-white rounded hover:bg-white/10 hover:text-white" />
              )}
              <Breadcrumb className="text-white">
                <BreadcrumbList>
                  {!authInitialized ? (
                    <Skeleton className="h-6 rounded w-28" />
                  ) : (
                    <BreadcrumbLink href={isAuthenticated ? '/admin/dashboard' : '/admin/login'} className="font-bold text-white hover:text-green-100">
                      {NSUKMedSchedulizer.name}
                    </BreadcrumbLink>
                  )}
                  <BreadcrumbSeparator className="text-white" />
                  <BreadcrumbPage className="text-white">{getNavigationPathTitle()}</BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>
  
              <div className="flex items-center gap-4 ml-auto">
            
                {(isAuthenticated || !authInitialized) && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative rounded-full h-9 w-9 hover:bg-green-500">
                          {!authInitialized ? (
                           <>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full animate-pulse">
                              <Skeleton className="w-8 h-8 rounded-full" />
                           </div>
                           </>
                          ) : (
                            <Avatar className="border-2 border-white h-9 w-9">
                              <AvatarImage src="/placeholder.svg" alt="User" />
                              <AvatarFallback className="bg-white text-[#0077B6] font-bold">
                                {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="font-normal">
                          {!authInitialized ? (
                            <Skeleton className="w-24 h-4" />
                          ) : (
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {profile?.medical_id || 'MED000000'}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {profile?.full_name  || 'admin@example.com'}
                              </p>
                            </div>
                          )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {NavigationPathDropdown.map(item => (
                            <DropdownMenuItem 
                              key={item.title} 
                              onClick={item.title === 'Logout' ? logout : undefined}
                              className={item.title === 'Logout' ? 'text-red-500' : ''}
                            >
                              <item.icon className="w-4 h-4 mr-2" />
                              <span>{item.title}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </header>
  
          <div className="relative flex-1 p-2 mt-12 overflow-auto">
            {children}
          </div>
        </main>
        
        {isLoggingOut && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
            <AccessOutBridge />
          </div>
        )}
      </div>
    )
}

export default function NavigationView({children}){
   return (
      <SidebarProvider>
        <NavigationContent>
           {children}
        </NavigationContent>
      </SidebarProvider>
    )
}