'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import STUDENT_ENDPOINTS from '@/config/studentConfig'

export const MedicalFormsLogic = (initialData, visibleStepIds) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedSteps, setSavedSteps] = useState(new Set())
  const router = useRouter()

  // Get current step info
  const getCurrentStepInfo = () => {
    const currentStepIndex = initialData?.medicalFormStatus?.current_step ?? 0
    const currentStepId = visibleStepIds[currentStepIndex]
    const isLastStep = currentStepIndex === visibleStepIds.length - 1
    const totalSteps = initialData?.medicalFormStatus?.total_steps ?? visibleStepIds.length
    const progressPercent = initialData?.medicalFormStatus?.progress_percentage ?? 0

    console.log(`Current Step: ${currentStepId}, Progress: ${progressPercent}%`)

    return {
      currentStepIndex,
      currentStepId,
      isLastStep,
      totalSteps,
      progressPercent
    }
  }

  const submitSectionData = async (stepRef, sectionId) => {
    if (isSubmitting || !stepRef.current?.submit) return
    
    setIsSubmitting(true)
    
    try {
      // Get validated form data from the step component
      const sectionData = await stepRef.current.submit()

      // Prepare payload for API
      const payload = {
        section: sectionId,
        ...sectionData
      }


      const response = await axios.post(STUDENT_ENDPOINTS.MEDICAL_FORMS, payload)
      
      // Axios automatically throws for 4xx/5xx status codes, so if we reach here, it's successful
      const result = response.data


      // Success - show toast first
      toast.success(`Section "${getSectionTitle(sectionId)}" saved successfully!`)
      
      // Mark this step as saved (read-only)
      setSavedSteps(prev => new Set([...prev, sectionId]))

      // Check if form is completed
      if (result.completed) {
        toast.success('Medical form completed successfully!')
        router.push('/student/dashboard')
        return
      }

      // Navigate to next section if available
      if (result.nextSection) {
        const nextStepPath = `/student/medical-forms/steps/${result.nextSection}`
        console.log('Navigating to:', nextStepPath)
        
        // Use router.push with refresh to ensure server data is updated
        router.push(nextStepPath)
        router.refresh()
      } else {
        // Fallback refresh if no next section specified
        router.refresh()
      }

    } catch (error) {
      if (error.response) {
             const errorMessage = error.response.data?.error || error.response.data?.message || 'An error occurred while submitting the form. Please try again.'
             toast.error(errorMessage)
          }
      else if (error.request) {
             toast.error('No response from server. Please check your connection.')
          } 
      else {
             toast.error('An error occurred while setting up the request')
          }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get section title for display
  const getSectionTitle = (sectionId) => {
    const titles = {
      'history': 'Medical History',
      'lifestyle': 'Lifestyle',
      'womens-health': "Women's Health",
      'conditions-1': 'Previous Conditions (1/6)',
      'conditions-2': 'Previous Conditions (2/6)', 
      'conditions-3': 'Previous Conditions (3/6)',
      'conditions-4': 'Previous Conditions (4/6)',
      'conditions-5': 'Previous Conditions (5/6)',
      'conditions-6': 'Previous Conditions (6/6)',
      'immunizations-1': 'Immunizations (1/2)',
      'immunizations-2': 'Immunizations (2/2)',
    }
    return titles[sectionId] || sectionId
  }

  // Check if step is saved/read-only
  const isStepReadOnly = (stepId) => {
    if (!initialData?.medicalFormStatus) return false
    
    const currentStep = initialData.medicalFormStatus.current_step ?? 0
    const stepIndex = visibleStepIds.indexOf(stepId)
    
    // Step is read-only if it's before current step (already completed)
    return stepIndex < currentStep || savedSteps.has(stepId)
  }

  // Validate step access
  const canAccessStep = (stepId) => {
    if (!visibleStepIds.includes(stepId)) return false
    
    const currentStep = initialData?.medicalFormStatus?.current_step ?? 0
    const stepIndex = visibleStepIds.indexOf(stepId)
    
    // Can only access current step or previous steps
    return stepIndex <= currentStep
  }

  return {
    isSubmitting,
    savedSteps,
    getCurrentStepInfo,
    submitSectionData,
    getSectionTitle,
    isStepReadOnly,
    canAccessStep
  }
}