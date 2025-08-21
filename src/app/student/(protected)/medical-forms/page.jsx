import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabaseServer'
import {getStepIdByIndex} from '@/config/stepsConfig'

export const metadata = { title: 'NSUK MedSched - Medical Forms' }

export default async function Page() {
  const supabase = await getServerSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data: student, error } = await supabase
    .from('students')
    .select('id, gender, medical_form_status')
    .eq('auth_user_id', user.id)
    .single()

   if (!student) return null

   const canonicalStepId = getStepIdByIndex(student.medical_form_status?.current_step ?? 0)
   
  // redirect to canonical step route (keeps URL canonical)
  redirect(`/student/medical-forms/steps/${canonicalStepId}`)
}
