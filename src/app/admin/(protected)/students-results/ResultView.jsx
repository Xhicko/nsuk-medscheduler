'use client'
import { Bell, RefreshCcw, Search, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from '@/components/custom/admin/data-table'
import { ConfirmationDialog } from '@/components/custom/admin/ConfirmationDialog'

export default function ResultView({
  // Panel
  status = 'ready',
  setStatus = () => {},
  readyCount = 0,
  notifiedCount = 0,
  loading = false,
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
  totalResults = 0,
  filteredResultsCount = 0,
  tableColumns = [],
  tableData = [],
  facultiesData = [],
  getDepartments = () => [],
  // actions
  isDeleteConfirmOpen = false,
  closeDeleteConfirm = () => {},
  handleConfirmDelete = () => {},
  isDeleting = false,
  // notify confirm
  isNotifyConfirmOpen = false,
  closeNotifyConfirm = () => {},
  handleConfirmNotify = () => {},
  isNotifying = false,
  // undo confirm
  isUndoConfirmOpen = false,
  closeUndoConfirm = () => {},
  handleConfirmUndo = () => {},
  isUndoing = false,
}) {
  const handleReload = () => {
    // We'll rely on parent logic to refetch when status changes or other filters change
    // For a manual reload, just toggle status briefly
    const next = status === 'ready' ? 'notified' : 'ready'
    setStatus(next)
    setTimeout(() => setStatus(status), 0)
  }

  return (
    <div className="min-h-[calc(100vh-49px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full mx-auto mb-8">
        <div className="p-8 bg-[#0077B6] border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-white rounded-xl">
              <Bell className="w-8 h-8 text-[#0077B6]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Students Results Notifications</h1>
              <p className="text-white/90">Manage result readiness and notifications.</p>
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

            {/* Panel toggles */}
            <div className="inline-flex w-full sm:w-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStatus('ready')}
                aria-pressed={status === 'ready'}
                className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 cursor-pointer focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0077B6]
                  ${status === 'ready' ? 'bg-[#0077B6] text-white hover:text-white hover:bg-[#0077B6]/90' : 'text-[#0077B6]/80 hover:bg-[#0077B6]/20 hover:text-[#0077B6]'}
                `}
              >
                Ready
                <span className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold
                  ${status === 'ready' ? 'bg-white/20 text-white' : 'bg-[#0077B6]/10 text-[#0077B6]'}
                `}>
                  {readyCount}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStatus('notified')}
                aria-pressed={status === 'notified'}
                className={`flex-1 sm:flex-none rounded-lg px-4 py-2 ml-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 cursor-pointer  focus-visible:ring-offset-[#0077B6]
                  ${status === 'notified' ? 'bg-[#0077B6] text-white hover:text-white hover:bg-[#0077B6]/90' : 'text-[#0077B6]/80 hover:bg-[#0077B6]/20 hover:text-[#0077B6]'}
                `}
              >
                Notified
                <span className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold
                  ${status === 'notified' ? 'bg-white/20 text-white' : 'bg-[#0077B6]/10 text-[#0077B6]'}
                `}>
                  {notifiedCount}
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
                <h2 className="text-xl font-semibold text-gray-900">{status === 'ready' ? 'Results Ready' : 'Students Notified'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Total: {totalResults} records | Showing: {tableData.length} of {filteredResultsCount} records
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 h-14 rounded-xl bg-white border-gray-200 text-gray-700"
                  />
                </div>
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
              totalPages={Math.ceil(Math.max(totalResults, 1) / itemsPerPage)}
              total={totalResults}
              onPageChange={setCurrentPage}
              numbered={true}
              showPagination={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={closeDeleteConfirm}
        title="Delete result notification?"
        description={"This will remove the result notification record for this student."}
        onConfirm={handleConfirmDelete}
        confirmText={isDeleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        isLoading={isDeleting}
      />

      {/* Notify confirmation dialog */}
      <ConfirmationDialog
        isOpen={isNotifyConfirmOpen}
        onOpenChange={closeNotifyConfirm}
        title="Notify this student?"
        description={"We'll send an email letting the student know their result is ready."}
        onConfirm={handleConfirmNotify}
        confirmText={isNotifying ? 'Notifying…' : 'Notify'}
        cancelText="Cancel"
        isLoading={isNotifying}
      />

      {/* Undo confirmation dialog */}
      <ConfirmationDialog
        isOpen={isUndoConfirmOpen}
        onOpenChange={closeUndoConfirm}
        title="Undo notification?"
        description={"This will revert the notification status back to Ready."}
        onConfirm={handleConfirmUndo}
        confirmText={isUndoing ? 'Reverting…' : 'Undo'}
        cancelText="Cancel"
        isLoading={isUndoing}
      />
    </div>
  )
}
