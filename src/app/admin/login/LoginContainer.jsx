'use client'

import { useAuthStore } from "@/store/authStore"
import LoginSkeleton from "./LoginSkeleton"
import LoginView from "./LoginView"

export default function LoginContainer() {
   const loading = useAuthStore(state => state.loading)
  const initialized = useAuthStore(state => state.initialized)
  const authInitialized = initialized && !loading

  if (!authInitialized) {
    return <LoginSkeleton />
  }

  return <LoginView />
} 