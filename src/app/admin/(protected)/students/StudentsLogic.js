'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import useDepartmentsStore from '@/store/admin/departmentsStore'
import { Pencil, Trash2 } from 'lucide-react'

export default function StudentsLogic(initialData){
   // Students management states
   const [students, setStudents] = useState(initialData?.students || [])
   const [loading, setLoading] = useState(false)
   const [selectedStudent, setSelectedStudent] = useState(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [totalStudentsCount, setTotalStudentsCount] = useState(initialData?.pagination?.total || 0)
   
   // Define handleReloadData function for reloading student data
   // This will be passed to StudentUploadModalLogic in the container
   const handleReloadData = () => {
      fetchStudents(currentPage, searchTerm, facultyFilter, departmentFilter, statusFilter)
   }
   
   // Delete confirmation states
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [studentToDelete, setStudentToDelete] = useState(null)
   
   // Edit sheet states
   const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
   const [editingStudent, setEditingStudent] = useState(null)
   const [editFormData, setEditFormData] = useState(null)
   const [editFocusStates, setEditFocusStates] = useState({})
   const [editErrors, setEditErrors] = useState({})
   const [saveLoading, setSaveLoading] = useState(false)
   
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState(initialData?.filters?.searchTerm ?? "")
   const [facultyFilter, setFacultyFilter] = useState(initialData?.filters?.faculty ?? "all")
   const [departmentFilter, setDepartmentFilter] = useState(initialData?.filters?.department ?? "all")
   const [statusFilter, setStatusFilter] = useState(initialData?.filters?.status ?? "all")
   
   // Faculties and departments data from store
   const { 
      faculties, 
      loading: departmentsLoading, 
      getDepartmentsByFaculty 
   } = useDepartmentsStore()
   
   // Derived data for backward compatibility
   const facultiesData = faculties
   const facultiesLoading = departmentsLoading
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1)
   const [itemsPerPage] = useState(10)

   // Helper to get departments for a specific faculty id
   const getDepartments = getDepartmentsByFaculty

   // Fetch students data with pagination
   const fetchStudents = async (page = currentPage, search = searchTerm, faculty = facultyFilter, department = departmentFilter, status = statusFilter) => {
      
      setLoading(true)
      try {
         // Build query parameters
         const params = new URLSearchParams()
         params.append('page', page.toString())
         params.append('limit', itemsPerPage.toString())
         
         if (search && search.trim()) {
            params.append('search', search.trim())
         }
         if (faculty && faculty !== 'all') {
            params.append('faculty', faculty)
         }
         if (department && department !== 'all') {
            params.append('department', department)
         }
         if (status && status !== 'all') {
            params.append('status', status)
         }

         const response = await axios.get(`${ADMIN_ENDPOINTS.STUDENTS}?${params.toString()}`)         
         if(response.status === 200){
            const studentsData = response.data.students || []
            // Flatten the faculty and department data
            const flattenedStudents = studentsData.map(student => ({
               ...student,
               faculty_name: student.faculties?.name || 'N/A',
               department_name: student.departments?.name || 'N/A'
            }))
            setStudents(flattenedStudents)
            setTotalStudentsCount(response.data.pagination?.total || 0)
            
            // Update pagination info from server response
            if (response.data.pagination) {
               const serverPage = response.data.pagination.page
               
               // Only update current page if it's different to avoid infinite loops
               if (serverPage !== currentPage) {
                  setCurrentPage(serverPage)
               }
            }
         } else {
            setStudents([])
            setTotalStudentsCount(0)
         }
      } catch (error) {
         console.error('Error fetching students:', error)
         setStudents([])
         setTotalStudentsCount(0)
         toast.error("Failed to fetch students data")
      } finally {
         setLoading(false)
      }
   }

   // Delete student
   const handleDeleteStudent = async (studentId) => {
      setDeleteLoading(true)
      try {
         const response = await axios.delete(`${ADMIN_ENDPOINTS.STUDENTS}?id=${studentId}`)
         if(response.status === 200){
            toast.success("Student deleted successfully")
            // Refresh with current filters and pagination
            fetchStudents(currentPage, searchTerm, facultyFilter, departmentFilter, statusFilter)
            // Close modal only after successful deletion
            closeDeleteModal()
         }
      } catch (error) {
         console.error('Error deleting student:', error)
         toast.error("Failed to delete student")
      } finally {
         setDeleteLoading(false)
      }
   }

   // Server-side pagination 
   const currentStudents = students // Use students directly from server
   const totalPages = Math.ceil(totalStudentsCount / itemsPerPage)

   // Search debounce timer ref
   const searchTimeoutRef = useRef(null)

   // Handle filter changes - these will trigger direct API calls
   const handleSearchChange = (value) => {
      setSearchTerm(value)
      setCurrentPage(1) // Reset to first page when search changes
      
      // Clear existing timeout
      if (searchTimeoutRef.current) {
         clearTimeout(searchTimeoutRef.current)
      }
      
      // Debounce search calls
      searchTimeoutRef.current = setTimeout(() => {
         fetchStudents(1, value, facultyFilter, departmentFilter, statusFilter)
      }, 500)
   }

   const handleFacultyFilterChange = (value) => {
      setFacultyFilter(value)
      setDepartmentFilter("all") // Reset department when faculty changes
      setCurrentPage(1) // Reset to first page when filter changes
      // Immediate call for filter changes
      fetchStudents(1, searchTerm, value, "all", statusFilter)
   }

   const handleDepartmentFilterChange = (value) => {
      setDepartmentFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
      // Immediate call for filter changes
      fetchStudents(1, searchTerm, facultyFilter, value, statusFilter)
   }

   const handleStatusFilterChange = (value) => {
      setStatusFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
      // Immediate call for filter changes
      fetchStudents(1, searchTerm, facultyFilter, departmentFilter, value)
   }

   const handlePageChange = (page) => {
      setCurrentPage(page)
      // Immediate call for pagination
      fetchStudents(page, searchTerm, facultyFilter, departmentFilter, statusFilter)
   }
   
   const openDeleteModal = (student) => {
      setStudentToDelete(student)
      setIsDeleteModalOpen(true)
   }

   const closeDeleteModal = () => {
      // Only close if not currently deleting
      if (!deleteLoading) {
         setIsDeleteModalOpen(false)
         setStudentToDelete(null)
      }
   }

   const handleConfirmDelete = () => {
      if (studentToDelete) {
         handleDeleteStudent(studentToDelete.id)
      }
   }

   const closeModal = () => {
      setIsModalOpen(false)
      setSelectedStudent(null)
   }

   // Handle edit sheet actions
   const openEditSheet = (student) => {
      setEditingStudent(student)
      setEditFormData({
         ...student,
         matricNumber: student.matric_number,
         fullName: student.full_name,
         institutionalEmail: student.institutional_email,
         departmentId: student.department_id,
         facultyId: student.faculty_id,
         gender: student.gender || '',
         religion: student.religion || '',
         isVerified: student.signup_status === 'verified'
      })
      setEditFocusStates({})
      setEditErrors({})
      setIsEditSheetOpen(true)
   }

   const closeEditSheet = () => {
      setIsEditSheetOpen(false)
      setEditingStudent(null)
      setEditFormData(null)
      setEditFocusStates({})
      setEditErrors({})
   }

   const handleEditFormChange = (e) => {
      const { id, value } = e.target
      setEditFormData((prev) => (prev ? { ...prev, [id]: value } : null))
      // Clear error for the field when typing
      setEditErrors((prev) => ({ ...prev, [id]: null }))
   }

   const handleEditSelectChange = (value, field) => {
      if (field === "isVerified") {
         setEditFormData((prev) => (prev ? { ...prev, [field]: value === "true" } : null))
      } else {
         setEditFormData((prev) => (prev ? { ...prev, [field]: value } : null))
         
         // Reset department when faculty changes
         if (field === "facultyId") {
            setEditFormData((prev) => (prev ? { ...prev, departmentId: "" } : null))
         }
      }
   }

   const setEditFocusState = (field, focused) => {
      setEditFocusStates((prev) => ({
         ...prev,
         [field]: focused,
      }))
   }

   const validateEditForm = () => {
      const newErrors = {}
      let isValid = true

      if (!editFormData?.matricNumber?.trim()) {
         newErrors.matricNumber = { message: "Matric Number is required" }
         isValid = false
      }
      if (!editFormData?.fullName?.trim()) {
         newErrors.fullName = { message: "Full Name is required" }
         isValid = false
      }
      
      // Validate institutional email
      if (!editFormData?.institutionalEmail?.trim()) {
         newErrors.institutionalEmail = { message: "Institutional email is required" }
         isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.institutionalEmail)) {
         newErrors.institutionalEmail = { message: "Invalid email format" }
         isValid = false
      }
      
      if (!editFormData?.departmentId?.trim()) {
         newErrors.departmentId = { message: "Department is required" }
         isValid = false
      }
      if (!editFormData?.facultyId?.trim()) {
         newErrors.facultyId = { message: "Faculty is required" }
         isValid = false
      }
      
      // Validate gender if provided
      if (editFormData?.gender && !['male', 'female'].includes(editFormData.gender.toLowerCase())) {
         newErrors.gender = { message: "Gender must be either 'male' or 'female'" }
         isValid = false
      }
      
      // Validate religion if provided
      if (editFormData?.religion && !['Christian', 'Muslim'].includes(editFormData.religion)) {
         newErrors.religion = { message: "Religion must be either 'Christian' or 'Muslim'" }
         isValid = false
      }

      setEditErrors(newErrors)
      return isValid
   }

   const isEditFieldValid = (field) => {
      return !editErrors[field] && editFormData?.[field]?.length > 0
   }

   const handleSaveStudent = async (formData) => {
      if (!validateEditForm()) return

      setSaveLoading(true)
      try {
         const updateData = {
            matricNumber: formData.matricNumber,
            fullName: formData.fullName,
            institutionalEmail: formData.institutionalEmail,
            facultyId: formData.facultyId,
            departmentId: formData.departmentId,
            gender: formData.gender,
            religion: formData.religion,
            signupStatus: formData.isVerified ? 'verified' : 'pending'
         }

         const response = await axios.put(`${ADMIN_ENDPOINTS.STUDENTS}?id=${editingStudent.id}`, updateData)
         
         if (response.status === 200) {
            toast.success("Student updated successfully")
            // Refresh with current filters and pagination  
            fetchStudents(currentPage, searchTerm, facultyFilter, departmentFilter, statusFilter)
            closeEditSheet()
         }
      } catch (error) {
         console.error('Error updating student:', error)
         toast.error("Failed to update student")
      } finally {
         setSaveLoading(false)
      }
   }

   const handleEditSubmit = (e) => {
      e.preventDefault()
      if (editFormData && validateEditForm()) {
         handleSaveStudent(editFormData)
      }
   }


   // Status color helper
   const getStatusColor = (status) => {
      return status === 'verified'
         ? "bg-emerald-50 text-emerald-700 border-emerald-200"
         : "bg-amber-50 text-amber-700 border-amber-200"
   }
   

   // Actions handlers
   const handleEditClick = (student) => {
      setSelectedStudent(student)
      setIsModalOpen(true)
   }

   const handleConfirmEdit = () => {
      setIsModalOpen(false)
      openEditSheet(selectedStudent)
   }

   const handleDeleteClick = (student) => {
      openDeleteModal(student)
   }

   // Table columns configuration
   const studentsColumns = [
      {
         key: "matric_number",
         header: "Matric Number",
         render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span>,
      },
      {
         key: "full_name",
         header: "Full Name", 
         render: (item) => <span className="text-gray-600">{item.full_name}</span>,
      },
      {
         key: "institutional_email",
         header: "Email",
         render: (item) => <span className="text-gray-600">{item.institutional_email || 'N/A'}</span>,
      },
      {
         key: "department_name",
         header: "Department",
         render: (item) => <span className="text-gray-600">{item.department_name}</span>,
      },
      {
         key: "faculty_name",
         header: "Faculty",
         render: (item) => <span className="text-gray-600">{item.faculty_name}</span>,
      },
      {
         key: "signup_status",
         header: "Status",
         render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.signup_status)}`}>
               {item.signup_status === 'verified' ? 'Verified' : 'Pending'}
            </span>
         ),
      },
      {
         key: "action",
         header: "Action",
         render: (item) => (
            <div className="flex items-center gap-2">
               <button
                  onClick={() => handleEditClick(item)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
                  title="Edit Student"
               >
                  <Pencil className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleDeleteClick(item)}
                  className="text-red-600 hover:text-red-800 p-1 cursor-pointer rounded"
                  title="Delete Student"
               >
                  <Trash2 className="h-4 w-4" />
               </button>
            </div>
         ),
         className: "text-right",
      },
   ]


   return {
      // Data
      students: currentStudents,
      allStudents: students,
      loading,
      selectedStudent,
      isModalOpen,
      deleteLoading,
      
      // Table configuration
      studentsColumns,
      getStatusColor,
      
      // Edit sheet data
      isEditSheetOpen,
      editingStudent,
      editFormData,
      editFocusStates,
      editErrors,
      saveLoading,
      
      // Faculties and departments data
      facultiesData,
      facultiesLoading,
      getDepartments,
      
      // Search and filters
      searchTerm,
      setSearchTerm: handleSearchChange,
      facultyFilter,
      setFacultyFilter: handleFacultyFilterChange,
      departmentFilter,
      setDepartmentFilter: handleDepartmentFilterChange,
      statusFilter,
      setStatusFilter: handleStatusFilterChange,
      
      // Pagination
      currentPage,
      setCurrentPage: handlePageChange,
      totalPages,
      itemsPerPage,
      totalStudents: totalStudentsCount,
      filteredStudentsCount: students.length, // Current page count
      
      // Actions
      handleDeleteStudent,
      openDeleteModal,
      closeModal,
      
      // Delete confirmation states
      isDeleteModalOpen,
      studentToDelete,
      closeDeleteModal,
      handleConfirmDelete,
      
      // Edit actions
      openEditSheet,
      closeEditSheet,
      handleEditFormChange,
      handleEditSelectChange,
      setEditFocusState,
      validateEditForm,
      isEditFieldValid,
      handleSaveStudent,
      handleEditSubmit,
      handleReloadData,
      fetchStudents,
      handleEditClick,
      handleConfirmEdit,
      handleDeleteClick,
      
      // No upload modal logic here - it's passed directly to the view
   }
}
