'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"


const formSchema = z
  .object({
    matricNumber: z
      .string()
      .min(1, { message: "Matric Number is required" })
      .regex(/^[A-Za-z0-9]+$/, { message: "Matric Number must contain only alphanumeric characters" }),
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

   return{
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