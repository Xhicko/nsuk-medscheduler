'use client'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import StudentHeader from '@/components/custom/client/StudentHeader'
import MedicalFormsSkeleton from './MedicalFormsSkeleton'
import STEPS from './steps/index'
import { MedicalFormsLogic } from './MedicalFormsLogic'
import { useRef } from 'react'
import { Loader2 } from 'lucide-react'
import StepNotFound from '@/components/custom/StepNotFound'

export default function MedicalFormsView({ initialData, initialStep, visibleStepIds, loading }) {

   const stepRef = useRef(null)
  
   const {
      isSubmitting,
      getCurrentStepInfo,
      submitSectionData,
      getSectionTitle,
      isStepReadOnly,
      canAccessStep
   } = MedicalFormsLogic(initialData, visibleStepIds)

   const InitialStudentData = initialData || null

   if (loading) {
      return <MedicalFormsSkeleton />
   }

  // Validate step access
  if (!canAccessStep(initialStep)) {
    const canonical = visibleStepIds?.[initialData?.medicalFormStatus?.current_step ?? 0]
    return <StepNotFound canonical={canonical} />
  }

   const StepComponent = STEPS[initialStep]
  if (!StepComponent) {
    const canonical = visibleStepIds?.[0]
    return <StepNotFound canonical={canonical} />
  }

    const { 
    currentStepIndex, 
    isLastStep, 
    totalSteps, 
    progressPercent 
  } = getCurrentStepInfo()

   const stepTitle = getSectionTitle(initialStep)
   const readOnly = isStepReadOnly(initialStep)
  
   return (
      <div className="min-h-screen bg-background">
         <StudentHeader student={InitialStudentData} />

         <main className="container mx-auto px-4 py-6 xs:px-2 xs:py-4" role="main">
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                     <span className="font-bold text-[#0077B6]">Progress</span>
                     <span className="font-bold text-[#0077B6]">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 " />
                           <p className="text-xs  text-[#0077B6] text-center">
                                Step {currentStepIndex + 1} of {totalSteps}: {stepTitle}
                           </p>
               </div>

               <StepComponent
                  ref={stepRef}
                  formData={initialData}
                  onFormChange={() => {}}
                  readOnly={readOnly}
               />

               <div className="pt-6 border-t">
                  <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded mb-4">Once you save this section it cannot be edited. Please review your answers before continuing.</p>
                  <div>
                     <Button
                        type="button"
                        onClick={() => submitSectionData(stepRef, initialStep)}
                        disabled={isSubmitting || readOnly}
                        className="w-full bg-[#0077B6] hover:bg-[#00629a] text-white disabled:opacity-50"
                     >
                        {isSubmitting ? (
                           <>
                           <Loader2 className="animate-spin h-4 w-4 mr-2" />
                           Saving...
                           </>
                        ) : readOnly ? (
                           'Section Completed'
                        ) : isLastStep ? (
                           'Complete Form'
                        ) : (
                           'Save & Continue'
                        )}
                     </Button>
                  </div>
               </div>
            </div>
        </main>
      </div>
   )
}
