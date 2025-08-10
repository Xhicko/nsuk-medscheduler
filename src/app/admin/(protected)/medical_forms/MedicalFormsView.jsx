'use client'

import {DataTable} from '@/components/custom/admin/data-table'
import {ConfirmationDialog} from '@/components/custom/admin/ConfirmationDialog'
import { Activity, Search, Filter, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {Button}  from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MedicalFormDetailSheet from './MedicalFormDetailSheet'

export default function MedicalFormsView({
   // Data
   medicalForms,
   loading,
   medicalFormsColumns,
   
   // Delete confirmation states
   isDeleteModalOpen,
   medicalFormToDelete,
   closeDeleteModal,
   handleConfirmDelete,
   deleteLoading,
   // Edit confirmation states
   isEditConfirmOpen,
   medicalFormToEdit,
   closeEditConfirm,
   handleConfirmEdit,
   
   // View modal states
   isViewModalOpen,
   viewingMedicalForm,
   closeViewModal,
   
   // Edit sheet states
   isEditSheetOpen,
   closeEditSheet,
   editFormData,
   editFocusStates,
   editErrors,
   handleEditFormChange,
   handleEditSelectChange,
   setEditFocusState,
   isEditFieldValid,
   handleEditSubmit,
   saveLoading,
   
   // Faculties and departments
   facultiesData,
   getDepartments,
   
   // Search and filters
   searchTerm,
   setSearchTerm,
   facultyFilter,
   setFacultyFilter,
   departmentFilter,
   setDepartmentFilter,
   completedFilter,
   setCompletedFilter,
   
   // Pagination
   currentPage,
   setCurrentPage,
   totalPages,
   itemsPerPage,
   totalMedicalForms,
   filteredMedicalFormsCount,
   
   // Actions
   fetchMedicalForms
}) {
   // Handler for reloading data with current filters
   const handleReloadData = () => {
      fetchMedicalForms(currentPage, searchTerm, facultyFilter, departmentFilter, completedFilter);
   };

   return (
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         <div className="w-full mx-auto mb-8">
            <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-white rounded-xl">
                     <Activity className="w-8 h-8 text-[#0077B6]" />
                  </div>
                  <div className="flex-1">
                     <h1 className="text-2xl font-bold text-white">Manage Medical Records</h1>
                     <p className="text-white/90">View and manage student medical records.</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <Button
                     variant="outline"
                     onClick={handleReloadData}
                     className="text-[#0077B6] border-none hover:bg-[#fff]/95 hover:text-[#0077B6] cursor-pointer"
                  >
                     <RefreshCcw className="w-4 h-4 mr-2 text-[#0077B6]" />
                     Reload
                  </Button>
               </div>
            </div>
         </div>

         <div className="w-full mx-auto px-6">
            <Card className="border-0 rounded-2xl bg-white">
               <CardHeader className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-semibold text-gray-900">Medical Form Records</h2>
                        <p className="text-sm text-gray-500 mt-1">
                           Total: {totalMedicalForms} records | Showing: {medicalForms.length} of {filteredMedicalFormsCount} records
                        </p>
                     </div>
                     
                     {/* Search and Filters */}
                     <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                           <Input
                              placeholder="Search medical records..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-64 rounded-xl bg-white border-gray-200 text-gray-700"
                           />
                        </div>
                        
                        <Select value={completedFilter} onValueChange={setCompletedFilter}>
                           <SelectTrigger className="w-40 rounded-xl bg-white border-gray-200">
                              <div className="flex items-center gap-2">
                                 <Filter className="h-4 w-4" />
                                 <SelectValue placeholder="Status" />
                              </div>
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="true">Completed</SelectItem>
                              <SelectItem value="false">Pending</SelectItem>
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
                     data={medicalForms}
                     columns={medicalFormsColumns}
                     loading={loading}
                     itemsPerPage={itemsPerPage}
                     currentPage={currentPage}
                     totalPages={totalPages}
                     total={totalMedicalForms}
                     onPageChange={setCurrentPage}
                     numbered={true}
                     showPagination={true}
                  />
               </CardContent>
            </Card>
         </div>

               {/* Edit Sheet */}
                  <MedicalFormDetailSheet
                  isOpen={isEditSheetOpen}
                  onOpenChange={closeEditSheet}
                  formData={editFormData}
                  focusStates={editFocusStates}
                  errors={editErrors}
                  onFormChange={handleEditFormChange}
                  onSelectChange={handleEditSelectChange}
                  setFocusState={setEditFocusState}
                  isFieldValid={isEditFieldValid}
                  onSubmit={handleEditSubmit}
                  saveLoading={saveLoading}
               />

               {/* View Sheet (read-only) */}
               <MedicalFormDetailSheet
                  isOpen={isViewModalOpen}
                  onOpenChange={closeViewModal}
                  formData={viewingMedicalForm}
                  focusStates={{}}
                  errors={{}}
                  onFormChange={() => {}}
                  onSelectChange={() => {}}
                  setFocusState={() => {}}
                  isFieldValid={() => true}
                  onSubmit={(e) => e?.preventDefault?.()}
                  saveLoading={false}
                  readOnly
                  title="Medical Form Details"
               />

         {/* Confirmation Dialog for Delete */}
         <ConfirmationDialog
            isOpen={isDeleteModalOpen}
            onOpenChange={closeDeleteModal}
            title="Confirm Delete"
            description={`Are you sure you want to permanently delete the medical record for ${medicalFormToDelete?.student_name || 'this student'}? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            confirmText="Yes, Delete"
            cancelText="Cancel"
            isLoading={deleteLoading}
         />

         {/* Edit confirmation dialog */}
         <ConfirmationDialog
            isOpen={isEditConfirmOpen}
            onOpenChange={closeEditConfirm}
            title="Confirm Edit"
            description={`Open the edit form for ${medicalFormToEdit?.student_name || 'this student'}? Ensure you intend to modify this record.`}
            onConfirm={handleConfirmEdit}
            confirmText="Yes, Edit"
            cancelText="Cancel"
            isLoading={false}
         />

      </div>
   )
}
