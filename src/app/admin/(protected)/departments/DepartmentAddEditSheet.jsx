'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription} from '@/components/ui/sheet'
import {Skeleton} from '@/components/ui/skeleton'
import {FloatingLabelInput} from '@/components/custom/floating-label-input'
import { toast } from 'react-hot-toast' 

export function DepartmentAddEditSheet({
   isOpen,
   onClose,
   department,
   formData,
   focusStates,
   errors,
   loading,
   isEditMode,
   facultiesData,
   facultiesLoading,
   onFormChange,
   onSelectChange,
   setFocusState,
   onSubmit,
   isFieldValid
}) {
   const [localFormData, setLocalFormData] = useState(formData || {})

   useEffect(() => {
      setLocalFormData(formData || {})
   }, [formData])

   const handleInputChange = (e) => {
      const { id, value } = e.target
      setLocalFormData(prev => ({ ...prev, [id]: value }))
      if (onFormChange) {
         onFormChange(e)
      }
   }

   const handleSelectValueChange = (value, field) => {
      setLocalFormData(prev => ({ ...prev, [field]: value }))
      if (onSelectChange) {
         onSelectChange(value, field)
      }
   }

   const handleSubmit = (e) => {
      e.preventDefault()
      
      // Let the parent component handle validation to ensure consistent error messages
      if (onSubmit) {
         onSubmit(e)
      }
   }

   const getVerifiedFaculties = () => {
      if (!facultiesData || !Array.isArray(facultiesData)) {
         return []
      }
      return facultiesData.filter(faculty => faculty.status === 'verified')
   }

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
                     {isEditMode ? 'Edit Department' : 'Add New Department'}
                  </SheetTitle>
                  <SheetDescription className="text-gray-500">
                     {isEditMode 
                        ? `Update the details for this department.`
                        : 'Create a new department under a verified faculty.'
                     }
                  </SheetDescription>
               </div>
            </SheetHeader>

               <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
                  {/* Faculty Selection */}
                  <div>
                     <Label htmlFor="faculty_id" className="text-sm font-medium text-gray-700">
                        Faculty *
                     </Label>
                     {facultiesLoading ? (
                        <Skeleton className="h-10 w-full rounded-lg" />
                     ) : (
                        <Select
                           value={localFormData.faculty_id || ''}
                           onValueChange={(value) => handleSelectValueChange(value, 'faculty_id')}
                           disabled={loading}
                        >
                           <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6] cursor-pointer">
                              <SelectValue placeholder="Select a verified faculty" />
                           </SelectTrigger>
                           <SelectContent className="z-[10000]" side="bottom" align="start">
                              {getVerifiedFaculties().length > 0 ? (
                                 getVerifiedFaculties().map((faculty) => (
                                    <SelectItem key={faculty.id} value={faculty.id}>
                                       {faculty.name}
                                    </SelectItem>
                                 ))
                              ) : (
                                 <SelectItem value="" disabled>
                                    No verified faculties available
                                 </SelectItem>
                              )}
                           </SelectContent>
                        </Select>
                     )}
                     {errors?.faculty_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.faculty_id.message || errors.faculty_id}</p>
                     )}
                     {getVerifiedFaculties().length === 0 && !facultiesLoading && (
                        <p className="mt-1 text-sm text-amber-600">
                           ⚠️ No verified faculties available. Departments can only be created under verified faculties.
                        </p>
                     )}
                  </div>

                  {/* Department Name */}
                  <FloatingLabelInput
                    id="name"
                    label="Department Name"
                    type="text"
                    value={localFormData.name || ""}
                    onChange={handleInputChange}
                    isFocused={focusStates?.name || false}
                    setIsFocused={(focused) => setFocusState && setFocusState("name", focused)}
                    errors={errors?.name}
                    isValid={isFieldValid ? isFieldValid("name") : true}
                    placeholder="e.g., Computer Science"
                    disabled={loading}
                  />

                  {/* Department Code */}
                  <FloatingLabelInput
                    id="code"
                    label="Department Code"
                    type="text"
                    value={localFormData.code || ""}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      handleInputChange(e);
                    }}
                    isFocused={focusStates?.code || false}
                    setIsFocused={(focused) => setFocusState && setFocusState("code", focused)}
                    errors={errors?.code}
                    isValid={isFieldValid ? isFieldValid("code") : true}
                    placeholder="e.g., CS"
                    style={{ textTransform: 'uppercase' }}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 -mt-4 mb-4">
                    Optional short code for the department (will be converted to uppercase)
                  </p>

                  {/* No Description Field - Removed */}

                  {/* Status Field - Only for Edit Mode */}
                  {isEditMode && (
                     <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                           Department Status
                        </Label>
                        <Select
                           value={localFormData.status || "pending"}
                           onValueChange={(value) => handleSelectValueChange(value, 'status')}
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
                        {errors?.status && (
                           <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                        )}
                        {localFormData.status === 'pending' && (
                           <p className="mt-1 text-xs text-amber-600">
                              ⚠️ Students cannot be enrolled in pending departments
                           </p>
                        )}
                        {localFormData.status === 'verified' && (
                           <p className="mt-1 text-xs text-green-600">
                              ✓ Students can be enrolled in this department
                           </p>
                        )}
                     </div>
                  )}

                  {/* Form Actions */}
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
                           disabled={loading || !localFormData.name?.trim() || !localFormData.faculty_id || getVerifiedFaculties().length === 0}
                        >
                           {loading ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                 {isEditMode ? 'Updating...' : 'Creating...'}
                              </div>
                           ) : (
                              isEditMode ? 'Update Department' : 'Create Department'
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
