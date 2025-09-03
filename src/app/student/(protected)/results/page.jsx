import ResultsContainer from './ResultsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = { title: 'NSUK MedSched - Results' }

export default async function ResultsPage() {

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
  
   // Fetch results for the student
  const { data: results, error: resultsError } = await supabase
    .from('result_notifications')
    .select(`
      id,
      blood_group,
      genotype,
      hemoglobin_status,
      hemoglobin_value,
      wbc_status,
      wbc_value,
      platelets_status,
      platelets_value,
      blood_sugar_status,
      blood_sugar_value,
      hiv_result,
      hepatitis_b_result,
      hepatitis_c_result
    `)
    .eq('student_id', studentRow.id)
    .order('created_at', { ascending: false })

  const initialData = {
   student: {
      id: studentRow.id,
      fullName: studentRow.full_name,
      email: studentRow.institutional_email,
      gender: studentRow.gender,
      medicalFormStatus: studentRow.medical_form_status || { status: 'not_started', progress_percentage: 0, current_step: 0 },
    },
    results: results || [],
    resultsError: resultsError?.message || null
  }


  return <ResultsContainer initialData={initialData} />
}
