'use client'

import PageHeader from '@/components/custom/admin/PageHeader'
import {DataTable} from '@/components/custom/admin/data-table'
import {ConfirmationDialog} from '@/components/custom/admin/ConfirmationDialog'
import {FacultyAddEditSheet} from './FacultyAddEditSheet'
import { GraduationCap, Search, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function FacultiesView({
   faculties,
   loading,
   facultiesColumns,
   
   // Modal states
   selectedFaculty,
   isModalOpen,
   deleteLoading,
   
   // Delete confirmation states
   isDeleteModalOpen,
   facultyToDelete,
   closeDeleteModal,
   handleConfirmDelete,
   
   // Add/Edit sheet
   isAddEditSheetOpen,
   editingFaculty,
   formData,
   focusStates,
   errors,
   saveLoading,
   isEditMode,
   
   // Search
   searchTerm,
   setSearchTerm,
   
   // Pagination
   currentPage,
   setCurrentPage,
   totalPages,
   itemsPerPage,
   totalFaculties,
   filteredFacultiesCount,
   
   // Actions
   openAddSheet,
   closeAddEditSheet,
   handleFormChange,
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
         <PageHeader
            icon={GraduationCap}
            title="Manage Faculties"
            description="Create, edit, and manage academic faculties"
            primaryAction={{
               label: "Add Faculty",
               icon: Plus,
               onClick: openAddSheet
            }}
            secondaryAction={{
               label: "Reload",
               onClick: handleReloadData
            }}
         />

         {/* Search Section */}
         <Card className="mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <CardHeader>
               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
               </h3>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                     <Input
                        placeholder="Search by faculty name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-[#0077B6] focus:ring-[#0077B6]"
                     />
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Faculties Table */}
         <DataTable
            title="Academic Faculties"
            description={`Showing ${faculties.length} of ${filteredFacultiesCount} faculties`}
            data={faculties}
            columns={facultiesColumns}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            emptyStateMessage="No faculties found"
            emptyStateDescription="Get started by adding a new faculty"
         />

         {/* Edit Confirmation Modal */}
         <ConfirmationDialog
            isOpen={isModalOpen}
            onClose={closeModal}
            onConfirm={handleConfirmEdit}
            title="Edit Faculty"
            description={`Are you sure you want to edit "${selectedFaculty?.name}"?`}
            confirmText="Edit"
            cancelText="Cancel"
            variant="default"
         />

         {/* Delete Confirmation Modal */}
         <ConfirmationDialog
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleConfirmDelete}
            title="Delete Faculty"
            description={
               <>
                  Are you sure you want to delete <strong>"{facultyToDelete?.name}"</strong>?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                     This action cannot be undone. Make sure all departments under this faculty are removed first.
                  </span>
               </>
            }
            confirmText="Delete"
            cancelText="Cancel"
            variant="destructive"
            loading={deleteLoading}
         />

         {/* Add/Edit Faculty Sheet */}
         <FacultyAddEditSheet
            isOpen={isAddEditSheetOpen}
            onClose={closeAddEditSheet}
            faculty={editingFaculty}
            formData={formData}
            focusStates={focusStates}
            errors={errors}
            loading={saveLoading}
            isEditMode={isEditMode}
            onFormChange={handleFormChange}
            onFocusChange={setFocusState}
            onSubmit={handleFormSubmit}
            isFieldValid={isFieldValid}
         />
      </div>
   )
}
