'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { CheckCircle, RotateCcw, Pencil, Trash2, BellRing, Filter, RefreshCcw, Search } from 'lucide-react'

export default function ResultLogic(initialData = null) {
  // Core data
  const [results, setResults] = useState(initialData?.results || [])
  const [loading, setLoading] = useState(false)
  const [totalResultsCount, setTotalResultsCount] = useState(initialData?.pagination?.total || 0)

  // Status panel similar to appointments: pending (not notified) | scheduled (not applicable) -> we use 'ready' and 'notified'
  const [status, setStatus] = useState(initialData?.status || 'ready') // 'ready' | 'notified'

  // Derive counts
  const [readyCount, setReadyCount] = useState(initialData?.counts?.ready || 0)
  const [notifiedCount, setNotifiedCount] = useState(initialData?.counts?.notified || 0)

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState(initialData?.filters?.searchTerm ?? '')
  const [facultyFilter, setFacultyFilter] = useState(initialData?.filters?.faculty ?? 'all')
  const [departmentFilter, setDepartmentFilter] = useState(initialData?.filters?.department ?? 'all')
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1)
  const [itemsPerPage] = useState(10)
  const searchTimeoutRef = useRef(null)

  // Faculties and departments
  const [faculties, setFaculties] = useState(initialData?.faculties || [])
  const [departments, setDepartments] = useState({})
  const [facultiesLoading, setFacultiesLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  const fetchFaculties = async () => {
    setFacultiesLoading(true)
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
      if (response.status === 200) {
        const verifiedFaculties = (response.data.faculties || []).filter((f) => f.status === 'verified')
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
          .filter((row) => row.faculty_id === facultyId && row.status === 'verified')
          .map((row) => ({ id: row.id, name: row.name, code: row.code, status: row.status }))
        setDepartments((prev) => ({ ...prev, [facultyId]: departmentsForFaculty }))
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

  const fetchResults = async (
    targetStatus = status,
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

      const response = await axios.get(`${ADMIN_ENDPOINTS.STUDENTS_RESULTS}?${params.toString()}`)
      if (response.status === 200) {
        const resultsFromServer = response.data.results || []
        setResults(resultsFromServer)
        setTotalResultsCount(response.data.pagination?.total || 0)
        if (response.data.counts) {
          setReadyCount(response.data.counts.ready || 0)
          setNotifiedCount(response.data.counts.notified || 0)
        }
        const serverPage = response.data.pagination?.page
        if (serverPage && serverPage !== currentPage) setCurrentPage(serverPage)
      } else {
        setResults([])
        setTotalResultsCount(0)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      const message = error?.response?.data?.error || error?.message || 'Failed to fetch results'
      toast.error(message)
      setResults([])
      setTotalResultsCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Lazy-load departments only when needed
  useEffect(() => {
    if (facultyFilter && facultyFilter !== 'all' && !departments[facultyFilter]) {
      fetchDepartmentsForFaculty(facultyFilter)
    }
  }, [facultyFilter])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchResults(status, 1, value, facultyFilter, departmentFilter)
    }, 500)
  }

  const handleFacultyFilterChange = (value) => {
    setFacultyFilter(value)
    setDepartmentFilter('all')
    setCurrentPage(1)
    fetchResults(status, 1, searchTerm, value, 'all')
  }

  const handleDepartmentFilterChange = (value) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
    fetchResults(status, 1, searchTerm, facultyFilter, value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchResults(status, page, searchTerm, facultyFilter, departmentFilter)
  }
  
  // When status changes via UI toggle, fetch new bucket
  const setStatusAndFetch = (next) => {
    setStatus(next)
    // reset to page 1 on status switch
    setCurrentPage(1)
    fetchResults(next, 1, searchTerm, facultyFilter, departmentFilter)
  }

  // Actions
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteConfirm = (item) => {
    setSelectedItem(item)
    setIsDeleteConfirmOpen(true)
  }
  const closeDeleteConfirm = (open) => {
    if (isDeleting) return
    setIsDeleteConfirmOpen(open)
  }
  const handleConfirmDelete = async () => {
    if (!selectedItem?.id) return
    try {
      setIsDeleting(true)
      const response = await axios.delete(`${ADMIN_ENDPOINTS.STUDENTS_RESULTS}?id=${selectedItem.id}`)
      if (response.status === 200) {
        toast.success(response.data.message || 'Result notification deleted')
        setIsDeleteConfirmOpen(false)
        setSelectedItem(null)
        fetchResults(status)
      } else {
        toast.error(response?.data?.error || 'Failed to delete')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to delete notification'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Notify student about result readiness
  const [isNotifying, setIsNotifying] = useState(false)
  const [isNotifyConfirmOpen, setIsNotifyConfirmOpen] = useState(false)
  const [selectedNotifyItem, setSelectedNotifyItem] = useState(null)
  const openNotifyConfirm = (item) => {
    setSelectedNotifyItem(item)
    setIsNotifyConfirmOpen(true)
  }
  const closeNotifyConfirm = (open) => {
    if (isNotifying) return
    setIsNotifyConfirmOpen(open)
  }
  const handleConfirmNotify = async () => {
    if (!selectedNotifyItem?.id) return
    try {
      setIsNotifying(true)
      const response = await axios.post(ADMIN_ENDPOINTS.STUDENTS_RESULTS, { id: selectedNotifyItem.id })
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || 'Student notified')
        setIsNotifyConfirmOpen(false)
        setSelectedNotifyItem(null)
        fetchResults(status)
      } else {
        toast.error(response?.data?.error || 'Failed to notify')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Failed to notify student'
      toast.error(message)
    } finally {
      setIsNotifying(false)
    }
  }

  // Undo notification (revert to ready)
  const [isUndoing, setIsUndoing] = useState(false)
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false)
  const [selectedUndoItem, setSelectedUndoItem] = useState(null)
  const openUndoConfirm = (item) => {
    setSelectedUndoItem(item)
    setIsUndoConfirmOpen(true)
  }
  const closeUndoConfirm = (open) => {
    if (isUndoing) return
    setIsUndoConfirmOpen(open)
  }
  const handleConfirmUndo = async () => {
    if (!selectedUndoItem?.id) return
    try {
      setIsUndoing(true)
      const response = await axios.put(ADMIN_ENDPOINTS.STUDENTS_RESULTS, { id: selectedUndoItem.id, status: 'ready' })
      if (response.status === 200) {
        toast.success(response?.data?.message || 'Notification reverted')
        setIsUndoConfirmOpen(false)
        setSelectedUndoItem(null)
        fetchResults(status)
      } else {
        toast.error(response?.data?.error || 'Failed to revert')
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to revert')
    } finally {
      setIsUndoing(false)
    }
  }

  const normalizedResults = useMemo(() => {
    return (results || []).map((row) => {
      const student = row?.students || {}
      return {
        id: row.id,
        student_id: row.student_id,
        matric_number: student?.matric_number || 'N/A',
        student_name: student?.full_name || 'N/A',
        faculty_name: student?.faculties?.name || 'N/A',
        department_name: student?.departments?.name || 'N/A',
        result_ready: !!row.result_ready,
        notified: !!row.notified,
        appointment_done_at: row.appointment_done_at,
        notified_at: row.notified_at,
      }
    })
  }, [results])

  const readyList = useMemo(() => normalizedResults.filter((it) => it.result_ready && !it.notified), [normalizedResults])
  const notifiedList = useMemo(() => normalizedResults.filter((it) => it.notified), [normalizedResults])

  const columnsReady = [
    { key: 'matric_number', header: 'Matric Number', render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span> },
    { key: 'student_name', header: 'Student Name', render: (item) => <span className="text-gray-600">{item.student_name}</span> },
    { key: 'department_name', header: 'Department', render: (item) => <span className="text-gray-600">{item.department_name}</span> },
    { key: 'faculty_name', header: 'Faculty', render: (item) => <span className="text-gray-600">{item.faculty_name}</span> },
    {
      key: 'action', header: 'Action', className: 'text-right', render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Notify student"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            aria-label="Notify student"
            onClick={() => openNotifyConfirm(item)}
            disabled={isNotifying}
          >
            <BellRing className="h-4 w-4" />
          </button>
          <button
            title="Delete notification"
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
            aria-label="Delete notification"
            onClick={() => openDeleteConfirm(item)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ]

  const columnsNotified = [
    { key: 'matric_number', header: 'Matric Number', render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span> },
    { key: 'student_name', header: 'Student Name', render: (item) => <span className="text-gray-600">{item.student_name}</span> },
    { key: 'department_name', header: 'Department', render: (item) => <span className="text-gray-600">{item.department_name}</span> },
    { key: 'faculty_name', header: 'Faculty', render: (item) => <span className="text-gray-600">{item.faculty_name}</span> },
    { key: 'notified_at', header: 'Notified At', render: (item) => <span className="text-gray-600">{item.notified_at ? new Date(item.notified_at).toLocaleString() : '—'}</span> },
    {
      key: 'action', header: 'Action', className: 'text-right', render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Undo notification"
            className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
            aria-label="Undo notification"
            onClick={() => openUndoConfirm(item)}
            disabled={isUndoing}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            title="Edit"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            aria-label="Edit"
            onClick={() => toast('Open edit sheet (future)')}
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
    results,

    // Panel
    status,
  setStatus: setStatusAndFetch,
    readyCount,
    notifiedCount,

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
    totalResults: totalResultsCount,
    filteredResultsCount: (status === 'ready' ? readyList.length : notifiedList.length),

    // Table
    tableColumns: status === 'ready' ? columnsReady : columnsNotified,
    tableData: status === 'ready' ? readyList : notifiedList,

    // Actions
    isDeleteConfirmOpen,
    closeDeleteConfirm,
    handleConfirmDelete,
    isDeleting,
  // Notify confirmation
  isNotifyConfirmOpen,
  closeNotifyConfirm,
  handleConfirmNotify,
  isNotifying,

  // Undo confirmation
  isUndoConfirmOpen,
  closeUndoConfirm,
  handleConfirmUndo,
  isUndoing,
  }
}
