'use client'

import { DataTable } from '@/components/custom/admin/data-table'
import { ConfirmationDialog } from '@/components/custom/admin/ConfirmationDialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AdminEditSheet } from './AdminEditSheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Search, Filter, Plus, RefreshCcw } from 'lucide-react'

export default function AdminManagementView({
  admins,
  loading,
  adminsColumns,

  // search & filters
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,

  // pagination
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  totalAdmins,
  filteredAdminsCount,

  // delete
  isDeleteModalOpen,
  adminToDelete,
  deleteLoading,
  closeDeleteModal,
  handleConfirmDelete,

  // actions
  fetchAdmins,
  // edit
  openAddSheet,
  isEditSheetOpen,
  editingAdmin,
  editFormData,
  editFocusStates,
  editErrors,
  saveLoading,
  closeEditSheet,
  handleEditFormChange,
  handleEditSelectChange,
  setEditFocusState,
  isEditFieldValid,
  handleSaveAdmin,
  handleEditSubmit,
  // confirmations
  isAddConfirmOpen,
  isEditConfirmOpen,
  editCandidate,
  openAddConfirm,
  closeAddConfirm,
  handleConfirmAdd,
  closeEditConfirm,
  handleConfirmEdit,
  // verification
  emailVerified,
  verificationToken,
  isSendLoading,
  isVerifyLoading,
  isResendLoading,
  resendCountdown,
  handleSendToken,
  handleResendToken,
  handleVerifyToken,
  setVerificationToken,
  // pending admin props
  pendingAdminId,
  pendingAdminEmail,
}){
  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full mx-auto mb-8">
        <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-white rounded-xl">
              <Users className="w-8 h-8 text-[#0077B6]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Manage Admins</h1>
              <p className="text-white/90">Create, update, and remove admin users.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={openAddConfirm}
              className="bg-[#fff] hover:bg-[#fff]/95 text-[#0077B6] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 text-[#0077B6]" />
              Add Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchAdmins(1, searchTerm, roleFilter, statusFilter)}
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
                <h2 className="text-xl font-semibold text-gray-900">Admins</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Total: {totalAdmins} | Showing: {admins.length} of {filteredAdminsCount}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 h-14 rounded-xl bg-white border-gray-200 text-gray-700"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 rounded-xl bg-white border-gray-200">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 rounded-xl bg-white border-gray-200">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              data={admins}
              columns={adminsColumns}
              loading={loading}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalAdmins}
              onPageChange={setCurrentPage}
              numbered={true}
              showPagination={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={closeDeleteModal}
        title="Confirm Delete"
        description={`Are you sure you want to permanently delete the record for ${adminToDelete?.full_name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
      />

      {/* Add Admin Confirmation */}
      <ConfirmationDialog
        isOpen={isAddConfirmOpen}
        onOpenChange={closeAddConfirm}
        title="Create New Admin?"
        description="You'll open the admin creation sheet. Ensure you have the correct email to start verification. Continue?"
        onConfirm={handleConfirmAdd}
        confirmText="Proceed"
        cancelText="Cancel"
      />

      {/* Edit Admin Confirmation */}
      <ConfirmationDialog
        isOpen={isEditConfirmOpen}
        onOpenChange={closeEditConfirm}
        title="Edit Admin?"
        description={`You're about to edit ${editCandidate?.full_name || 'this admin'}. Proceed to the edit sheet?`}
        onConfirm={handleConfirmEdit}
        confirmText="Yes, Edit"
        cancelText="Cancel"
      />

      {/* Edit Admin Sheet */}
      <AdminEditSheet
        isOpen={isEditSheetOpen}
        onOpenChange={closeEditSheet}
        admin={editingAdmin}
        formData={editFormData}
        focusStates={editFocusStates}
        errors={editErrors}
        saveLoading={saveLoading}
        onFormChange={handleEditFormChange}
        onSelectChange={handleEditSelectChange}
        setFocusState={setEditFocusState}
        isFieldValid={isEditFieldValid}
        onSave={handleSaveAdmin}
        onSubmit={handleEditSubmit}
      // verification props
      emailVerified={emailVerified}
      verificationToken={verificationToken}
      isSendLoading={isSendLoading}
      isVerifyLoading={isVerifyLoading}
      isResendLoading={isResendLoading}
      resendCountdown={resendCountdown}
      onSendToken={handleSendToken}
      onResendToken={handleResendToken}
      onVerifyToken={handleVerifyToken}
      setVerificationToken={setVerificationToken}
  pendingAdminId={pendingAdminId}
  pendingAdminEmail={pendingAdminEmail}
      />
    </div>
  )
}
