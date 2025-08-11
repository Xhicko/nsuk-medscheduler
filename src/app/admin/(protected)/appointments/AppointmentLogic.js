'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { CalendarPlus, CheckCircle, RotateCcw, Pencil, Trash2 } from 'lucide-react'

export default function AppointmentLogic() {
  // Core data (to be wired to API later)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0)

  // Status panel: 'pending' (no given appointment yet) | 'scheduled' (has appointment)
  const [status, setStatus] = useState('pending')

  // Derive counts from appointments list
  const [pendingCount, setPendingCount] = useState(0)
  const [scheduledCount, setScheduledCount] = useState(0)

  // Do not sync status to URL; keep UI state internal only

  // Fetch appointments (placeholder – wire API later)
  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const searchTimeoutRef = useRef(null)

  // Faculties and departments
  const [faculties, setFaculties] = useState([])
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
      toast.error('Failed to load faculties')
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
      toast.error('Failed to load departments')
    } finally {
      setLoadingDepartments(false)
    }
  }

  const getDepartments = (facultyId) => {
    if (!facultyId) return []
    return departments[facultyId] || []
  }

  const fetchAppointments = async (targetStatus = status, page = currentPage, search = searchTerm, faculty = facultyFilter, department = departmentFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', itemsPerPage.toString())
      if (search && search.trim()) params.append('search', search.trim())
      if (faculty && faculty !== 'all') params.append('faculty', faculty)
      if (department && department !== 'all') params.append('department', department)
      // Send status to get server-side filtered dataset & accurate pagination for the active panel
      if (targetStatus && targetStatus !== 'all') params.append('status', targetStatus)

      const response = await axios.get(`${ADMIN_ENDPOINTS.APPOINTMENTS}?${params.toString()}`)
      if (response.status === 200) {
        const appointmentsFromServer = response.data.appointments || []
        setAppointments(appointmentsFromServer)
        setTotalAppointmentsCount(response.data.pagination?.total || 0)
        // Update toggle badge counts directly from server
        if (response.data.counts) {
          setPendingCount(response.data.counts.pending || 0)
          setScheduledCount(response.data.counts.scheduled || 0)
        }
        // Keep server pagination in sync
        const serverPage = response.data.pagination?.page
        if (serverPage && serverPage !== currentPage) setCurrentPage(serverPage)
      } else {
        setAppointments([])
        setTotalAppointmentsCount(0)
      }

    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to fetch appointments')
      setAppointments([])
      setTotalAppointmentsCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Refresh data when status changes (makes the header buttons useful immediately)
  useEffect(() => {
    fetchAppointments(status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Initial load: fetch appointments + faculties
  useEffect(() => {
    fetchAppointments(status)
    fetchFaculties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load departments when faculty changes
  useEffect(() => {
    if (facultyFilter && facultyFilter !== 'all') {
      fetchDepartmentsForFaculty(facultyFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyFilter])

  // Search handler with debounce
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchAppointments(status, 1, value, facultyFilter, departmentFilter)
    }, 500)
  }

  const handleFacultyFilterChange = (value) => {
    setFacultyFilter(value)
    setDepartmentFilter('all')
    setCurrentPage(1)
    fetchAppointments(status, 1, searchTerm, value, 'all')
  }

  const handleDepartmentFilterChange = (value) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
    fetchAppointments(status, 1, searchTerm, facultyFilter, value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchAppointments(status, page, searchTerm, facultyFilter, departmentFilter)
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
        toast.success('Appointment scheduled successfully')
        setIsScheduleModalOpen(false)
        // Refresh current panel data and counts
        fetchAppointments(status)
      } else {
        toast.error('Failed to schedule appointment')
      }
    } catch (error) {
      const errorMessage = (error?.response?.data?.error) || error?.message || 'Failed to schedule appointment'
      toast.error(errorMessage)
      console.error('Error scheduling appointment:', error)
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
  const scheduledList = useMemo(() => normalizedAppointments.filter((appointmentItem) => (appointmentItem.status || '').toLowerCase() === 'scheduled'), [normalizedAppointments])

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
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            title="Undo appointment"
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
            aria-label="Undo appointment"
          >
            <RotateCcw  className="h-4 w-4" />
          </button>
          <button
            title="Edit appointment"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            aria-label="Edit appointment"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ]

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
  }
}
