import { create } from 'zustand'

const useMedicalFormsStore = create((set) => ({
  // Define your state here
  medicalForms: [],
  loading: false,
  error: null,
  
  // Define your actions here
  setMedicalForms: (medicalForms) => set({ medicalForms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Add more actions as needed
}))

export default useMedicalFormsStore
