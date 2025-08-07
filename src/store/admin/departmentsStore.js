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
    // State
    faculties: stored?.faculties || [],
    departments: stored?.departments || [],
    loading: false,
    error: null,
    initialized: stored?.initialized || false,

    // Actions
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
    }
  }
})

export default useDepartmentsStore
