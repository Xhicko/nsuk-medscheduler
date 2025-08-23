// app/student/(protected)/medical-forms/step/[stepId]/page.tsx (server)
import MedicalFormsContainer from '../../MedicalFormsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'
import {FORM_STEP_IDS, getStepIdByIndex} from '@/config/stepsConfig'
import { redirect } from 'next/navigation'


export const dynamic = 'force-dynamic' 

export default async function StepPage({ params }) {
  const { stepsId } = await params

  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: studentRow } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      institutional_email,
      gender,
      medical_form_status,
      signup_status
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!studentRow || studentRow.signup_status !== 'verified') return null

 // Compute visible step ids server-side (filter out womens-health for males)
  const visibleStepIds =
    (studentRow.gender || '').toLowerCase() === 'male'
      ? FORM_STEP_IDS.filter(id => id !== 'womens-health')
      : [...FORM_STEP_IDS]

 // Get current step from medical_form_status and map it to visible steps
  const currentStepIndex = Math.min(
    studentRow.medical_form_status?.current_step ?? 0,
    visibleStepIds.length - 1
  )
  
  // Canonical step must come from visible steps array.
  const canonicalStepId = visibleStepIds[currentStepIndex]
  
   // If requested step is not in visible steps or user is trying to access wrong step
  if (!stepsId || !visibleStepIds.includes(stepsId)) {
    return redirect(`/student/medical-forms/steps/${canonicalStepId}`)
  }

  // If user is trying to access a step beyond their current progress
  const requestedStepIndex = visibleStepIds.indexOf(stepsId)
  if (requestedStepIndex > currentStepIndex) {
    return redirect(`/student/medical-forms/steps/${canonicalStepId}`)
  }
  
  const initialData = {
    id: studentRow.id,
    fullName: studentRow.full_name,
    email: studentRow.institutional_email,
    gender: studentRow.gender,
    medicalFormStatus: {
      ...studentRow.medical_form_status,
      total_steps: visibleStepIds.length 
    },
  }


  return <MedicalFormsContainer initialData={initialData} initialStep={stepsId} visibleStepIds={visibleStepIds} />
}
