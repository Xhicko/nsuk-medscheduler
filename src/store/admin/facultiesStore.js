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

const STORAGE_KEY = 'faculties_store_data'

const useFacultiesStore = create((set, get) => {
  // Initialize from session storage if available
  const stored = getFromSessionStorage(STORAGE_KEY)
  
  return {
    // State
    faculties: stored?.faculties || [],
    loading: false,
    error: null,
    initialized: stored?.initialized || false,

    // Actions
    fetchFaculties: async () => {
      // Don't fetch if already loading or if data exists and initialized
      const { loading, faculties, initialized } = get()
      if (loading || (faculties.length > 0 && initialized)) {
        return
      }

      set({ loading: true, error: null })
      
      try {
        const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
        
        if (response.status === 200) {
          const facultiesData = response.data.faculties || []
          
          // Save to session storage
          const storeData = {
            faculties: facultiesData,
            initialized: true
          }
          saveToSessionStorage(STORAGE_KEY, storeData)
          
          set({ 
            faculties: facultiesData,
            loading: false,
            error: null,
            initialized: true
          })
        }
      } catch (error) {
        console.error('Error fetching faculties:', error)
        set({ 
          faculties: [],
          loading: false,
          error: error.message,
          initialized: false
        })
      }
    },

    // Refresh faculties (force fetch)
    refreshFaculties: async () => {
      set({ loading: true, error: null })
      
      try {
        const response = await axios.get(ADMIN_ENDPOINTS.FACULTIES)
        
        if (response.status === 200) {
          const facultiesData = response.data.faculties || []
          
          // Save to session storage
          const storeData = {
            faculties: facultiesData,
            initialized: true
          }
          saveToSessionStorage(STORAGE_KEY, storeData)
          
          set({ 
            faculties: facultiesData,
            loading: false,
            error: null,
            initialized: true
          })
        }
      } catch (error) {
        console.error('Error refreshing faculties:', error)
        set({ 
          loading: false,
          error: error.message
        })
      }
    },

    // Clear store and session storage
    clearFaculties: () => {
      removeFromSessionStorage(STORAGE_KEY)
      set({
        faculties: [],
        loading: false,
        error: null,
        initialized: false
      })
    },

    // Get faculty by ID
    getFacultyById: (id) => {
      const { faculties } = get()
      return faculties.find(faculty => faculty.id === id) || null
    },

    // Add new faculty to store (optimistic update)
    addFaculty: (newFaculty) => {
      const { faculties } = get()
      const updatedFaculties = [...faculties, newFaculty]
      
      const storeData = {
        faculties: updatedFaculties,
        initialized: true
      }
      saveToSessionStorage(STORAGE_KEY, storeData)
      
      set({ faculties: updatedFaculties })
    },

    // Update faculty in store (optimistic update)
    updateFaculty: (updatedFaculty) => {
      const { faculties } = get()
      const updatedFaculties = faculties.map(faculty => 
        faculty.id === updatedFaculty.id ? updatedFaculty : faculty
      )
      
      const storeData = {
        faculties: updatedFaculties,
        initialized: true
      }
      saveToSessionStorage(STORAGE_KEY, storeData)
      
      set({ faculties: updatedFaculties })
    },

    // Remove faculty from store (optimistic update)
    removeFaculty: (facultyId) => {
      const { faculties } = get()
      const updatedFaculties = faculties.filter(faculty => faculty.id !== facultyId)
      
      const storeData = {
        faculties: updatedFaculties,
        initialized: true
      }
      saveToSessionStorage(STORAGE_KEY, storeData)
      
      set({ faculties: updatedFaculties })
    }
  }
})

export default useFacultiesStore
