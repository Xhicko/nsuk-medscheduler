'use client'

import PageHeader from '@/components/custom/admin/PageHeader'
import UploadDataLogic from './UploadDataLogic'
import { useRef } from 'react'
import { HardDriveUpload, UploadCloud, Edit, User, Mail, Plus, Loader} from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingLabelInput } from '@/components/custom/floating-label-input';
import { Input } from "@/components/ui/input"
import { cn } from '@/lib/utils'

export default function UploadDataView(){
   const fileInputRef = useRef(null);
   const {
      handleReloadData,
      showManualEntry, 
      setShowManualEntry,
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
      students,
      handleAddStudent,
      handleRemoveStudent,
      handleFocusChange,
      selectedFile,
      filePreview,
      bulkUploadLoading,
      handleBulkFileChange,
      handleBulkDrop,
      handleBulkDragOver,
      handleBulkUpload
   } = UploadDataLogic()

   return(
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         <div className="w-full mx-auto mb-8">
            <PageHeader
               icon={<HardDriveUpload className="w-8 h-8"  />}
               title="Manage Student Data Upload"
               description="Efficiently add and manage student records for the NSUK Medical Schedulizer Database."
               onReloadData={handleReloadData}
            />
         </div>

         <div className="flex justify-center gap-4 mb-8">
            <Button
               variant={showManualEntry ? "lg" : "outline"}
               onClick={() => setShowManualEntry(true)}
               className={
               showManualEntry
                  ? "bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-md rounded px-12 py-5 font-medium cursor-pointer"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent rounded px-12 py-5 font-medium cursor-pointer"
               }
            >
               <Edit className="w-5 h-5 mr-2" /> Manual Entry
            </Button>
            <Button
               variant={!showManualEntry ? "lg" : "outline"}
               onClick={() => setShowManualEntry(false)}
               className={
               !showManualEntry
                  ? "bg-[#0077B6] hover:bg-[#0077B6]/90 text-white shadow-md rounded px-12 py-5 font-medium cursor-pointer"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent rounded px-12 py-5 font-medium cursor-pointer"
               }
            >
               <UploadCloud className="w-5 h-5 mr-2" /> Bulk Upload
            </Button>
        </div>

        <div className="w-full mx-auto">
          {showManualEntry ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {students.map((student, index) => (
                  <Card key={student.id} className="p-6 bg-white border-0 shadow-lg rounded-2xl">
                    <CardHeader className="pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">Student Entry #{index + 1}</CardTitle>
                          <CardDescription className="text-gray-500">Fill in student details.</CardDescription>
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Matriculation Number */}
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

                        {/* Full Name */}
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

                        {/* Institute Email */}
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

                        {/* Gender Dropdown */}
                        <div className="space-y-4">
                          <Select 
                            onValueChange={(value) => setValue(`students.${index}.gender`, value)} 
                            value={getWatchedValue(index, 'gender')}
                          >
                            <SelectTrigger className="w-full border-black py-[27px] border-1 rounded">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.students?.[index]?.gender && (
                            <p className="text-sm text-red-500">{errors.students[index].gender.message}</p>
                          )}
                        </div>

                        {/* Religion Dropdown */}
                        <div className="space-y-4">
                          <Select 
                            onValueChange={(value) => setValue(`students.${index}.religion`, value)} 
                            value={getWatchedValue(index, 'religion')}
                          >
                            <SelectTrigger className="w-full border-black py-[27px] border-1 rounded">
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Christian">Christian</SelectItem>
                              <SelectItem value="Muslim">Muslim</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.students?.[index]?.religion && (
                            <p className="text-sm text-red-500">{errors.students[index].religion.message}</p>
                          )}
                        </div>

                        {/* Faculty Dropdown */}
                        <div className="space-y-4">
                          <Select
                            onValueChange={value => handleFacultyChange(index, value)}
                            value={getWatchedValue(index, 'faculty')}
                          >
                            <SelectTrigger className="w-full border-black py-[27px] border-1 rounded">
                              <SelectValue placeholder={loadingFaculties ? "Loading..." : "Select faculty"} />
                            </SelectTrigger>
                            <SelectContent>
                              {faculties.map((faculty) => (
                                <SelectItem key={faculty.id} value={faculty.id.toString()}>
                                  {faculty.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.students?.[index]?.faculty && (
                            <p className="text-sm text-red-500">{errors.students[index].faculty.message}</p>
                          )}
                        </div>

                        {/* Department Dropdown */}
                        <div className="space-y-2">
                          <Select
                            onValueChange={value => handleDepartmentChange(index, value)}
                            value={getWatchedValue(index, 'department')}
                            disabled={!getWatchedValue(index, 'faculty') || loadingDepartments}
                          >
                            <SelectTrigger className="w-full border-black py-[27px] border-1 rounded">
                              <SelectValue placeholder={
                                !getWatchedValue(index, 'faculty')
                                  ? "Select faculty first"
                                  : loadingDepartments
                                    ? "Loading..."
                                    : "Select department"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {getDepartments(getWatchedValue(index, 'faculty')).map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.students?.[index]?.department && (
                            <p className="text-sm text-red-500">{errors.students[index].department.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Button Container */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Add Student Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddStudent}
                    className="w-full h-15 text-white hover:bg-[#0077B6]/90 hover:text-white/90 transition-all duration-200 rounded py-3 bg-[#0077B6] cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Another Student
                  </Button>

                  {/* Submit All Button */}
                  <Button
                    type="submit"
                    className="w-full h-15 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white font-semibold py-3 rounded transition-colors duration-200 cursor-pointer"
                    disabled={!areAllFormsValid}
                  >
                    {buttonLoading ? (
                        <div className="flex items-center gap-2">
                           <Loader className="animate-spin" />
                        </div>
                     ) : (
                        <>
                             Submit Student(s) Data
                           <UploadCloud   className="w-4 h-4" />
                        </>
                     )}
                  </Button>
                </div>

              </div>
            </form>
          ) : (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Bulk Upload</CardTitle>
                <CardDescription className="text-gray-500">Upload student data in CSV, JSON, or SQL format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onDrop={handleBulkDrop}
                  onDragOver={handleBulkDragOver}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-200",
                    selectedFile ? "border-[#0077B6]/50 bg-[#0077B6]/5" : "border-gray-300 hover:border-gray-400 bg-gray-50",
                  )}
                >
                  <UploadCloud className={cn("h-12 w-12 mb-4", selectedFile ? "text-[#0077B6]" : "text-gray-400")} />
                  <p className="mb-2 text-center text-gray-600">
                    {selectedFile ? (
                      <span className="font-medium text-gray-800">{selectedFile.name} selected</span>
                    ) : (
                      "Drag & drop your file here, or"
                    )}
                  </p>
                  <div className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/10 rounded-lg bg-transparent"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      Browse Files
                    </Button>
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleBulkFileChange}
                      accept=".csv,.json,.sql"
                    />
                  </div>
                </div>

                {filePreview && filePreview.length > 0 && (
                  <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800">
                      File Preview (First {filePreview.length} records)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-gray-700">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left">
                              Matric Number
                            </th>
                            <th scope="col" className="px-4 py-2 text-left">
                              Full Name
                            </th>
                            <th scope="col" className="px-4 py-2 text-left">
                              Department
                            </th>
                            <th scope="col" className="px-4 py-2 text-left">
                              Faculty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.map((record, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap">{record.matric_number}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{record.full_name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{record.department}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{record.faculty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBulkUpload}
                  disabled={!selectedFile || bulkUploadLoading}
                  className="w-full h-15 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white font-semibold py-3 rounded transition-colors duration-200"
                >
                  {bulkUploadLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="animate-spin" />
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
   )
}