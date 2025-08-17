"use client"

import React from "react"
import { User, Lock, Loader, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FloatingLabelInput } from "@/components/custom/floating-label-input"
import LoginLogic from "./LoginLogic"
import StudentAccessInBridge from "@/components/custom/client/AccessInBridge"
import StudentVerificationDialog from "@/components/custom/client/StudentVerificationDialog"

export default function LoginPage() {
 const {
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
   register} = LoginLogic()

  if (isTransitioning) {
    return <StudentAccessInBridge />
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md">
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardHeader className="pb-6 sm:pb-8 text-center">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-[#0077B6] rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-black">NSUK MEDICAL SCHEDULER</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600">Student Login</CardDescription>
          </CardHeader>

       <CardContent>
        <form onSubmit={handleSubmit(HandleLogin)} className="space-y-3 sm:space-y-4">
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
           size="responsive"
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
           size="responsive"
              />

          <Button 
            type="submit" 
            className="mb-4 w-full bg-[#0077B6] hover:bg-[#0077B6]/90 text-white cursor-pointer px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-2"
            disabled={!isFormReadyToSubmit || isTransitioning}
          >
            {buttonLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
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
          <Button variant="outline" size="sm" onClick={openVerification} className="cursor-pointer text-xs sm:text-sm">Not verified? Verify now</Button>
              <StudentVerificationDialog
                isOpen={isVerifyOpen}
                onOpenChange={setIsVerifyOpen}
                onSubmit={HandleVerifySubmit}
                isLoading={verifyLoading}
                faculties={faculties}
                departments={departments}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
       <p className="text-[10px] sm:text-xs text-gray-400">© 2025 Medical Scheduling System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
