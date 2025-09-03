'use client'

import NavigationView from "./Navigation/NavigationView"
import RouterProgressBar from "@/components/custom/RouterProgressBar"

export default function ProtectedAdminLayout({ children }) {
  
  return (
    <>
      <RouterProgressBar />
      <NavigationView>
        {children}
      </NavigationView>
    </>
  )
} 