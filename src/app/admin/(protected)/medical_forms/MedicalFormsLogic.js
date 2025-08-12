'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
// Direct API calls instead of using departmentsStore
import { Pencil, Trash2, Eye } from 'lucide-react'

export default function MedicalFormsLogic(initialData) {
   // Normalize forms to the shape the table expects
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
   // Medical forms management states
   const [medicalForms, setMedicalForms] = useState(() => processForms(initialData?.medicalForms || []))
   const [loading, setLoading] = useState(false)
   const [selectedMedicalForm, setSelectedMedicalForm] = useState(null)
   const [deleteLoading, setDeleteLoading] = useState(false)
   const [totalMedicalFormsCount, setTotalMedicalFormsCount] = useState(initialData?.pagination?.total || 0)
   
   // View modal states
   const [isViewModalOpen, setIsViewModalOpen] = useState(false)
   const [viewingMedicalForm, setViewingMedicalForm] = useState(null)
   
   // Delete confirmation states
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [medicalFormToDelete, setMedicalFormToDelete] = useState(null)
   
   // Edit sheet states
   const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
   const [editingMedicalForm, setEditingMedicalForm] = useState(null)
   const [editFormData, setEditFormData] = useState(null)
   const [editFocusStates, setEditFocusStates] = useState({})
   const [editErrors, setEditErrors] = useState({})
   const [saveLoading, setSaveLoading] = useState(false)

   // Edit confirmation states
   const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false)
   const [medicalFormToEdit, setMedicalFormToEdit] = useState(null)
   
   // Search and filter states
   const [searchTerm, setSearchTerm] = useState(initialData?.filters?.searchTerm ?? "")
   const [facultyFilter, setFacultyFilter] = useState(initialData?.filters?.faculty ?? "all")
   const [departmentFilter, setDepartmentFilter] = useState(initialData?.filters?.department ?? "all")
   const [completedFilter, setCompletedFilter] = useState(initialData?.filters?.completed ?? "all")
   
   // Direct faculties and departments state - fetch from API endpoints
   const [faculties, setFaculties] = useState(initialData?.faculties || [])
   const [facultiesLoading, setFacultiesLoading] = useState(false)
   const [departments, setDepartments] = useState({})
   const [loadingDepartments, setLoadingDepartments] = useState(false)
   
   // Pagination states
   const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1)
   const [itemsPerPage] = useState(10)

   // Function to fetch faculties directly from faculties endpoint
   const fetchFaculties = async () => {
      setFacultiesLoading(true)
      try {
         const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
         if (response.status === 200) {
            // Filter to only show verified faculties
            const verifiedFaculties = response.data.faculties.filter(faculty => faculty.status === 'verified')
            setFaculties(verifiedFaculties || [])
         }
      } catch (error) {
         console.error('Error fetching faculties:', error)
         toast.error("Failed to load faculties. Please try again.")
      } finally {
         setFacultiesLoading(false)
      }
   }
   
   // Function to fetch departments for a specific faculty directly from API
   const fetchDepartmentsForFaculty = async (facultyId) => {
      if (!facultyId) return;
      
      setLoadingDepartments(true);
      try {
         const response = await axios.get(`${ADMIN_ENDPOINTS.DEPARTMENTS}?faculty_id=${facultyId}&status=verified`);
         
         if (response.status === 200) {
            // Extract departments from the response
            const facultyDepts = response.data.departments
               .filter(dept => dept.faculty_id === facultyId && dept.status === 'verified')
               .map(dept => ({
                  id: dept.id,
                  name: dept.name,
                  code: dept.code,
                  status: dept.status
               }));
               
            // Update our local departments state
            setDepartments(prev => ({
               ...prev,
               [facultyId]: facultyDepts
            }));
         }
      } catch (error) {
         console.error(`Error fetching departments for faculty ${facultyId}:`, error);
         toast.error("Failed to load departments. Please try again.");
      } finally {
         setLoadingDepartments(false);
      }
   };

   // Custom function to get departments for a faculty
   const getDepartments = (facultyId) => {
      if (!facultyId) return [];
      // Get from our local departments state which is populated via direct API call
      const depts = departments[facultyId] || [];
      console.log(`Getting departments for faculty ${facultyId}:`, depts);
      return depts;
   }

   // Fetch medical forms data with pagination
   const fetchMedicalForms = async (page = currentPage, search = searchTerm, faculty = facultyFilter, department = departmentFilter, completed = completedFilter) => {
      
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
         if (completed && completed !== 'all') {
            params.append('completed', completed === 'true')
         }

         const response = await axios.get(`${ADMIN_ENDPOINTS.MEDICAL_FORMS}?${params.toString()}`)         
         if(response.status === 200){
            const formsData = response.data.medicalForms || []
            setMedicalForms(processForms(formsData))
            setTotalMedicalFormsCount(response.data.pagination?.total || 0)
            
            // Update pagination info from server response
            if (response.data.pagination) {
               const serverPage = response.data.pagination.page
               
               // Only update current page if it's different to avoid infinite loops
               if (serverPage !== currentPage) {
                  setCurrentPage(serverPage)
               }
            }
         } else {
            setMedicalForms([])
            setTotalMedicalFormsCount(0)
         }
      } catch (error) {
         console.error('Error fetching medical forms:', error)
         setMedicalForms([])
         setTotalMedicalFormsCount(0)
         toast.error("Failed to fetch medical forms data")
      } finally {
         setLoading(false)
      }
   }

   // Delete medical form
   const handleDeleteMedicalForm = async (formId) => {
      setDeleteLoading(true)
      let deletionSucceeded = false
      try {
         const response = await axios.delete(`${ADMIN_ENDPOINTS.MEDICAL_FORMS}?id=${formId}`)
         if(response.status === 200){
            // Use server response message
            toast.success(response.data.message || "Medical form deleted successfully")
            // Refresh with current filters and pagination
            fetchMedicalForms(currentPage, searchTerm, facultyFilter, departmentFilter, completedFilter)
            deletionSucceeded = true
         }
      } catch (error) {
         console.error('Error deleting medical form:', error)
         // Use server error message if available
         if (error.response && error.response.data) {
            toast.error(error.response.data.error || "Failed to delete medical form")
         } else if (error.request) {
            toast.error("No response from server. Please check your connection.")
         } else {
            toast.error("An error occurred while deleting the medical form")
         }
      } finally {
         setDeleteLoading(false)
         // Close modal after loading state is cleared to ensure it actually closes
         if (deletionSucceeded) {
            closeDeleteModal()
         }
      }
   }

   // Server-side pagination - no client-side filtering needed
   const currentMedicalForms = medicalForms // Use medical forms directly from server
   const totalPages = Math.ceil(totalMedicalFormsCount / itemsPerPage)

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
         fetchMedicalForms(1, value, facultyFilter, departmentFilter, completedFilter)
      }, 500)
   }

   const handleFacultyFilterChange = (value) => {
      setFacultyFilter(value)
      setDepartmentFilter("all") // Reset department when faculty changes
      setCurrentPage(1) // Reset to first page when filter changes
      
      // Fetch departments for the selected faculty
      if (value && value !== 'all') {
         fetchDepartmentsForFaculty(value)
      }
      
      // Immediate call for filter changes
      fetchMedicalForms(1, searchTerm, value, "all", completedFilter)
   }

   const handleDepartmentFilterChange = (value) => {
      setDepartmentFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
      // Immediate call for filter changes
      fetchMedicalForms(1, searchTerm, facultyFilter, value, completedFilter)
   }

   const handleCompletedFilterChange = (value) => {
      setCompletedFilter(value)
      setCurrentPage(1) // Reset to first page when filter changes
      // Immediate call for filter changes
      fetchMedicalForms(1, searchTerm, facultyFilter, departmentFilter, value)
   }

   const handlePageChange = (page) => {
      setCurrentPage(page)
      // Immediate call for pagination
      fetchMedicalForms(page, searchTerm, facultyFilter, departmentFilter, completedFilter)
   }
   
   // View modal handlers
   const openViewModal = (medicalForm) => {
      setViewingMedicalForm(medicalForm)
      setIsViewModalOpen(true)
   }

   const closeViewModal = () => {
      setIsViewModalOpen(false)
      setViewingMedicalForm(null)
   }
   
   // Delete modal handlers
   const openDeleteModal = (medicalForm) => {
      setMedicalFormToDelete(medicalForm)
      setIsDeleteModalOpen(true)
   }

   const closeDeleteModal = () => {
      // Only close if not currently deleting
      if (!deleteLoading) {
         setIsDeleteModalOpen(false)
         setMedicalFormToDelete(null)
      }
   }

   const handleConfirmDelete = () => {
      if (medicalFormToDelete) {
         handleDeleteMedicalForm(medicalFormToDelete.id)
      }
   }

   // Edit confirmation handlers
   const openEditConfirm = (medicalForm) => {
      setMedicalFormToEdit(medicalForm)
      setIsEditConfirmOpen(true)
   }

   const closeEditConfirm = () => {
      setIsEditConfirmOpen(false)
      setMedicalFormToEdit(null)
   }

   const handleConfirmEdit = () => {
      if (medicalFormToEdit) {
         openEditSheet(medicalFormToEdit)
      }
      closeEditConfirm()
   }

   // Edit sheet handlers
   const openEditSheet = (medicalForm) => {
      setEditingMedicalForm(medicalForm)
      setEditFormData({
         ...medicalForm,
         // Include all fields with proper handling for null/undefined values
         completed: medicalForm.completed,
         general_health: medicalForm.general_health || '',
         inpatient_admit: medicalForm.inpatient_admit || false,
         inpatient_details: medicalForm.inpatient_details || '',
         family_history: medicalForm.family_history || '',
         prev_tuberculosis: medicalForm.prev_tuberculosis || false,
         prev_hypertension: medicalForm.prev_hypertension || false,
         prev_epilepsy: medicalForm.prev_epilepsy || false,
         prev_mental_illness: medicalForm.prev_mental_illness || false,
         prev_cardiovascular: medicalForm.prev_cardiovascular || false,
         prev_arthritis: medicalForm.prev_arthritis || false,
         prev_asthma: medicalForm.prev_asthma || false,
         prev_bronchitis: medicalForm.prev_bronchitis || false,
         prev_hay_fever: medicalForm.prev_hay_fever || false,
         prev_diabetes: medicalForm.prev_diabetes || false,
         prev_eye_ear_nose: medicalForm.prev_eye_ear_nose || false,
         prev_throat_trouble: medicalForm.prev_throat_trouble || false,
         prev_drug_sensitivity: medicalForm.prev_drug_sensitivity || false,
         prev_dysentery: medicalForm.prev_dysentery || false,
         prev_dizziness: medicalForm.prev_dizziness || false,
         prev_jaundice: medicalForm.prev_jaundice || false,
         prev_kidney_disease: medicalForm.prev_kidney_disease || false,
         prev_gonorrhea: medicalForm.prev_gonorrhea || false,
         prev_parasitic_disease: medicalForm.prev_parasitic_disease || false,
         prev_heart_disease: medicalForm.prev_heart_disease || false,
         prev_ulcer: medicalForm.prev_ulcer || false,
         prev_haemorrhoids: medicalForm.prev_haemorrhoids || false,
         prev_skin_disease: medicalForm.prev_skin_disease || false,
         prev_schistosomiasis: medicalForm.prev_schistosomiasis || false,
         prev_other_condition: medicalForm.prev_other_condition || false,
         prev_other_details: medicalForm.prev_other_details || '',
         smoke: medicalForm.smoke || false,
         alcohol: medicalForm.alcohol || false,
         alcohol_since: medicalForm.alcohol_since || '',
         alcohol_qty_per_day: medicalForm.alcohol_qty_per_day || '',
         leisure_activities: medicalForm.leisure_activities || '',
         current_treatments: medicalForm.current_treatments || '',
         menses_regular: medicalForm.menses_regular || false,
         menses_painful: medicalForm.menses_painful || false,
         menses_duration_days: medicalForm.menses_duration_days || '',
         last_period_date: medicalForm.last_period_date || '',
         breast_sexual_disease: medicalForm.breast_sexual_disease || false,
         breast_sexual_details: medicalForm.breast_sexual_details || '',
         imm_yellow_fever: medicalForm.imm_yellow_fever || false,
         imm_smallpox: medicalForm.imm_smallpox || false,
         imm_typhoid: medicalForm.imm_typhoid || false,
         imm_tetanus: medicalForm.imm_tetanus || false,
         imm_tuberculosis: medicalForm.imm_tuberculosis || false,
         imm_cholera: medicalForm.imm_cholera || false,
         imm_polio: medicalForm.imm_polio || false,
         imm_others: medicalForm.imm_others || false,
         imm_others_details: medicalForm.imm_others_details || ''
      })
      setEditFocusStates({})
      setEditErrors({})
      setIsEditSheetOpen(true)
   }

   const closeEditSheet = () => {
      setIsEditSheetOpen(false)
      setEditingMedicalForm(null)
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
      if (field === "completed") {
         setEditFormData((prev) => (prev ? { ...prev, [field]: value === "true" } : null))
      } else {
         setEditFormData((prev) => (prev ? { ...prev, [field]: value } : null))
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

      // Validate required fields
      if (!editFormData?.general_health?.trim()) {
         newErrors.general_health = { message: "General health status is required" }
         isValid = false
      }
      
      // Validate inpatient details if inpatient_admit is true
      if (editFormData?.inpatient_admit === true && !editFormData?.inpatient_details?.trim()) {
         newErrors.inpatient_details = { message: "Inpatient details are required when admitted as inpatient" }
         isValid = false
      }
      
      // Validate family history
      if (!editFormData?.family_history?.trim()) {
         newErrors.family_history = { message: "Family medical history is required" }
         isValid = false
      }
      
      // Validate other condition details if selected
      if (editFormData?.prev_other_condition === true && !editFormData?.prev_other_details?.trim()) {
         newErrors.prev_other_details = { message: "Please provide details for other medical conditions" }
         isValid = false
      }
      
      // Validate alcohol details if alcohol is true
      if (editFormData?.alcohol === true) {
         if (!editFormData?.alcohol_since?.trim()) {
            newErrors.alcohol_since = { message: "Please specify when alcohol consumption started" }
            isValid = false
         }
         if (!editFormData?.alcohol_qty_per_day?.trim()) {
            newErrors.alcohol_qty_per_day = { message: "Please specify quantity of alcohol consumed per day" }
            isValid = false
         }
      }
      
      // Validate breast/sexual disease details if selected
      if (editFormData?.breast_sexual_disease === true && !editFormData?.breast_sexual_details?.trim()) {
         newErrors.breast_sexual_details = { message: "Please provide details for breast/sexual disease" }
         isValid = false
      }

      // Validate menstrual fields for female students
      const gender = (editFormData?.students?.gender || editFormData?.gender || '').toString().toLowerCase()
      if (gender === 'female') {
         // Last period date must not be empty for female
         if (!editFormData?.last_period_date) {
            newErrors.last_period_date = { message: "Last period date is required for female students" }
            isValid = false
         }

         // Menses duration days must not be empty for female
         if (
            editFormData?.menses_duration_days === undefined ||
            editFormData?.menses_duration_days === null ||
            String(editFormData?.menses_duration_days).trim() === ''
         ) {
            newErrors.menses_duration_days = { message: "Menses duration (days) is required for female students" }
            isValid = false
         }
      }
      
      // Validate other immunizations details if selected
      if (editFormData?.imm_others === true && !editFormData?.imm_others_details?.trim()) {
         newErrors.imm_others_details = { message: "Please provide details for other immunizations" }
         isValid = false
      }

      setEditErrors(newErrors)
      return isValid
   }

   const isEditFieldValid = (field) => {
      return !editErrors[field] && editFormData?.[field] !== undefined
   }

   const handleSaveMedicalForm = async (formData) => {
      if (!validateEditForm()) return

      setSaveLoading(true)
      try {
         const updateData = {
            // Include all the fields that can be updated
            completed: formData.completed,
            general_health: formData.general_health,
            inpatient_admit: formData.inpatient_admit,
            inpatient_details: formData.inpatient_details,
            family_history: formData.family_history,
            prev_tuberculosis: formData.prev_tuberculosis,
            prev_hypertension: formData.prev_hypertension,
            prev_epilepsy: formData.prev_epilepsy,
            prev_mental_illness: formData.prev_mental_illness,
            prev_cardiovascular: formData.prev_cardiovascular,
            prev_arthritis: formData.prev_arthritis,
            prev_asthma: formData.prev_asthma,
            prev_bronchitis: formData.prev_bronchitis,
            prev_hay_fever: formData.prev_hay_fever,
            prev_diabetes: formData.prev_diabetes,
            prev_eye_ear_nose: formData.prev_eye_ear_nose,
            prev_throat_trouble: formData.prev_throat_trouble,
            prev_drug_sensitivity: formData.prev_drug_sensitivity,
            prev_dysentery: formData.prev_dysentery,
            prev_dizziness: formData.prev_dizziness,
            prev_jaundice: formData.prev_jaundice,
            prev_kidney_disease: formData.prev_kidney_disease,
            prev_gonorrhea: formData.prev_gonorrhea,
            prev_parasitic_disease: formData.prev_parasitic_disease,
            prev_heart_disease: formData.prev_heart_disease,
            prev_ulcer: formData.prev_ulcer,
            prev_haemorrhoids: formData.prev_haemorrhoids,
            prev_skin_disease: formData.prev_skin_disease,
            prev_schistosomiasis: formData.prev_schistosomiasis,
            prev_other_condition: formData.prev_other_condition,
            prev_other_details: formData.prev_other_details,
            smoke: formData.smoke,
            alcohol: formData.alcohol,
            alcohol_since: formData.alcohol_since,
            alcohol_qty_per_day: formData.alcohol_qty_per_day,
            leisure_activities: formData.leisure_activities,
            current_treatments: formData.current_treatments,
            menses_regular: formData.menses_regular,
            menses_painful: formData.menses_painful,
            menses_duration_days: formData.menses_duration_days,
            last_period_date: formData.last_period_date,
            breast_sexual_disease: formData.breast_sexual_disease,
            breast_sexual_details: formData.breast_sexual_details,
            imm_yellow_fever: formData.imm_yellow_fever,
            imm_smallpox: formData.imm_smallpox,
            imm_typhoid: formData.imm_typhoid,
            imm_tetanus: formData.imm_tetanus,
            imm_tuberculosis: formData.imm_tuberculosis,
            imm_cholera: formData.imm_cholera,
            imm_polio: formData.imm_polio,
            imm_others: formData.imm_others,
            imm_others_details: formData.imm_others_details
         }

         // Client-side normalization to avoid sending empty strings for date/numeric fields
         const gender = (formData?.students?.gender || formData?.gender || '').toString().toLowerCase()

         // If not female, clear menstrual fields server expects nullable
         if (gender !== 'female') {
            updateData.menses_regular = false
            updateData.menses_painful = false
            updateData.menses_duration_days = null
            updateData.last_period_date = null
         } else {
            // Female: coerce last_period_date '' -> null
            if (!updateData.last_period_date) {
               updateData.last_period_date = null
            }
            // Parse menses_duration_days to integer or null
            if (
               updateData.menses_duration_days === '' ||
               updateData.menses_duration_days === undefined ||
               updateData.menses_duration_days === null
            ) {
               updateData.menses_duration_days = null
            } else {
               const parsed = parseInt(updateData.menses_duration_days, 10)
               updateData.menses_duration_days = Number.isNaN(parsed) ? null : parsed
            }
         }

         // If alcohol is false, clear dependent fields
         if (!updateData.alcohol) {
            updateData.alcohol_since = null
            updateData.alcohol_qty_per_day = null
         }

         // If other condition not selected, clear details
         if (!updateData.prev_other_condition) {
            updateData.prev_other_details = null
         }

         // If other immunizations not selected, clear details
         if (!updateData.imm_others) {
            updateData.imm_others_details = null
         }

         // If inpatient not admitted, clear details
         if (!updateData.inpatient_admit) {
            updateData.inpatient_details = null
         }

         const response = await axios.put(`${ADMIN_ENDPOINTS.MEDICAL_FORMS}?id=${editingMedicalForm.id}`, updateData)
         
         if (response.status === 200) {
            // Use the server response message for success
            toast.success(response.data.message || "Medical form updated successfully")
            // Refresh with current filters and pagination  
            fetchMedicalForms(currentPage, searchTerm, facultyFilter, departmentFilter, completedFilter)
            closeEditSheet()
         }
      } catch (error) {
         console.error('Error updating medical form:', error)
         // Use server error message if available
         if (error.response && error.response.data) {
            toast.error(error.response.data.error || "Failed to update medical form")
         } else if (error.request) {
            toast.error("No response from server. Please check your connection.")
         } else {
            toast.error("An error occurred while updating the medical form")
         }
      } finally {
         setSaveLoading(false)
      }
   }

   const handleEditSubmit = (e) => {
      e.preventDefault()
      if (editFormData && validateEditForm()) {
         handleSaveMedicalForm(editFormData)
      }
   }

   // Status color helper - adapted for medical form "completed" status
   const getStatusColor = (completed) => {
      return completed === true
         ? "bg-emerald-50 text-emerald-700 border-emerald-200"
         : "bg-amber-50 text-amber-700 border-amber-200"
   }
   
   // Actions handlers
   const handleViewClick = (medicalForm) => {
      openViewModal(medicalForm)
   }
   
   const handleEditClick = (medicalForm) => {
   openEditConfirm(medicalForm)
   }

   const handleDeleteClick = (medicalForm) => {
      openDeleteModal(medicalForm)
   }

   // Table columns configuration
   const medicalFormsColumns = [
      {
         key: "matric_number",
         header: "Matric Number",
         render: (item) => <span className="font-medium text-gray-900">{item.matric_number}</span>,
      },
      {
         key: "student_name",
         header: "Student Name", 
         render: (item) => <span className="text-gray-600">{item.student_name}</span>,
      },
      {
         key: "submitted_at",
         header: "Submitted At",
         render: (item) => <span className="text-gray-600">{item.submitted_date} {item.submitted_time}</span>,
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
         key: "completed",
         header: "Status",
         render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.completed)}`}>
               {item.completed === true ? 'Completed' : 'Pending'}
            </span>
         ),
      },
      {
         key: "action",
         header: "Action",
         render: (item) => (
            <div className="flex items-center gap-2">
               <button
                  onClick={() => handleViewClick(item)}
                  className="text-green-600 hover:text-green-800 p-1 rounded cursor-pointer"
                  title="View Medical Form"
               >
                  <Eye className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleEditClick(item)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
                  title="Edit Medical Form"
               >
                  <Pencil className="h-4 w-4" />
               </button>
               <button
                  onClick={() => handleDeleteClick(item)}
                  className="text-red-600 hover:text-red-800 p-1 cursor-pointer rounded"
                  title="Delete Medical Form"
               >
                  <Trash2 className="h-4 w-4" />
               </button>
            </div>
         ),
         className: "text-right",
      },
   ]

   // Initial load only - fetch both medical forms and faculties
   // No initial fetch on mount; initialData seeds the table. Fetch only on user actions.
   
   // Load departments whenever faculty filter changes
   useEffect(() => {
      if (facultyFilter && facultyFilter !== 'all') {
         fetchDepartmentsForFaculty(facultyFilter)
      }
   }, [facultyFilter]) // Dependency on facultyFilter

   return {
      // Data
   medicalForms: currentMedicalForms,
      loading,
      deleteLoading,
      
      // Table configuration
      medicalFormsColumns,
      
      // View modal states
      isViewModalOpen,
      viewingMedicalForm,
      closeViewModal,
      
      // Edit sheet data
      isEditSheetOpen,
      editFormData,
      editFocusStates,
      editErrors,
      saveLoading,

   // Edit confirmation
   isEditConfirmOpen,
   medicalFormToEdit,
   closeEditConfirm,
   handleConfirmEdit,
      
      // Faculties and departments data
      facultiesData: faculties,
      getDepartments,
      
      // Search and filters
      searchTerm,
      setSearchTerm: handleSearchChange,
      facultyFilter,
      setFacultyFilter: handleFacultyFilterChange,
      departmentFilter,
      setDepartmentFilter: handleDepartmentFilterChange,
      completedFilter,
      setCompletedFilter: handleCompletedFilterChange,
      
      // Pagination
      currentPage,
      setCurrentPage: handlePageChange,
      totalPages,
      itemsPerPage,
      totalMedicalForms: totalMedicalFormsCount,
      filteredMedicalFormsCount: medicalForms.length,
      
      // Delete confirmation states
      isDeleteModalOpen,
      medicalFormToDelete,
      closeDeleteModal,
      handleConfirmDelete,
      
      // Edit actions
      openEditSheet,
      closeEditSheet,
      handleEditFormChange,
      handleEditSelectChange,
      setEditFocusState,
      isEditFieldValid,
      handleEditSubmit,
      
      // Data fetching
      fetchMedicalForms,
   }
}
