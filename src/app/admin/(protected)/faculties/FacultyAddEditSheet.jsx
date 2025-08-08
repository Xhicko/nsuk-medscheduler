"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingLabelInput } from "@/components/custom/floating-label-input"

export function FacultyAddEditSheet({ 
  isOpen, 
  onClose,
  faculty,
  formData, 
  focusStates, 
  errors, 
  onFormChange,
  onSelectChange, 
  setFocusState, 
  isFieldValid, 
  onSubmit,
  loading,
  isEditMode
}) {
  if (!formData) return null

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" />}
      <Sheet open={isOpen} onOpenChange={(open) => !loading && onClose && onClose()}>
        <SheetContent 
          className="w-full sm:max-w-md rounded-none p-6 flex flex-col z-[9999] bg-white shadow-2xl" 
          onPointerDownOutside={(e) => loading && e.preventDefault()}
          onEscapeKeyDown={(e) => loading && e.preventDefault()}
        >
        <SheetHeader className="mb-6">
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
        </SheetHeader>
        
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
          {/* Warning for verified faculties */}
          {isEditMode && formData.status === 'verified' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-amber-600 mt-0.5">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Verified Faculty</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This faculty is verified. To change the name or code, you must first change the status to "Pending".
                    You can change the status now and then modify other fields.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            disabled={loading || (isEditMode && formData.status === 'verified')}
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
            disabled={loading || (isEditMode && formData.status === 'verified')}
          />

          {isEditMode && (
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Faculty Status
              </Label>
              <Select
                value={formData.status || "pending"}
                onValueChange={(value) => {
                  onSelectChange && onSelectChange(value, "status")
                }}
                disabled={loading}
              >
                <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6] cursor-pointer">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[10000]" side="bottom" align="start">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
              {formData.status === 'pending' && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Faculty can be edited and deleted
                </p>
              )}
              {formData.status === 'verified' && (
                <p className="mt-1 text-xs text-blue-600">
                  ℹ️ Verified faculties are protected from deletion
                </p>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 cursor-pointer"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white cursor-pointer"
                disabled={loading || !formData.name?.trim() || !formData.code?.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode 
                    ? (formData.status === 'verified' && faculty?.status === 'verified' 
                        ? 'Change Status to Pending' 
                        : 'Update Faculty') 
                    : 'Create Faculty'
                )}
              </Button>
            </div>
          </div>
        </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
