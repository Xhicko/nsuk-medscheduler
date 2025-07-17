"use client"

import React, { useState } from "react"
import { User, Lock, Loader, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingLabelInput } from "@/components/custom/floating-label-input"
import LoginLogic from "./LoginLogic"
import Link from "next/link"

export default function LoginPage() {
 const {
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
   register} = LoginLogic()

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md">
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardHeader className="pb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-[#14C38E] rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-black">NSUK MEDICAL SCHEDULER</CardTitle>
            <CardDescription className="text-gray-600">Student Login</CardDescription>
          </CardHeader>

          <CardContent>
            <form  className="space-y-2">
              <FloatingLabelInput
                id="matricNumber"
                label="Matric Number"
                type="text"
                register={register("matricNumber")}
                icon={<User className="w-5 h-5" />}
                isFocused={isMatricNumberFocused}
                setIsFocused={setIsMatricNumberFocused}
                watchedValue={watchedMatricNumber}
                errors={errors.matricNumber}
                isValid={isMatricNumberValid}
              />

              <FloatingLabelInput
                id="password"
                label="Password"
                type="password"
                register={register("password")}
                icon={<Lock className="w-5 h-5" />}
                isFocused={isPasswordFocused}
                setIsFocused={setIsPasswordFocused}
                watchedValue={watchedPassword}
                errors={errors.password}
                isValid={isPasswordValid}
                showToggle={true}
                toggleState={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />

               <Button 
                  type="submit" 
                  className="mb-4 p-6 w-full bg-[#14C38E] hover:bg-[#14c38fc9] text-white cursor-pointer"
                  disabled={!isFormReadyToSubmit || isTransitioning}
               >
                  {buttonLoading ? (
                        <div className="flex items-center gap-2">
                           <Loader className="animate-spin" />
                        </div>
                     ) : (
                        <>
                              Log In
                           <LogIn  className="w-4 h-4" />
                        </>
                     )}
               </Button>
                        
            </form>

            <div className="mt-6 text-center">
              <p className="mt-4 text-sm text-gray-500">
                New student?{' '}
                <Link href="/Student/Register" className="text-[#14C38E] hover:text-[#0ea770] font-medium underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">© 2025 Medical Scheduling System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
