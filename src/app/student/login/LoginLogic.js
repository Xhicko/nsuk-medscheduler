'use client'

import { useState } from "react"
import axios from 'axios'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { STUDENT_ENDPOINTS } from '@/config/studentConfig'
import { useAuthStore } from '@/store/authStore'


const formSchema = z
  .object({
    matricNumber: z
      .string()
      .min(1, { message: "Matric Number is required" })
      .regex(/^[A-Za-z0-9/]+$/, { message: "Matric Number may contain letters, numbers and  '/'" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  })


export default function LoginLogic() {
   const [isTransitioning, setIsTransitioning] = useState(false)
   const [buttonLoading, setButtonLoading] = useState(false)
   const [showPassword, setShowPassword] = useState(false)
   const [isMatricNumberFocused, setIsMatricNumberFocused] = useState(false)
   const [isPasswordFocused, setIsPasswordFocused] = useState(false)
   const [isVerifyOpen, setIsVerifyOpen] = useState(false)
   const [verifyLoading, setVerifyLoading] = useState(false)
   const [faculties, setFaculties] = useState([])
   const [departments, setDepartments] = useState([])
   const router = useRouter()

   const {
      register,
      handleSubmit,
      formState: { errors, dirtyFields },
      watch,
   } = useForm({
      resolver: zodResolver(formSchema),
      mode: "onChange",
      defaultValues: {
         matricNumber: "",
         password: "",
      },
   })

      // Watch values for floating labels
      const watchedMatricNumber = watch("matricNumber")
      const watchedPassword = watch("password")

      // Check if individual fields are valid
      const isMatricNumberValid = dirtyFields.matricNumber && !errors.matricNumber
      const isPasswordValid = dirtyFields.password && !errors.password

       // Check if form is ready to submit
    const isFormReadyToSubmit = isMatricNumberValid && isPasswordValid && !buttonLoading

    const HandleLogin = async (data) => {
       setButtonLoading(true)

       const { setUser, clearUser } = useAuthStore.getState()

       clearUser()

       try {
          const response = await axios.post(STUDENT_ENDPOINTS.AUTH.LOGIN, {
             matric_number: data.matricNumber,
             password: data.password,
          })

          if (response.status === 200) {
             const { session, user, profile } = response.data
             const supabase = createClientComponentClient()

             if (session) {
                try {
                   const { error } = await supabase.auth.setSession({
                      access_token: session.access_token,
                      refresh_token: session.refresh_token,
                   })
                   if (error) {
                      console.error('Session setup failed:', error)
                      toast.error('Session setup failed')
                      setButtonLoading(false)
                      return
                   }

                   // ensure role metadata for middleware gating
                   const { error: updateError } = await supabase.auth.updateUser({
                      data: { role: 'student' },
                   })
                   if (updateError) {
                      console.error('Failed to update user metadata:', updateError)
                   }
                } catch (e) {
                   console.error('Set session error:', e)
                }
             }

             setUser(user, profile)
             setIsTransitioning(true)
             router.push('/student/dashboard')
             toast.success('Login successful')
          }
       } catch (error) {
          clearUser()
          if (error.response) {
             const errorMessage = error.response.data?.error || error.response.data?.message || 'Login failed. Please try again.'
             toast.error(errorMessage)
          } else if (error.request) {
             toast.error('No response from server. Please check your connection.')
          } else {
             toast.error('An error occurred while setting up the request')
          }
       } finally {
          setButtonLoading(false)
       }
    }

         // Open verification dialog immediately, then lazy-load lookups in background
         const openVerification = () => {
             setIsVerifyOpen(true)
             if (!faculties.length || !departments.length) {
                // fire-and-forget; don't block modal open
                axios.get(STUDENT_ENDPOINTS.LOOKUPS)
                   .then(({ data }) => {
                      setFaculties(data?.faculties || [])
                      setDepartments(data?.departments || [])
                   })
                   .catch(() => {
                      // keep empty lists; dialog still usable
                   })
             }
         }
      const closeVerification = () => setIsVerifyOpen(false)

   // Optionally fetch faculties/departments if still empty (used on submit as a safety net)
      const ensureListsLoaded = async () => {
         if (faculties.length && departments.length) return
         try {
            const { data } = await axios.get(STUDENT_ENDPOINTS.LOOKUPS)
            setFaculties(data.faculties || [])
            setDepartments(data.departments || [])
         } catch (e) {
            setFaculties([])
            setDepartments([])
         }
      }

      const HandleVerifySubmit = async ({ matric_number, password, faculty_id, department_id }) => {
         setVerifyLoading(true)
         try {
            await ensureListsLoaded()
            const res = await axios.post(STUDENT_ENDPOINTS.AUTH.VERIFY, {
               matric_number,
               password,
               faculty_id,
               department_id,
            })
            if (res.status === 200) {
               toast.success(res.data?.message || 'Verification successful')
               setIsVerifyOpen(false)
            }
         } catch (e) {
            const msg = e?.response?.data?.error || 'Verification failed'
            toast.error(msg)
         } finally {
            setVerifyLoading(false)
         }
      }

   return{
   handleSubmit,
   HandleLogin,
   // verification dialog controls
   isVerifyOpen,
   setIsVerifyOpen,
   verifyLoading,
   openVerification,
   closeVerification,
   HandleVerifySubmit,
   faculties,
   departments,
      isTransitioning,
      buttonLoading,
      showPassword, 
      setShowPassword,
      isMatricNumberFocused, 
      setIsMatricNumberFocused,
      isPasswordFocused, 
      setIsPasswordFocused,
      watchedMatricNumber,
      watchedPassword,
      isFormReadyToSubmit,
      isMatricNumberValid,
      isPasswordValid,
      errors,
      register,
   }
}