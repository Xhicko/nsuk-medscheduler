'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import StudentHeader from '@/components/custom/client/StudentHeader'
import MedicalFormsSkeleton from './MedicalFormsSkeleton'
import STEPS from './steps/index'
import { getStepIdByIndex, FORM_STEP_IDS } from '@/config/stepsConfig'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import StepNotFound from '@/components/custom/StepNotFound'
export default function MedicalFormsView({ initialData, initialStep, visibleStepIds, loading, submitSection }) {
      const InitialStudentData = initialData || null

      // derive active step from route or server-provided current_step
      const computedStepId = initialStep ?? getStepIdByIndex(InitialStudentData?.medicalFormStatus?.current_step ?? 0)
      const activeSectionId = computedStepId
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [savedSteps, setSavedSteps] = useState(new Set())
      const stepRef = useRef(null)
      const router = useRouter()

         if (loading) {
            return <MedicalFormsSkeleton />
         }

   const StepComponent = STEPS[activeSectionId]
   const canonical = visibleStepIds && visibleStepIds[0]
   if (!StepComponent) return <StepNotFound canonical={canonical} />

   // Use server-provided visibleStepIds to derive the current step index.
   const currentStepIndex = Math.max(0, visibleStepIds.indexOf(computedStepId))
   const isLastStep = currentStepIndex === visibleStepIds.length - 1
   const totalSteps = InitialStudentData?.medicalFormStatus?.total_steps ?? 0
   const progressPercent = InitialStudentData?.medicalFormStatus?.progress_percentage ?? 0

       // Human-readable titles for steps (used when visibleStepIds is an array of ids)
       const STEP_TITLES = {
          history: 'Medical History',
          lifestyle: 'Lifestyle',
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
                                 Step {currentStepIndex + 1} of {totalSteps}: {(
                                    // support either an array of ids (string) or objects with a `title` property
                                    visibleStepIds[currentStepIndex]?.title ?? STEP_TITLES[visibleStepIds[currentStepIndex]] ?? visibleStepIds[currentStepIndex]
                                 )}
                           </p>
               </div>

                      <StepComponent
                           ref={stepRef}
                           formData={InitialStudentData}
                           onFormChange={() => { /* no-op while top-level save/navigation is inert */ }}
                           readOnly={savedSteps.has(activeSectionId)}
                      />

                      <div className="pt-6 border-t">
                         <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded mb-4">Once you save this section it cannot be edited. Please review your answers before continuing.</p>

                         <div>
                            <Button
                               type="button"
                               disabled={isSubmitting || isLastStep || !StepComponent}
                               className="w-full bg-[#0077B6] hover:bg-[#00629a] text-white"
                            >
                               {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : isLastStep ? 'Complete' : 'Next'}
                            </Button>
                         </div>
                      </div>
            </div>
        </main>
      </div>
   )
}
