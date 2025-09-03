"use client"

import { AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/custom/floating-label-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, User, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { z } from "zod"

const formSchema = z.object({
  matricNumber: z
    .string()
    .min(1, { message: "Matric Number is required" })
    .regex(/^[A-Za-z0-9\/]+$/, { message: "Matric Number may contain letters, numbers and  '/'" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string().min(1, { message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
})

export default function StudentVerificationDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) {
  // Local form state (kept internal to the dialog)
  const [matric, setMatric] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [isMatricFocused, setIsMatricFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isConfirmFocused, setIsConfirmFocused] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)


  // Reset on open/close changes
  useEffect(() => {
    if (!isOpen) {
      setMatric("")
      setPassword("")
      setErrors({})
      setConfirmPassword("")
    }
  }, [isOpen])

  const handleOpenChange = (open) => {
    // Keep sheet open while loading
    if (!isLoading) onOpenChange?.(open)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validate with Zod
    const data = {
      matricNumber: (matric || "").trim(),
      password: (password || "").trim(),
      confirmPassword: (confirmPassword || "").trim(),
    }

    const result = formSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        fieldErrors[key] = { message: issue.message }
      }
      setErrors(fieldErrors)
      return // keep dialog open until valid
    }

    setErrors({})
    onSubmit?.({
      matric_number: data.matricNumber,
      password: data.password,
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
       <AlertDialogOverlay className="z-[250] fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <AlertDialogContent className="p-0 w-[calc(100vw-1.5rem)] z-[300] sm:max-w-md bg-white overflow-hidden">
        <div className="flex max-h-[80vh] flex-col">
          <div className="sticky top-0 bg-white/90 backdrop-blur border-b">
            <AlertDialogHeader className="px-3 py-2 sm:px-6 sm:py-4">
              <AlertDialogTitle className="text-base sm:text-xl font-bold text-gray-900">Student Verification</AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-gray-600">
                Enter your details to verify your student account. 
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <form id="student-verify-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          <div className="grid gap-4">
            <FloatingLabelInput
              id="verifyMatric"
              label="Matric Number"
              type="text"
              value={matric}
              onChange={(e) => setMatric(e.target.value)}
              icon={<User className="w-5 h-5" />}
              isFocused={isMatricFocused}
              setIsFocused={setIsMatricFocused}
              watchedValue={matric}
              errors={errors.matricNumber}
              isValid={Boolean(matric) && !errors.matricNumber}
              size="responsive"
            />

            <FloatingLabelInput
              id="verifyPassword"
              label="Password"
              type="password"
              showToggle
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              isFocused={isPasswordFocused}
              setIsFocused={setIsPasswordFocused}
              watchedValue={password}
              errors={errors.password}
              isValid={Boolean(password) && !errors.password}
              toggleState={showPwd}
              onToggle={() => setShowPwd((v) => !v)}
              size="responsive"
            />

            <FloatingLabelInput
              id="verifyConfirmPassword"
              label="Confirm Password"
              type="password"
              showToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              isFocused={isConfirmFocused}
              setIsFocused={setIsConfirmFocused}
              watchedValue={confirmPassword}
              errors={errors.confirmPassword}
              isValid={Boolean(confirmPassword) && !errors.confirmPassword}
              toggleState={showConfirmPwd}
              onToggle={() => setShowConfirmPwd((v) => !v)}
              size="responsive"
            />

      
          </div>

          </form>

          <div className="sticky bottom-0 border-t bg-white px-3 sm:px-6 py-2 sm:py-3">
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => !isLoading && onOpenChange?.(false)}
                size="sm"
                className={`border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="student-verify-form"
                size="sm"
                className={`bg-[#0077B6] hover:bg-[#0077B6]/90 text-white text-xs sm:text-sm ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify now'
                )}
              </Button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
