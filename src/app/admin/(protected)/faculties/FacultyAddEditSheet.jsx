"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/custom/floating-label-input" 
import { X } from "lucide-react"

export function FacultyAddEditSheet({ 
  isOpen, 
  onClose,
  formData, 
  focusStates, 
  errors, 
  onFormChange, 
  setFocusState, 
  isFieldValid, 
  onSubmit,
  loading,
  isEditMode
}) {
  if (!formData) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md rounded-none p-6 flex flex-col">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Faculty' : 'Add New Faculty'}
              </SheetTitle>
              <SheetDescription className="text-gray-500">
                {isEditMode 
                  ? `Update the details for this faculty.`
                  : 'Create a new academic faculty in the system.'
                }
              </SheetDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
          <FloatingLabelInput
            id="name"
            label="Faculty Name"
            type="text"
            value={formData.name || ""}
            onChange={onFormChange}
            isFocused={focusStates.name || false}
            setIsFocused={(focused) => setFocusState("name", focused)}
            errors={errors.name}
            isValid={isFieldValid("name")}
            placeholder="e.g., Faculty of Medicine"
          />
          
          <FloatingLabelInput
            id="code"
            label="Faculty Code"
            type="text"
            value={formData.code || ""}
            onChange={onFormChange}
            isFocused={focusStates.code || false}
            setIsFocused={(focused) => setFocusState("code", focused)}
            errors={errors.code}
            isValid={isFieldValid("code")}
            placeholder="e.g., MED"
            style={{ textTransform: 'uppercase' }}
          />

          <div className="pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !formData.name?.trim() || !formData.code?.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode ? 'Update Faculty' : 'Create Faculty'
                )}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
