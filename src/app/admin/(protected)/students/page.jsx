import StudentsContainer from './StudentsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Students',
}

export default async function Page() {
  const supabase = await getServerSupabase()

  const page = 1
  const limit = 10
  const from = 0
  const to = limit - 1

  // Fetch initial students (default filters)
  const { data: students, error } = await supabase
    .from('students')
    .select(`
       id,
        matric_number,
        full_name,
        institutional_email,
        faculty_id,
        department_id,
        signup_status,
        gender,
        religion,
        faculties (
          id,
          name
        ),
        departments (
          id,
          name
        )
    `)
    .order('created_at', { ascending: false })
    .range(from, to)

  const { count: total } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })

  const initialData = {
    students: error ? [] : (students || []),
    pagination: { page, limit, total: total || 0 },
    filters: {
      searchTerm: '',
      faculty: 'all',
      department: 'all',
      status: 'all',
    },
  }

  return <StudentsContainer initialData={initialData} />
}
