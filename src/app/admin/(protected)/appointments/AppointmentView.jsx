'use client'
import { CalendarClock, RefreshCcw, Search, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from '@/components/custom/admin/data-table'
import { ConfirmationDialog } from '@/components/custom/admin/ConfirmationDialog'
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal'
import AppointmentEditSheet from './AppointmentEditSheet'


export default function AppointmentView({
   // Panel controls injected by logic
   status = 'pending',
   setStatus = () => {},
   pendingCount = 0,
   scheduledCount = 0,
   loading = false,
   fetchAppointments = () => {},
   // Filters & pagination & table
   searchTerm = '',
   setSearchTerm = () => {},
   facultyFilter = 'all',
   setFacultyFilter = () => {},
   departmentFilter = 'all',
   setDepartmentFilter = () => {},
   currentPage = 1,
   setCurrentPage = () => {},
   itemsPerPage = 10,
   totalAppointments = 0,
   filteredAppointmentsCount = 0,
   tableColumns = [],
   tableData = [],
      facultiesData = [],
      getDepartments = () => [],
      scheduledStatusFilter = 'scheduled',
      setScheduledStatusFilter = () => {},
   // schedule flow
   isScheduleConfirmOpen = false,
   closeScheduleConfirm = () => {},
   handleConfirmSchedule = () => {},
   isScheduleModalOpen = false,
   handleScheduleModalOpenChange = () => {},
   handleScheduleSubmit = () => {},
   selectedStudentForModal = null,
   // delete flow
   isDeleteConfirmOpen = false,
   closeDeleteConfirm = () => {},
   handleConfirmDelete = () => {},
   isDeleting = false,
   // undo flow
   isUndoConfirmOpen = false,
   closeUndoConfirm = () => {},
   handleConfirmUndo = () => {},
   isUndoing = false,
   // complete flow
   isCompleteConfirmOpen = false,
   closeCompleteConfirm = () => {},
   handleConfirmComplete = () => {},
   isCompleting = false,
   // edit sheet
   isEditSheetOpen = false,
   handleEditSheetOpenChange = () => {},
   selectedStudentForEdit = null,
   initialRangeForEdit = null,
   requestReschedule = () => {},
   isEditConfirmOpen = false,
   closeEditConfirm = () => {},
   handleConfirmEditOpen = () => {},
   isRescheduleConfirmOpen = false,
   closeRescheduleConfirm = () => {},
   handleConfirmReschedule = () => {},
   handleMarkMissed = () => {},
   handleRevertPendingFromSheet = () => {},
   loadingAction = null,
}) {
   const handleReload = () => {
      fetchAppointments(status)
   }

  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
             <div className="w-full mx-auto mb-8">
                <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-white rounded-xl">
                         <CalendarClock className="w-8 h-8 text-[#0077B6]" />
                      </div>
                      <div className="flex-1">
                         <h1 className="text-2xl font-bold text-white">Manage Students Appointments</h1>
                         <p className="text-white/90">Manage student medical appointments efficiently..</p>
                      </div>
                   </div>
                            <div className="flex flex-wrap items-center gap-3">
                                 {/* Reload */}
                                 <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReload}
                                    disabled={loading}
                                    className="text-[#0077B6] border-none hover:bg-[#fff]/95 hover:text-[#0077B6] cursor-pointer"
                                 >
                                    <RefreshCcw className="w-4 h-4 mr-2 text-[#0077B6]" />
                                    {loading ? 'Reloading…' : 'Reload'}
                                 </Button>

                                             {/* Smart panel toggles (responsive segmented control) */}
                                             <div className="inline-flex w-full sm:w-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
                                                <Button
                                                   type="button"
                                                   variant="ghost"
                                                   onClick={() => setStatus('pending')}
                                                   aria-pressed={status === 'pending'}
                                                   aria-label="Show students pending appointment"
                                                   className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 cursor-pointer focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0077B6]
                                                      ${status === 'pending'
                                                         ? 'bg-[#0077B6] text-white hover:text-white hover:bg-[#0077B6]/90'
                                                         : 'text-[#0077B6]/80 hover:bg-[#0077B6]/20 hover:text-[#0077B6]'}
                                                   `}
                                                >
                                                   Without Appointment
                                                   <span className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold
                                                      ${status === 'pending' ? 'bg-white/20 text-white' : 'bg-[#0077B6]/10 text-[#0077B6]'}
                                                   `}>
                                                      {pendingCount}
                                                   </span>
                                                </Button>
                                                <Button
                                                   type="button"
                                                   variant="ghost"
                                                   onClick={() => setStatus('scheduled')}
                                                   aria-pressed={status === 'scheduled'}
                                                   aria-label="Show students with scheduled appointment"
                                                   className={`flex-1 sm:flex-none rounded-lg px-4 py-2 ml-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 cursor-pointer  focus-visible:ring-offset-[#0077B6]
                                                      ${status === 'scheduled'
                                                         ? 'bg-[#0077B6] text-white hover:text-white hover:bg-[#0077B6]/90'
                                                         : 'text-[#0077B6]/80 hover:bg-[#0077B6]/20 hover:text-[#0077B6]'}
                                                   `}
                                                >
                                                    With Appointment
                                                   <span className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold
                                                      ${status === 'scheduled' ? 'bg-white/20 text-white' : 'bg-[#0077B6]/10 text-[#0077B6]'}
                                                   `}>
                                                      {scheduledCount}
                                                   </span>
                                                </Button>
                                             </div>
                            </div>
                </div>
             </div>
               {/* Table and filters */}
               <div className="w-full mx-auto px-6">
                  <Card className="border-0 rounded-2xl bg-white">
                     <CardHeader className="px-8 py-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                           <div>
                              <h2 className="text-xl font-semibold text-gray-900">{status === 'pending' ? 'Pending Appointments' : 'Scheduled Appointments'}</h2>
                              <p className="text-sm text-gray-500 mt-1">
                                 Total: {totalAppointments} records | Showing: {tableData.length} of {filteredAppointmentsCount} records
                              </p>
                           </div>
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
                                           {status === 'scheduled' && (
                                              <Select value={scheduledStatusFilter} onValueChange={setScheduledStatusFilter}>
                                                 <SelectTrigger className="w-48 rounded-xl bg-white border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                       <Filter className="h-4 w-4" />
                                                       <SelectValue placeholder="Appointment status" />
                                                    </div>
                                                 </SelectTrigger>
                                                 <SelectContent>
                                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="missed">Missed</SelectItem>
                                                 </SelectContent>
                                              </Select>
                                           )}
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
                              {facultyFilter && facultyFilter !== 'all' && (
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
                           data={tableData}
                           columns={tableColumns}
                           loading={loading}
                           itemsPerPage={itemsPerPage}
                           currentPage={currentPage}
                           totalPages={Math.ceil(Math.max(totalAppointments, 1) / itemsPerPage)}
                           total={totalAppointments}
                           onPageChange={setCurrentPage}
                           numbered={true}
                           showPagination={true}
                        />
                     </CardContent>
                  </Card>
               </div>

               {/* Schedule confirmation dialog */}
               <ConfirmationDialog
                  isOpen={isScheduleConfirmOpen}
                  onOpenChange={closeScheduleConfirm}
                  title="Schedule appointment?"
                  description={selectedStudentForModal ? `Proceed to schedule an appointment for ${selectedStudentForModal.fullName} (${selectedStudentForModal.matricNumber}).` : 'Proceed to scheduling.'}
                  onConfirm={handleConfirmSchedule}
                  confirmText="Continue"
                  cancelText="Cancel"
               />

               {/* Schedule modal */}
               <ScheduleAppointmentModal
                  isOpen={isScheduleModalOpen}
                  onOpenChange={handleScheduleModalOpenChange}
                  student={selectedStudentForModal}
                  onSchedule={handleScheduleSubmit}
                  onCancel={() => handleScheduleModalOpenChange(false)}
               />

               {/* Edit appointment sheet */}
               <AppointmentEditSheet
                  isOpen={isEditSheetOpen}
                  onOpenChange={handleEditSheetOpenChange}
                  student={selectedStudentForEdit}
                  initialRange={initialRangeForEdit}
                  onReschedule={requestReschedule}
                  onMarkMissed={handleMarkMissed}
                  onRevertPending={handleRevertPendingFromSheet}
                  loadingAction={loadingAction}
               />

               {/* Delete confirmation dialog */}
               <ConfirmationDialog
                  isOpen={isDeleteConfirmOpen}
                  onOpenChange={closeDeleteConfirm}
                  title="Delete pending appointment?"
                  description={selectedStudentForModal ? `This will remove the pending appointment for ${selectedStudentForModal.fullName} (${selectedStudentForModal.matricNumber}).` : 'This will remove the pending appointment.'}
                  onConfirm={handleConfirmDelete}
                  confirmText={isDeleting ? 'Deleting…' : 'Delete'}
                  cancelText="Cancel"
                  isLoading={isDeleting}
               />

               {/* Undo confirmation dialog */}
               <ConfirmationDialog
                  isOpen={isUndoConfirmOpen}
                  onOpenChange={closeUndoConfirm}
                  title="Undo scheduled appointment?"
                  description={selectedStudentForModal ? `This will revert the appointment for ${selectedStudentForModal.fullName} (${selectedStudentForModal.matricNumber}) back to pending.` : 'This will revert the appointment back to pending.'}
                  onConfirm={handleConfirmUndo}
                  confirmText={isUndoing ? 'Undoing…' : 'Undo'}
                  cancelText="Cancel"
                  isLoading={isUndoing}
               />

               {/* Confirm opening the edit sheet */}
               <ConfirmationDialog
                  isOpen={isEditConfirmOpen}
                  onOpenChange={closeEditConfirm}
                  title="Update student appointment?"
                  description={selectedStudentForEdit ? `You’re about to open the editor to update ${selectedStudentForEdit.fullName} (${selectedStudentForEdit.matricNumber}).` : 'Open the editor to update this appointment.'}
                  onConfirm={handleConfirmEditOpen}
                  confirmText="Open editor"
                  cancelText="Cancel"
               />

               {/* Reschedule confirmation */}
               <ConfirmationDialog
                  isOpen={isRescheduleConfirmOpen}
                  onOpenChange={closeRescheduleConfirm}
                  title="Confirm reschedule?"
                  description={selectedStudentForEdit ? `Reschedule appointment for ${selectedStudentForEdit.fullName} (${selectedStudentForEdit.matricNumber}). The student will be notified by email.` : 'The student will be notified by email.'}
                  onConfirm={handleConfirmReschedule}
                  confirmText={loadingAction === 'reschedule' ? 'Rescheduling…' : 'Yes, reschedule'}
                  cancelText="Cancel"
                  isLoading={loadingAction === 'reschedule'}
               />

               {/* Complete confirmation dialog */}
               <ConfirmationDialog
                  isOpen={isCompleteConfirmOpen}
                  onOpenChange={closeCompleteConfirm}
                  title="Mark appointment as completed?"
                  description={selectedStudentForModal ? `This will mark the appointment for ${selectedStudentForModal.fullName} (${selectedStudentForModal.matricNumber}) as completed.` : 'This will mark the appointment as completed.'}
                  onConfirm={handleConfirmComplete}
                  confirmText={isCompleting ? 'Completing…' : 'Complete'}
                  cancelText="Cancel"
                  isLoading={isCompleting}
               />

    </div>
  )
}
