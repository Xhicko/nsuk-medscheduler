'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { 
   Tabs, 
   TabsContent, 
   TabsList, 
   TabsTrigger 
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FloatingLabelInput } from '@/components/custom/floating-label-input'
import { 
   UploadCloud, 
   X, 
   Plus, 
   Trash2, 
   Loader2, 
   Info, 
   PencilLine, 
   FileUp, 
   User, 
   Mail } from 'lucide-react'
import { cn } from "@/lib/utils"

export function StudentUploadModal({
  isOpen,
  onOpenChange,
  
  // Manual entry props
  students,
  handleAddStudent,
  handleRemoveStudent,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isMatricNumberFocused,
  isFullNameFocused,
  isInstituteEmailFocused,
  getWatchedValue,
  isFieldValid,
  setValue,
  buttonLoading,
  handleFacultyChange,
  handleDepartmentChange,
  faculties,
  getDepartments,
  loadingFaculties,
  loadingDepartments,
  areAllFormsValid,
  handleFocusChange,
  
  // Bulk upload props
  selectedFile,
  filePreview,
  bulkUploadLoading,
  handleBulkFileChange,
  handleBulkDrop,
  handleBulkDragOver,
  handleBulkUpload
}) {
  const [activeTab, setActiveTab] = useState('manual')
  const fileInputRef = useRef(null)

  // Prevent closing the modal while loading
  const handleOpenChange = (open) => {
    if (!buttonLoading && !bulkUploadLoading) {
      onOpenChange(open);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Responsive width: 95% on mobile, smaller on larger screens
          "w-[95vw] md:w-[85vw] lg:w-[70vw] max-w-none",
          // Height constraint with internal scroll to keep content accessible
          "max-h-[95vh] overflow-hidden",
          // Visuals
          "rounded-2xl border border-black/10 bg-white text-black",
          "shadow-[0_24px_80px_rgba(0,0,0,0.22),_0_4px_18px_rgba(0,0,0,0.10)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "p-0"
        )}
      >
        <DialogHeader className="border-b border-black/10">
          <div className="flex items-start justify-between px-6 pt-5">
            <div className="space-y-1 pb-5">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Upload Students
              </DialogTitle>
              <DialogDescription className="text-xs text-black/60">
                Add one or more students manually or upload a CSV file.
              </DialogDescription>
              <div className="mt-2 inline-flex items-start gap-2 rounded-md bg-[#0077B6]/10 px-3 py-2 text-[#0077B6]">
                <Info className="mt-0.5 h-4 w-4" />
                <p className="text-xs">
                  Tip: Use Bulk Upload to import many students at once.
                </p>
              </div>
            </div>
            <DialogClose asChild>
              <button
                onClick={() => handleOpenChange(false)}
                disabled={buttonLoading || bulkUploadLoading}
                className="cursor-pointer rounded-full p-2 text-white transition bg-[#0077B6] hover:bg-[#0077B6]/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          <div className="px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList
                className={cn(
                  "mb-0 flex w-full justify-start gap-2 rounded-lg bg-black/[0.04] p-6",
                )}
              >
                <TabsTrigger
                  value="manual"
                  className={cn(
                    "cursor-pointer rounded-md p-4 text-sm md:text-base font-semibold transition",
                    "data-[state=active]:bg-[#0077B6] data-[state=active]:text-white",
                    "data-[state=inactive]:text-black/70 hover:text-black"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <PencilLine className="h-4 w-4" />
                    Manual Entry
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="bulk"
                  className={cn(
                    "cursor-pointer rounded-md p-4 text-sm md:text-base font-semibold transition",
                    "data-[state=active]:bg-[#0077B6] data-[state=active]:text-white",
                    "data-[state=inactive]:text-black/70 hover:text-black"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Bulk Upload
                  </span>
                </TabsTrigger>
              </TabsList>
              <div className="overflow-y-auto px-1 pb-6 pt-4 max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-170px)] md:max-h-[calc(90vh-160px)] lg:max-h-[calc(90vh-160px)]">
                <TabsContent
                  value="manual"
                  className="data-[state=inactive]:hidden"
                >
                  {/* Manual Entry Tab */}
                  <div className="space-y-5 px-6">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      {students.map((student, index) => (
                        <div
                          key={student.id}
                          className={cn(
                            "rounded-2xl border border-black/10 bg-white mb-5",
                            "shadow-[0_6px_24px_rgba(0,0,0,0.10)] transition"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-black/10 px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0077B6] text-xs font-semibold text-white">
                                {index + 1}
                              </span>
                              <div className="text-sm font-medium">Student</div>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(student.id)}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-[#E53935] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                                aria-label={`Remove student ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                            {/* Matriculation Number */}
                            <div className="space-y-1.5 col-span-1">
                              <FloatingLabelInput
                                id={`matricNumber-${student.id}`}
                                label="Matriculation Number"
                                type="text"
                                register={register(`students.${index}.matricNumber`)}
                                icon={<User className="w-5 h-5" />}
                                isFocused={isMatricNumberFocused[student.id]}
                                setIsFocused={(focused) => handleFocusChange(student.id, 'matricNumber', focused)}
                                watchedValue={getWatchedValue(index, 'matricNumber')}
                                errors={errors.students?.[index]?.matricNumber}
                                isValid={isFieldValid(index, 'matricNumber')}
                              />
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5 col-span-1">
                              <FloatingLabelInput
                                id={`fullName-${student.id}`}
                                label="Full Name"
                                type="text"
                                register={register(`students.${index}.fullName`)}
                                icon={<User className="w-5 h-5" />}
                                isFocused={isFullNameFocused[student.id]}
                                setIsFocused={(focused) => handleFocusChange(student.id, 'fullName', focused)}
                                watchedValue={getWatchedValue(index, 'fullName')}
                                errors={errors.students?.[index]?.fullName}
                                isValid={isFieldValid(index, 'fullName')}
                              />
                            </div>

                            {/* Institute Email */}
                            <div className="space-y-1.5 col-span-1">
                              <FloatingLabelInput
                                id={`institute_email-${student.id}`}
                                label="Institutional Email"
                                type="email"
                                register={register(`students.${index}.institute_email`)}
                                icon={<Mail className="w-5 h-5" />}
                                isFocused={isInstituteEmailFocused[student.id]}
                                setIsFocused={(focused) => handleFocusChange(student.id, 'institute_email', focused)}
                                watchedValue={getWatchedValue(index, 'institute_email')}
                                errors={errors.students?.[index]?.institute_email}
                                isValid={isFieldValid(index, 'institute_email')}
                              />
                            </div>

                            {/* Gender Dropdown */}
                            <div className="space-y-1.5 col-span-1">
                              <Select
                                value={getWatchedValue(index, 'gender') || ''}
                                onValueChange={(value) => setValue(`students.${index}.gender`, value)}
                                className="!w-full"
                              >
                                <SelectTrigger
                                  id={`gender-${student.id}`}
                                  className="h-10 border-black/15 text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                                >
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[1000]">
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.students?.[index]?.gender && (
                                <p className="text-sm text-red-500">{errors.students[index].gender.message}</p>
                              )}
                            </div>

                            {/* Religion Dropdown */}
                            <div className="space-y-1.5 col-span-1">
                              <Select
                                value={getWatchedValue(index, 'religion') || ''} 
                                onValueChange={(value) => setValue(`students.${index}.religion`, value)}
                              >
                                <SelectTrigger
                                  id={`religion-${student.id}`}
                                  className="h-10 border-black/15 text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                                >
                                  <SelectValue placeholder="Select religion" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[1000]">
                                  <SelectItem value="Christian">Christian</SelectItem>
                                  <SelectItem value="Muslim">Muslim</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.students?.[index]?.religion && (
                                <p className="text-sm text-red-500">{errors.students[index].religion.message}</p>
                              )}
                            </div>

                            {/* Faculty Dropdown */}
                            <div className="space-y-1.5 col-span-1">
                              <Select
                                value={getWatchedValue(index, 'faculty') || ''}
                                onValueChange={value => handleFacultyChange(index, value)}
                              >
                                <SelectTrigger
                                  id={`faculty-${student.id}`}
                                  className="h-10 border-black/15 text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                                >
                                  <SelectValue placeholder={loadingFaculties ? "Loading..." : "Select faculty"} />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[1000]">
                                  {faculties && faculties.length > 0 ? (
                                    faculties.map((faculty) => (
                                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                        {faculty.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="text-center py-3 text-gray-500">
                                      No faculties available
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              {errors.students?.[index]?.faculty && (
                                <p className="text-sm text-red-500">{errors.students[index].faculty.message}</p>
                              )}
                            </div>

                            {/* Department Dropdown */}
                            <div className="space-y-1.5 col-span-1">
                              <Select
                                value={getWatchedValue(index, 'department') || ''}
                                onValueChange={value => handleDepartmentChange(index, value)}
                                disabled={!getWatchedValue(index, 'faculty') || loadingDepartments}
                              >
                                <SelectTrigger
                                  id={`department-${student.id}`}
                                  className="h-10 border-black/15 text-black  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                                >
                                  <SelectValue placeholder={
                                    !getWatchedValue(index, 'faculty')
                                      ? "Select faculty first"
                                      : loadingDepartments
                                        ? "Loading..."
                                        : "Select department"
                                  } />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[1000]">
                                  {getWatchedValue(index, 'faculty') ? (
                                    getDepartments(getWatchedValue(index, 'faculty')).length > 0 ? (
                                      getDepartments(getWatchedValue(index, 'faculty')).map((department) => (
                                        <SelectItem key={department.id} value={department.id.toString()}>
                                          {department.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="text-center py-3 text-gray-500">
                                        No departments available for this faculty
                                      </div>
                                    )
                                  ) : (
                                    <div className="text-center py-3 text-gray-500">
                                      Please select a faculty first
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              {errors.students?.[index]?.department && (
                                <p className="text-sm text-red-500">{errors.students[index].department.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Button Container */}
                      <div className='flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                          <button
                            type="button"
                            onClick={handleAddStudent}
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-[#0077B6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0077B6] transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                          >
                            <Plus className="h-4 w-4" />
                            Add another student
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!areAllFormsValid || buttonLoading}
                          className={cn(
                            "cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0077B6] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6] sm:w-auto",
                            (!areAllFormsValid || buttonLoading) && "opacity-75"
                          )}
                        >
                          {buttonLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>Submit Students</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
                <TabsContent
                  value="bulk"
                  className="data-[state=inactive]:hidden"
                >
                  {/* Bulk Upload Tab */}
                  <div className="space-y-5 px-6">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        handleBulkDragOver(e);
                      }}
                      onDragLeave={() => {}}
                      onDrop={handleBulkDrop}
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          fileInputRef.current && fileInputRef.current.click();
                        }
                      }}
                      className={cn(
                        "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition",
                        "border-[#0077B6] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]",
                      )}
                      aria-label="Drag and drop CSV file here or click to browse"
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-black/0 to-black/[0.04]" />
                      <UploadCloud className="h-9 w-9 text-[#0077B6]" />
                      <div className="space-y-1">
                        <p className="text-[15px] font-semibold">
                          {selectedFile ? (
                            <span className="font-medium text-gray-800">{selectedFile.name} selected</span>
                          ) : (
                            "Drag your file here or click to browse"
                          )}
                        </p>
                        <p className="text-xs text-black/60">CSV, JSON, or SQL files accepted. Max ~10MB.</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleBulkFileChange}
                        accept=".csv,.json,.sql"
                      />
                    </div>

                    {filePreview && filePreview.length > 0 && (
                      <div className="overflow-hidden rounded-2xl border border-black/10">
                        <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.02] px-4 py-3">
                          <div className="text-sm">
                            Preview: {selectedFile.name}
                            <span className="ml-2 text-xs text-black/60">
                              Showing first {filePreview.length} records
                            </span>
                          </div>
                          <button
                            className="cursor-pointer rounded-full px-3 py-1.5 text-xs text-black/70 transition hover:bg-black/5 hover:text-black  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]"
                            onClick={() => {
                              // Clear file function
                              fileInputRef.current.value = '';
                              fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                            }}
                          >
                            Clear
                          </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-10 bg-white">
                              <tr className="border-b border-black/10">
                                <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">Matric Number</th>
                                <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">Full Name</th>
                                <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">Department</th>
                                <th className="px-3 py-2 text-left text-[13px] font-semibold text-black">Faculty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filePreview.map((record, index) => (
                                <tr
                                  key={index}
                                  className={cn(
                                    "border-b border-black/5",
                                    index % 2 === 1 ? "bg-black/[0.03]" : "bg-transparent",
                                    "hover:bg-black/[0.05] transition-colors"
                                  )}
                                >
                                  <td className="px-3 py-2 text-[13px] text-black">{record.matric_number || "-"}</td>
                                  <td className="px-3 py-2 text-[13px] text-black">{record.full_name || "-"}</td>
                                  <td className="px-3 py-2 text-[13px] text-black">{record.department || "-"}</td>
                                  <td className="px-3 py-2 text-[13px] text-black">{record.faculty || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBulkUpload}
                      disabled={!selectedFile || bulkUploadLoading}
                      className={cn(
                        "cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077B6] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0077B6]",
                        (!selectedFile || bulkUploadLoading) && "opacity-75"
                      )}
                      aria-live="polite"
                    >
                      {bulkUploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>Upload File</>
                      )}
                    </button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
