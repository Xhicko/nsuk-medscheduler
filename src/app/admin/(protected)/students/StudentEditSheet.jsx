"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingLabelInput } from "@/components/custom/floating-label-input" 

export function StudentEditSheet({ 
  isOpen, 
  onOpenChange, 
  formData, 
  focusStates, 
  errors, 
  onFormChange, 
  onSelectChange, 
  setFocusState, 
  isFieldValid, 
  onSubmit,
  saveLoading,
  facultiesData,
  facultiesLoading,
  getDepartments
}) {
  if (!formData) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md rounded-none p-6 flex flex-col">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-gray-900">Edit Student Record</SheetTitle>
          <SheetDescription className="text-gray-500">
            Make corrections to {formData.fullName}'s student details.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto space-y-6 pr-4 -mr-4">
          <FloatingLabelInput
            id="matricNumber"
            label="Matric Number"
            type="text"
            value={formData.matricNumber || ""}
            onChange={onFormChange}
            isFocused={focusStates.matricNumber || false}
            setIsFocused={(focused) => setFocusState("matricNumber", focused)}
            errors={errors.matricNumber}
            isValid={isFieldValid("matricNumber")}
          />
          <FloatingLabelInput
            id="fullName"
            label="Full Name"
            type="text"
            value={formData.fullName || ""}
            onChange={onFormChange}
            isFocused={focusStates.fullName || false}
            setIsFocused={(focused) => setFocusState("fullName", focused)}
            errors={errors.fullName}
            isValid={isFieldValid("fullName")}
          />
          <FloatingLabelInput
            id="institutionalEmail"
            label="Institutional Email"
            type="email"
            value={formData.institutionalEmail || ""}
            onChange={onFormChange}
            isFocused={focusStates.institutionalEmail || false}
            setIsFocused={(focused) => setFocusState("institutionalEmail", focused)}
            errors={errors.institutionalEmail}
            isValid={isFieldValid("institutionalEmail")}
          />
          <div>
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender
            </Label>
            <Select
              value={formData.gender || ""}
              onValueChange={(value) => onSelectChange(value, "gender")}
            >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_specified">Not specified</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="religion" className="text-sm font-medium text-gray-700">
              Religion
            </Label>
            <Select
              value={formData.religion || ""}
              onValueChange={(value) => onSelectChange(value, "religion")}
            >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6]">
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_specified">Not specified</SelectItem>
                <SelectItem value="Christian">Christian</SelectItem>
                <SelectItem value="Muslim">Muslim</SelectItem>
              </SelectContent>
            </Select>
            {errors.religion && (
              <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="facultyId" className="text-sm font-medium text-gray-700">
              Faculty
            </Label>
            <Select
              value={formData.facultyId || ""}
              onValueChange={(value) => onSelectChange(value, "facultyId")}
              disabled={facultiesLoading}
            >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6]">
                <SelectValue placeholder={facultiesLoading ? "Loading faculties..." : "Select faculty"} />
              </SelectTrigger>
              <SelectContent>
                {facultiesData.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.facultyId && (
              <p className="mt-1 text-sm text-red-600">{errors.facultyId.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="departmentId" className="text-sm font-medium text-gray-700">
              Department
            </Label>
            <Select
              value={formData.departmentId || ""}
              onValueChange={(value) => onSelectChange(value, "departmentId")}
              disabled={!formData.facultyId || facultiesLoading}
            >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6]">
                <SelectValue placeholder={
                  !formData.facultyId 
                    ? "Select faculty first" 
                    : facultiesLoading 
                      ? "Loading departments..." 
                      : "Select department"
                } />
              </SelectTrigger>
              <SelectContent>
                {getDepartments(formData.facultyId).map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="isVerified" className="text-sm font-medium text-gray-700">
              Activation Status
            </Label>
            <Select
              value={String(formData.isVerified)}
              onValueChange={(value) => onSelectChange(value, "isVerified")}
            >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#0077B6] focus:ring-[#0077B6]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={saveLoading}
              className="w-full bg-[#0077B6] hover:bg-[#0077B6] text-white rounded-lg cursor-pointer"
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
