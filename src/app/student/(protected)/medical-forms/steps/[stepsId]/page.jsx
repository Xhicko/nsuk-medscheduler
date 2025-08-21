// app/student/(protected)/medical-forms/step/[stepId]/page.tsx (server)
import MedicalFormsContainer from '../../MedicalFormsContainer'
import { submitSection } from './actions'
import { getServerSupabase } from '@/lib/supabaseServer'
import {FORM_STEP_IDS, getStepIdByIndex} from '@/config/stepsConfig'
import { redirect } from 'next/navigation'


export const dynamic = 'force-dynamic' 

export default async function StepPage({ params }) {
  // Note: folder is [stepsId] so the param key is `stepsId`.
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

  // canonical fallback using index stored in DB
  const canonicalStepId = getStepIdByIndex(studentRow.medical_form_status?.current_step ?? 0)
  // if canonical is not visible (e.g., womens-health on a male), pick the first visible
  const canonicalVisible = visibleStepIds.includes(canonicalStepId) ? canonicalStepId : visibleStepIds[0]
  
  // Use the correct param key when validating visibility
  if (!stepsId || !visibleStepIds.includes(stepsId)) {
    // Redirect to canonical step (keeps URL consistent and server is SOT)
    return redirect(`/student/medical-forms/steps/${canonicalVisible}`)
  }
  const initialData = {
    id: studentRow.id,
    fullName: studentRow.full_name,
    email: studentRow.institutional_email,
    gender: studentRow.gender,
    medicalFormStatus: studentRow.medical_form_status,
  }

  // Optionally: validate stepId against visible steps computed on server
  // If invalid, you can redirect back to canonical step
  // compute visibleSteps server-side (e.g., remove womens-health for males)
  // if (!visible) redirect to canonical

  return <MedicalFormsContainer initialData={initialData} initialStep={stepsId} visibleStepIds={visibleStepIds} submitSection={submitSection} />
}
