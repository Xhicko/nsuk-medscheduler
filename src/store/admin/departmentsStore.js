import { create } from 'zustand'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'

// Helper functions for session storage
const getFromSessionStorage = (key) => {
  if (typeof window === 'undefined') return null
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading from sessionStorage:', error)
    return null
  }
}

const saveToSessionStorage = (key, data) => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to sessionStorage:', error)
  }
}

const removeFromSessionStorage = (key) => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from sessionStorage:', error)
  }
}

const STORAGE_KEY = 'departments_store_data'

const useDepartmentsStore = create((set, get) => {
  // Initialize from session storage if available
  const stored = getFromSessionStorage(STORAGE_KEY)
  
  return {
    // Original State
    faculties: stored?.faculties || [],
    departments: stored?.departments || [],
    loading: false,
    error: null,
    initialized: stored?.initialized || false,

    // New Pagination State (for admin dashboard)
    currentPage: 1,
    totalPages: 1,
    totalDepartments: 0,
    filteredDepartmentsCount: 0,
    itemsPerPage: 10,

    // New Filter State (for admin dashboard)
    searchTerm: '',
    statusFilter: 'all',
    facultyFilter: 'all',

    // New Modal states (for admin dashboard)
    selectedDepartment: null,
    isModalOpen: false,
    deleteLoading: false,

    // New Delete confirmation (for admin dashboard)
    isDeleteModalOpen: false,
    departmentToDelete: null,

    // New Add/Edit sheet (for admin dashboard)
    isAddEditSheetOpen: false,
    editingDepartment: null,
    formData: {
      name: '',
      code: '',
      faculty_id: '',
      status: 'pending'
    },
    focusStates: {
      name: false,
      code: false
    },
    errors: {},
    saveLoading: false,
    isEditMode: false,

    // New Faculties data (for admin dashboard)
    facultiesData: [],
    facultiesLoading: false,

    // Original Actions
    fetchDepartments: async () => {
      // Don't fetch if already loading or if data exists and initialized
      if (get().loading || (get().initialized && get().faculties.length > 0)) {
        return
      }

      set({ loading: true, error: null })
      
      try {
        const response = await axios.get(ADMIN_ENDPOINTS.DEPARTMENTS)
        
        if (response.status === 200) {
          // The API returns { faculties: [...], departments: [...] }
          const { faculties, departments } = response.data
          
          const storeData = {
            faculties: faculties || [],
            departments: departments || [],
            loading: false,
            initialized: true,
            error: null
          }
          
          // Save to session storage
          saveToSessionStorage(STORAGE_KEY, {
            faculties: storeData.faculties,
            departments: storeData.departments,
            initialized: true
          })
          
          set(storeData)
        } else {
          throw new Error('Failed to fetch departments')
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        set({ 
          loading: false, 
          error: error.message || 'Failed to fetch departments',
          faculties: [],
          departments: []
        })
      }
    },

    // Helper to get departments for a specific faculty
    getDepartmentsByFaculty: (facultyId) => {
      const state = get()
      const faculty = state.faculties.find(f => f.id === facultyId)
      return faculty ? faculty.departments : []
    },

    // Helper to get faculty by department
    getFacultyByDepartment: (departmentId) => {
      const state = get()
      for (const faculty of state.faculties) {
        if (faculty.departments.some(dept => dept.id === departmentId)) {
          return faculty
        }
      }
      return null
    },

    // Clear store (on logout)
    clearStore: () => {
      removeFromSessionStorage(STORAGE_KEY)
      set({
        faculties: [],
        departments: [],
        loading: false,
        error: null,
        initialized: false
      })
    },

    // Force refresh (when data might have changed)
    forceRefresh: async () => {
      removeFromSessionStorage(STORAGE_KEY)
      set({ initialized: false })
      await get().fetchDepartments()
    },

    // New Actions for Admin Dashboard
    setDepartments: (departments) => set({ departments }),
    setDepartmentsLoading: (loading) => set({ loading }),

    // Pagination actions
    setCurrentPage: (page) => set({ currentPage: page }),
    setTotalPages: (pages) => set({ totalPages: pages }),
    setTotalDepartments: (total) => set({ totalDepartments: total }),
    setFilteredDepartmentsCount: (count) => set({ filteredDepartmentsCount: count }),

    // Filter actions
    setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
    setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
    setFacultyFilter: (faculty) => set({ facultyFilter: faculty, currentPage: 1 }),

    // Modal actions
    setSelectedDepartment: (department) => set({ selectedDepartment: department }),
    setIsModalOpen: (open) => set({ isModalOpen: open }),
    setDeleteLoading: (loading) => set({ deleteLoading: loading }),

    // Delete confirmation actions
    setIsDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
    setDepartmentToDelete: (department) => set({ departmentToDelete: department }),

    // Add/Edit sheet actions
    setIsAddEditSheetOpen: (open) => set({ isAddEditSheetOpen: open }),
    setEditingDepartment: (department) => set({ editingDepartment: department }),
    setFormData: (data) => set({ formData: data }),
    setFocusStates: (states) => set({ focusStates: states }),
    setErrors: (errors) => set({ errors }),
    setSaveLoading: (loading) => set({ saveLoading: loading }),
    setIsEditMode: (mode) => set({ isEditMode: mode }),

    // Faculties actions
    setFacultiesData: (faculties) => set({ facultiesData: faculties }),
    setFacultiesLoading: (loading) => set({ facultiesLoading: loading }),

    // Helper actions
    resetForm: () => set({
      formData: {
        name: '',
        code: '',
        faculty_id: '',
        status: 'pending'
      },
      focusStates: {
        name: false,
        code: false
      },
      errors: {},
      editingDepartment: null,
      isEditMode: false
    }),

    closeModal: () => set({
      isModalOpen: false,
      selectedDepartment: null
    }),

    closeDeleteModal: () => set({
      isDeleteModalOpen: false,
      departmentToDelete: null
    }),

    closeAddEditSheet: () => {
      const { resetForm } = get()
      resetForm()
      set({
        isAddEditSheetOpen: false
      })
    },

    openAddSheet: () => {
      const { resetForm } = get()
      resetForm()
      set({
        isAddEditSheetOpen: true,
        isEditMode: false
      })
    },

    openEditSheet: (department) => {
      set({
        editingDepartment: department,
        formData: {
          name: department.name || '',
          code: department.code || '',
          faculty_id: department.faculty_id || '',
          status: department.status || 'pending'
        },
        isAddEditSheetOpen: true,
        isEditMode: true,
        errors: {}
      })
    },

    // Validation helpers
    validateField: (field, value) => {
      const { errors } = get()
      const newErrors = { ...errors }

      switch (field) {
        case 'name':
          if (!value?.trim()) {
            newErrors.name = 'Department name is required'
          } else if (value.trim().length < 2) {
            newErrors.name = 'Department name must be at least 2 characters'
          } else {
            delete newErrors.name
          }
          break
        
        case 'faculty_id':
          if (!value) {
            newErrors.faculty_id = 'Faculty selection is required'
          } else {
            delete newErrors.faculty_id
          }
          break
        
        case 'code':
          if (value && value.trim().length > 10) {
            newErrors.code = 'Department code cannot exceed 10 characters'
          } else {
            delete newErrors.code
          }
          break
        
        default:
          break
      }

      set({ errors: newErrors })
      return !newErrors[field]
    },

    isFieldValid: (field) => {
      const { errors } = get()
      return !errors[field]
    },

    // Clear all filters
    clearFilters: () => set({
      searchTerm: '',
      statusFilter: 'all',
      facultyFilter: 'all',
      currentPage: 1
    }),

    // Reset pagination
    resetPagination: () => set({
      currentPage: 1,
      totalPages: 1,
      totalDepartments: 0,
      filteredDepartmentsCount: 0
    })
  }
})

export default useDepartmentsStore
