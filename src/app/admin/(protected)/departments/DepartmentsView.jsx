'use client'

import {DataTable} from '@/components/custom/admin/data-table'
import {ConfirmationDialog} from '@/components/custom/admin/ConfirmationDialog'
import {DepartmentAddEditSheet} from './DepartmentAddEditSheet'
import { Building2, Search, Plus, UserRoundCheck, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DepartmentsView({
   departments,
   loading,
   departmentsColumns,
   
   // Modal states
   selectedDepartment,
   isModalOpen,
   deleteLoading,
   
   // Delete confirmation states
   isDeleteModalOpen,
   departmentToDelete,
   closeDeleteModal,
   handleConfirmDelete,
   
   // Add/Edit sheet
   isAddEditSheetOpen,
   editingDepartment,
   formData,
   focusStates,
   errors,
   saveLoading,
   isEditMode,
   
   // Faculties data
   facultiesData,
   facultiesLoading,
   
   // Search
   searchTerm,
   setSearchTerm,
   statusFilter,
   setStatusFilter,
   facultyFilter,
   setFacultyFilter,
   
   // Pagination
   currentPage,
   setCurrentPage,
   totalPages,
   itemsPerPage,
   totalDepartments,
   filteredDepartmentsCount,
   
   // Add/Edit actions
   openAddSheet,
   closeAddEditSheet,
   handleFormChange,
   handleSelectChange,
   setFocusState,
   isFieldValid,
   handleFormSubmit,
   handleReloadData,
   closeModal,
   handleConfirmEdit
}) {
   return (
      <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
         {/* Page Header */}
         <div className="w-full mx-auto mb-8">
            <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-white rounded-xl">
                     <Building2 className="w-8 h-8 text-[#0077B6]" />
                  </div>
                  <div className="flex-1">
                     <h1 className="text-2xl font-bold text-white">Manage Departments</h1>
                     <p className="text-white/90">Create, edit, and manage academic departments</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <Button
                     onClick={openAddSheet}
                     className="bg-[#fff] hover:bg-[#fff]/95 text-[#0077B6] cursor-pointer"
                  >
                     <Plus className="w-4 h-4 mr-2 text-[#0077B6]" />
                     Add Department
                  </Button>
                  <Button
                     variant="outline"
                     onClick={handleReloadData}
                     className="text-[#0077B6] border-none hover:bg-[#fff]/95 hover:text-[#0077B6] cursor-pointer"
                  >
                     <UserRoundCheck className="w-4 h-4 mr-2 text-[#0077B6]" />
                     Reload
                  </Button>
               </div>
            </div>
         </div>

        
    {/* Search Section */}
         <Card className="mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <CardHeader className="px-8 py-6 border-b border-gray-100">
               <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-xl font-semibold text-gray-900">Departments Records</h2>
                     <p className="text-sm text-gray-500 mt-1">
                        Total: {totalDepartments} Departments | Showing: {departments.length} of {filteredDepartmentsCount} Departments
                     </p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="flex items-center gap-3 flex-wrap">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                           placeholder="Search departments..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 w-64 h-14 rounded-xl bg-white border-gray-200 text-gray-700"
                        />
                     </div>
                     
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 rounded-xl bg-white border-gray-200 cursor-pointer">
                           <div className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              <SelectValue placeholder="Status" />
                           </div>
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Status</SelectItem>
                           <SelectItem value="pending">Pending</SelectItem>
                           <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                     </Select>
                     
                     <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                        <SelectTrigger className="w-56 rounded-xl bg-white border-gray-200 cursor-pointer">
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
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <DataTable
                  data={departments}
                  columns={departmentsColumns}
                  loading={loading}
                  numbered={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  total={totalDepartments}
                  onPageChange={setCurrentPage}
                  showPagination={true}
               />
            </CardContent>
         </Card>

         {/* Faculties Table */}
         <div className="w-full mx-auto px-6">
         </div>

         {/* Edit Confirmation Modal */}
         <ConfirmationDialog
            isOpen={isModalOpen}
            onOpenChange={(open) => !open && closeModal()}
            onConfirm={handleConfirmEdit}
            title="Edit Department"
            description={`Are you sure you want to edit department of "${selectedDepartment?.name}"?`}
            confirmText="Edit"
            cancelText="Cancel"
            isDestructive={false}
         />

         {/* Delete Confirmation Modal */}
         <ConfirmationDialog
            isOpen={isDeleteModalOpen}
            onOpenChange={(open) => !open && closeDeleteModal()}
            onConfirm={handleConfirmDelete}
            title="Delete Department"
            description={
               <>
                  Are you sure you want to delete department of <strong>"{departmentToDelete?.name}"</strong>?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                     This action cannot be undone. Make sure all students under this department are removed first.
                  </span>
               </>
            }
            confirmText="Delete"
            cancelText="Cancel"
            isDestructive={true}
            isLoading={deleteLoading}
         />

         {/* Add/Edit Department Sheet */}
         <DepartmentAddEditSheet
            isOpen={isAddEditSheetOpen}
            onClose={closeAddEditSheet}
            department={editingDepartment}
            formData={formData}
            focusStates={focusStates}
            errors={errors}
            loading={saveLoading}
            isEditMode={isEditMode}
            facultiesData={facultiesData}
            facultiesLoading={facultiesLoading}
            onFormChange={handleFormChange}
            onSelectChange={handleSelectChange}
            setFocusState={setFocusState}
            onSubmit={handleFormSubmit}
            isFieldValid={isFieldValid}
         />
      </div>
   )
}
