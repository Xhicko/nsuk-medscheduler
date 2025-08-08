'use client'

import PageHeader from '@/components/custom/admin/PageHeader'
import {DataTable} from '@/components/custom/admin/data-table'
import {ConfirmationDialog} from '@/components/custom/admin/ConfirmationDialog'
import {StudentEditSheet} from './StudentEditSheet'
import { UserRoundCheck, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentsView({
   students,
   loading,
   studentsColumns,
   
   // Modal states
   selectedStudent,
   isModalOpen,
   deleteLoading,
   
   // Delete confirmation states
   isDeleteModalOpen,
   studentToDelete,
   closeDeleteModal,
   handleConfirmDelete,
   
   // Edit sheet
   isEditSheetOpen,
   editingStudent,
   editFormData,
   editFocusStates,
   editErrors,
   saveLoading,
   
   // Faculties and departments
   facultiesData,
   facultiesLoading,
   getDepartments,
   
   // Search and filters
   searchTerm,
   setSearchTerm,
   facultyFilter,
   setFacultyFilter,
   departmentFilter,
   setDepartmentFilter,
   statusFilter,
   setStatusFilter,
   
   // Pagination
   currentPage,
   setCurrentPage,
   totalPages,
   itemsPerPage,
   totalStudents,
   filteredStudentsCount,
   
   // Actions
   handleDeleteStudent,
   closeModal,
   closeEditSheet,
   handleEditFormChange,
   handleEditSelectChange,
   setEditFocusState,
   isEditFieldValid,
   handleSaveStudent,
   handleEditSubmit,
   handleConfirmEdit,
   handleReloadData
}) {
   return (
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         <div className="w-full mx-auto mb-8">
            <PageHeader
               icon={<UserRoundCheck className="w-8 h-8" />}
               title="Manage Students Data"
               description="Manage student records for the NSUK Medical Schedulizer Database."
               onReloadData={handleReloadData}
            />
         </div>

         <div className="w-full mx-auto px-6">
            <Card className="border-0 rounded-2xl bg-white">
               <CardHeader className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-900">Student Records</h2>
                        <p className="text-sm text-gray-500 mt-1">
                           Total: {totalStudents} students | Showing: {students.length} of {filteredStudentsCount} students
                        </p>
                     </div>
                     
                     {/* Search and Filters */}
                     <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                           <Input
                              placeholder="Search students..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-64 rounded-xl bg-white border-gray-200 text-gray-700"
                           />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                           <SelectTrigger className="w-40 rounded-xl bg-white border-gray-200">
                              <div className="flex items-center gap-2">
                                 <Filter className="h-4 w-4" />
                                 <SelectValue placeholder="Status" />
                              </div>
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                           </SelectContent>
                        </Select>
                        
                        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                           <SelectTrigger className="w-56 rounded-xl bg-white border-gray-200">
                              <div className="flex items-center gap-2">
                                 <Filter className="h-4 w-4" />
                                 <SelectValue placeholder="Faculty" />
                              </div>
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Faculties</SelectItem>
                              {facultiesData.map((faculty) => (
                                 <SelectItem key={faculty.id} value={faculty.id}>
                                    <span className="truncate" title={faculty.name}>{faculty.name}</span>
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        
                        {facultyFilter && facultyFilter !== "all" && (
                           <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                              <SelectTrigger className="w-56 rounded-xl bg-white border-gray-200">
                                 <SelectValue placeholder="Department" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Departments</SelectItem>
                                 {getDepartments(facultyFilter).map((department) => (
                                    <SelectItem key={department.id} value={department.id}>
                                       <span className="truncate" title={department.name}>{department.name}</span>
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        )}
                     </div>
                  </div>
               </CardHeader>
               
               <CardContent className="p-0">
                  <DataTable
                     data={students}
                     columns={studentsColumns}
                     loading={loading}
                     itemsPerPage={itemsPerPage}
                     currentPage={currentPage}
                     totalPages={totalPages}
                     total={totalStudents}
                     onPageChange={setCurrentPage}
                     numbered={true}
                     showPagination={true}
                  />
               </CardContent>
            </Card>
         </div>

         {/* Confirmation Dialog for Edit */}
         <ConfirmationDialog
            isOpen={isModalOpen}
            onOpenChange={closeModal}
            title="Confirm Edit"
            description={`Are you sure you want to edit the record for ${selectedStudent?.full_name}?`}
            onConfirm={handleConfirmEdit}
            confirmText="Yes, Edit"
            cancelText="Cancel"
         />

         {/* Confirmation Dialog for Delete */}
         <ConfirmationDialog
            isOpen={isDeleteModalOpen}
            onOpenChange={closeDeleteModal}
            title="Confirm Delete"
            description={`Are you sure you want to permanently delete the record for ${studentToDelete?.full_name}? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            confirmText="Yes, Delete"
            cancelText="Cancel"
            isLoading={deleteLoading}
         />

         {/* Edit Student Sheet */}
         <StudentEditSheet
            isOpen={isEditSheetOpen}
            onOpenChange={closeEditSheet}
            student={editingStudent}
            formData={editFormData}
            focusStates={editFocusStates}
            errors={editErrors}
            saveLoading={saveLoading}
            facultiesData={facultiesData}
            getDepartments={getDepartments}
            onFormChange={handleEditFormChange}
            onSelectChange={handleEditSelectChange}
            setFocusState={setEditFocusState}
            isFieldValid={isEditFieldValid}
            onSave={handleSaveStudent}
            onSubmit={handleEditSubmit}
         />
      </div>
   )
}
