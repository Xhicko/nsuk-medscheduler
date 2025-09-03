import DashboardContainer from './DashboardContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Student Dashboard',
}

// SSR-first: fetch readonly dashboard data on the server to avoid client flash
export default async function Page() {
  const supabase = await getServerSupabase()
  // Use verified user from Auth server
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // If no session, the middleware/route guards should handle redirect; return null to avoid rendering
  if (userError || !user) return null

  // Fetch initial profile data directly (admin pattern)
  let initialData = null
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        gender,
        matric_number,
        institutional_email,
        medical_form_status,
        result_status,
        signup_status,
        faculties:faculty_id ( name ),
        departments:department_id ( name )
      `)
  .eq('auth_user_id', user.id)
      .single()

    if (!error && student && student.signup_status === 'verified') {
      initialData = {
        fullName: student.full_name,
        gender: student.gender,
        matricNumber: student.matric_number,
        email: student.institutional_email,
        facultyName: student.faculties?.name || null,
        departmentName: student.departments?.name || null,
        medicalFormStatus: student.medical_form_status || { status: 'not_started', progress_percentage: 0, current_step: 0 },
        resultStatus: student.result_status
      }
    }
  } catch {}

  return <DashboardContainer initialData={initialData} />
}
