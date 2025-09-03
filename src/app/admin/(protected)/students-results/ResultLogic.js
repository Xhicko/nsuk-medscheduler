'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { RotateCcw, Pencil, Trash2, BellRing} from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'


// Zod schema for  results validation
const resultsSchema = z.object({
  bloodGroup: z.string().min(1, 'Blood group is required'),
  genotype: z.string().min(1, 'Genotype is required'),
  hemoglobinStatus: z.string().min(1, 'Hemoglobin status is required'),
  hemoglobinValue: z.string().min(1, 'Hemoglobin value is required'),
  wbcStatus: z.string().min(1, 'WBC status is required'),
  wbcValue: z.string().min(1, 'WBC value is required'),
  plateletsStatus: z.string().min(1, 'Platelets status is required'),
  plateletsValue: z.string().min(1, 'Platelets value is required'),
  bloodSugarStatus: z.string().min(1, 'Blood sugar status is required'),
  bloodSugarValue: z.string().min(1, 'Blood sugar value is required'),
  hivResult: z.string().min(1, 'HIV result is required'),
  hepatitisBResult: z.string().min(1, 'Hepatitis B result is required'),
  hepatitisCResult: z.string().min(1, 'Hepatitis C result is required'),
}).refine((data) => {
  // Hemoglobin: both status and value must be provided
  if (!data.hemoglobinStatus || !data.hemoglobinValue) {
    return false
  }
  return true
}, {
  message: "Hemoglobin status and value are both required",
  path: ["hemoglobinStatus"]
}).refine((data) => {
  // WBC: both status and value must be provided
  if (!data.wbcStatus || !data.wbcValue) {
    return false
  }
  return true
}, {
  message: "WBC status and value are both required",
  path: ["wbcStatus"]
}).refine((data) => {
  // Platelets: both status and value must be provided
  if (!data.plateletsStatus || !data.plateletsValue) {
    return false
  }
  return true
}, {
  message: "Platelets status and value are both required",
  path: ["plateletsStatus"]
}).refine((data) => {
  // Blood sugar: both status and value must be provided
  if (!data.bloodSugarStatus || !data.bloodSugarValue) {
    return false
  }
  return true
}, {
  message: "Blood sugar status and value are both required",
  path: ["bloodSugarStatus"]
})

export default function ResultLogic(initialData = null) {

     // React Hook Form setup for create/notify
     const sheetResultForm = useForm({
       resolver: zodResolver(resultsSchema),
       mode: 'onChange', 
       reValidateMode: 'onChange',
       defaultValues: {
         bloodGroup: '',
         genotype: '',
         hemoglobinStatus: '',
         hemoglobinValue: '',
         wbcStatus: '',
         wbcValue: '',
         plateletsStatus: '',
         plateletsValue: '',
         bloodSugarStatus: '',
         bloodSugarValue: '',
         hivResult: '',
         hepatitisBResult: '',
         hepatitisCResult: ''
       }
     })

     // React Hook Form setup for editing existing results
     const editResultForm = useForm({
       resolver: zodResolver(resultsSchema),
       mode: 'onChange', 
       reValidateMode: 'onChange',
       defaultValues: {
         bloodGroup: '',
         genotype: '',
         hemoglobinStatus: '',
         hemoglobinValue: '',
         wbcStatus: '',
         wbcValue: '',
         plateletsStatus: '',
         plateletsValue: '',
         bloodSugarStatus: '',
         bloodSugarValue: '',
         hivResult: '',
         hepatitisBResult: '',
         hepatitisCResult: ''
       }
     })

   const processForms = (formsData = []) => {
      return (formsData || []).map(form => ({
         ...form,
         student_name: form.students?.full_name || 'N/A',
         matric_number: form.students?.matric_number || 'N/A',
         faculty_name: form.students?.faculties?.name || 'N/A',
         department_name: form.students?.departments?.name || 'N/A',
         submitted_date: form.submitted_at ? new Date(form.submitted_at).toLocaleDateString() : 'N/A',
         submitted_time: form.submitted_at ? new Date(form.submitted_at).toLocaleTimeString() : ''
      }))
   }

  // Core data
  const [results, setResults] = useState(() => processForms(initialData?.results || []))
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
  toast.error(getApiErrorMessage(error, 'Failed to load faculties'))
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
  toast.error(getApiErrorMessage(error, 'Failed to load departments'))
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
        setResults(processForms(resultsFromServer))
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
  toast.error(getApiErrorMessage(error, 'Failed to fetch results'))
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

  //Delete Actions
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
  toast.error(getApiErrorMessage(error, 'Failed to delete notification'))
    } finally {
      setIsDeleting(false)
    }
  }


//   Notify Actions
   const [openResultToNotify, setOpenResultToNotify] = useState(false)
   const [ResultToNotify, setResultToNotify] = useState(null)
   const [isResultSheetOpen, setIsResultSheetOpen] = useState(false)
   const [saveLoading, setSaveLoading] = useState(false)

  // Edit Actions
  const [isEditResultSheetOpen, setIsEditResultSheetOpen] = useState(false)
  const [resultToEdit, setResultToEdit] = useState(null)
  const [editSaveLoading, setEditSaveLoading] = useState(false)
  
  // Edit confirmation
  const [openEditConfirm, setOpenEditConfirm] = useState(false)
  const [resultToEditConfirm, setResultToEditConfirm] = useState(null)

  const openResultForm = (result) => {
    // Keep confirmation flow (existing behavior)
    setResultToNotify(result)
    setOpenResultToNotify(true)
  }

   const closeResultConfirm = () => {
      setOpenResultToNotify(false)
   }

   const handleConfirmResult = () => {
      if (ResultToNotify) {
         openResultSheet(ResultToNotify)
      }
      closeResultConfirm()
   }

  const openResultSheet = (studentResult) => {
    if (!studentResult) return
    // Normalize and store selected result to allow sheet to reference directly
    setResultToNotify(studentResult)
    const existingData = {
      bloodGroup: studentResult.blood_group || '',
      genotype: studentResult.genotype || '',
      hemoglobinStatus: studentResult.hemoglobin_status || '',
      hemoglobinValue: studentResult.hemoglobin_value?.toString() || '',
      wbcStatus: studentResult.wbc_status || '',
      wbcValue: studentResult.wbc_value?.toString() || '',
      plateletsStatus: studentResult.platelets_status || '',
      plateletsValue: studentResult.platelets_value?.toString() || '',
      bloodSugarStatus: studentResult.blood_sugar_status || '',
      bloodSugarValue: studentResult.blood_sugar_value?.toString() || '',
      hivResult: studentResult.hiv_result || '',
      hepatitisBResult: studentResult.hepatitis_b_result || '',
      hepatitisCResult: studentResult.hepatitis_c_result || ''
    }
    sheetResultForm.reset(existingData)
    setIsResultSheetOpen(true)
  }

   const closeResultSheet = () => {
      setIsResultSheetOpen(false)  
      sheetResultForm.reset()
      // Clear the selected result when sheet is closed
      setResultToNotify(null)
   }

  const handleResultClick = (studentResult) => {
    openResultForm(studentResult)
  }

  // Edit handlers
  const openEditConfirmDialog = (studentResult) => {
    setResultToEditConfirm(studentResult)
    setOpenEditConfirm(true)
  }

  const closeEditConfirm = () => {
    setOpenEditConfirm(false)
    setResultToEditConfirm(null)
  }

  const handleConfirmEdit = () => {
    if (resultToEditConfirm) {
      openEditResultSheet(resultToEditConfirm)
    }
    closeEditConfirm()
  }

  const openEditResultSheet = (studentResult) => {
    if (!studentResult) return
    
    setResultToEdit(studentResult)
    const existingData = {
      bloodGroup: studentResult.blood_group || '',
      genotype: studentResult.genotype || '',
      hemoglobinStatus: studentResult.hemoglobin_status || '',
      hemoglobinValue: studentResult.hemoglobin_value?.toString() || '',
      wbcStatus: studentResult.wbc_status || '',
      wbcValue: studentResult.wbc_value?.toString() || '',
      plateletsStatus: studentResult.platelets_status || '',
      plateletsValue: studentResult.platelets_value?.toString() || '',
      bloodSugarStatus: studentResult.blood_sugar_status || '',
      bloodSugarValue: studentResult.blood_sugar_value?.toString() || '',
      hivResult: studentResult.hiv_result || '',
      hepatitisBResult: studentResult.hepatitis_b_result || '',
      hepatitisCResult: studentResult.hepatitis_c_result || ''
    }
    editResultForm.reset(existingData)
    setIsEditResultSheetOpen(true)
  }

  const closeEditResultSheet = () => {
    setIsEditResultSheetOpen(false)
    editResultForm.reset()
    setResultToEdit(null)
  }

  const handleEditResultClick = (studentResult) => {
    openEditConfirmDialog(studentResult)
  }


     // Handle form submission with RHF
  const handleSubmitResults = async (resultFormData) => {
    if (!ResultToNotify?.id) return

    try {
      setSaveLoading(true)
      const response = await axios.post(ADMIN_ENDPOINTS.STUDENTS_RESULTS, {
        id: ResultToNotify.id,
        resultData: resultFormData
      })
      
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || 'Error:Results saved and student notified successfully')
        closeResultSheet()
        setResultToNotify(null)
        fetchResults(status) 
      } else {
        toast.error(response?.data?.error || 'Error: Failed to save results')
      }
    } 
    catch (error) {
      toast.error(getApiErrorMessage(error, 'Error: Failed to save results and notify student'))
    } 
    finally {
      setSaveLoading(false)
    }
  }

  // Handle edit form submission
  const handleEditSubmitResults = async (editFormData) => {
    if (!resultToEdit?.id) return

    try {
      setEditSaveLoading(true)
      console.log('Submitting edit results Data:', editFormData);

      const response = await axios.put(ADMIN_ENDPOINTS.STUDENTS_RESULTS, {
        id: resultToEdit.id,
        resultData: editFormData,
        action: 'update_results'
      })
      
      if (response.status === 200) {
        toast.success(response.data.message || 'Results updated successfully')
        closeEditResultSheet()
        setResultToEdit(null)
        fetchResults(status) 
      } else {
        toast.error(response?.data?.error || 'Failed to update results')
      }
    } 
    catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update results'))
    } 
    finally {
      setEditSaveLoading(false)
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
  toast.error(getApiErrorMessage(error, 'Failed to revert notification'))
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
         // Include medical result fields for editing
        blood_group: row.blood_group,
        genotype: row.genotype,
        hemoglobin_status: row.hemoglobin_status,
        hemoglobin_value: row.hemoglobin_value,
        wbc_status: row.wbc_status,
        wbc_value: row.wbc_value,
        platelets_status: row.platelets_status,
        platelets_value: row.platelets_value,
        blood_sugar_status: row.blood_sugar_status,
        blood_sugar_value: row.blood_sugar_value,
        hiv_result: row.hiv_result,
        hepatitis_b_result: row.hepatitis_b_result,
        hepatitis_c_result: row.hepatitis_c_result,
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
            title="Notify Student"
            className="text-[#0077B6] hover:text-[#0077B6]/90 p-1 rounded cursor-pointer"
            onClick={() => handleResultClick(item)}
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
            onClick={() => handleEditResultClick(item)}
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
    selectedItem,

  // Notify confirmation
   handleConfirmResult,
   closeResultConfirm,
   openResultToNotify,
   ResultToNotify,
  normalizedResults,
  handleResultClick,

   //Result sheet States
   isResultSheetOpen,
   closeResultSheet,
   saveLoading,
   sheetResultForm,
   handleSubmitResults,

  // Edit result sheet states
  isEditResultSheetOpen,
  closeEditResultSheet,
  editSaveLoading,
  editResultForm,
  handleEditSubmitResults,
  resultToEdit,

  // Edit confirmation
  openEditConfirm,
  closeEditConfirm,
  handleConfirmEdit,
  resultToEditConfirm,

  // Undo confirmation
  isUndoConfirmOpen,
  closeUndoConfirm,
  handleConfirmUndo,
  isUndoing,
  selectedUndoItem,
  }
}
