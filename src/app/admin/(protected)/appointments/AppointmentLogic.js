'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { CalendarPlus, CheckCircle, RotateCcw, Pencil, Trash2 } from 'lucide-react'

export default function AppointmentLogic(initialData) {
  // Core data (to be wired to API later)
  const [appointments, setAppointments] = useState(initialData?.appointments || [])
  const [loading, setLoading] = useState(false)
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(initialData?.pagination?.total || 0)

  // Status panel: 'pending' (no given appointment yet) | 'scheduled' (has appointment)
  const [status, setStatus] = useState(initialData?.status || 'pending')

  // Derive counts from appointments list
  const [pendingCount, setPendingCount] = useState(initialData?.counts?.pending || 0)
  const [scheduledCount, setScheduledCount] = useState(initialData?.counts?.scheduled || 0)
  // Sub-filter within scheduled tab: 'scheduled' | 'completed' | 'missed'
  const [scheduledStatusFilter, setScheduledStatusFilter] = useState('scheduled')

  // Fetch appointments (placeholder – wire API later)
  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState(initialData?.filters?.searchTerm ?? '')
  const [facultyFilter, setFacultyFilter] = useState(initialData?.filters?.faculty ?? 'all')
  const [departmentFilter, setDepartmentFilter] = useState(initialData?.filters?.department ?? 'all')
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1)
  const [itemsPerPage] = useState(10)
  const searchTimeoutRef = useRef(null)
  const didMountRef = useRef(false)

  // Faculties and departments
  const [faculties, setFaculties] = useState(initialData?.faculties || [])
  const [departments, setDepartments] = useState({})
  const [facultiesLoading, setFacultiesLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  // Schedule flow state
  const [isScheduleConfirmOpen, setIsScheduleConfirmOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  // Delete flow state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Undo flow state
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)
  // Complete flow state
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  // Edit sheet state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState(null) 
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false) 
  const [pendingRescheduleSelection, setPendingRescheduleSelection] = useState(null) 
  const [isRescheduleConfirmOpen, setIsRescheduleConfirmOpen] = useState(false)

  const fetchFaculties = async () => {
    setFacultiesLoading(true)
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
      if (response.status === 200) {
        const verifiedFaculties = (response.data.faculties || []).filter((faculty) => faculty.status === 'verified')
        setFaculties(verifiedFaculties)
      }
    } catch (error) {
  console.error('Error fetching faculties:', error)
  const message = error?.response?.data?.error || error?.message || 'Failed to load faculties'
  toast.error(message)
    } finally {
      setFacultiesLoading(false)
    }
  }

  const fetchDepartmentsForFaculty = async (facultyId) => {
    if (!facultyId || facultyId === 'all') return
    setLoadingDepartments(true)
    try {
      const response = await axios.get(`${ADMIN_ENDPOINTS.DEPARTMENTS}?faculty_id=${facultyId}&status=verified`)
      if (response.status === 200) {
        const departmentsForFaculty = (response.data.departments || [])
          .filter((departmentRow) => departmentRow.faculty_id === facultyId && departmentRow.status === 'verified')
          .map((departmentRow) => ({ id: departmentRow.id, name: departmentRow.name, code: departmentRow.code, status: departmentRow.status }))
        setDepartments((previousState) => ({ ...previousState, [facultyId]: departmentsForFaculty }))
      }
    } catch (error) {
  console.error('Error fetching departments:', error)
  const message = error?.response?.data?.error || error?.message || 'Failed to load departments'
  toast.error(message)
    } finally {
      setLoadingDepartments(false)
    }
  }

  const getDepartments = (facultyId) => {
    if (!facultyId) return []
    return departments[facultyId] || []
  }

  // Compute effective status for server and UI based on scheduled sub-filter
  const getEffectiveStatus = () => {
    if (status !== 'scheduled') return status
    if (scheduledStatusFilter === 'completed' || scheduledStatusFilter === 'missed') return scheduledStatusFilter
    return 'scheduled'
  }

  // Fetch appointments from the server
  const fetchAppointments = async (
    targetStatus = getEffectiveStatus(),
    page = currentPage,
    search = searchTerm,
    faculty = facultyFilter,
    department = departmentFilter
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', itemsPerPage.toString())
      if (search && search.trim()) params.append('search', search.trim())
      if (faculty && faculty !== 'all') params.append('faculty', faculty)
      if (department && department !== 'all') params.append('department', department)
      if (targetStatus && targetStatus !== 'all') params.append('status', targetStatus)

      const response = await axios.get(`${ADMIN_ENDPOINTS.APPOINTMENTS}?${params.toString()}`)
      if (response.status === 200) {
        const appointmentsFromServer = response.data.appointments || []
        setAppointments(appointmentsFromServer)
        setTotalAppointmentsCount(response.data.pagination?.total || 0)
        if (response.data.counts) {
          setPendingCount(response.data.counts.pending || 0)
          setScheduledCount(response.data.counts.scheduled || 0)
        }
        const serverPage = response.data.pagination?.page
        if (serverPage && serverPage !== currentPage) setCurrentPage(serverPage)
      } else {
        setAppointments([])
        setTotalAppointmentsCount(0)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      const message = error?.response?.data?.error || error?.message || 'Failed to fetch appointments'
      toast.error(message)
      setAppointments([])
      setTotalAppointmentsCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Refresh data when status changes
  useEffect(() => {
    // Skip first run to avoid duplicating SSR initial fetch
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    fetchAppointments()
  }, [status])

  // Load departments when faculty changes
  useEffect(() => {
    if (facultyFilter && facultyFilter !== 'all') {
      fetchDepartmentsForFaculty(facultyFilter)
    }
  }, [facultyFilter])

  // Refetch on scheduled sub-filter change
  useEffect(() => {
    if (!didMountRef.current) return
    if (status === 'scheduled') {
      fetchAppointments()
    }
  }, [scheduledStatusFilter])

  // Search handler with debounce
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchAppointments(getEffectiveStatus(), 1, value, facultyFilter, departmentFilter)
    }, 500)
  }

  const handleFacultyFilterChange = (value) => {
    setFacultyFilter(value)
    setDepartmentFilter('all')
    setCurrentPage(1)
    fetchAppointments(getEffectiveStatus(), 1, searchTerm, value, 'all')
  }

  const handleDepartmentFilterChange = (value) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
    fetchAppointments(getEffectiveStatus(), 1, searchTerm, facultyFilter, value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchAppointments(getEffectiveStatus(), page, searchTerm, facultyFilter, departmentFilter)
  }

  // Schedule flow handlers
  const openScheduleConfirm = (appointmentItem) => {
    setSelectedItem(appointmentItem)
    setIsScheduleConfirmOpen(true)
  }

  const closeScheduleConfirm = (open) => {
    setIsScheduleConfirmOpen(open)
  }

  const handleConfirmSchedule = () => {
    setIsScheduleConfirmOpen(false)
    setIsScheduleModalOpen(true)
  }

  const handleScheduleModalOpenChange = (open) => {
    setIsScheduleModalOpen(open)
  }

  const handleScheduleSubmit = async (student, date, startTime, endTime) => {
    try {
      const [startHour, startMinute] = String(startTime).split(':').map(Number)
      const [endHour, endMinute] = String(endTime).split(':').map(Number)
      const start = new Date(date)
      start.setHours(startHour || 0, startMinute || 0, 0, 0)
      const end = new Date(date)
      end.setHours(endHour || 0, endMinute || 0, 0, 0)

      const payload = {
        appointment_id: selectedItem?.id,
        status: 'scheduled',
        time_range: `[${start.toISOString()},${end.toISOString()})`,
      }

      const response = await axios.put(ADMIN_ENDPOINTS.APPOINTMENTS, payload)
      if (response.status === 200) {
  toast.success(response?.data?.message || 'Appointment scheduled successfully')
        setIsScheduleModalOpen(false)
        // Refresh current panel data and counts
        fetchAppointments(status)
      } else {
  toast.error(response?.data?.error || response?.data?.message || 'Failed to schedule appointment')
      }
    } catch (error) {
      const errorMessage = (error?.response?.data?.error) || error?.message || 'Failed to schedule appointment'
      toast.error(errorMessage)
      console.error('Error scheduling appointment:', error)
    }
  }

  // Undo scheduled appointment back to pending
  const openUndoConfirm = (appointmentItem) => {
    setSelectedItem(appointmentItem)
    setIsUndoConfirmOpen(true)
  }

  const closeUndoConfirm = (open) => {
    if (isUndoing) return
    setIsUndoConfirmOpen(open)
  }

  const handleConfirmUndo = async () => {
    if (!selectedItem?.id) return
    try {
      setIsUndoing(true)
      const response = await axios.put(ADMIN_ENDPOINTS.APPOINTMENTS, {
        appointment_id: selectedItem.id,
        status: 'pending',
        time_range: null,
      })
      if (response.status === 200) {
  toast.success(response?.data?.message || 'Appointment returned to pending')
        setIsUndoConfirmOpen(false)
        setSelectedItem(null)
        fetchAppointments(status)
      } else {
  toast.error(response?.data?.error || response?.data?.message || 'Failed to undo appointment')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to undo appointment'
      toast.error(message)
    } finally {
      setIsUndoing(false)
    }
  }

  // Complete flow handlers
  const openCompleteConfirm = (appointmentItem) => {
    setSelectedItem(appointmentItem)
    setIsCompleteConfirmOpen(true)
  }

  const closeCompleteConfirm = (open) => {
    if (isCompleting) return
    setIsCompleteConfirmOpen(open)
  }

  const handleConfirmComplete = async () => {
    if (!selectedItem?.id) return
    try {
      setIsCompleting(true)
      const response = await axios.post(ADMIN_ENDPOINTS.APPOINTMENTS, {
        appointment_id: selectedItem.id,
      })
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || 'Appointment marked as completed')
        setIsCompleteConfirmOpen(false)
        setSelectedItem(null)
        fetchAppointments(status)
      } else {
        toast.error(response?.data?.error || response?.data?.message || 'Failed to complete appointment')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to complete appointment'
      toast.error(message)
    } finally {
      setIsCompleting(false)
    }
  }

  // Delete flow handlers
  const openDeleteConfirm = (appointmentItem) => {
    setSelectedItem(appointmentItem)
    setIsDeleteConfirmOpen(true)
  }

  const closeDeleteConfirm = (open) => {
    // Prevent closing while deleting
    if (isDeleting) return
    setIsDeleteConfirmOpen(open)
  }

  const handleConfirmDelete = async () => {
    if (!selectedItem?.id) return
    try {
      setIsDeleting(true)
      const response = await axios.delete(`${ADMIN_ENDPOINTS.APPOINTMENTS}?appointment_id=${selectedItem.id}`)
      if (response.status === 200) {
        toast.success(response.data.message)
        setIsDeleteConfirmOpen(false)
        setSelectedItem(null)
        fetchAppointments(status)
      } else {
        toast.error('Failed to delete appointment')
      }
    } catch (error) {
      const message = (error?.response?.data?.error) || error?.message || 'Failed to delete appointment'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Client-side formatting and splits
  const normalizedAppointments = useMemo(() => {
    // Shape: include student fields surfaced for the table
    return (appointments || []).map((appointment) => {
      const student = appointment?.students || {}
      // Parse tsrange: expected format '[(]start,end[)]' or '["start","end"]'? We’ll attempt both.
      let startISO = null
      let endISO = null
      const timeRangeRaw = appointment?.time_range
      if (typeof timeRangeRaw === 'string') {
        // strip brackets and split by comma
        const rangeParts = timeRangeRaw.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '').split(',')
        if (rangeParts.length === 2) {
          startISO = rangeParts[0]?.replace(/"/g, '').trim()
          endISO = rangeParts[1]?.replace(/"/g, '').trim()
        }
      } else if (timeRangeRaw && typeof timeRangeRaw === 'object' && timeRangeRaw?.lower && timeRangeRaw?.upper) {
        startISO = timeRangeRaw.lower
        endISO = timeRangeRaw.upper
      }

      const startDate = startISO ? new Date(startISO) : null
      const endDate = endISO ? new Date(endISO) : null

      return {
        id: appointment.id,
        status: appointment.status,
        created_at: appointment.created_at,
        completed_at: appointment.completed_at,
        start: startISO,
        end: endISO,
        start_date: startDate,
        end_date: endDate,
        start_date_str: startDate ? startDate.toLocaleDateString() : '—',
        start_time_str: startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        end_time_str: endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        student_id: appointment.student_id,
        matric_number: student?.matric_number || 'N/A',
        student_name: student?.full_name || 'N/A',
        faculty_name: student?.faculties?.name || 'N/A',
        department_name: student?.departments?.name || 'N/A',
      }
    })
  }, [appointments])

  const pendingList = useMemo(() => normalizedAppointments.filter((appointmentItem) => (appointmentItem.status || '').toLowerCase() === 'pending'), [normalizedAppointments])
  // List for scheduled tab honoring sub-filter
  const scheduledList = useMemo(() => {
    return normalizedAppointments.filter((appointmentItem) => {
      const s = (appointmentItem.status || '').toLowerCase()
      if (status !== 'scheduled') return false
      if (scheduledStatusFilter === 'completed' || scheduledStatusFilter === 'missed') return s === scheduledStatusFilter
      return s === 'scheduled'
    })
  }, [normalizedAppointments, status, scheduledStatusFilter])

  // Selected student mapped for modal shape
  const selectedStudentForModal = useMemo(() => {
    if (!selectedItem) return null
    return {
      id: selectedItem.student_id,
      matricNumber: selectedItem.matric_number,
      fullName: selectedItem.student_name,
      department: selectedItem.department_name,
      faculty: selectedItem.faculty_name,
    }
  }, [selectedItem])

  // Columns for tables
  const pendingColumns = [
    { key: 'matric_number', header: 'Matric Number', render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span> },
    { key: 'student_name', header: 'Student Name', render: (item) => <span className="text-gray-600">{item.student_name}</span> },
    { key: 'department_name', header: 'Department', render: (item) => <span className="text-gray-600">{item.department_name}</span> },
    { key: 'faculty_name', header: 'Faculty', render: (item) => <span className="text-gray-600">{item.faculty_name}</span> },
    {
      key: 'action', header: 'Action', className: 'text-right', render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Schedule appointment"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            aria-label="Schedule appointment"
            onClick={() => openScheduleConfirm(item)}
          >
            <CalendarPlus className="h-4 w-4" />
          </button>
          <button
            title="Delete pending appointment"
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
            aria-label="Delete pending appointment"
            onClick={() => openDeleteConfirm(item)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ]

  const scheduledColumns = [
    { key: 'matric_number', header: 'Matric Number', render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span> },
    { key: 'student_name', header: 'Student Name', render: (item) => <span className="text-gray-600">{item.student_name}</span> },
    { key: 'start_date_str', header: 'Date', render: (item) => <span className="text-gray-600">{item.start_date_str}</span> },
    { key: 'start_time_str', header: 'Start', render: (item) => <span className="text-gray-600">{item.start_time_str}</span> },
    { key: 'end_time_str', header: 'End', render: (item) => <span className="text-gray-600">{item.end_time_str}</span> },
    {
      key: 'action', header: 'Action', className: 'text-right', render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Mark complete"
            className="text-green-600 hover:text-green-800 p-1 rounded cursor-pointer"
            aria-label="Mark appointment complete"
            onClick={() => openCompleteConfirm(item)}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            title="Undo appointment"
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
            aria-label="Undo appointment"
            onClick={() => openUndoConfirm(item)}
          >
            <RotateCcw  className="h-4 w-4" />
          </button>
          <button
            title="Edit appointment"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            aria-label="Edit appointment"
            onClick={() => openEditSheet(item)}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ]

  // Edit sheet helpers
  const openEditSheet = (appointmentItem) => {
    setSelectedItem(appointmentItem)
    setIsEditConfirmOpen(true)
  }

  const handleEditSheetOpenChange = (open) => {
    if (loadingAction) return
    setIsEditSheetOpen(open)
  }

  const selectedStudentForEdit = useMemo(() => {
    if (!selectedItem) return null
    return {
      id: selectedItem.student_id,
      matricNumber: selectedItem.matric_number,
      fullName: selectedItem.student_name,
      department: selectedItem.department_name,
      faculty: selectedItem.faculty_name,
    }
  }, [selectedItem])

  const initialRangeForEdit = useMemo(() => {
    if (!selectedItem) return null
    const date = selectedItem.start_date || null
    const fmt = (d) => d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : ''
    return {
      date,
      start: selectedItem.start_date ? fmt(selectedItem.start_date) : '',
      end: selectedItem.end_date ? fmt(selectedItem.end_date) : '',
    }
  }, [selectedItem])

  // Reschedule flow from sheet: confirm before applying
  const requestReschedule = (student, date, startTime, endTime) => {
    setPendingRescheduleSelection({ date, start: startTime, end: endTime })
    setIsRescheduleConfirmOpen(true)
  }

  const closeEditConfirm = (open) => {
    if (loadingAction) return
    setIsEditConfirmOpen(open)
  }

  const handleConfirmEditOpen = () => {
    setIsEditConfirmOpen(false)
    setIsEditSheetOpen(true)
  }

  const closeRescheduleConfirm = (open) => {
    if (loadingAction) return
    setIsRescheduleConfirmOpen(open)
  }

  const handleConfirmReschedule = async () => {
    if (!selectedItem?.id || !pendingRescheduleSelection) return
    const { date, start, end } = pendingRescheduleSelection
    try {
      setLoadingAction('reschedule')
      const [startHour, startMinute] = String(start).split(':').map(Number)
      const [endHour, endMinute] = String(end).split(':').map(Number)
      const startDt = new Date(date)
      startDt.setHours(startHour || 0, startMinute || 0, 0, 0)
      const endDt = new Date(date)
      endDt.setHours(endHour || 0, endMinute || 0, 0, 0)

      const response = await axios.put(ADMIN_ENDPOINTS.APPOINTMENTS, {
        appointment_id: selectedItem.id,
        status: 'scheduled',
        time_range: `[${startDt.toISOString()},${endDt.toISOString()})`,
      })
      if (response.status === 200) {
        toast.success(response?.data?.message || 'Appointment rescheduled')
        setIsRescheduleConfirmOpen(false)
        setPendingRescheduleSelection(null)
        fetchAppointments(status)
      } else {
        toast.error(response?.data?.error || response?.data?.message || 'Failed to reschedule appointment')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to reschedule appointment'
      toast.error(message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleMarkMissed = async () => {
    if (!selectedItem?.id) return
    try {
      setLoadingAction('missed')
      const response = await axios.put(ADMIN_ENDPOINTS.APPOINTMENTS, {
        appointment_id: selectedItem.id,
        status: 'missed',
      })
      if (response.status === 200) {
        toast.success(response?.data?.message || 'Student notified of missed appointment')
        // Keep sheet open; refresh to reflect new status if visible elsewhere
        fetchAppointments(status)
      } else {
        toast.error(response?.data?.error || response?.data?.message || 'Failed to mark missed')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to mark missed'
      toast.error(message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleRevertPendingFromSheet = async () => {
    if (!selectedItem?.id) return
    try {
      setLoadingAction('pending')
      const response = await axios.put(ADMIN_ENDPOINTS.APPOINTMENTS, {
        appointment_id: selectedItem.id,
        status: 'pending',
        time_range: null,
      })
      if (response.status === 200) {
        toast.success(response?.data?.message || 'Appointment reverted to pending')
        setIsEditSheetOpen(false)
        setSelectedItem(null)
        fetchAppointments(status)
      } else {
        toast.error(response?.data?.error || response?.data?.message || 'Failed to revert to pending')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to revert to pending'
      toast.error(message)
    } finally {
      setLoadingAction(null)
    }
  }

  return {
  // Data
  loading,
  appointments,

  // Panel state
  status, // 'pending' | 'scheduled'
  setStatus,
  pendingCount,
  scheduledCount,

  // Filters
  searchTerm,
  setSearchTerm: handleSearchChange,
  facultyFilter,
  setFacultyFilter: handleFacultyFilterChange,
  departmentFilter,
  setDepartmentFilter: handleDepartmentFilterChange,
  facultiesData: faculties,
  getDepartments,
  scheduledStatusFilter,
  setScheduledStatusFilter,

  // Pagination
  currentPage,
  setCurrentPage: handlePageChange,
  itemsPerPage,
  totalAppointments: totalAppointmentsCount,
  filteredAppointmentsCount: (status === 'pending' ? pendingList.length : scheduledList.length),

  // Columns & data for current view
  tableColumns: status === 'pending' ? pendingColumns : scheduledColumns,
  tableData: status === 'pending' ? pendingList : scheduledList,

  // Actions
  fetchAppointments,
  // Schedule flow props
  isScheduleConfirmOpen,
  closeScheduleConfirm,
  handleConfirmSchedule,
  isScheduleModalOpen,
  handleScheduleModalOpenChange,
  handleScheduleSubmit,
  selectedStudentForModal,
  // Delete flow props
  isDeleteConfirmOpen,
  closeDeleteConfirm,
  handleConfirmDelete,
  isDeleting,
  // Undo flow props
  isUndoConfirmOpen,
  closeUndoConfirm,
  handleConfirmUndo,
  isUndoing,
  // Complete flow props
  isCompleteConfirmOpen,
  closeCompleteConfirm,
  handleConfirmComplete,
  isCompleting,
  // Edit sheet props
  isEditSheetOpen,
  handleEditSheetOpenChange,
  selectedStudentForEdit,
  initialRangeForEdit,
  requestReschedule,
  isEditConfirmOpen,
  closeEditConfirm,
  handleConfirmEditOpen,
  isRescheduleConfirmOpen,
  closeRescheduleConfirm,
  handleConfirmReschedule,
  handleMarkMissed,
  handleRevertPendingFromSheet,
  loadingAction,
  }
}
