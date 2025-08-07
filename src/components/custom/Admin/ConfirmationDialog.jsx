"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  isDestructive = false,
  isLoading = false,
}) {
  const isDelete = title?.toLowerCase().includes("delete") || confirmText?.toLowerCase().includes("delete")
  
  // Prevent closing the dialog while loading
  const handleOpenChange = (open) => {
    if (!isLoading) {
      onOpenChange(open)
    }
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogOverlay className="z-[9998] fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <AlertDialogContent className="shadow-lg rounded-xl z-[9999] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className={isDelete ? "text-red-600 cursor-pointer" : "text-gray-900 cursor-pointer"}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              className={`text-gray-700 bg-white border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading}
              className={`rounded-lg ${
                isDelete 
                  ? "text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                  : "text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
              } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isDelete ? "Deleting..." : "Processing..."}
                </>
              ) : (
                confirmText
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
