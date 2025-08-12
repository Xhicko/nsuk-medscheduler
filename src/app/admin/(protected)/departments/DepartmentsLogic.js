'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast' 
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function DepartmentsLogic(initialData){
   // Departments management states
   const [departments, setDepartments] = useState(initialData?.departments || [])
   const [loading, setLoading] = useState(false)
   const [selectedDepartment, setSelectedDepartment] = useState(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [totalDepartmentsCount, setTotalDepartmentsCount] = useState(initialData?.departments?.length || 0)
   
   // Delete confirmation states
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [departmentToDelete, setDepartmentToDelete] = useState(null)
   
   // Add/Edit sheet states
   const [isAddEditSheetOpen, setIsAddEditSheetOpen] = useState(false)
   const [editingDepartment, setEditingDepartment] = useState(null)
   const [formData, setFormData] = useState(null)
   const [focusStates, setFocusStates] = useState({})
   const [errors, setErrors] = useState({})
   const [saveLoading, setSaveLoading] = useState(false)
   const [isEditMode, setIsEditMode] = useState(false)
   
   // Faculties data for selection
   const [facultiesData, setFacultiesData] = useState(initialData?.faculties || [])
   const [facultiesLoading, setFacultiesLoading] = useState(false)
   
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState("")
   const [statusFilter, setStatusFilter] = useState("all")
   const [facultyFilter, setFacultyFilter] = useState("all")
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(1)
   const [itemsPerPage] = useState(10)
   
   // Fetch departments data
   const fetchDepartments = async () => {
      setLoading(true)
      try {
         const response = await axios.get(ADMIN_ENDPOINTS.DEPARTMENTS)         
         if(response.status === 200){
            // API returns either {departments} or {faculties, departments}
            const responseData = response.data
            
            let departmentsData = []
            if (responseData.departments) {
               // Use departments data directly
               departmentsData = responseData.departments
            } else if (responseData.faculties) {
               // Extract departments from faculties structure
               departmentsData = []
               responseData.faculties.forEach(faculty => {
                  if (faculty.departments && Array.isArray(faculty.departments)) {
                     // Add faculty name to each department
                     const depsWithFaculty = faculty.departments.map(dept => ({
                        ...dept,
                        faculty_name: faculty.name
                     }))
                     departmentsData = [...departmentsData, ...depsWithFaculty]
                  }
               })
            }
            
            setDepartments(departmentsData)
            setTotalDepartmentsCount(departmentsData.length)
         } else {
            setDepartments([])
            setTotalDepartmentsCount(0)
         }
      } catch (error) {
         console.error('Error fetching departments:', error)
         setDepartments([])
         setTotalDepartmentsCount(0)
         toast.error("Failed to fetch departments data")
      } finally {
         setLoading(false)
      }
   }

   // Fetch faculties data for selection
   const fetchFaculties = async () => {
      setFacultiesLoading(true)
      try {
         const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
         if(response.status === 200){
            const facultiesData = response.data.faculties || []
            setFacultiesData(facultiesData)
         } else {
            setFacultiesData([])
         }
      } catch (error) {
         console.error('Error fetching faculties:', error)
         setFacultiesData([])
         toast.error("Failed to fetch faculties data")
      } finally {
         setFacultiesLoading(false)
      }
   }

   // Delete department
   const handleDeleteDepartment = async (departmentId) => {
      setDeleteLoading(true)
      try {
         const response = await axios.delete(`${ADMIN_ENDPOINTS.DEPARTMENTS}?id=${departmentId}`)
         if(response.status === 200){
            toast.success("Department deleted successfully")
            fetchDepartments()
            closeDeleteModal()
         }
      } catch (error) {
         console.error('Error deleting department:', error)
         const errorMessage = error.response?.data?.error || "Failed to delete department"
         toast.error(errorMessage)
      } finally {
         setDeleteLoading(false)
      }
   }

   // Client-side filtering and pagination
   const filteredDepartments = departments.filter(department => {
      const matchesSearch = !searchTerm || (
         department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (department.code && department.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      
      const matchesStatus = statusFilter === "all" || department.status === statusFilter
      const matchesFaculty = facultyFilter === "all" || department.faculty_id === facultyFilter
      
      return matchesSearch && matchesStatus && matchesFaculty
   })

   const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)
   const startIndex = (currentPage - 1) * itemsPerPage
   const currentDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage)
   
   // Search debounce timer ref
   const searchTimeoutRef = useRef(null)

   // Handle search and filter changes
   const handleSearchChange = (value) => {
      setSearchTerm(value)
      setCurrentPage(1) // Reset to first page when search changes
   }

   const handleStatusFilterChange = (value) => {
      setStatusFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
   }

   const handleFacultyFilterChange = (value) => {
      setFacultyFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
   }

   const handlePageChange = (page) => {
      setCurrentPage(page)
   }

   // Initial data fetch
   // No initial fetch on mount; initialData seeds the table. Fetch only on user actions.
   
   const openDeleteModal = (department) => {
      setDepartmentToDelete(department)
      setIsDeleteModalOpen(true)
   }

   const closeDeleteModal = () => {
      if (!deleteLoading) {
         setIsDeleteModalOpen(false)
         setDepartmentToDelete(null)
      }
   }

   const handleConfirmDelete = () => {
      if (departmentToDelete) {
         handleDeleteDepartment(departmentToDelete.id)
      }
   }

   const closeModal = () => {
      setIsModalOpen(false)
      setSelectedDepartment(null)
   }

   // Handle add/edit sheet actions
   const openAddSheet = () => {
      if (facultiesData.length === 0) {
         toast.error("No verified faculties available. Please create and verify faculties first.")
         return
      }
      
      setIsEditMode(false)
      setEditingDepartment(null)
      setFormData({
         name: '',
         code: '',
         faculty_id: '',
         status: 'pending' // Default status for new departments
      })
      setFocusStates({})
      setErrors({})
      setIsAddEditSheetOpen(true)
   }

   const openEditSheet = (department) => {
      setIsEditMode(true)
      setEditingDepartment(department)
      setFormData({
         name: department.name,
         code: department.code || '',
         faculty_id: department.faculty_id,
         status: department.status
      })
      setFocusStates({})
      setErrors({})
      setIsAddEditSheetOpen(true)
   }

   const closeAddEditSheet = () => {
      setIsAddEditSheetOpen(false)
      setEditingDepartment(null)
      setFormData(null)
      setFocusStates({})
      setErrors({})
      setIsEditMode(false)
   }

   const handleFormChange = (e) => {
      const { id, value } = e.target
      setFormData((prev) => (prev ? { ...prev, [id]: value } : null))
      // Clear error for the field when typing
      setErrors((prev) => ({ ...prev, [id]: null }))
   }

   const handleSelectChange = (value, field) => {
      setFormData((prev) => {
         if (!prev) return null
         
         const newData = { ...prev, [field]: value }
         
         return newData
      })
      // Clear error for the field when changing
      setErrors((prev) => ({ ...prev, [field]: null }))
   }

   const setFocusState = (field, focused) => {
      setFocusStates({
         ...focusStates,
         [field]: focused
      })
   }

   const validateForm = () => {
      const newErrors = {}
      let isValid = true

      if (!formData?.name?.trim()) {
         newErrors.name = { message: "Department name is required" }
         isValid = false
      }
      if (!formData?.faculty_id) {
         newErrors.faculty_id = { message: "Faculty selection is required" }
         isValid = false
      }
      
      // Additional validation for verified departments in edit mode
      if (isEditMode && editingDepartment && editingDepartment.status === 'verified') {
         // If department is currently verified and status is not being changed to pending,
         // prevent name/code/faculty changes
         if (formData.status === 'verified') {
            if (formData.name !== editingDepartment.name) {
               newErrors.name = { message: "Cannot change name of verified department. Change status to pending first." }
               isValid = false
            }
            if (formData.code !== editingDepartment.code) {
               newErrors.code = { message: "Cannot change code of verified department. Change status to pending first." }
               isValid = false
            }
            if (formData.faculty_id !== editingDepartment.faculty_id) {
               newErrors.faculty_id = { message: "Cannot change faculty of verified department. Change status to pending first." }
               isValid = false
            }
         }
      }

      setErrors(newErrors)
      return isValid
   }
   
   const isFieldValid = (field) => {
      return !errors[field] && formData?.[field]?.length > 0
   }

   const handleSaveDepartment = async (data) => {
      if (!validateForm()) return

      setSaveLoading(true)
      try {
         const saveData = {
            name: data.name.trim(),
            code: data.code?.trim() || null, // Make code optional
            faculty_id: data.faculty_id
         }

         // Include status if updating
         if (isEditMode && data.status) {
            saveData.status = data.status
         }

         let response
         if (isEditMode && editingDepartment) {
            // Update existing department
            response = await axios.put(ADMIN_ENDPOINTS.DEPARTMENTS, {
               id: editingDepartment.id,
               ...saveData
            })
         } else {
            // Create new department
            response = await axios.post(ADMIN_ENDPOINTS.DEPARTMENTS, saveData)
         }
         
         if (response.status === 200 || response.status === 201) {
            toast.success(isEditMode ? "Department updated successfully" : "Department created successfully")
            // Refresh data after save
            fetchDepartments()
            fetchFaculties()
            closeAddEditSheet()
         }
      } catch (error) {
         console.error('Error saving department:', error)
         const errorMessage = error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} department`
         toast.error(errorMessage)
      } finally {
         setSaveLoading(false)
      }
   }

   const handleFormSubmit = (e) => {
      e.preventDefault()
      if (formData && validateForm()) {
         handleSaveDepartment(formData)
      }
   }

   // Handle reload data
   const handleReloadData = () => {
      fetchDepartments()
      fetchFaculties()
   }

   // Actions handlers
   const handleEditClick = (department) => {
      // Allow editing of all departments - status can be changed to pending if needed
      setSelectedDepartment(department)
      setIsModalOpen(true)
   }

   const handleConfirmEdit = () => {
      setIsModalOpen(false)
      openEditSheet(selectedDepartment)
   }

   const handleDeleteClick = (department) => {
      // Only allow deletion of pending departments
      if (department.status === 'verified') {
         toast.error("Verified departments cannot be deleted. Change status to pending first.")
         return
      }
      openDeleteModal(department)
   }

   // Status color helper
   const getStatusColor = (status) => {
      return status === 'verified'
         ? "bg-emerald-50 text-emerald-700 border-emerald-200"
         : "bg-amber-50 text-amber-700 border-amber-200"
   }

  // Get faculty name helper
  const getFacultyName = (facultyId) => {
      if (!facultyId) return 'No Faculty Assigned';
      const faculty = facultiesData.find(f => f.id === facultyId);
      return faculty ? faculty.name : 'Unknown Faculty';
  }   // Table columns configuration
   const departmentsColumns = [
       {
         key: "faculty_name",
         header: "Faculty",
         render: (item) => (
            <span className="text-gray-600">
               {item.faculty_name || getFacultyName(item.faculty_id)}
            </span>
         ),
      },
      {
         key: "name",
         header: "Department Name",
         render: (item) => <span className="font-medium text-gray-900">{item.name}</span>,
      },
      {
         key: "code",
         header: "Department Code", 
         render: (item) => <span className="text-gray-600 font-mono">{item.code || 'N/A'}</span>,
      },
      {
         key: "created_at",
         header: "Created Date",
         render: (item) => (
            <span className="text-gray-600">
               {new Date(item.created_at).toLocaleDateString()}
            </span>
         ),
      },
      {
         key: "status",
         header: "Status",
         render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
               {item.status === 'verified' ? 'Verified' : 'Pending'}
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
                  title="Edit Department"
               >
                  <Pencil className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleDeleteClick(item)}
                  className={`p-1 rounded cursor-pointer ${
                     item.status === 'verified' 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-800'
                  }`}
                  title={item.status === 'verified' ? 'Verified departments cannot be deleted' : 'Delete Department'}
                  disabled={item.status === 'verified'}
               >
                  <Trash2 className="h-4 w-4" />
               </button>
            </div>
         ),
         className: "text-right",
      },
   ]

   // Initial load
   useEffect(() => {
      fetchDepartments()
      fetchFaculties()
   }, [])

   return {
      // Data
      departments: currentDepartments,
      allDepartments: departments,
      loading,
      selectedDepartment,
      isModalOpen,
      deleteLoading,
      
      // Table configuration
      departmentsColumns,
      getStatusColor,
      getFacultyName,
      
      // Add/Edit sheet data
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
      
      // Search and filters
      searchTerm,
      setSearchTerm: handleSearchChange,
      statusFilter,
      setStatusFilter: handleStatusFilterChange,
      facultyFilter,
      setFacultyFilter: handleFacultyFilterChange,
      
      // Pagination
      currentPage,
      setCurrentPage: handlePageChange,
      totalPages,
      itemsPerPage,
      totalDepartments: totalDepartmentsCount,
      filteredDepartmentsCount: filteredDepartments.length,
      
      // Actions
      handleDeleteDepartment,
      openDeleteModal,
      closeModal,
      
      // Delete confirmation states
      isDeleteModalOpen,
      departmentToDelete,
      closeDeleteModal,
      handleConfirmDelete,
      
      // Add/Edit actions
      openAddSheet,
      openEditSheet,
      closeAddEditSheet,
      handleFormChange,
      handleSelectChange,
      setFocusState,
      validateForm,
      isFieldValid,
      handleSaveDepartment,
      handleFormSubmit,
      handleReloadData,
      fetchDepartments,
      handleEditClick,
      handleConfirmEdit,
      handleDeleteClick
   }
}
