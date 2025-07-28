'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { useAuthStore } from '@/store/authStore'
import { useDashboardStore } from '@/store/admin/dashboardStore'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


const formSchema = z
  .object({
    MedicalID: z
      .string()
      .min(1, { message: "Medical ID is required" })
      .regex(/^[A-Za-z0-9]+$/, { message: "Medical ID must contain only alphanumeric characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  })


export default function LoginLogic() {
   const router = useRouter()
   const [isTransitioning, setIsTransitioning] = useState(false)
   const [buttonLoading, setButtonLoading] = useState(false)
   const [showPassword, setShowPassword] = useState(false)
   const [isMedicalIDFocused, setIsMedicalIDFocused] = useState(false)
   const [isPasswordFocused, setIsPasswordFocused] = useState(false)

   const {
      register,
      handleSubmit,
      formState: { errors, dirtyFields },
      watch,
   } = useForm({
      resolver: zodResolver(formSchema),
      mode: "onChange",
      defaultValues: {
         MedicalID: "",
         password: "",
      },
   })

      // Watch values for floating labels
      const watchedMedicalID = watch("MedicalID")
      const watchedPassword = watch("password")

      // Check if individual fields are valid
      const isMedicalIDValid = dirtyFields.MedicalID && !errors.MedicalID
      const isPasswordValid = dirtyFields.password && !errors.password

       // Check if form is ready to submit
      const isFormReadyToSubmit = isMedicalIDValid && isPasswordValid && !buttonLoading

      const HandleLogin = async(data) => {
         setButtonLoading(true)

         // Get store actions
         const { setUser, clearUser } = useAuthStore.getState()
         const { setDashboardData, setError: setDashboardError } = useDashboardStore.getState()


         try{
            const response = await axios.post(ADMIN_ENDPOINTS.AUTH.LOGIN,{
               medical_id: data.MedicalID,
               password:data.password
            })
            if(response.status === 200){
                // Create Supabase client - this will automatically handle cookies
                const supabase = createClientComponentClient()
                console.log(response.data)
                if(response.data.session){
                  try {
                     // Set the session from the server response
                     const { error } = await supabase.auth.setSession({
                        access_token: response.data.session.access_token,
                        refresh_token: response.data.session.refresh_token
                     })
                     
                     if (error) {
                        console.error('Session setup failed:', error)
                        return
                     }

                     // Update the user metadata in the session to include the role
                     const { error: updateError } = await supabase.auth.updateUser({
                        data: { role: response.data.role }
                     })

                     if (updateError) {
                        console.error('Failed to update user metadata:', updateError)
                     }
                  } catch (sessionError) {
                     toast.error('Session setup error')
                     return
                  }
                }

                // Update store with user data
                setUser(response.data.user)

                 // Start transition and navigate
                setIsTransitioning(true)
                
                // Pre-fetch dashboard data before navigation
                try {
                  console.log('Pre-fetching dashboard data...')
                  const dashboardResponse = await axios.get(ADMIN_ENDPOINTS.DASHBOARD)
                  
                  // Store dashboard data in the dashboard store
                  setDashboardData(dashboardResponse.data)
                  console.log('Dashboard data pre-fetched and stored:', dashboardResponse.data)
                } 
                catch (dashboardError) {
                  console.error('Dashboard pre-fetch failed:', dashboardError)
                  // Set error in dashboard store but don't block navigation
                  setDashboardError(dashboardError.response?.data?.error || 'Failed to load dashboard data')
                }
                
                // Navigate to dashboard
                router.push('/admin/dashboard')
                toast.success('Login successful')
            }

         }
         catch(error) {
            // Clear user in zustand store on login failure
            clearUser()
            if (error.response) {
               const errorMessage = error.response.data.error || error.response.data.message || "Login failed. Please try again."
               toast.error(errorMessage)
            } else if (error.request) {
               toast.error("No response from server. Please check your connection.")
            } else {
               toast.error("An error occurred while setting up the request")
            }
         } 
         finally {
            setButtonLoading(false)
         }
      }

   return{
      handleSubmit,
      HandleLogin,
      isTransitioning,
      buttonLoading,
      showPassword, 
      setShowPassword,
      isMedicalIDFocused, 
      setIsMedicalIDFocused,
      isPasswordFocused, 
      setIsPasswordFocused,
      watchedMedicalID,
      watchedPassword,
      isFormReadyToSubmit,
      isMedicalIDValid,
      isPasswordValid,
      errors,
      register,
   }
}