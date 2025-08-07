'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function FacultiesLogic(){
   // Faculties management states
   const [faculties, setFaculties] = useState([])
   const [loading, setLoading] = useState(false)
   const [selectedFaculty, setSelectedFaculty] = useState(null)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [totalFacultiesCount, setTotalFacultiesCount] = useState(0)
   
   // Delete confirmation states
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [facultyToDelete, setFacultyToDelete] = useState(null)
   
   // Add/Edit sheet states
   const [isAddEditSheetOpen, setIsAddEditSheetOpen] = useState(false)
   const [editingFaculty, setEditingFaculty] = useState(null)
   const [formData, setFormData] = useState(null)
   const [focusStates, setFocusStates] = useState({})
   const [errors, setErrors] = useState({})
   const [saveLoading, setSaveLoading] = useState(false)
   const [isEditMode, setIsEditMode] = useState(false)
   
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState("")
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(1)
   const [itemsPerPage] = useState(10)

   // Fetch faculties data
   const fetchFaculties = async () => {
      setLoading(true)
      try {
         const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)         
         if(response.status === 200){
            const facultiesData = response.data.faculties || []
            setFaculties(facultiesData)
            setTotalFacultiesCount(facultiesData.length)
         } else {
            setFaculties([])
            setTotalFacultiesCount(0)
         }
      } catch (error) {
         console.error('Error fetching faculties:', error)
         setFaculties([])
         setTotalFacultiesCount(0)
         toast.error("Failed to fetch faculties data")
      } finally {
         setLoading(false)
      }
   }

   // Delete faculty
   const handleDeleteFaculty = async (facultyId) => {
      setDeleteLoading(true)
      try {
         const response = await axios.delete(`${ADMIN_ENDPOINTS.FACULTIES}?id=${facultyId}`)
         if(response.status === 200){
            toast.success("Faculty deleted successfully")
            fetchFaculties()
            closeDeleteModal()
         }
      } catch (error) {
         console.error('Error deleting faculty:', error)
         const errorMessage = error.response?.data?.error || "Failed to delete faculty"
         toast.error(errorMessage)
      } finally {
         setDeleteLoading(false)
      }
   }

   // Client-side filtering and pagination
   const filteredFaculties = faculties.filter(faculty => {
      if (!searchTerm) return true
      return (
         faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         faculty.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
   })

   const totalPages = Math.ceil(filteredFaculties.length / itemsPerPage)
   const startIndex = (currentPage - 1) * itemsPerPage
   const currentFaculties = filteredFaculties.slice(startIndex, startIndex + itemsPerPage)

   // Search debounce timer ref
   const searchTimeoutRef = useRef(null)

   // Handle search changes
   const handleSearchChange = (value) => {
      setSearchTerm(value)
      setCurrentPage(1) // Reset to first page when search changes
   }

   const handlePageChange = (page) => {
      setCurrentPage(page)
   }
   
   const openDeleteModal = (faculty) => {
      setFacultyToDelete(faculty)
      setIsDeleteModalOpen(true)
   }

   const closeDeleteModal = () => {
      if (!deleteLoading) {
         setIsDeleteModalOpen(false)
         setFacultyToDelete(null)
      }
   }

   const handleConfirmDelete = () => {
      if (facultyToDelete) {
         handleDeleteFaculty(facultyToDelete.id)
      }
   }

   const closeModal = () => {
      setIsModalOpen(false)
      setSelectedFaculty(null)
   }

   // Handle add/edit sheet actions
   const openAddSheet = () => {
      setIsEditMode(false)
      setEditingFaculty(null)
      setFormData({
         name: '',
         code: ''
      })
      setFocusStates({})
      setErrors({})
      setIsAddEditSheetOpen(true)
   }

   const openEditSheet = (faculty) => {
      setIsEditMode(true)
      setEditingFaculty(faculty)
      setFormData({
         name: faculty.name,
         code: faculty.code
      })
      setFocusStates({})
      setErrors({})
      setIsAddEditSheetOpen(true)
   }

   const closeAddEditSheet = () => {
      setIsAddEditSheetOpen(false)
      setEditingFaculty(null)
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

   const setFocusState = (field, focused) => {
      setFocusStates((prev) => ({
         ...prev,
         [field]: focused,
      }))
   }

   const validateForm = () => {
      const newErrors = {}
      let isValid = true

      if (!formData?.name?.trim()) {
         newErrors.name = { message: "Faculty name is required" }
         isValid = false
      }
      if (!formData?.code?.trim()) {
         newErrors.code = { message: "Faculty code is required" }
         isValid = false
      }

      setErrors(newErrors)
      return isValid
   }

   const isFieldValid = (field) => {
      return !errors[field] && formData?.[field]?.length > 0
   }

   const handleSaveFaculty = async (data) => {
      if (!validateForm()) return

      setSaveLoading(true)
      try {
         const saveData = {
            name: data.name.trim(),
            code: data.code.trim()
         }

         let response
         if (isEditMode && editingFaculty) {
            // Update existing faculty
            response = await axios.put(ADMIN_ENDPOINTS.FACULTIES, {
               id: editingFaculty.id,
               ...saveData
            })
         } else {
            // Create new faculty
            response = await axios.post(ADMIN_ENDPOINTS.FACULTIES, saveData)
         }
         
         if (response.status === 200 || response.status === 201) {
            toast.success(isEditMode ? "Faculty updated successfully" : "Faculty created successfully")
            fetchFaculties()
            closeAddEditSheet()
         }
      } catch (error) {
         console.error('Error saving faculty:', error)
         const errorMessage = error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} faculty`
         toast.error(errorMessage)
      } finally {
         setSaveLoading(false)
      }
   }

   const handleFormSubmit = (e) => {
      e.preventDefault()
      if (formData && validateForm()) {
         handleSaveFaculty(formData)
      }
   }

   // Handle reload data
   const handleReloadData = () => {
      fetchFaculties()
   }

   // Actions handlers
   const handleEditClick = (faculty) => {
      setSelectedFaculty(faculty)
      setIsModalOpen(true)
   }

   const handleConfirmEdit = () => {
      setIsModalOpen(false)
      openEditSheet(selectedFaculty)
   }

   const handleDeleteClick = (faculty) => {
      openDeleteModal(faculty)
   }

   // Table columns configuration
   const facultiesColumns = [
      {
         key: "name",
         header: "Faculty Name",
         render: (item) => <span className="font-medium text-gray-900">{item.name}</span>,
      },
      {
         key: "code",
         header: "Faculty Code", 
         render: (item) => <span className="text-gray-600 font-mono">{item.code}</span>,
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
         key: "action",
         header: "Action",
         render: (item) => (
            <div className="flex items-center gap-2">
               <button
                  onClick={() => handleEditClick(item)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
                  title="Edit Faculty"
               >
                  <Pencil className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleDeleteClick(item)}
                  className="text-red-600 hover:text-red-800 p-1 cursor-pointer rounded"
                  title="Delete Faculty"
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
      fetchFaculties()
   }, [])

   return {
      // Data
      faculties: currentFaculties,
      allFaculties: faculties,
      loading,
      selectedFaculty,
      isModalOpen,
      deleteLoading,
      
      // Table configuration
      facultiesColumns,
      
      // Add/Edit sheet data
      isAddEditSheetOpen,
      editingFaculty,
      formData,
      focusStates,
      errors,
      saveLoading,
      isEditMode,
      
      // Search and filters
      searchTerm,
      setSearchTerm: handleSearchChange,
      
      // Pagination
      currentPage,
      setCurrentPage: handlePageChange,
      totalPages,
      itemsPerPage,
      totalFaculties: totalFacultiesCount,
      filteredFacultiesCount: filteredFaculties.length,
      
      // Actions
      handleDeleteFaculty,
      openDeleteModal,
      closeModal,
      
      // Delete confirmation states
      isDeleteModalOpen,
      facultyToDelete,
      closeDeleteModal,
      handleConfirmDelete,
      
      // Add/Edit actions
      openAddSheet,
      openEditSheet,
      closeAddEditSheet,
      handleFormChange,
      setFocusState,
      validateForm,
      isFieldValid,
      handleSaveFaculty,
      handleFormSubmit,
      handleReloadData,
      fetchFaculties,
      handleEditClick,
      handleConfirmEdit,
      handleDeleteClick
   }
}
